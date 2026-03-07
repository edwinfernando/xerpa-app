-- Backfill operativo:
-- - Poblar sedes, eventos_plantilla, eventos_ediciones, eventos_fechas desde carreras
-- - Vincular carreras.evento_fecha_id
-- - Poblar/relacionar categorias legacy desde usuario_carreras
-- - Vincular usuario_carreras.evento_fecha_categoria_id cuando aplique

-- ---------------------------------------------------------------------------
-- 1) Sedes desde carreras
-- ---------------------------------------------------------------------------
INSERT INTO public.sedes (
  nombre,
  pais_id,
  ciudad_id,
  direccion,
  latitud,
  longitud
)
SELECT DISTINCT
  COALESCE(NULLIF(trim(c.circuito_nombre), ''), NULLIF(trim(c.ciudad), ''), trim(c.nombre)) AS nombre,
  c.pais_id,
  c.ciudad_id,
  NULL::text AS direccion,
  c.latitud,
  c.longitud
FROM public.carreras c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sedes s
  WHERE lower(s.nombre) = lower(COALESCE(NULLIF(trim(c.circuito_nombre), ''), NULLIF(trim(c.ciudad), ''), trim(c.nombre)))
    AND COALESCE(s.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE(c.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- ---------------------------------------------------------------------------
-- 2) Plantillas desde carreras (agrupadas por nombre/tipo/deporte)
-- ---------------------------------------------------------------------------
WITH base AS (
  SELECT DISTINCT
    trim(c.nombre) AS nombre,
    c.tipo_evento_id,
    c.tipo_deporte_id,
    c.formato_evento_id,
    c.pais_id,
    c.ciudad_id,
    ('legacy-' || md5(
      lower(trim(c.nombre)) || '|' ||
      COALESCE(c.tipo_evento_id::text, '') || '|' ||
      COALESCE(c.tipo_deporte_id::text, '')
    )) AS slug
  FROM public.carreras c
)
INSERT INTO public.eventos_plantilla (
  nombre,
  slug,
  tipo_evento_id,
  tipo_deporte_id,
  formato_evento_id,
  descripcion,
  sede_principal_id
)
SELECT
  b.nombre,
  b.slug,
  b.tipo_evento_id,
  b.tipo_deporte_id,
  b.formato_evento_id,
  NULL::text AS descripcion,
  (
    SELECT s.id
    FROM public.sedes s
    WHERE COALESCE(s.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid) =
          COALESCE(b.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid)
    ORDER BY s.created_at ASC
    LIMIT 1
  ) AS sede_principal_id
FROM base b
WHERE NOT EXISTS (
  SELECT 1 FROM public.eventos_plantilla ep WHERE ep.slug = b.slug
)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3) Ediciones por anio
-- ---------------------------------------------------------------------------
WITH carreras_base AS (
  SELECT
    c.id AS carrera_id,
    c.fecha_inicio,
    c.fecha_fin,
    c.estado,
    ep.id AS evento_plantilla_id
  FROM public.carreras c
  JOIN public.eventos_plantilla ep
    ON ep.slug = (
      'legacy-' || md5(
        lower(trim(c.nombre)) || '|' ||
        COALESCE(c.tipo_evento_id::text, '') || '|' ||
        COALESCE(c.tipo_deporte_id::text, '')
      )
    )
),
ediciones_src AS (
  SELECT DISTINCT
    cb.evento_plantilla_id,
    EXTRACT(YEAR FROM cb.fecha_inicio)::int AS anio
  FROM carreras_base cb
  WHERE cb.fecha_inicio IS NOT NULL
)
INSERT INTO public.eventos_ediciones (
  evento_plantilla_id,
  anio,
  temporada,
  fecha_inicio,
  fecha_fin,
  estado
)
SELECT
  es.evento_plantilla_id,
  es.anio,
  es.anio::text AS temporada,
  (
    SELECT MIN(c2.fecha_inicio)
    FROM carreras_base c2
    WHERE c2.evento_plantilla_id = es.evento_plantilla_id
      AND EXTRACT(YEAR FROM c2.fecha_inicio)::int = es.anio
  ) AS fecha_inicio,
  (
    SELECT MAX(COALESCE(c2.fecha_fin, c2.fecha_inicio))
    FROM carreras_base c2
    WHERE c2.evento_plantilla_id = es.evento_plantilla_id
      AND EXTRACT(YEAR FROM c2.fecha_inicio)::int = es.anio
  ) AS fecha_fin,
  'Programada'::text
FROM ediciones_src es
WHERE NOT EXISTS (
  SELECT 1
  FROM public.eventos_ediciones ee
  WHERE ee.evento_plantilla_id = es.evento_plantilla_id
    AND COALESCE(ee.anio, -1) = COALESCE(es.anio, -1)
    AND COALESCE(lower(ee.temporada), '') = COALESCE(lower(es.anio::text), '')
);

