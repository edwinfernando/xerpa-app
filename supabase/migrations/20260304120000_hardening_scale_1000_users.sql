-- ---------------------------------------------------------------------------
-- Hardening de esquema para escalar de forma sostenible (> 1.000 usuarios)
-- Objetivos:
--   1) Integridad de datos (evitar duplicados y valores fuera de dominio)
--   2) Mejorar patrones de consulta frecuentes con índices
--   3) Normalizar updated_at automático en tablas críticas
-- ---------------------------------------------------------------------------

-- 1) Función genérica para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2) Limpieza de datos antes de agregar constraints

-- 2.1) Deduplicar relaciones_usuarios manteniendo la más antigua
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY atleta_id, vinculado_id
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn
  FROM public.relaciones_usuarios
)
DELETE FROM public.relaciones_usuarios ru
USING ranked r
WHERE ru.id = r.id
  AND r.rn > 1;

-- 2.2) Deduplicar usuario_carreras (un usuario no debe tener la misma carrera repetida)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, carrera_id
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn
  FROM public.usuario_carreras
)
DELETE FROM public.usuario_carreras uc
USING ranked r
WHERE uc.id = r.id
  AND r.rn > 1;

-- 2.3) Normalizar prioridad legacy hacia A/B/C
UPDATE public.usuario_carreras
SET prioridad = CASE
  WHEN prioridad IN ('A', 'Alta', 'alta', 'ALTA') THEN 'A'
  WHEN prioridad IN ('B', 'Media', 'media', 'MEDIA') THEN 'B'
  WHEN prioridad IN ('C', 'Baja', 'baja', 'BAJA') THEN 'C'
  ELSE 'B'
END
WHERE prioridad IS DISTINCT FROM CASE
  WHEN prioridad IN ('A', 'Alta', 'alta', 'ALTA') THEN 'A'
  WHEN prioridad IN ('B', 'Media', 'media', 'MEDIA') THEN 'B'
  WHEN prioridad IN ('C', 'Baja', 'baja', 'BAJA') THEN 'C'
  ELSE 'B'
END;

-- 2.4) Asegurar no nulos para prioridad
UPDATE public.usuario_carreras
SET prioridad = 'B'
WHERE prioridad IS NULL;

-- 3) Constraints de integridad

-- 3.1) relaciones_usuarios: evitar vínculos duplicados y autorrelación
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.relaciones_usuarios'::regclass
      AND conname = 'relaciones_usuarios_atleta_vinculado_unique'
  ) THEN
    ALTER TABLE public.relaciones_usuarios
      ADD CONSTRAINT relaciones_usuarios_atleta_vinculado_unique
      UNIQUE (atleta_id, vinculado_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.relaciones_usuarios'::regclass
      AND conname = 'relaciones_usuarios_no_self_link'
  ) THEN
    ALTER TABLE public.relaciones_usuarios
      ADD CONSTRAINT relaciones_usuarios_no_self_link
      CHECK (atleta_id <> vinculado_id);
  END IF;
END $$;

-- 3.2) integraciones_terceros: 1 integración por plataforma/usuario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.integraciones_terceros'::regclass
      AND conname = 'integraciones_terceros_usuario_plataforma_unique'
  ) THEN
    ALTER TABLE public.integraciones_terceros
      ADD CONSTRAINT integraciones_terceros_usuario_plataforma_unique
      UNIQUE (usuario_id, plataforma);
  END IF;
END $$;

-- 3.2.1) Expandir checks de dominio para incluir valores nuevos
UPDATE public.integraciones_terceros
SET plataforma = 'intervals'
WHERE plataforma IS NULL
   OR plataforma NOT IN ('intervals', 'strava', 'garmin', 'wahoo');

UPDATE public.integraciones_terceros
SET estado = 'Inactiva'
WHERE estado IS NULL
   OR estado NOT IN ('Activa', 'Inactiva', 'Revocada');

ALTER TABLE public.integraciones_terceros
  DROP CONSTRAINT IF EXISTS integraciones_terceros_plataforma_check;

ALTER TABLE public.integraciones_terceros
  ADD CONSTRAINT integraciones_terceros_plataforma_check
  CHECK (plataforma IN ('intervals', 'strava', 'garmin', 'wahoo'));

ALTER TABLE public.integraciones_terceros
  DROP CONSTRAINT IF EXISTS integraciones_terceros_estado_check;

ALTER TABLE public.integraciones_terceros
  ADD CONSTRAINT integraciones_terceros_estado_check
  CHECK (estado IN ('Activa', 'Inactiva', 'Revocada'));

-- 3.3) usuario_carreras: una fila por usuario+carrera, prioridad controlada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.usuario_carreras'::regclass
      AND conname = 'usuario_carreras_user_carrera_unique'
  ) THEN
    ALTER TABLE public.usuario_carreras
      ADD CONSTRAINT usuario_carreras_user_carrera_unique
      UNIQUE (user_id, carrera_id);
  END IF;
