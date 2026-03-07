-- ---------------------------------------------------------------------------
-- Compatibilidad operativa para alto volumen de ingesta
-- Objetivos:
--   1) Evitar ruptura entre clientes que usan duracion_min o duracion_seg
--   2) Garantizar writes idempotentes y consultas eficientes de "último valor"
-- ---------------------------------------------------------------------------

-- 1) esfuerzo_manual: soporte dual duracion_min <-> duracion_seg
ALTER TABLE public.esfuerzo_manual
  ADD COLUMN IF NOT EXISTS duracion_seg INTEGER;

-- Backfill desde minutos hacia segundos
UPDATE public.esfuerzo_manual
SET duracion_seg = GREATEST(0, COALESCE(duracion_min, 0) * 60)
WHERE duracion_seg IS NULL;

-- Backfill inverso si viniera solo en segundos
UPDATE public.esfuerzo_manual
SET duracion_min = GREATEST(0, FLOOR(COALESCE(duracion_seg, 0) / 60.0)::INTEGER)
WHERE duracion_min IS NULL;

ALTER TABLE public.esfuerzo_manual
  ALTER COLUMN duracion_min SET DEFAULT 0;

ALTER TABLE public.esfuerzo_manual
  ALTER COLUMN duracion_seg SET DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.esfuerzo_manual'::regclass
      AND conname = 'esfuerzo_manual_duracion_seg_check'
  ) THEN
    ALTER TABLE public.esfuerzo_manual
      ADD CONSTRAINT esfuerzo_manual_duracion_seg_check
      CHECK (duracion_seg >= 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sync_esfuerzo_duracion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.duracion_seg IS NULL AND NEW.duracion_min IS NOT NULL THEN
    NEW.duracion_seg = GREATEST(0, NEW.duracion_min * 60);
  ELSIF NEW.duracion_min IS NULL AND NEW.duracion_seg IS NOT NULL THEN
    NEW.duracion_min = GREATEST(0, FLOOR(NEW.duracion_seg / 60.0)::INTEGER);
  ELSIF NEW.duracion_min IS NOT NULL AND NEW.duracion_seg IS NOT NULL THEN
    -- Canonizar: segundos es la fuente de verdad para evitar drift acumulado.
    NEW.duracion_seg = GREATEST(0, NEW.duracion_seg);
    NEW.duracion_min = GREATEST(0, FLOOR(NEW.duracion_seg / 60.0)::INTEGER);
  ELSE
    NEW.duracion_min = 0;
    NEW.duracion_seg = 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_esfuerzo_sync_duracion ON public.esfuerzo_manual;
CREATE TRIGGER trg_esfuerzo_sync_duracion
BEFORE INSERT OR UPDATE ON public.esfuerzo_manual
FOR EACH ROW
EXECUTE FUNCTION public.sync_esfuerzo_duracion();

-- 2) Índices para lecturas "último registro" y cargas de ingesta
CREATE INDEX IF NOT EXISTS idx_wellness_user_fetched_at_desc
  ON public.wellness_cache (user_id, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_actividades_user_fetched_at_desc
  ON public.actividades_cache (user_id, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_esfuerzo_user_fecha_created_desc
  ON public.esfuerzo_manual (user_id, fecha DESC, created_at DESC);
