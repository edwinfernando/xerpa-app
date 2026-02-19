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

export function useDashboard(user) {
  const [loading, setLoading] = useState(true);
  const [ctl, setCtl] = useState(null);
  const [atl, setAtl] = useState(null);
  const [tsb, setTsb] = useState(null);
  const [tssSemanal, setTssSemanal] = useState(null);
  const [entrenoHoy, setEntrenoHoy] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [hasReportedToday, setHasReportedToday] = useState(false);
  const [rpeValue, setRpeValue] = useState(5);
  const [submittingRpe, setSubmittingRpe] = useState(false);
  const [nombre, setNombre] = useState('Atleta');

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

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      setLoading(true);
      try {
        let athId = null;
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('athlete_id, nombre')
          .eq('id', user.id)
          .maybeSingle();
        if (!error) {
          athId = usuario?.athlete_id ?? null;
          if (usuario?.nombre) setNombre(usuario.nombre);
        }
        setHasData(!!athId);

        const [plan, wellness, reported] = await Promise.all([
          fetchTodayPlan(user.id),
          fetchWellness(user.id),
          fetchEsfuerzoHoy(user.id),
        ]);

        setEntrenoHoy(plan);
        setHasReportedToday(reported);

        if (wellness) {
          setCtl(wellness.ctl);
          setAtl(wellness.atl);
          setTsb(wellness.tsb);
          setTssSemanal(wellness.tss_semanal);
        } else {
          setCtl(null);
          setAtl(null);
          setTsb(null);
          setTssSemanal(null);
        }
      } catch (err) {
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id, fetchTodayPlan, fetchWellness, fetchEsfuerzoHoy]);

  const saveRPE = useCallback(async () => {
    if (!user?.id || rpeValue < 1 || rpeValue > 10) return;

    setSubmittingRpe(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('esfuerzo_manual').insert([
        {
          user_id: user.id,
          rpe: rpeValue,
          fecha: hoy,
        },
      ]);

      if (error) throw error;

      setHasReportedToday(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar el esfuerzo.');
    } finally {
      setSubmittingRpe(false);
    }
  }, [user?.id, rpeValue]);

  const handleVincular = useCallback(() => {
    // Navegar a Perfil para vincular
  }, []);

  const getRpeColor = useCallback((value) => {
    const v = Math.round(value);
    if (v <= 3) return '#39FF14';
    if (v <= 6) return '#00F0FF';
    if (v <= 8) return '#ff9800';
    return '#ff5252';
  }, []);

  return {
    loading,
    nombre: nombre || user?.email?.split('@')[0] || 'Atleta',
    ctl,
    atl,
    tsb,
    tssSemanal,
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
  };
}
