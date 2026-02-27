-- ─────────────────────────────────────────────────────────────────────────────
-- Carreras Marketplace: schema para Marketplace de Eventos
-- Tablas: carreras, usuario_carreras
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extender carreras para Marketplace
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS tipo_evento TEXT DEFAULT 'xerpa' CHECK (tipo_evento IN ('xerpa', 'ruta_local'));
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS tipo_deporte TEXT CHECK (tipo_deporte IN ('MTB', 'Ruta', 'Gravel', 'otros') OR tipo_deporte IS NULL);
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS nivel_dificultad INTEGER CHECK (nivel_dificultad BETWEEN 1 AND 5 OR nivel_dificultad IS NULL);
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS pais TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS descripcion_organizador TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS url_inscripcion TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS circuito_nombre TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS circuito_logo_url TEXT;
ALTER TABLE carreras ADD COLUMN IF NOT EXISTS tss_estimado NUMERIC(8,2);

-- 2. Extender usuario_carreras: prioridad A/B/C + preparar_con_xerpa
ALTER TABLE usuario_carreras ADD COLUMN IF NOT EXISTS preparar_con_xerpa BOOLEAN DEFAULT FALSE;
-- prioridad: A=objetivo principal, B=secundario, C=terciario (usado por WF06).
COMMENT ON COLUMN usuario_carreras.prioridad IS 'A=objetivo principal, B=secundario, C=terciario. Usado por WF06 para priorizar en el plan.';

-- NOTA: Si existe vista_calendario_atletas, debe incluir carrera_id y preparar_con_xerpa
-- de usuario_carreras para que el Marketplace muestre correctamente el estado.
