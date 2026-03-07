-- Evolucion de esquema para carreras:
-- - Catalogos normalizados (tipo evento, formato, deporte, pais, ciudad)
-- - Entidad copas + soporte de validas
-- - Nuevas FK en carreras sin romper columnas legacy actuales
-- - Refresco de vista_calendario_atletas con campos nuevos

-- ---------------------------------------------------------------------------
-- 1) Catalogos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.catalogo_tipos_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogo_formatos_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogo_tipos_deporte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogo_paises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_iso2 text,
  nombre text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogo_ciudades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pais_id uuid REFERENCES public.catalogo_paises(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogo_ciudades_pais_nombre_unique
  ON public.catalogo_ciudades (
    COALESCE(pais_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(nombre)
  );

-- ---------------------------------------------------------------------------
-- 2) Copas (serie de carreras / validas)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.copas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  temporada text,
  descripcion text,
  organizador text,
  pais_id uuid REFERENCES public.catalogo_paises(id) ON DELETE SET NULL,
  ciudad_id uuid REFERENCES public.catalogo_ciudades(id) ON DELETE SET NULL,
  fecha_inicio date,
  fecha_fin date,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3) Seed inicial de catalogos
-- ---------------------------------------------------------------------------

INSERT INTO public.catalogo_tipos_evento (codigo, nombre, descripcion)
VALUES
  ('xerpa', 'XERPA', 'Evento oficial del catalogo XERPA'),
  ('ruta_local', 'Ruta local', 'Evento local/comunitario'),
  ('competencia', 'Competencia', 'Carrera competitiva'),
  ('travesia', 'Travesia', 'Ruta/travesia no competitiva'),
  ('entrenamiento', 'Entrenamiento', 'Evento de entrenamiento')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.catalogo_formatos_evento (codigo, nombre, descripcion)
VALUES
  ('individual', 'Individual', 'Evento unico'),
  ('copa', 'Copa', 'Serie o campeonato compuesto por validas'),
  ('valida', 'Valida', 'Fecha individual dentro de una copa')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.catalogo_tipos_deporte (codigo, nombre, descripcion)
VALUES
  ('MTB', 'MTB', 'Mountain bike'),
  ('Ruta', 'Ruta', 'Ciclismo de ruta'),
  ('Gravel', 'Gravel', 'Ciclismo gravel'),
  ('otros', 'Otros', 'Otros deportes')
ON CONFLICT (codigo) DO NOTHING;

-- Paises/ciudades desde datos existentes
INSERT INTO public.catalogo_paises (nombre)
SELECT DISTINCT trim(c.pais)
FROM public.carreras c
WHERE c.pais IS NOT NULL AND trim(c.pais) <> ''
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.catalogo_ciudades (pais_id, nombre)
SELECT DISTINCT p.id, trim(c.ciudad)
FROM public.carreras c
LEFT JOIN public.catalogo_paises p
  ON lower(p.nombre) = lower(trim(c.pais))
