-- Agregar is_generado_ia, entrenador_id y nota_atleta a plan_entrenamientos
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase

ALTER TABLE plan_entrenamientos
ADD COLUMN IF NOT EXISTS is_generado_ia BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entrenador_id UUID REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS nota_atleta TEXT;
