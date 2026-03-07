-- Vista enriquecida para catálogo global de eventos/carreras.
-- Mezcla carreras + catálogos + estructura de evento/edición/fecha.

DROP VIEW IF EXISTS public.vista_eventos_fecha_catalogo;

CREATE VIEW public.vista_eventos_fecha_catalogo AS
SELECT
  c.*,
  -- Labels de catálogos
  te.codigo AS tipo_evento_codigo,
  te.nombre AS tipo_evento_nombre,
  fe.codigo AS formato_evento_codigo,
  fe.nombre AS formato_evento_nombre,
  td.codigo AS tipo_deporte_codigo,
  td.nombre AS tipo_deporte_nombre,
  p.nombre AS pais_nombre,
  ci.nombre AS ciudad_nombre,
  -- Contexto evento/edición
  ep.id AS evento_plantilla_id,
  ep.nombre AS evento_plantilla_nombre,
  ee.id AS evento_edicion_id,
  ee.anio AS evento_anio,
  ef.id AS evento_fecha_id_ref,
  ef.numero_valida AS evento_numero_valida,
  ef.nombre AS evento_fecha_nombre,
  -- Copa
  co.id AS copa_id_ref,
  co.nombre AS copa_nombre,
  co.temporada AS copa_temporada
FROM public.carreras c
LEFT JOIN public.catalogo_tipos_evento te
  ON te.id = c.tipo_evento_id
LEFT JOIN public.catalogo_formatos_evento fe
  ON fe.id = c.formato_evento_id
LEFT JOIN public.catalogo_tipos_deporte td
  ON td.id = c.tipo_deporte_id
LEFT JOIN public.catalogo_paises p
  ON p.id = c.pais_id
LEFT JOIN public.catalogo_ciudades ci
  ON ci.id = c.ciudad_id
LEFT JOIN public.eventos_fechas ef
  ON ef.id = c.evento_fecha_id
LEFT JOIN public.eventos_ediciones ee
  ON ee.id = ef.edicion_id
LEFT JOIN public.eventos_plantilla ep
  ON ep.id = ee.evento_plantilla_id
LEFT JOIN public.copas co
  ON co.id = c.copa_id;

GRANT SELECT ON public.vista_eventos_fecha_catalogo TO authenticated, anon, service_role;

