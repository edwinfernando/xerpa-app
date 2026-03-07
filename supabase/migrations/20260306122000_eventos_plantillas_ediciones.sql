-- Fase 1: Modelo de plantillas + ediciones + fechas (validadas por temporada)
-- Objetivo: soportar eventos que se repiten anualmente y copas con validas.

-- ---------------------------------------------------------------------------
-- 1) Sedes (lugar reutilizable)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  pais_id uuid REFERENCES public.catalogo_paises(id) ON DELETE SET NULL,
  ciudad_id uuid REFERENCES public.catalogo_ciudades(id) ON DELETE SET NULL,
  direccion text,
  latitud double precision,
  longitud double precision,
  altitud_m integer,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sedes_unique_nombre_ciudad
  ON public.sedes (
    lower(nombre),
    COALESCE(ciudad_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- ---------------------------------------------------------------------------
-- 2) Plantilla de evento (definicion base)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_plantilla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text UNIQUE,
  tipo_evento_id uuid REFERENCES public.catalogo_tipos_evento(id) ON DELETE SET NULL,
  tipo_deporte_id uuid REFERENCES public.catalogo_tipos_deporte(id) ON DELETE SET NULL,
  formato_evento_id uuid REFERENCES public.catalogo_formatos_evento(id) ON DELETE SET NULL,
  descripcion text,
  sede_principal_id uuid REFERENCES public.sedes(id) ON DELETE SET NULL,
  activo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eventos_plantilla_tipo ON public.eventos_plantilla(tipo_evento_id, tipo_deporte_id);

-- ---------------------------------------------------------------------------
-- 3) Ediciones por temporada (ej: Copa Valle 2026)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_ediciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_plantilla_id uuid NOT NULL REFERENCES public.eventos_plantilla(id) ON DELETE CASCADE,
  anio integer,
  temporada text,
  fecha_inicio date,
  fecha_fin date,
  estado text NOT NULL DEFAULT 'Programada'
    CHECK (estado IN ('Programada', 'Activa', 'Finalizada', 'Cancelada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eventos_ediciones_anio_o_temporada_chk CHECK (anio IS NOT NULL OR temporada IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_ediciones_unique
  ON public.eventos_ediciones (
    evento_plantilla_id,
    COALESCE(anio, -1),
    COALESCE(lower(temporada), '')
  );

-- ---------------------------------------------------------------------------
-- 4) Fechas / validas dentro de la edicion
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos_fechas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edicion_id uuid NOT NULL REFERENCES public.eventos_ediciones(id) ON DELETE CASCADE,
  numero_valida integer,
  nombre text,
  sede_id uuid REFERENCES public.sedes(id) ON DELETE SET NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  distancia_base_km numeric,
  desnivel_base_m integer,
  url_inscripcion text,
  imagen_url text,
  estado text NOT NULL DEFAULT 'Programada'
    CHECK (estado IN ('Programada', 'Activa', 'Finalizada', 'Cancelada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eventos_fechas_numero_valida_chk CHECK (numero_valida IS NULL OR numero_valida > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_fechas_unique_valida
  ON public.eventos_fechas (
    edicion_id,
    COALESCE(numero_valida, -1),
    fecha_inicio
  );

CREATE INDEX IF NOT EXISTS idx_eventos_fechas_fecha ON public.eventos_fechas(fecha_inicio);

-- ---------------------------------------------------------------------------
-- 5) Bridge de compatibilidad con carreras actuales
-- ---------------------------------------------------------------------------
ALTER TABLE public.carreras
  ADD COLUMN IF NOT EXISTS evento_fecha_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.carreras'::regclass
      AND conname = 'carreras_evento_fecha_id_fkey'
  ) THEN
    ALTER TABLE public.carreras
      ADD CONSTRAINT carreras_evento_fecha_id_fkey
      FOREIGN KEY (evento_fecha_id) REFERENCES public.eventos_fechas(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_carreras_evento_fecha_id ON public.carreras(evento_fecha_id);

