import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase';

export function useRaceCalendar(user) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchRaces();
  }, [user?.id]);

  async function fetchRaces() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('calendario_carreras')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: true });

      if (sbError) throw sbError;
      setRaces(data ?? []);
    } catch {
      setError('No pudimos cargar tus carreras. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function addRace(formData) {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) throw new Error('Usuario no autenticado.');

    const { data, error: insertError } = await supabase
      .from('calendario_carreras')
      .insert([{
        user_id: authUser.id,
        nombre: formData.nombre.trim(),
        fecha: formData.fecha.trim(),
        ciudad: formData.ciudad.trim() || null,
        distancia_km: formData.distancia_km ? Number(formData.distancia_km) : null,
        desnivel_m: formData.desnivel_m ? Number(formData.desnivel_m) : null,
        estado: 'Programada',
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Insertar en el estado local ordenando por fecha
    setRaces(prev =>
      [...prev, data].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    );

    return data;
  }

  return { races, loading, error, addRace };
}