WHERE c.ciudad IS NOT NULL
  AND trim(c.ciudad) <> ''
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4) Extender carreras con relaciones normalizadas
-- ---------------------------------------------------------------------------

ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS tipo_evento_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS formato_evento_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS tipo_deporte_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS pais_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS ciudad_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS copa_id uuid;
ALTER TABLE public.carreras ADD COLUMN IF NOT EXISTS numero_valida integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_tipo_evento_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_tipo_evento_id_fkey
      FOREIGN KEY (tipo_evento_id) REFERENCES public.catalogo_tipos_evento(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_formato_evento_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_formato_evento_id_fkey
      FOREIGN KEY (formato_evento_id) REFERENCES public.catalogo_formatos_evento(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_tipo_deporte_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_tipo_deporte_id_fkey
      FOREIGN KEY (tipo_deporte_id) REFERENCES public.catalogo_tipos_deporte(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_pais_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_pais_id_fkey
      FOREIGN KEY (pais_id) REFERENCES public.catalogo_paises(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_ciudad_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_ciudad_id_fkey
      FOREIGN KEY (ciudad_id) REFERENCES public.catalogo_ciudades(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_copa_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_copa_id_fkey
      FOREIGN KEY (copa_id) REFERENCES public.copas(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_numero_valida_check'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_numero_valida_check
      CHECK (numero_valida IS NULL OR numero_valida > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_valida_requiere_copa_check'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_valida_requiere_copa_check
      CHECK (numero_valida IS NULL OR copa_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_carreras_tipo_evento_id ON public.carreras (tipo_evento_id);
CREATE INDEX IF NOT EXISTS idx_carreras_formato_evento_id ON public.carreras (formato_evento_id);
CREATE INDEX IF NOT EXISTS idx_carreras_tipo_deporte_id ON public.carreras (tipo_deporte_id);
CREATE INDEX IF NOT EXISTS idx_carreras_pais_ciudad_id ON public.carreras (pais_id, ciudad_id);
CREATE INDEX IF NOT EXISTS idx_carreras_copa_valida ON public.carreras (copa_id, numero_valida);

-- ---------------------------------------------------------------------------
-- 5) Backfill de nuevas FK desde columnas legacy
-- ---------------------------------------------------------------------------

UPDATE public.carreras c
SET tipo_evento_id = te.id
FROM public.catalogo_tipos_evento te
WHERE c.tipo_evento_id IS NULL
  AND lower(te.codigo) = lower(COALESCE(trim(c.tipo_evento), 'xerpa'));

UPDATE public.carreras c
SET tipo_deporte_id = td.id
FROM public.catalogo_tipos_deporte td
WHERE c.tipo_deporte_id IS NULL
  AND c.tipo_deporte IS NOT NULL
  AND lower(td.codigo) = lower(trim(c.tipo_deporte));

UPDATE public.carreras c
SET pais_id = p.id
FROM public.catalogo_paises p
WHERE c.pais_id IS NULL
  AND c.pais IS NOT NULL
  AND lower(p.nombre) = lower(trim(c.pais));

UPDATE public.carreras c
SET ciudad_id = ci.id
FROM public.catalogo_ciudades ci
WHERE c.ciudad_id IS NULL
  AND c.ciudad IS NOT NULL
  AND lower(ci.nombre) = lower(trim(c.ciudad))
  AND (
    ci.pais_id IS NULL
    OR ci.pais_id = c.pais_id
  );

UPDATE public.carreras c
SET formato_evento_id = fe.id
FROM public.catalogo_formatos_evento fe
WHERE c.formato_evento_id IS NULL
  AND fe.codigo = CASE
    WHEN c.numero_valida IS NOT NULL THEN 'valida'
    WHEN c.copa_id IS NOT NULL THEN 'copa'
    ELSE 'individual'
  END;

-- ---------------------------------------------------------------------------
-- 6) Refrescar vista_calendario_atletas con columnas enriquecidas
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS public.vista_calendario_atletas;

CREATE VIEW public.vista_calendario_atletas AS
SELECT
  -- Inscripcion del usuario
  uc.id AS id,
  uc.id AS inscripcion_id,
  uc.user_id,
  uc.carrera_id,
  uc.categoria,
  uc.prioridad,
  uc.resultado,
  uc.tss_real_carrera,
  uc.notas,
  uc.preparar_con_xerpa,
  uc.posicion,
  uc.created_at AS inscripcion_created_at,

  -- Carrera (legacy + FK nuevas)
  c.nombre,
  c.ciudad,
  c.fecha_inicio,
  c.fecha_fin,
  c.distancia_km,
  c.desnivel_m,
  c.nivel,
  c.estado,
  c.imagen_url,
  c.verificado,
  c.tipo_evento,
  c.tipo_deporte,
  c.nivel_dificultad,
  c.pais,
  c.descripcion_organizador,
  c.url_inscripcion,
  c.circuito_nombre,
  c.circuito_logo_url,
  c.tss_estimado,
  c.latitud,
  c.longitud,
  c.created_at AS carrera_created_at,
  c.tipo_evento_id,
  c.formato_evento_id,
  c.tipo_deporte_id,
  c.pais_id,
  c.ciudad_id,
  c.copa_id,
  c.numero_valida,

  -- Catalogos (labels listos para UI)
  te.codigo AS tipo_evento_codigo,
  te.nombre AS tipo_evento_nombre,
  fe.codigo AS formato_evento_codigo,
  fe.nombre AS formato_evento_nombre,
  td.codigo AS tipo_deporte_codigo,
  td.nombre AS tipo_deporte_nombre,
  p.nombre AS pais_nombre,
  ci.nombre AS ciudad_nombre,
  co.nombre AS copa_nombre,
  co.temporada AS copa_temporada
FROM public.usuario_carreras uc
JOIN public.carreras c
  ON c.id = uc.carrera_id
LEFT JOIN public.catalogo_tipos_evento te
  ON te.id = c.tipo_evento_id
LEFT JOIN public.catalogo_formatos_evento fe
  ON fe.id = c.formato_evento_id
LEFT JOIN public.catalogo_tipos_deporte td
  ON td.id = c.tipo_deporte_id
LEFT JOIN public.catalogo_paises p
  ON p.id = c.pais_id
LEFT JOIN public.catalogo_ciudades ci
  ON ci.id = c.ciudad_id
LEFT JOIN public.copas co
  ON co.id = c.copa_id;

GRANT SELECT ON public.vista_calendario_atletas TO authenticated, anon, service_role;

-- Permisos de lectura para catalogos/copa (util para formularios y filtros)
GRANT SELECT ON public.catalogo_tipos_evento TO authenticated, anon, service_role;
GRANT SELECT ON public.catalogo_formatos_evento TO authenticated, anon, service_role;
GRANT SELECT ON public.catalogo_tipos_deporte TO authenticated, anon, service_role;
GRANT SELECT ON public.catalogo_paises TO authenticated, anon, service_role;
GRANT SELECT ON public.catalogo_ciudades TO authenticated, anon, service_role;
GRANT SELECT ON public.copas TO authenticated, anon, service_role;
