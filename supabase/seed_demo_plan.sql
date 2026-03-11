-- =============================================================================
-- Planes DEMO: 2 semanas para usuario de prueba
-- =============================================================================
-- Ejecuta en SQL Editor de Supabase.
-- Usa el primer usuario con rol 'Atleta' de la tabla usuarios.
-- Genera: semana actual (7 días) + semana pasada (7 días en historial) = 2 semanas
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_monday DATE;
  v_fecha DATE;
  v_tipos TEXT[] := ARRAY['Ride', 'Run', 'Strength', 'Rest', 'Ride', 'Run', 'Rest'];
  v_titulos TEXT[] := ARRAY[
    'Fondo suave Z2',
    'Intervalos 8x3min',
    'Fuerza piernas',
    'Descanso',
    'Tempo 45min',
    'Recovery run',
    'Descanso activo'
  ];
  v_duracion INT[] := ARRAY[90, 60, 45, 0, 60, 35, 0];
  v_tss INT[] := ARRAY[55, 72, 35, 0, 65, 42, 0];
  v_detalles TEXT[] := ARRAY[
    'Z2 constante, cadencia 85-90.',
    'Calentamiento 15min. 8 series 3min fuerte / 2min suave. Enfriamiento 10min.',
    'Sentadillas, prensa, extensiones. 3 series x 12 rep.',
    NULL,
    'Bloque tempo 45min en Z3.',
    'Z1-Z2 muy suave, 30-35min.',
    NULL
  ];
  v_hora TEXT[] := ARRAY['06:30', '07:00', NULL, NULL, '18:00', '06:45', NULL];
  v_punto TEXT[] := ARRAY['Salida Parque', 'Pista', NULL, NULL, 'Rodadero', 'Home', NULL];
  i INT;
BEGIN
  v_user_id := '4f373155-250f-4f19-8180-5897a90bbe33'::uuid;

  -- Borrar planes previos del usuario para evitar duplicados al re-ejecutar
  DELETE FROM public.plan_entrenamientos WHERE user_id = v_user_id;

  -- Lunes de la semana actual (ISO: Lun=1, Dom=7)
  v_monday := CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1));

  FOR i IN 1..7 LOOP
    v_fecha := v_monday + (i - 1);
    INSERT INTO public.plan_entrenamientos (
      user_id,
      fecha,
      tipo,
      titulo,
      detalle,
      duracion_min,
      tss_plan,
      completado,
      hora,
      punto_encuentro,
      is_generado_ia,
      estado
    ) VALUES (
      v_user_id,
      v_fecha,
      v_tipos[i],
      v_titulos[i],
      v_detalles[i],
      v_duracion[i],
      v_tss[i],
      FALSE,
      v_hora[i],
      v_punto[i],
      TRUE,
      'Programada'
    );
  END LOOP;

  -- Historial: semana pasada (Lun, Mar, Jue completados con nota_atleta)
  v_monday := v_monday - 7;
  FOR i IN 1..7 LOOP
    v_fecha := v_monday + (i - 1);
    INSERT INTO public.plan_entrenamientos (
      user_id,
      fecha,
      tipo,
      titulo,
      detalle,
      duracion_min,
      tss_plan,
      completado,
      hora,
      punto_encuentro,
      is_generado_ia,
      nota_atleta,
      estado
    ) VALUES (
      v_user_id,
      v_fecha,
      v_tipos[i],
      'Semana pasada: ' || v_titulos[i],
      v_detalles[i],
      v_duracion[i],
      v_tss[i],
      i IN (1, 2, 4),
      v_hora[i],
      v_punto[i],
      TRUE,
      CASE WHEN i = 1 THEN 'Muy bien, piernas frescas.' WHEN i = 2 THEN 'Duro pero cumplido.' ELSE NULL END,
      'Programada'
    );
  END LOOP;

  RAISE NOTICE 'Plan demo: 2 semanas insertadas para user_id %. Semana actual + historial.', v_user_id;
END;
$$;
