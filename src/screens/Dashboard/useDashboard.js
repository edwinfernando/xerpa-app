import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

const RPE_LABELS = {
  1: 'Suave / Recuperación',
  2: 'Suave / Recuperación',
  3: 'Suave / Recuperación',
  4: 'Moderado / Aeróbico',
  5: 'Moderado / Aeróbico',
  6: 'Moderado / Aeróbico',
  7: 'Duro / Umbral',
  8: 'Duro / Umbral',
  9: 'Máximo / Agónico',
  10: 'Máximo / Agónico',
};

function getWeekBounds() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    monday: monday.toISOString().split('T')[0],
    sunday: sunday.toISOString().split('T')[0],
  };
}

function getMotivationalMessage() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Tu ventana de rendimiento óptimo está abierta. ¡A entrenar!';
  if (h >= 12 && h < 15) return 'Recarga energía. La calidad de hoy es la forma de mañana.';
  if (h >= 15 && h < 20) return 'La tarde es tuya. Domina la sesión de hoy.';
  if (h >= 20 && h < 23) return 'Termina el día con fuerza. Cada kilómetro cuenta.';
  return 'El descanso es entrenamiento. Tu cuerpo mejora mientras duermes.';
}

export function useDashboard(user) {
  const [loading, setLoading] = useState(true);
  const [ctl, setCtl] = useState(null);
  const [atl, setAtl] = useState(null);
  const [tsb, setTsb] = useState(null);
  const [tssSemanal, setTssSemanal] = useState(null);
  const [tssPlaneadoSemanal, setTssPlaneadoSemanal] = useState(0);
  const [entrenoHoy, setEntrenoHoy] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [hasReportedToday, setHasReportedToday] = useState(false);
  const [rpeValue, setRpeValue] = useState(5);
  const [submittingRpe, setSubmittingRpe] = useState(false);
  const [nombre, setNombre] = useState('Atleta');
  const [proximaCarrera, setProximaCarrera] = useState(null);

  const fetchTodayPlan = useCallback(async (userId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('plan_entrenamientos')
      .select('*')
      .eq('fecha', hoy)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }, []);

  const fetchWellness = useCallback(async (userId) => {
    if (!userId) return null;
    const { data } = await supabase
      .from('wellness_cache')
      .select('atl, ctl, tsb, tss_semanal')
      .eq('user_id', userId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }, []);

  const fetchEsfuerzoHoy = useCallback(async (userId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('esfuerzo_manual')
      .select('id')
      .eq('user_id', userId)
      .eq('fecha', hoy)
      .limit(1)
      .maybeSingle();
    return !!data;
  }, []);

  const fetchTssPlaneadoSemanal = useCallback(async (userId) => {
    const { monday, sunday } = getWeekBounds();
    const { data } = await supabase
      .from('plan_entrenamientos')
      .select('tss_plan')
      .eq('user_id', userId)
      .gte('fecha', monday)
      .lte('fecha', sunday);
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, w) => sum + (Number(w.tss_plan) || 0), 0);
  }, []);

  const fetchProximaCarrera = useCallback(async (userId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('vista_calendario_atletas')
      .select('id, nombre, fecha_inicio, fecha_fin, ciudad, distancia_km')
      .eq('user_id', userId)
      .gte('fecha_inicio', hoy)
      .order('fecha_inicio', { ascending: true })
      .limit(1)
      .maybeSingle();
    return data;
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('athlete_id, nombre')
          .eq('id', user.id)
          .maybeSingle();

        let athId = null;
        if (!error) {
          athId = usuario?.athlete_id ?? null;
          if (usuario?.nombre) setNombre(usuario.nombre);
        }
        setHasData(!!athId);

        const [plan, wellness, reported, tssPlaneado, proxCarrera] = await Promise.all([
          fetchTodayPlan(user.id),
          fetchWellness(user.id),
          fetchEsfuerzoHoy(user.id),
          fetchTssPlaneadoSemanal(user.id),
          fetchProximaCarrera(user.id),
        ]);

        setEntrenoHoy(plan);
        setHasReportedToday(reported);
        setTssPlaneadoSemanal(tssPlaneado);
        setProximaCarrera(proxCarrera);

        if (wellness) {
          setCtl(wellness.ctl);
          setAtl(wellness.atl);
          setTsb(wellness.tsb);
          setTssSemanal(wellness.tss_semanal);
        }
      } catch {
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id, fetchTodayPlan, fetchWellness, fetchEsfuerzoHoy, fetchTssPlaneadoSemanal, fetchProximaCarrera]);

  const saveRPE = useCallback(async () => {
    if (!user?.id || rpeValue < 1 || rpeValue > 10) return;
    setSubmittingRpe(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('esfuerzo_manual').insert([
        { user_id: user.id, rpe: rpeValue, fecha: hoy },
      ]);
      if (error) throw error;
      setHasReportedToday(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar el esfuerzo.');
    } finally {
      setSubmittingRpe(false);
    }
  }, [user?.id, rpeValue]);

  const handleVincular = useCallback(() => {}, []);

  const getRpeColor = useCallback((value) => {
    const v = Math.round(value);
    if (v <= 3) return '#39FF14';
    if (v <= 6) return '#00F0FF';
    if (v <= 8) return '#ff9800';
    return '#ff5252';
  }, []);

  // Compute TSS progress percentage
  const tssProgressPct = tssPlaneadoSemanal > 0
    ? Math.min(Math.round(((tssSemanal || 0) / tssPlaneadoSemanal) * 100), 100)
    : 0;

  // Compute days until next race (based on fecha_inicio — when athlete travels/starts)
  const diasParaCarrera = proximaCarrera?.fecha_inicio
    ? Math.max(0, Math.ceil(
        (new Date(proximaCarrera.fecha_inicio + 'T12:00:00') - new Date()) / 86400000
      ))
    : null;

  return {
    loading,
    nombre: nombre || user?.email?.split('@')[0] || 'Atleta',
    ctl,
    atl,
    tsb,
    tssSemanal,
    tssPlaneadoSemanal,
    tssProgressPct,
    entrenoHoy,
    hasData,
    hasReportedToday,
    rpeValue,
    setRpeValue,
    submittingRpe,
    saveRPE,
    handleVincular,
    getRpeColor,
    rpeLabel: RPE_LABELS[rpeValue] || '',
    motivationalMessage: getMotivationalMessage(),
    proximaCarrera,
    diasParaCarrera,
  };
}
