-- Motor de recomendación de eventos para atletas (consumible por n8n vía RPC).
-- Estrategia híbrida:
-- - recurrencia (eventos similares ya corridos/inscritos)
-- - afinidad por deporte/tipo/formato
-- - proximidad geográfica (si hay lat/lon)
-- - ventana temporal (días hacia la carrera)

CREATE TABLE IF NOT EXISTS public.recomendaciones_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  carrera_id uuid NOT NULL REFERENCES public.carreras(id) ON DELETE CASCADE,
  canal text NOT NULL DEFAULT 'n8n_chat',
  score_total numeric(5,2),
  score_breakdown jsonb,
  razones jsonb,
  contexto jsonb,
  shown_at timestamptz NOT NULL DEFAULT now(),
  clicked_at timestamptz,
  enrolled_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recomendaciones_eventos_user_shown
  ON public.recomendaciones_eventos (user_id, shown_at DESC);

CREATE INDEX IF NOT EXISTS idx_recomendaciones_eventos_carrera
  ON public.recomendaciones_eventos (carrera_id);

CREATE OR REPLACE FUNCTION public.recomendar_eventos_atleta(
  p_user_id uuid,
  p_lat double precision DEFAULT NULL,
  p_lon double precision DEFAULT NULL,
  p_limite integer DEFAULT 10,
  p_dias_min integer DEFAULT 7,
  p_dias_max integer DEFAULT 180
)
RETURNS TABLE (
  carrera_id uuid,
  nombre text,
  fecha_inicio date,
  fecha_fin date,
  ciudad text,
  pais text,
  tipo_deporte text,
  tipo_evento text,
  formato_evento text,
  copa text,
  numero_valida integer,
  latitud double precision,
  longitud double precision,
  distancia_km double precision,
  dias_para_evento integer,
  score_total numeric,
  score_recurrencia numeric,
  score_afinidad_deporte numeric,
  score_afinidad_tipo_evento numeric,
  score_afinidad_formato numeric,
  score_geo numeric,
  score_tiempo numeric,
  razones jsonb
)
LANGUAGE sql
STABLE
AS $$
WITH eventos_base AS (
  SELECT
    c.id AS carrera_id,
    c.nombre,
    c.fecha_inicio,
    c.fecha_fin,
    c.ciudad,
    c.pais,
    c.tipo_deporte,
    c.tipo_evento,
    c.latitud,
    c.longitud,
    c.evento_fecha_id,
    c.formato_evento_id,
    c.tipo_evento_id,
    c.tipo_deporte_id,
    c.copa_id,
    c.numero_valida,
    ep.id AS evento_plantilla_id,
    fe.nombre AS formato_evento,
    co.nombre AS copa,
    GREATEST(
      0,
      (COALESCE(c.fecha_inicio, c.fecha_fin) - CURRENT_DATE)
    )::int AS dias_para_evento
  FROM public.carreras c
  LEFT JOIN public.eventos_fechas ef
    ON ef.id = c.evento_fecha_id
  LEFT JOIN public.eventos_ediciones ee
    ON ee.id = ef.edicion_id
  LEFT JOIN public.eventos_plantilla ep
    ON ep.id = ee.evento_plantilla_id
  LEFT JOIN public.catalogo_formatos_evento fe
    ON fe.id = c.formato_evento_id
  LEFT JOIN public.copas co
    ON co.id = c.copa_id
  WHERE COALESCE(lower(c.estado), 'programada') <> 'cancelada'
    AND COALESCE(c.fecha_inicio, c.fecha_fin) >= CURRENT_DATE + p_dias_min
    AND COALESCE(c.fecha_inicio, c.fecha_fin) <= CURRENT_DATE + p_dias_max
),
inscritas_futuras AS (
  SELECT uc.carrera_id
  FROM public.usuario_carreras uc
  JOIN public.carreras c ON c.id = uc.carrera_id
  WHERE uc.user_id = p_user_id
    AND COALESCE(c.fecha_inicio, c.fecha_fin) >= CURRENT_DATE
),
historial AS (
  SELECT
    c.id AS carrera_id,
    c.tipo_deporte_id,
    c.tipo_evento_id,
    c.formato_evento_id,
    c.evento_fecha_id,
    ep.id AS evento_plantilla_id
  FROM public.usuario_carreras uc
  JOIN public.carreras c
    ON c.id = uc.carrera_id
  LEFT JOIN public.eventos_fechas ef
    ON ef.id = c.evento_fecha_id
  LEFT JOIN public.eventos_ediciones ee
    ON ee.id = ef.edicion_id
  LEFT JOIN public.eventos_plantilla ep
    ON ep.id = ee.evento_plantilla_id
  WHERE uc.user_id = p_user_id
),
hist_stats AS (
  SELECT
    COUNT(*)::numeric AS total_historial
  FROM historial
),
candidatos AS (
  SELECT
    e.*,
    CASE
      WHEN p_lat IS NULL OR p_lon IS NULL OR e.latitud IS NULL OR e.longitud IS NULL THEN NULL
      ELSE (
        6371 * acos(
          LEAST(
            1,
            GREATEST(
              -1,
              cos(radians(p_lat)) * cos(radians(e.latitud))
              * cos(radians(e.longitud) - radians(p_lon))
              + sin(radians(p_lat)) * sin(radians(e.latitud))
            )
          )
        )
      )
    END AS distancia_km,
    EXISTS (
      SELECT 1
      FROM historial h
      WHERE h.evento_plantilla_id IS NOT NULL
        AND h.evento_plantilla_id = e.evento_plantilla_id
    ) AS recurrencia_evento,
    EXISTS (
      SELECT 1 FROM historial h WHERE h.tipo_deporte_id = e.tipo_deporte_id
    ) AS afinidad_deporte,
    EXISTS (
      SELECT 1 FROM historial h WHERE h.tipo_evento_id = e.tipo_evento_id
    ) AS afinidad_tipo_evento,
    EXISTS (
      SELECT 1 FROM historial h WHERE h.formato_evento_id = e.formato_evento_id
    ) AS afinidad_formato
  FROM eventos_base e
  WHERE NOT EXISTS (
    SELECT 1 FROM inscritas_futuras i WHERE i.carrera_id = e.carrera_id
  )
),
scores AS (
  SELECT
    c.*,
    -- 25%
    CASE WHEN c.recurrencia_evento THEN 25 ELSE 0 END::numeric AS score_recurrencia,
    -- 20%
    CASE
      WHEN c.afinidad_deporte THEN 20
      WHEN (SELECT total_historial FROM hist_stats) = 0 THEN 10
      ELSE 5
    END::numeric AS score_afinidad_deporte,
    -- 10%
    CASE
      WHEN c.afinidad_tipo_evento THEN 10
      WHEN (SELECT total_historial FROM hist_stats) = 0 THEN 5
      ELSE 2
    END::numeric AS score_afinidad_tipo_evento,
    -- 10%
    CASE
      WHEN c.afinidad_formato THEN 10
      WHEN (SELECT total_historial FROM hist_stats) = 0 THEN 5
      ELSE 2
    END::numeric AS score_afinidad_formato,
    -- 20%
    CASE
      WHEN c.distancia_km IS NULL THEN 8
      WHEN c.distancia_km <= 30 THEN 20
      WHEN c.distancia_km <= 80 THEN 16
      WHEN c.distancia_km <= 150 THEN 12
      WHEN c.distancia_km <= 300 THEN 8
      ELSE 4
    END::numeric AS score_geo,
    -- 15%
    CASE
      WHEN c.dias_para_evento BETWEEN 14 AND 60 THEN 15
      WHEN c.dias_para_evento BETWEEN 7 AND 90 THEN 12
      WHEN c.dias_para_evento BETWEEN 91 AND 140 THEN 8
      ELSE 4
    END::numeric AS score_tiempo
  FROM candidatos c
)
SELECT
  s.carrera_id,
  s.nombre,
  s.fecha_inicio,
  s.fecha_fin,
  s.ciudad,
  s.pais,
  s.tipo_deporte,
  s.tipo_evento,
  s.formato_evento,
  s.copa,
  s.numero_valida,
  s.latitud,
  s.longitud,
  s.distancia_km,
  s.dias_para_evento,
  (
    s.score_recurrencia
    + s.score_afinidad_deporte
    + s.score_afinidad_tipo_evento
    + s.score_afinidad_formato
    + s.score_geo
    + s.score_tiempo
  )::numeric AS score_total,
  s.score_recurrencia,
  s.score_afinidad_deporte,
  s.score_afinidad_tipo_evento,
  s.score_afinidad_formato,
  s.score_geo,
  s.score_tiempo,
  jsonb_strip_nulls(
    jsonb_build_object(
      'recurrencia_evento', s.recurrencia_evento,
      'afinidad_deporte', s.afinidad_deporte,
      'afinidad_tipo_evento', s.afinidad_tipo_evento,
      'afinidad_formato', s.afinidad_formato,
      'distancia_km', CASE WHEN s.distancia_km IS NOT NULL THEN round((s.distancia_km::numeric), 1) END,
      'dias_para_evento', s.dias_para_evento
    )
  ) AS razones
FROM scores s
ORDER BY score_total DESC, s.fecha_inicio ASC
LIMIT GREATEST(COALESCE(p_limite, 10), 1);
$$;

GRANT EXECUTE ON FUNCTION public.recomendar_eventos_atleta(uuid, double precision, double precision, integer, integer, integer)
TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON public.recomendaciones_eventos
TO authenticated, service_role;

