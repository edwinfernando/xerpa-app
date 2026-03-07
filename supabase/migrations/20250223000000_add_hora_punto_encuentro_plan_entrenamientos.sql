-- Agregar campos hora y punto_encuentro a plan_entrenamientos
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase

ALTER TABLE plan_entrenamientos
ADD COLUMN IF NOT EXISTS hora TEXT,
ADD COLUMN IF NOT EXISTS punto_encuentro TEXT;

-- Ejemplo de valores:
-- hora: '08:00', '18:30', etc.
-- punto_encuentro: 'Parque Central', 'Velódromo Municipal', etc.
