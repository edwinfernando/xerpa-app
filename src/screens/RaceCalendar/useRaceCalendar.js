import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../supabase';
import { useUserContext } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

/** Prioridades para la IA del plan (WF06). */
export const PRIORIDADES = ['A', 'B', 'C'];

/** Tipos de deporte. */
export const TIPOS_DEPORTE = ['MTB', 'Ruta', 'Gravel', 'otros'];

/** Tabs del Marketplace. */
export const TABS = {
  MI_CALENDARIO: 'mi-calendario',
  EVENTOS_XERPA: 'eventos-xerpa',
  RUTAS_LOCALES: 'rutas-locales',
};

export function useRaceCalendar(user) {
  const { refreshUserRaces } = useUserContext();
  const { showToast } = useToast();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalRaces, setGlobalRaces] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [ctl, setCtl] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    pais: '',
    tipoDeporte: '',
    nivelDificultad: '',
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchRaces();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchWellness(user.id);
  }, [user?.id]);

  async function fetchWellness(userId) {
    const { data } = await supabase
      .from('wellness_cache')
      .select('ctl')
      .eq('user_id', userId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setCtl(data?.ctl ?? null);
  }

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
      setGlobalError('No pudimos cargar el catálogo de eventos.');
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredEventosXerpa = useMemo(() => {
    const base = globalRaces.filter((r) => (r.tipo_evento || 'xerpa') === 'xerpa');
    return applyFilters(base, filters);
  }, [globalRaces, filters]);

  const filteredRutasLocales = useMemo(() => {
    const base = globalRaces.filter((r) => r.tipo_evento === 'ruta_local');
    return applyFilters(base, filters);
  }, [globalRaces, filters]);

  async function enrollToRace(carreraId, prioridad = 'B') {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const p = PRIORIDADES.includes(prioridad) ? prioridad : 'B';
    const { error } = await supabase
      .from('usuario_carreras')
      .insert({ user_id: user.id, carrera_id: carreraId, prioridad: p });

    if (error) throw error;
    await fetchRaces();
    refreshUserRaces();
    showToast('¡Meta fijada! Nos vemos en la línea de salida');
  }

  async function unenrollFromRace(carreraId) {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');

    const { data: inscripcion, error: selError } = await supabase
      .from('usuario_carreras')
      .select('id')
      .eq('user_id', user.id)
      .eq('carrera_id', carreraId)
      .maybeSingle();

    if (selError) throw selError;
    if (!inscripcion) throw new Error('No se encontró la inscripción para cancelar.');

    const { error } = await supabase
      .from('usuario_carreras')
      .delete()
      .eq('id', inscripcion.id);

    if (error) throw error;
    await fetchRaces();
    await fetchGlobalRaces();
    refreshUserRaces();
    showToast('Inscripción cancelada. El calendario se ha actualizado');
  }

  async function setPrepararConXerpa(carreraId, activo, prioridad = 'A') {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');

    const { data: inscripcion, error: selError } = await supabase
      .from('usuario_carreras')
      .select('id')
      .eq('user_id', user.id)
      .eq('carrera_id', carreraId)
      .maybeSingle();

    if (selError) throw selError;
    if (!inscripcion) {
      await enrollToRace(carreraId, prioridad);
      const { data: nuevo } = await supabase
        .from('usuario_carreras')
        .select('id')
        .eq('user_id', user.id)
        .eq('carrera_id', carreraId)
        .maybeSingle();
      if (nuevo) {
        await supabase
          .from('usuario_carreras')
          .update({ preparar_con_xerpa: true, prioridad: 'A' })
          .eq('id', nuevo.id);
      }
    } else {
      const { error } = await supabase
        .from('usuario_carreras')
        .update({
          preparar_con_xerpa: activo,
          prioridad: activo ? prioridad : 'C',
        })
        .eq('id', inscripcion.id);

      if (error) throw error;
    }

    await fetchRaces();
    await fetchGlobalRaces();
    refreshUserRaces();
    if (activo) {
      showToast('XERPA priorizará esta carrera en tu plan (WF06)');
    }
  }

  async function addRace(formData) {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) throw new Error('Usuario no autenticado.');

    const fechaInicio = formData.fecha_inicio?.trim();
    const fechaFin = formData.fecha_fin?.trim() || fechaInicio;

    const { data: existing } = await supabase
      .from('carreras')
      .select('id')
      .eq('nombre', formData.nombre.trim())
      .eq('fecha_inicio', fechaInicio)
      .limit(1)
      .maybeSingle();

    let carreraId = existing?.id ?? null;

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
          tipo_evento: formData.tipo_evento || 'ruta_local',
          tipo_deporte: formData.tipo_deporte || null,
          pais: formData.pais?.trim() || null,
          tss_estimado: formData.tss_estimado ? Number(formData.tss_estimado) : null,
        })
        .select()
        .single();

      if (createError) throw createError;
      carreraId = newRace.id;
    }

    const prioridad = PRIORIDADES.includes(formData.prioridad) ? formData.prioridad : 'B';
    const { error: enrollError } = await supabase
      .from('usuario_carreras')
      .insert({ user_id: authUser.id, carrera_id: carreraId, prioridad });

    if (enrollError) throw enrollError;

    await fetchRaces();
    refreshUserRaces();
  }

  async function deleteRace(idInscripcion) {
    if (!idInscripcion) throw new Error('ID de inscripción requerido.');
    const { error } = await supabase
      .from('usuario_carreras')
      .delete()
      .eq('id', idInscripcion);

    if (error) throw error;
    await fetchRaces();
    refreshUserRaces();
  }

  async function updateRace(idInscripcion, updates) {
    if (!idInscripcion) throw new Error('ID de inscripción requerido.');
    const allowed = ['prioridad', 'notas', 'resultado', 'preparar_con_xerpa'];
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
    ctl,
    filters,
    setFilter,
    filteredEventosXerpa,
    filteredRutasLocales,
    addRace,
    deleteRace,
    updateRace,
    fetchGlobalRaces,
    enrollToRace,
    unenrollFromRace,
    setPrepararConXerpa,
    refetch: fetchRaces,
  };
}

function applyFilters(items, { search, pais, tipoDeporte, nivelDificultad }) {
  let result = items;

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        (r.nombre || '').toLowerCase().includes(q) ||
        (r.ciudad || '').toLowerCase().includes(q) ||
        (r.circuito_nombre || '').toLowerCase().includes(q)
    );
  }
  if (pais?.trim()) {
    result = result.filter((r) => (r.pais || '').toLowerCase() === pais.trim().toLowerCase());
  }
  if (tipoDeporte?.trim()) {
    result = result.filter((r) => (r.tipo_deporte || '').toLowerCase() === tipoDeporte.trim().toLowerCase());
  }
  if (nivelDificultad != null && nivelDificultad !== '') {
    const lvl = Number(nivelDificultad);
    result = result.filter((r) => Number(r.nivel_dificultad) === lvl);
  }

  return result;
}
