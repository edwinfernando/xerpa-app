-- ─────────────────────────────────────────────────────────────────────────────
-- Añadir coordenadas de ubicación de la pista en carreras
-- Permite abrir la ubicación en el mapa/navegador del dispositivo
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE carreras ADD COLUMN IF NOT EXISTS latitud DOUBLE PRECISION;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS longitud DOUBLE PRECISION;

COMMENT ON COLUMN carreras.latitud IS 'Latitud de la ubicación de la pista/start. Permite abrir en mapas del dispositivo.';
COMMENT ON COLUMN carreras.longitud IS 'Longitud de la ubicación de la pista/start. Permite abrir en mapas del dispositivo.';
