import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';

export function usePlan(user) {
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState([]);

  useEffect(() => {
    async function loadPlan() {
      if (!user?.id) return;

      setLoading(true);
      try {
        const hoy = new Date().toISOString().split('T')[0];
        const fin = new Date();
        fin.setDate(fin.getDate() + 7);
        const finStr = fin.toISOString().split('T')[0];

        const { data: planData, error } = await supabase
          .from('plan_entrenamientos')
          .select('*')
          .eq('user_id', user.id)
          .gte('fecha', hoy)
          .lte('fecha', finStr)
          .order('fecha', { ascending: true });

        setDias(!error && planData ? planData : []);
      } catch {
        setDias([]);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [user?.id]);

  return {
    loading,
    dias,
  };
}
