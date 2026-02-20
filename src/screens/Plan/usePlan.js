import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

// ⚠️ Reemplaza esta URL con tu endpoint de n8n
const N8N_WEBHOOK_URL = 'https://untremulent-isoagglutinative-irving.ngrok-free.dev/webhook/chat';

// ─── Helpers de fecha ────────────────────────────────────────
export function getWeekBounds() {
  const today = new Date();
  const day = today.getDay(); // 0=Dom, 1=Lun…
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    monday: monday.toISOString().split('T')[0],
    sunday: sunday.toISOString().split('T')[0],
    today: today.toISOString().split('T')[0],
  };
}

export function generateWeekDays(mondayStr) {
  const days = [];
  const base = new Date(mondayStr + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function groupByMonth(workouts) {
  const groups = {};
  workouts.forEach(w => {
    const d = new Date(w.fecha + 'T00:00:00');
    const key = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });
  return Object.entries(groups).map(([month, items]) => ({ month, items }));
}

// ─── Hook ────────────────────────────────────────────────────
export function usePlan(user) {
  const [loading, setLoading] = useState(true);
  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [historyWorkouts, setHistoryWorkouts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { monday } = getWeekBounds();

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_entrenamientos')
        .select('*')
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
      setLoading(false);
    }
  }, [user?.id, monday]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markComplete = async (id) => {
    try {
      const { error } = await supabase
        .from('plan_entrenamientos')
        .update({ completado: true })
        .eq('id', id);
      if (error) throw error;
      setWeekWorkouts(prev =>
        prev.map(w => w.id === id ? { ...w, completado: true } : w)
      );
    } catch {
      Alert.alert('Error', 'No se pudo marcar como completado.');
    }
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
        estado: 'Programada',
        completado: false,
      });

    if (error) throw error;
    await fetchAll();
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      // Obtener usuario autenticado
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error('Usuario no autenticado');

      // Obtener rol del usuario
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', authUser.id)
        .maybeSingle();

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authUser.id,
          message: 'Generar plan semanal automático',
          rol: userData?.rol ?? 'Atleta',
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Refrescar datos desde Supabase
      await fetchAll();
      Alert.alert('¡Listo! 🚀', '¡Plan generado con éxito! A darlo todo.');
    } catch {
      Alert.alert(
        'Error de conexión',
        'Hubo un problema de conexión al generar el plan. Intenta de nuevo.'
      );
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
    handleGeneratePlan,
    addManualWorkout,
    refetch: fetchAll,
  };
}
