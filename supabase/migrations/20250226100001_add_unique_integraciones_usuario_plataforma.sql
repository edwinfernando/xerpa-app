-- Añade UNIQUE(usuario_id, plataforma) para permitir upsert en integraciones_terceros
-- Requerido por el código que usa: .upsert(..., { onConflict: 'usuario_id,plataforma' })

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.integraciones_terceros'::regclass
    AND conname = 'integraciones_terceros_usuario_plataforma_unique'
  ) THEN
    ALTER TABLE public.integraciones_terceros
    ADD CONSTRAINT integraciones_terceros_usuario_plataforma_unique
    UNIQUE (usuario_id, plataforma);
  END IF;
END $$;
