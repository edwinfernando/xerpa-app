-- Columnas para tokens OAuth de Strava (access_token, refresh_token, expires_at)
-- Intervals usa id_externo + api_key; Strava usa id_externo + access_token + refresh_token + expires_at

ALTER TABLE public.integraciones_terceros
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.integraciones_terceros.access_token IS 'Token de acceso OAuth (Strava). Null para Intervals.';
COMMENT ON COLUMN public.integraciones_terceros.refresh_token IS 'Token de refresco OAuth (Strava). Null para Intervals.';
COMMENT ON COLUMN public.integraciones_terceros.expires_at IS 'Expiración del access_token (Strava). Null para Intervals.';