-- ---------------------------------------------------------------------------
-- 4) Fechas/validas desde carreras y vinculo carreras.evento_fecha_id
-- ---------------------------------------------------------------------------
WITH carreras_map AS (
  SELECT
    c.id AS carrera_id,
    c.nombre,
    c.numero_valida,
    c.fecha_inicio,
    c.fecha_fin,
    c.distancia_km,
    c.desnivel_m,
    c.url_inscripcion,
    c.imagen_url,
    c.estado,
    c.ciudad_id,
    c.circuito_nombre,
    c.latitud,
    c.longitud,
    ep.id AS evento_plantilla_id,
    ee.id AS edicion_id
  FROM public.carreras c
  JOIN public.eventos_plantilla ep
    ON ep.slug = (
      'legacy-' || md5(
        lower(trim(c.nombre)) || '|' ||
        COALESCE(c.tipo_evento_id::text, '') || '|' ||
        COALESCE(c.tipo_deporte_id::text, '')
      )
    )
  JOIN public.eventos_ediciones ee
    ON ee.evento_plantilla_id = ep.id
   AND ee.anio = EXTRACT(YEAR FROM c.fecha_inicio)::int
),
inserted AS (
  INSERT INTO public.eventos_fechas (
    edicion_id,
    numero_valida,
    nombre,
    sede_id,
    fecha_inicio,
    fecha_fin,
    distancia_base_km,
    desnivel_base_m,
    url_inscripcion,
    imagen_url,
    estado
  )
  SELECT
    cm.edicion_id,
    cm.numero_valida,
    COALESCE(
      NULLIF(trim(cm.circuito_nombre), ''),
      CASE WHEN cm.numero_valida IS NOT NULL THEN 'Valida ' || cm.numero_valida::text END,
      cm.nombre
    ) AS nombre,
    (
      SELECT s.id
      FROM public.sedes s
      WHERE COALESCE(s.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid) =
            COALESCE(cm.ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid)
      ORDER BY s.created_at ASC
      LIMIT 1
    ) AS sede_id,
    cm.fecha_inicio,
    COALESCE(cm.fecha_fin, cm.fecha_inicio),
    cm.distancia_km,
    cm.desnivel_m,
    cm.url_inscripcion,
    cm.imagen_url,
    COALESCE(cm.estado, 'Programada')
  FROM carreras_map cm
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.eventos_fechas ef
    WHERE ef.edicion_id = cm.edicion_id
      AND COALESCE(ef.numero_valida, -1) = COALESCE(cm.numero_valida, -1)
      AND ef.fecha_inicio = cm.fecha_inicio
  )
  RETURNING id
)
SELECT COUNT(*) FROM inserted;

-- Vincular carrera -> evento_fecha_id
UPDATE public.carreras c
SET evento_fecha_id = ef.id
FROM public.eventos_plantilla ep
JOIN public.eventos_ediciones ee
  ON ee.evento_plantilla_id = ep.id
JOIN public.eventos_fechas ef
  ON ef.edicion_id = ee.id
WHERE ep.slug = (
    'legacy-' || md5(
      lower(trim(c.nombre)) || '|' ||
      COALESCE(c.tipo_evento_id::text, '') || '|' ||
      COALESCE(c.tipo_deporte_id::text, '')
    )
  )
  AND ee.anio = EXTRACT(YEAR FROM c.fecha_inicio)::int
  AND ef.fecha_inicio = c.fecha_inicio
  AND COALESCE(ef.numero_valida, -1) = COALESCE(c.numero_valida, -1)
  AND c.evento_fecha_id IS DISTINCT FROM ef.id;

-- ---------------------------------------------------------------------------
-- 5) Categorias legacy desde usuario_carreras
-- ---------------------------------------------------------------------------
INSERT INTO public.categorias_evento (codigo, nombre, activo)
SELECT DISTINCT
  'LEGACY-' || md5(lower(trim(uc.categoria))) AS codigo,
  trim(uc.categoria) AS nombre,
  TRUE
FROM public.usuario_carreras uc
WHERE uc.categoria IS NOT NULL
  AND trim(uc.categoria) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.categorias_evento ce
    WHERE lower(ce.nombre) = lower(trim(uc.categoria))
  );

-- ---------------------------------------------------------------------------
-- 6) Crear eventos_fecha_categorias y vincular usuario_carreras
-- ---------------------------------------------------------------------------
INSERT INTO public.eventos_fecha_categorias (evento_fecha_id, categoria_id, activo)
SELECT DISTINCT
  c.evento_fecha_id,
  ce.id,
  TRUE
FROM public.usuario_carreras uc
JOIN public.carreras c
  ON c.id = uc.carrera_id
JOIN public.categorias_evento ce
  ON lower(ce.nombre) = lower(trim(uc.categoria))
WHERE c.evento_fecha_id IS NOT NULL
  AND uc.categoria IS NOT NULL
  AND trim(uc.categoria) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.eventos_fecha_categorias efc
    WHERE efc.evento_fecha_id = c.evento_fecha_id
      AND efc.categoria_id = ce.id
  );

UPDATE public.usuario_carreras uc
SET evento_fecha_categoria_id = efc.id
FROM public.carreras c,
     public.categorias_evento ce,
     public.eventos_fecha_categorias efc
WHERE c.id = uc.carrera_id
  AND lower(ce.nombre) = lower(trim(uc.categoria))
  AND efc.evento_fecha_id = c.evento_fecha_id
  AND efc.categoria_id = ce.id
  AND c.evento_fecha_id IS NOT NULL
  AND uc.categoria IS NOT NULL
  AND trim(uc.categoria) <> ''
  AND uc.evento_fecha_categoria_id IS DISTINCT FROM efc.id;

