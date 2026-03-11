-- Permite al atleta desvincularse (UPDATE estado = 'Inactivo')
-- Necesario para que el atleta pueda cancelar/revocar vinculaciones con entrenadores o tutores

CREATE POLICY "relaciones_update_atleta"
  ON public.relaciones_usuarios FOR UPDATE
  USING (auth.uid() = atleta_id)
  WITH CHECK (auth.uid() = atleta_id);
