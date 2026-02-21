import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabase';

export function useRaceCalendar(user) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalRaces, setGlobalRaces] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchRaces();
  }, [user?.id]);

  // ─── Lectura Mis Carreras ─────────────────────────────────
  async function fetchRaces() {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('vista_calendario_atletas')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_inicio', { ascending: true });

      if (sbError) throw sbError;
      setRaces(data ?? []);
    } catch {
      setError('No pudimos cargar tus carreras. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Lectura Calendario Global ─────────────────────────────
  const fetchGlobalRaces = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('carreras')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (sbError) throw sbError;
      setGlobalRaces(data ?? []);
    } catch {
      setGlobalError('No pudimos cargar el calendario global.');
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  // ─── Inscripción desde catálogo global ─────────────────────
  async function enrollToRace(carreraId) {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const { error } = await supabase
      .from('usuario_carreras')
      .insert({ user_id: user.id, carrera_id: carreraId, prioridad: 'Media' });

    if (error) throw error;
    await fetchRaces();
  }

  // ─── Cancelar inscripción (por carrera_id desde global) ─────
  async function unenrollFromRace(carreraId) {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const { error } = await supabase
      .from('usuario_carreras')
      .delete()
      .match({ user_id: user.id, carrera_id: carreraId });

    if (error) throw error;
    await fetchRaces();
    await fetchGlobalRaces();
  }

  // ─── Inserción (3 pasos) ──────────────────────────────────
  async function addRace(formData) {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) throw new Error('Usuario no autenticado.');

    try {
      const fechaInicio = formData.fecha_inicio?.trim();
      const fechaFin = formData.fecha_fin?.trim() || fechaInicio; // Si no hay fin, usar inicio (un solo día)

      // ── Paso A: buscar la carrera en el catálogo global ──
      const { data: existing } = await supabase
        .from('carreras')
        .select('id')
        .eq('nombre', formData.nombre.trim())
        .eq('fecha_inicio', fechaInicio)
        .limit(1)
        .maybeSingle();

      let carreraId = existing?.id ?? null;

      // ── Paso B: crear en el catálogo global si no existe ──
      if (!carreraId) {
        const { data: newRace, error: createError } = await supabase
          .from('carreras')
          .insert({
            nombre: formData.nombre.trim(),
            ciudad: formData.ciudad.trim() || null,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            distancia_km: formData.distancia_km ? Number(formData.distancia_km) : null,
            desnivel_m: formData.desnivel_m ? Number(formData.desnivel_m) : null,
          })
          .select()
          .single();

        if (createError) throw createError;
        carreraId = newRace.id;
      }

      // ── Paso C: inscribir al atleta ───────────────────────
      const { error: enrollError } = await supabase
        .from('usuario_carreras')
        .insert({ user_id: authUser.id, carrera_id: carreraId, prioridad: 'Media' });

      if (enrollError) throw enrollError;

      // Recargar la lista desde la vista para reflejar el nuevo registro
      await fetchRaces();

    } catch (e) {
      throw e;
    }
  }

  // ─── Eliminación ────────────────────────────────────────────
  // La vista NO soporta DELETE. Siempre usar la tabla pivote usuario_carreras.
  // idInscripcion = id del registro en usuario_carreras (expuesto por vista_calendario_atletas como "id").
  async function deleteRace(idInscripcion) {
    if (!idInscripcion) throw new Error('ID de inscripción requerido.');
    try {
      const { error } = await supabase
        .from('usuario_carreras')
        .delete()
        .eq('id', idInscripcion);

      if (error) throw error;
      await fetchRaces();
    } catch (e) {
      throw e;
    }
  }

  // ─── Actualización ──────────────────────────────────────────
  // La vista NO soporta UPDATE. Siempre usar la tabla pivote.
  // Campos editables: prioridad, notas, resultado.
  async function updateRace(idInscripcion, updates) {
    if (!idInscripcion) throw new Error('ID de inscripción requerido.');
    const allowed = ['prioridad', 'notas', 'resultado'];
    const payload = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, k)) {
        payload[k] = updates[k];
      }
    }
    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase
      .from('usuario_carreras')
      .update(payload)
      .eq('id', idInscripcion);

    if (error) throw error;
    await fetchRaces();
  }

  return {
    races,
    loading,
    error,
    globalRaces,
    globalLoading,
    globalError,
    addRace,
    deleteRace,
    updateRace,
    fetchGlobalRaces,
    enrollToRace,
    unenrollFromRace,
    refetch: fetchRaces,
  };
}
