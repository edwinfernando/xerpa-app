-- Asegurar que usuario_carreras permite guardar resultados manualmente (posicion, notas).
-- Ambas columnas aceptan NULL para permitir guardar solo uno u otro.

-- posicion: ya añadida en 20260305120000, asegurar que acepta NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuario_carreras' AND column_name = 'posicion'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.usuario_carreras ALTER COLUMN posicion DROP NOT NULL;
  END IF;
END $$;

-- notas: añadir si no existe (sensaciones/objetivos post-carrera)
ALTER TABLE public.usuario_carreras
  ADD COLUMN IF NOT EXISTS notas TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuario_carreras' AND column_name = 'notas'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.usuario_carreras ALTER COLUMN notas DROP NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.usuario_carreras.notas IS 'Sensaciones y objetivos post-carrera. Usado por PastRaceResultSheet.';
