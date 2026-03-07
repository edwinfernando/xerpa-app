-- Expone la categoria seleccionada de la estructura nueva de eventos
-- para usarla en ficha de carrera e inscripciones.

DROP VIEW IF EXISTS public.vista_calendario_atletas;

CREATE VIEW public.vista_calendario_atletas AS
SELECT
  -- Inscripción del usuario (usuario_carreras)
  uc.id AS id,
  uc.id AS inscripcion_id,
  uc.user_id,
  uc.carrera_id,
  uc.categoria,
  uc.evento_fecha_categoria_id,
  ce.nombre AS evento_categoria_nombre,
  uc.prioridad,
  uc.resultado,
  uc.tss_real_carrera,
  uc.notas,
  uc.preparar_con_xerpa,
  uc.posicion,
  uc.created_at AS inscripcion_created_at,

  -- Catálogo de carreras (carreras)
  c.nombre,
  c.ciudad,
  c.fecha_inicio,
  c.fecha_fin,
  c.distancia_km,
  c.desnivel_m,
  c.nivel,
  c.estado,
  c.imagen_url,
  c.verificado,
  c.tipo_evento,
  c.tipo_deporte,
  c.nivel_dificultad,
  c.pais,
  c.descripcion_organizador,
  c.url_inscripcion,
  c.circuito_nombre,
  c.circuito_logo_url,
  c.tss_estimado,
  c.latitud,
  c.longitud,
  c.evento_fecha_id,
  c.created_at AS carrera_created_at
FROM public.usuario_carreras uc
JOIN public.carreras c
  ON c.id = uc.carrera_id
LEFT JOIN public.eventos_fecha_categorias efc
  ON efc.id = uc.evento_fecha_categoria_id
LEFT JOIN public.categorias_evento ce
  ON ce.id = efc.categoria_id;

GRANT SELECT ON public.vista_calendario_atletas TO authenticated, anon, service_role;

