-- Tabla relacional para relaciones atleta-entrenador/tutor
-- Sustituye columnas directas en usuarios: entrenador_id, atleta_id, codigo_asociado, parentesco

-- Crear tabla relaciones_usuarios
CREATE TABLE IF NOT EXISTS relaciones_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vinculado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_vinculo TEXT NOT NULL CHECK (tipo_vinculo IN ('Entrenador', 'Tutor')),
  parentesco TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Activo', 'Inactivo', 'Pendiente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(atleta_id, vinculado_id)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_relaciones_atleta ON relaciones_usuarios(atleta_id);
CREATE INDEX IF NOT EXISTS idx_relaciones_vinculado ON relaciones_usuarios(vinculado_id);
CREATE INDEX IF NOT EXISTS idx_relaciones_estado ON relaciones_usuarios(estado);

-- RLS
ALTER TABLE relaciones_usuarios ENABLE ROW LEVEL SECURITY;

-- Política: atleta y vinculado pueden leer sus propias relaciones
CREATE POLICY "relaciones_select_own"
  ON relaciones_usuarios FOR SELECT
  USING (auth.uid() = atleta_id OR auth.uid() = vinculado_id);

-- Política: atleta puede insertar (solicitud de vinculación)
CREATE POLICY "relaciones_insert_atleta"
  ON relaciones_usuarios FOR INSERT
  WITH CHECK (auth.uid() = atleta_id);

-- Política: vinculado (entrenador/tutor) puede actualizar estado
CREATE POLICY "relaciones_update_vinculado"
  ON relaciones_usuarios FOR UPDATE
  USING (auth.uid() = vinculado_id)
  WITH CHECK (auth.uid() = vinculado_id);
