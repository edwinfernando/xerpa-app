-- plan_entrenamientos: soporte para planes semanales generados por n8n
-- La tabla plan_entrenamientos ya existe con: id, user_id, fecha, tipo, titulo,
-- detalle, duracion_min, tss_plan, tss_real, completado, nota_atleta, semana_inicio,
-- fase, entrenador_id, is_generado_ia, estado, hora, punto_encuentro.
-- Este script añade el trigger para auto-rellenar semana_inicio desde fecha.

-- 1) Función para obtener lunes ISO de una fecha
CREATE OR REPLACE FUNCTION public.fn_semana_inicio_from_fecha(d DATE)
RETURNS DATE
LANGUAGE sql IMMUTABLE
AS $$
  SELECT d - ((EXTRACT(ISODOW FROM d)::int - 1))::int;
$$;

-- 2) Trigger para rellenar semana_inicio en INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.trg_plan_entrenamientos_set_semana_inicio()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.fecha IS NOT NULL THEN
    NEW.semana_inicio := public.fn_semana_inicio_from_fecha(NEW.fecha);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plan_entrenamientos_set_semana_inicio ON public.plan_entrenamientos;
CREATE TRIGGER trg_plan_entrenamientos_set_semana_inicio
BEFORE INSERT OR UPDATE OF fecha ON public.plan_entrenamientos
FOR EACH ROW
EXECUTE FUNCTION public.trg_plan_entrenamientos_set_semana_inicio();

-- 3) Backfill: rellenar semana_inicio en filas existentes que lo tengan NULL
UPDATE public.plan_entrenamientos
SET semana_inicio = public.fn_semana_inicio_from_fecha(fecha)
WHERE semana_inicio IS NULL AND fecha IS NOT NULL;

-- 4) Índice para consultas por semana
CREATE INDEX IF NOT EXISTS idx_plan_user_semana_inicio
  ON public.plan_entrenamientos (user_id, semana_inicio DESC);
