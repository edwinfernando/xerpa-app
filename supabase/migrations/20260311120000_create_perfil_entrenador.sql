-- Perfil extendido para Entrenador / Tutor (imagen en usuarios.avatar_url)
-- Permite mostrar en el preview: profesión, club, descripción, logros, es atleta, calificación.
CREATE TABLE IF NOT EXISTS public.perfil_entrenador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  profesion TEXT,
  club TEXT,
  descripcion TEXT,
  es_tambien_atleta BOOLEAN DEFAULT false,
  calificacion_promedio NUMERIC(3,2) CHECK (calificacion_promedio IS NULL OR (calificacion_promedio >= 0 AND calificacion_promedio <= 5)),
  total_valoraciones INTEGER DEFAULT 0 CHECK (total_valoraciones >= 0),
  logros JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.perfil_entrenador IS 'Datos extendidos para perfil público de Entrenador/Tutor (preview al vincular).';
COMMENT ON COLUMN public.perfil_entrenador.logros IS 'Array de objetos: [{titulo, descripcion, anio}]';

CREATE INDEX IF NOT EXISTS idx_perfil_entrenador_usuario ON public.perfil_entrenador(usuario_id);

ALTER TABLE public.perfil_entrenador ENABLE ROW LEVEL SECURITY;

-- Cualquier autenticado puede leer perfiles de entrenador (para búsqueda por código).
CREATE POLICY "perfil_entrenador_select"
  ON public.perfil_entrenador FOR SELECT
  TO authenticated
  USING (true);

-- Solo el propio usuario puede insertar/actualizar su perfil entrenador.
CREATE POLICY "perfil_entrenador_insert_own"
  ON public.perfil_entrenador FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "perfil_entrenador_update_own"
  ON public.perfil_entrenador FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_perfil_entrenador_set_updated_at ON public.perfil_entrenador;
CREATE TRIGGER trg_perfil_entrenador_set_updated_at
  BEFORE UPDATE ON public.perfil_entrenador
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
