-- Fase 2: Categorias y recorridos por categoria para cada fecha/valida.
-- Objetivo: permitir que una categoria use pista distinta o menos vueltas.

-- ---------------------------------------------------------------------------
-- 1) Catalogo de categorias
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categorias_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  nombre text NOT NULL,
  sexo text CHECK (sexo IN ('Masculino', 'Femenino', 'Mixto') OR sexo IS NULL),
  edad_min integer,
  edad_max integer,
  tipo_deporte_id uuid REFERENCES public.catalogo_tipos_deporte(id) ON DELETE SET NULL,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categorias_evento_edad_chk CHECK (
    (edad_min IS NULL AND edad_max IS NULL)
    OR (edad_min IS NOT NULL AND edad_max IS NOT NULL AND edad_min <= edad_max)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_evento_nombre_unique
  ON public.categorias_evento (lower(nombre));

-- Seed base
INSERT INTO public.categorias_evento (codigo, nombre, sexo, activo)
VALUES
  ('ELITE_M', 'Elite Masculino', 'Masculino', TRUE),
  ('ELITE_F', 'Elite Femenino', 'Femenino', TRUE),
  ('SUB23_M', 'Sub-23 Masculino', 'Masculino', TRUE),
  ('SUB23_F', 'Sub-23 Femenino', 'Femenino', TRUE),
  ('MASTER_A', 'Master A', 'Mixto', TRUE),
  ('MASTER_B', 'Master B', 'Mixto', TRUE),
  ('RECREATIVA', 'Recreativa', 'Mixto', TRUE),
  ('JUVENIL', 'Juvenil', 'Mixto', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2) Recorridos disponibles por fecha/valida
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_fecha_recorridos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_fecha_id uuid NOT NULL REFERENCES public.eventos_fechas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  distancia_km numeric,
  desnivel_m integer,
  gpx_url text,
  geojson jsonb,
  orden smallint,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_fecha_recorridos_unique
  ON public.eventos_fecha_recorridos (evento_fecha_id, lower(nombre));

-- ---------------------------------------------------------------------------
-- 3) Categorias habilitadas por fecha/valida
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_fecha_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_fecha_id uuid NOT NULL REFERENCES public.eventos_fechas(id) ON DELETE CASCADE,
  categoria_id uuid NOT NULL REFERENCES public.categorias_evento(id) ON DELETE RESTRICT,
  cupo integer,
  precio numeric,
  reglamento_url text,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eventos_fecha_categorias_cupo_chk CHECK (cupo IS NULL OR cupo > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_fecha_categorias_unique
  ON public.eventos_fecha_categorias (evento_fecha_id, categoria_id);

-- ---------------------------------------------------------------------------
-- 4) Configuracion tecnica categoria <-> recorrido
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_fecha_categoria_recorrido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_fecha_categoria_id uuid NOT NULL REFERENCES public.eventos_fecha_categorias(id) ON DELETE CASCADE,
  recorrido_id uuid NOT NULL REFERENCES public.eventos_fecha_recorridos(id) ON DELETE RESTRICT,
  numero_vueltas integer,
  distancia_objetivo_km numeric,
  desnivel_objetivo_m integer,
  tiempo_corte_min integer,
  es_oficial boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eventos_fecha_categoria_recorrido_vueltas_chk
    CHECK (numero_vueltas IS NULL OR numero_vueltas > 0)
);

-- Una categoria en una fecha tiene 1 configuracion oficial (puede haber alternativas no oficiales)
CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_fecha_categoria_recorrido_oficial
  ON public.eventos_fecha_categoria_recorrido (evento_fecha_categoria_id)
  WHERE es_oficial = TRUE;

-- ---------------------------------------------------------------------------
-- 5) Inscripciones de usuario: relacion fina con categoria configurada
-- ---------------------------------------------------------------------------
ALTER TABLE public.usuario_carreras
  ADD COLUMN IF NOT EXISTS evento_fecha_categoria_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.usuario_carreras'::regclass
      AND conname = 'usuario_carreras_evento_fecha_categoria_id_fkey'
  ) THEN
    ALTER TABLE public.usuario_carreras
      ADD CONSTRAINT usuario_carreras_evento_fecha_categoria_id_fkey
      FOREIGN KEY (evento_fecha_categoria_id)
      REFERENCES public.eventos_fecha_categorias(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usuario_carreras_evento_fecha_categoria
  ON public.usuario_carreras (evento_fecha_categoria_id);

