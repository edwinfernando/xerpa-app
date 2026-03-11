-- Permite que usuarios autenticados lean solo perfiles de Entrenador o Tutor por código.
-- Un atleta puede buscar entrenador/tutor por codigo, pero NO ver datos de otros atletas.
DROP POLICY IF EXISTS "usuarios_select_vinculacion" ON public.usuarios;
CREATE POLICY "usuarios_select_vinculacion"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (rol IN ('Entrenador', 'Tutor'));
