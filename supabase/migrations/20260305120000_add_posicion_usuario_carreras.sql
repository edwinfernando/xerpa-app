-- Añadir columna posicion a usuario_carreras para registrar puesto final en carreras.
-- El campo notas ya existe y se usa para sensaciones/objetivos.
-- NOTA: Si vista_calendario_atletas existe y usa columnas explícitas, recrear la vista
-- para incluir posicion. Si usa SELECT uc.*, la nueva columna se incluirá automáticamente.

ALTER TABLE public.usuario_carreras
  ADD COLUMN IF NOT EXISTS posicion INTEGER;

COMMENT ON COLUMN public.usuario_carreras.posicion IS 'Puesto final en la carrera (ej. 1, 15, 42).';
COMMENT ON COLUMN public.usuario_carreras.notas IS 'Sensaciones y objetivos post-carrera. Usado por PastRaceResultSheet.';