END $$;

ALTER TABLE public.usuario_carreras
  ALTER COLUMN prioridad SET DEFAULT 'B';

ALTER TABLE public.usuario_carreras
  ALTER COLUMN prioridad SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.usuario_carreras'::regclass
      AND conname = 'usuario_carreras_prioridad_check'
  ) THEN
    ALTER TABLE public.usuario_carreras
      ADD CONSTRAINT usuario_carreras_prioridad_check
      CHECK (prioridad IN ('A', 'B', 'C'));
  END IF;
END $$;

-- 3.4) contactos_emergencia: solo un contacto principal por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_contactos_un_principal_por_usuario
  ON public.contactos_emergencia (usuario_id)
  WHERE es_principal = TRUE;

-- 3.5) cache/wellness: un registro diario por usuario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.wellness_cache'::regclass
      AND conname = 'wellness_cache_user_fecha_unique'
  ) THEN
    ALTER TABLE public.wellness_cache
      ADD CONSTRAINT wellness_cache_user_fecha_unique
      UNIQUE (user_id, fecha);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.actividades_cache'::regclass
      AND conname = 'actividades_cache_user_intervals_unique'
  ) THEN
    ALTER TABLE public.actividades_cache
      ADD CONSTRAINT actividades_cache_user_intervals_unique
      UNIQUE (user_id, intervals_id);
  END IF;
END $$;

-- 4) Índices para mejorar escalabilidad en consultas frecuentes

-- usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_activo
  ON public.usuarios (rol, activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_updated_at
  ON public.usuarios (updated_at DESC);

-- plan_entrenamientos
CREATE INDEX IF NOT EXISTS idx_plan_user_fecha_desc
  ON public.plan_entrenamientos (user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_plan_user_semana_inicio
  ON public.plan_entrenamientos (user_id, semana_inicio);
CREATE INDEX IF NOT EXISTS idx_plan_user_completado_fecha
  ON public.plan_entrenamientos (user_id, completado, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_plan_entrenador_fecha
  ON public.plan_entrenamientos (entrenador_id, fecha DESC);

-- usuario_carreras y carreras
CREATE INDEX IF NOT EXISTS idx_usuario_carreras_user_prioridad
  ON public.usuario_carreras (user_id, prioridad);
CREATE INDEX IF NOT EXISTS idx_usuario_carreras_preparar
  ON public.usuario_carreras (user_id, preparar_con_xerpa)
  WHERE preparar_con_xerpa = TRUE;
CREATE INDEX IF NOT EXISTS idx_carreras_fecha_estado
  ON public.carreras (fecha_inicio, estado);
CREATE INDEX IF NOT EXISTS idx_carreras_tipo_deporte_fecha
  ON public.carreras (tipo_deporte, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_carreras_pais_ciudad
  ON public.carreras (pais, ciudad);

-- relaciones
CREATE INDEX IF NOT EXISTS idx_relaciones_atleta_estado
  ON public.relaciones_usuarios (atleta_id, estado);
CREATE INDEX IF NOT EXISTS idx_relaciones_vinculado_estado
  ON public.relaciones_usuarios (vinculado_id, estado);

-- contactos y preferencias
CREATE INDEX IF NOT EXISTS idx_contactos_usuario
  ON public.contactos_emergencia (usuario_id);
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario
  ON public.preferencias_notificaciones (usuario_id);

-- integraciones
CREATE INDEX IF NOT EXISTS idx_integraciones_usuario_estado
  ON public.integraciones_terceros (usuario_id, estado);

-- analítica/cargas operativas
CREATE INDEX IF NOT EXISTS idx_analisis_user_semana
  ON public.analisis_semanal (user_id, semana_analizada DESC);
CREATE INDEX IF NOT EXISTS idx_actividades_user_fecha
  ON public.actividades_cache (user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_user_fecha
  ON public.wellness_cache (user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_esfuerzo_user_fecha
  ON public.esfuerzo_manual (user_id, fecha DESC);

-- 5) Triggers updated_at (tablas con columna updated_at)
DROP TRIGGER IF EXISTS trg_usuarios_set_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_set_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_plan_entrenamientos_set_updated_at ON public.plan_entrenamientos;
CREATE TRIGGER trg_plan_entrenamientos_set_updated_at
BEFORE UPDATE ON public.plan_entrenamientos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_preferencias_notificaciones_set_updated_at ON public.preferencias_notificaciones;
CREATE TRIGGER trg_preferencias_notificaciones_set_updated_at
BEFORE UPDATE ON public.preferencias_notificaciones
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_integraciones_terceros_set_updated_at ON public.integraciones_terceros;
CREATE TRIGGER trg_integraciones_terceros_set_updated_at
BEFORE UPDATE ON public.integraciones_terceros
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
