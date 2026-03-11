/**
 * Plan (Semana actual + Historial).
 * - Generar Plan solo visible cuando no hay entrenos en la semana.
 * - TODO: Sincronizar con Intervals/Strava para marcar entrenos del día como
 *   completado si existe una actividad ese día (actividades_cache o API). Ver
 *   integraciones_terceros, esfuerzo_manual y n8n para el flujo de sync.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabase';
import { useToast } from '../../context/ToastContext';
import { useDeviceContext } from '../../hooks/useDeviceContext';
import { saveTodayPlan } from '../../services/offlineStorage';
import { buildN8nPayload } from '../../utils/buildN8nPayload';
import { getWeekBounds, generateWeekDays, groupByMonth } from '../../utils/dateUtils';

// ⚠️ Reemplaza esta URL con tu endpoint de n8n
const N8N_WEBHOOK_URL = 'https://untremulent-isoagglutinative-irving.ngrok-free.dev/webhook/chat';

export function usePlan(user) {
  const { showToast } = useToast();
  const { location, pushToken } = useDeviceContext();
  const [loading, setLoading] = useState(true);
  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [historyWorkouts, setHistoryWorkouts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { monday } = getWeekBounds();

  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_entrenamientos')
        .select(`
          id,
          user_id,
          fecha,
          tipo,
          titulo,
          detalle,
          duracion_min,
          tss_plan,
          tss_real,
          completado,
          hora,
          punto_encuentro,
          is_generado_ia,
          entrenador_id,
          nota_atleta
        `)
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;

      const all = data ?? [];
      setWeekWorkouts(
        all.filter(w => w.fecha >= monday).sort((a, b) => a.fecha.localeCompare(b.fecha))
      );
      setHistoryWorkouts(all.filter(w => w.fecha < monday));
    } catch {
      setWeekWorkouts([]);
      setHistoryWorkouts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id, monday]);

  useEffect(() => {
    if (!user?.id) return;

    fetchAll();

    const planSubscription = supabase
      .channel(`plan_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_entrenamientos',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchAll({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(planSubscription);
    };
  }, [user?.id, fetchAll]);

  // Cache plan de hoy para uso offline (WorkoutActiveScreen)
  useEffect(() => {
    const hoy = getWeekBounds().today;
    const planHoy = weekWorkouts.find(w => w.fecha === hoy) ?? null;
    if (planHoy) saveTodayPlan(planHoy).catch(() => {});
  }, [weekWorkouts]);

  const markComplete = async (id) => {
    const { error } = await supabase
      .from('plan_entrenamientos')
      .update({ completado: true })
      .eq('id', id);
    if (error) throw error;
    const updater = (w) => (w.id === id ? { ...w, completado: true } : w);
    setWeekWorkouts(prev => prev.map(updater));
    setHistoryWorkouts(prev => prev.map(updater));
  };

  const saveFeedback = async (id, nota_atleta) => {
    const payload = { completado: true, nota_atleta: nota_atleta?.trim() || null };
    const { error } = await supabase
      .from('plan_entrenamientos')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
    const updater = (w) => (w.id === id ? { ...w, ...payload } : w);
    setWeekWorkouts(prev => prev.map(updater));
    setHistoryWorkouts(prev => prev.map(updater));
  };

  const saveTimerSession = async ({ duracion_seg, rpe }) => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) throw new Error('Usuario no autenticado');
    const today = new Date().toISOString().split('T')[0];
    const duracionMin = Math.max(0, Math.round((Number(duracion_seg) || 0) / 60));
    const { error } = await supabase
      .from('esfuerzo_manual')
      .insert({ user_id: authUser.id, duracion_min: duracionMin, rpe, fecha: today });
    if (error) throw error;
  };

  const addManualWorkout = async (formData) => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('plan_entrenamientos')
      .insert({
        user_id: authUser.id,
        titulo: formData.titulo,
        fecha: formData.fecha,
        tipo: formData.tipo,
        duracion_min: formData.duracion_min ? parseInt(formData.duracion_min, 10) : null,
        tss_plan: formData.tss_plan ? parseFloat(formData.tss_plan) : null,
        detalle: formData.detalle || null,
        hora: formData.hora?.trim() || null,
        punto_encuentro: formData.punto_encuentro?.trim() || null,
        estado: 'Programada',
        completado: false,
      });

    if (error) throw error;
    await fetchAll();
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Usuario no autenticado');

      const [userRes, carrerasRes] = await Promise.all([
        supabase.from('usuarios').select('rol').eq('id', authUser.id).maybeSingle(),
        supabase
          .from('usuario_carreras')
          .select('prioridad, carreras(nombre, distancia_km, desnivel_m, tss_estimado)')
          .eq('user_id', authUser.id)
          .eq('preparar_con_xerpa', true)
          .order('prioridad'),
      ]);

      const carreraContext = (carrerasRes?.data ?? [])
        .filter((uc) => uc.carreras)
        .map((uc) => ({
          ...(typeof uc.carreras === 'object' ? uc.carreras : {}),
          prioridad: uc.prioridad ?? 'B',
        }));

      const body = buildN8nPayload({
        userId: authUser.id,
        mensaje: 'Generar plan semanal automático',
        rol: userRes?.data?.rol ?? 'Atleta',
        location,
        pushToken,
        carreraContext,
      });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Refrescar datos desde Supabase
      await fetchAll();
      showToast({ type: 'success', title: '¡Listo! 🚀', message: '¡Plan generado con éxito! A darlo todo.' });
    } catch (e) {
      showToast({ type: 'error', title: 'Error de XERPA', message: e?.message ?? 'Hubo un problema al generar el plan. Intenta de nuevo.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    loading,
    weekWorkouts,
    historyWorkouts,
    isGenerating,
    markComplete,
    saveFeedback,
    handleGeneratePlan,
    addManualWorkout,
    saveTimerSession,
    refetch: fetchAll,
  };
}
