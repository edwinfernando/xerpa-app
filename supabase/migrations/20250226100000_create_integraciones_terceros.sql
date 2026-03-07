-- Tabla relacional para integraciones con plataformas externas (Intervals.icu, Strava, Garmin)
-- Sustituye columnas obsoletas en usuarios: athlete_id, athlete_api_key, intervals_api_key

CREATE TABLE IF NOT EXISTS integraciones_terceros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  plataforma TEXT NOT NULL CHECK (plataforma IN ('intervals', 'strava', 'garmin')),
  id_externo TEXT,
  api_key TEXT,
  estado TEXT NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Inactiva')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, plataforma)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_integraciones_usuario ON integraciones_terceros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_integraciones_plataforma ON integraciones_terceros(plataforma);

-- RLS
ALTER TABLE integraciones_terceros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integraciones_select_own"
  ON integraciones_terceros FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "integraciones_insert_own"
  ON integraciones_terceros FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "integraciones_update_own"
  ON integraciones_terceros FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
