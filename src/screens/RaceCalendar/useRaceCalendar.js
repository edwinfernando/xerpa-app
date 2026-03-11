import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../supabase';
import { useUserContext } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

/** Prioridades para la IA del plan (WF06). */
import { PRIORIDADES } from '../../constants/prioridades';

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
  const [addRaceCatalogs, setAddRaceCatalogs] = useState({
    tiposEvento: [],
    formatosEvento: [],
    tiposDeporte: [],
    paises: [],
    ciudades: [],
  });
  const [addRaceCatalogsLoading, setAddRaceCatalogsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    pais: '',
    tipoDeporte: '',
    tipoEvento: '',
    formatoEvento: '',
    copa: '',
    mes: '',
    sortBy: 'fecha_asc',
  });

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

  const fetchRaces = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    fetchRaces();

    const racesSubscription = supabase
      .channel(`races_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuario_carreras',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRaces({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(racesSubscription);
    };
  }, [user?.id, fetchRaces]);

  const fetchGlobalRaces = useCallback(async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('vista_eventos_fecha_catalogo')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (sbError) {
        // Fallback temporal mientras la vista nueva no existe en algunos entornos.
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('carreras')
          .select('*')
          .order('fecha_inicio', { ascending: true });
        if (fallbackError) throw fallbackError;
        setGlobalRaces(fallbackData ?? []);
      } else {
        setGlobalRaces(data ?? []);
      }
    } catch {
      setGlobalError('No pudimos cargar el catálogo de eventos.');
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  const fetchAddRaceCatalogs = useCallback(async () => {
    setAddRaceCatalogsLoading(true);
    try {
      const [
        { data: tiposEventoData, error: tiposEventoError },
        { data: formatosEventoData, error: formatosEventoError },
        { data: tiposDeporteData, error: tiposDeporteError },
        { data: paisesData, error: paisesError },
        { data: ciudadesData, error: ciudadesError },
      ] = await Promise.all([
        supabase
          .from('catalogo_tipos_evento')
          .select('id, codigo, nombre')
          .eq('activo', true)
          .order('nombre', { ascending: true }),
        supabase
          .from('catalogo_formatos_evento')
          .select('id, codigo, nombre')
          .eq('activo', true)
          .order('nombre', { ascending: true }),
        supabase
          .from('catalogo_tipos_deporte')
          .select('id, codigo, nombre')
          .eq('activo', true)
          .order('nombre', { ascending: true }),
        supabase
          .from('catalogo_paises')
          .select('id, codigo_iso2, nombre')
          .order('nombre', { ascending: true }),
        supabase
          .from('catalogo_ciudades')
          .select('id, nombre, pais_id')
          .order('nombre', { ascending: true }),
      ]);

      if (tiposEventoError) throw tiposEventoError;
      if (formatosEventoError) throw formatosEventoError;
      if (tiposDeporteError) throw tiposDeporteError;
      if (paisesError) throw paisesError;
      if (ciudadesError) throw ciudadesError;

      setAddRaceCatalogs({
        tiposEvento: tiposEventoData ?? [],
        formatosEvento: formatosEventoData ?? [],
        tiposDeporte: tiposDeporteData ?? [],
        paises: paisesData ?? [],
        ciudades: ciudadesData ?? [],
      });
    } catch (e) {
      setAddRaceCatalogs({
        tiposEvento: [],
        formatosEvento: [],
        tiposDeporte: [],
        paises: [],
        ciudades: [],
      });
      showToast('No se pudieron cargar los catálogos para añadir carrera.');
    } finally {
      setAddRaceCatalogsLoading(false);
    }
  }, [showToast]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  function applySort(items, sortBy) {
    const list = [...items];
    switch (sortBy) {
      case 'fecha_desc':
        return list.sort((a, b) => (b.fecha_inicio || '').localeCompare(a.fecha_inicio || ''));
      case 'distancia_desc': {
        return list.sort((a, b) => (Number(b.distancia_km) || 0) - (Number(a.distancia_km) || 0));
      }
      case 'desnivel_desc': {
        return list.sort((a, b) => (Number(b.desnivel_m) || 0) - (Number(a.desnivel_m) || 0));
      }
      case 'fecha_asc':
      default:
        return list.sort((a, b) => (a.fecha_inicio || '').localeCompare(b.fecha_inicio || ''));
    }
  }

  const filteredRaces = useMemo(() => {
    const filtered = applyFilters(races, filters);
    return applySort(filtered, filters.sortBy || 'fecha_asc');
  }, [races, filters]);

  const filteredEventosXerpa = useMemo(() => {
    const base = globalRaces.filter((r) => {
      const tipoCodigo = (r.tipo_evento_codigo || r.tipo_evento || '').toLowerCase();
      return (tipoCodigo || 'xerpa') === 'xerpa' || tipoCodigo === 'competencia';
    });
    const filtered = applyFilters(base, filters);
    return applySort(filtered, filters.sortBy || 'fecha_asc');
  }, [globalRaces, filters]);

  const filteredRutasLocales = useMemo(() => {
    const base = globalRaces.filter((r) => {
      const tipoCodigo = (r.tipo_evento_codigo || r.tipo_evento || '').toLowerCase();
      return tipoCodigo === 'ruta_local' || tipoCodigo === 'travesia';
    });
    const filtered = applyFilters(base, filters);
    return applySort(filtered, filters.sortBy || 'fecha_asc');
  }, [globalRaces, filters]);

  const filterOptionsByTab = useMemo(() => {
    const getMonth = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
    };

    const buildOptions = (data) => ({
      meses: [...new Set((data || []).map((r) => getMonth(r.fecha_inicio)).filter(Boolean))],
      paises: [...new Set((data || []).map((r) => r.pais_nombre || r.pais).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
      deportes: [...new Set(
        (data || [])
          .map((r) => r.tipo_deporte_nombre || r.tipo_deporte || r.tipoDeporte || r.tipo_evento)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
      tiposEvento: [...new Set(
        (data || [])
          .map((r) => r.tipo_evento_nombre || r.tipo_evento_codigo || r.tipo_evento)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
      formatos: [...new Set(
        (data || [])
          .map((r) => r.formato_evento_nombre || r.formato_evento_codigo)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
      copas: [...new Set(
        (data || [])
          .map((r) => r.copa_nombre)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    });

    const eventosXerpa = globalRaces.filter((r) => {
      const tipoCodigo = (r.tipo_evento_codigo || r.tipo_evento || '').toLowerCase();
      return (tipoCodigo || 'xerpa') === 'xerpa' || tipoCodigo === 'competencia';
    });
    const rutasLocales = globalRaces.filter((r) => {
      const tipoCodigo = (r.tipo_evento_codigo || r.tipo_evento || '').toLowerCase();
      return tipoCodigo === 'ruta_local' || tipoCodigo === 'travesia';
    });

    return {
      [TABS.MI_CALENDARIO]: buildOptions(races),
      [TABS.EVENTOS_XERPA]: buildOptions(eventosXerpa),
      [TABS.RUTAS_LOCALES]: buildOptions(rutasLocales),
    };
  }, [races, globalRaces]);

  async function enrollToRace(carreraId, prioridad = 'B', eventoFechaCategoriaId = null) {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const p = PRIORIDADES.includes(prioridad) ? prioridad : 'B';
    const payload = {
      user_id: user.id,
      carrera_id: carreraId,
      prioridad: p,
      ...(eventoFechaCategoriaId ? { evento_fecha_categoria_id: eventoFechaCategoriaId } : {}),
    };
    const { error } = await supabase
      .from('usuario_carreras')
      .upsert(
        payload,
        { onConflict: 'user_id,carrera_id' }
      );

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
    const tipoEventoCode = (formData.tipo_evento_codigo || formData.tipo_evento || 'ruta_local').trim();
    const tipoDeporteLabel = (formData.tipo_deporte_nombre || formData.tipo_deporte || '').trim() || null;
    const paisLabel = (formData.pais_nombre || formData.pais || '').trim() || null;
    const ciudadLabel = (formData.ciudad_nombre || formData.ciudad || '').trim() || null;
    const circuitoNombre = (formData.circuito_nombre || '').trim() || null;
    const latitud = formData.latitud !== '' && formData.latitud != null ? Number(formData.latitud) : null;
    const longitud = formData.longitud !== '' && formData.longitud != null ? Number(formData.longitud) : null;

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
          circuito_nombre: circuitoNombre,
          ciudad: ciudadLabel,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          distancia_km: formData.distancia_km ? Number(formData.distancia_km) : null,
          desnivel_m: formData.desnivel_m ? Number(formData.desnivel_m) : null,
          latitud: Number.isFinite(latitud) ? latitud : null,
          longitud: Number.isFinite(longitud) ? longitud : null,
          tipo_evento: tipoEventoCode,
          tipo_deporte: tipoDeporteLabel,
          pais: paisLabel,
          tipo_evento_id: formData.tipo_evento_id || null,
          formato_evento_id: formData.formato_evento_id || null,
          tipo_deporte_id: formData.tipo_deporte_id || null,
          pais_id: formData.pais_id || null,
          ciudad_id: formData.ciudad_id || null,
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
      .upsert(
        { user_id: authUser.id, carrera_id: carreraId, prioridad },
        { onConflict: 'user_id,carrera_id' }
      );

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
    const allowed = ['prioridad', 'notas', 'resultado', 'preparar_con_xerpa', 'posicion'];
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

  /** Actualiza resultado de carrera por carrera_id (útil cuando la vista expone carrera_id como id). */
  async function updateRaceByCarreraId(carreraId, updates) {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const allowed = ['prioridad', 'notas', 'resultado', 'preparar_con_xerpa', 'posicion'];
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
      .eq('user_id', user.id)
      .eq('carrera_id', carreraId);

    if (error) throw error;
    await fetchRaces();
  }

  async function fetchCarreraById(carreraId) {
    if (!carreraId) return null;
    const id = String(carreraId).trim();
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? { ...data, id: data.id, carrera_id: data.id } : null;
    } catch {
      return null;
    }
  }

  async function fetchRaceCategories(carrera) {
    if (!carrera?.id) return [];

    let eventoFechaId = carrera.evento_fecha_id ?? null;
    if (!eventoFechaId) {
      const { data: raceData, error: raceError } = await supabase
        .from('carreras')
        .select('evento_fecha_id')
        .eq('id', carrera.id)
        .maybeSingle();
      if (raceError) throw raceError;
      eventoFechaId = raceData?.evento_fecha_id ?? null;
    }
    if (!eventoFechaId) return [];

    const { data: efcData, error: efcError } = await supabase
      .from('eventos_fecha_categorias')
      .select('id, categoria_id, cupo, precio, activo')
      .eq('evento_fecha_id', eventoFechaId)
      .order('created_at', { ascending: true });
    if (efcError) throw efcError;

    const efcList = efcData ?? [];
    if (!efcList.length) return [];

    const categoriaIds = [...new Set(efcList.map((x) => x.categoria_id).filter(Boolean))];
    const efcIds = efcList.map((x) => x.id);

    const [{ data: categoriasData, error: categoriasError }, { data: configsData, error: configsError }] =
      await Promise.all([
        categoriaIds.length
          ? supabase
            .from('categorias_evento')
            .select('id, codigo, nombre, sexo, edad_min, edad_max')
            .in('id', categoriaIds)
          : Promise.resolve({ data: [], error: null }),
        efcIds.length
          ? supabase
            .from('eventos_fecha_categoria_recorrido')
            .select('evento_fecha_categoria_id, recorrido_id, numero_vueltas, distancia_objetivo_km, desnivel_objetivo_m, tiempo_corte_min, es_oficial')
            .in('evento_fecha_categoria_id', efcIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (categoriasError) throw categoriasError;
    if (configsError) throw configsError;

    const recorridoIds = [...new Set((configsData || []).map((x) => x.recorrido_id).filter(Boolean))];
    const { data: recorridosData, error: recorridosError } = recorridoIds.length
      ? await supabase
        .from('eventos_fecha_recorridos')
        .select('id, nombre, distancia_km, desnivel_m')
        .in('id', recorridoIds)
      : { data: [], error: null };

    if (recorridosError) throw recorridosError;

    const categoriaMap = new Map((categoriasData || []).map((c) => [c.id, c]));
    const recorridoMap = new Map((recorridosData || []).map((r) => [r.id, r]));
    const configsByEfc = new Map();
    for (const cfg of configsData || []) {
      const list = configsByEfc.get(cfg.evento_fecha_categoria_id) || [];
      list.push(cfg);
      configsByEfc.set(cfg.evento_fecha_categoria_id, list);
    }

    return efcList.map((row) => {
      const categoria = categoriaMap.get(row.categoria_id);
      const configs = configsByEfc.get(row.id) || [];
      const selectedConfig = configs.find((x) => x.es_oficial) || configs[0] || null;
      const recorrido = selectedConfig?.recorrido_id ? recorridoMap.get(selectedConfig.recorrido_id) : null;

      return {
        id: row.id,
        categoria_id: row.categoria_id,
        nombre: categoria?.nombre || 'Categoría',
        codigo: categoria?.codigo || null,
        sexo: categoria?.sexo || null,
        edad_min: categoria?.edad_min ?? null,
        edad_max: categoria?.edad_max ?? null,
        cupo: row.cupo ?? null,
        precio: row.precio ?? null,
        activo: row.activo !== false,
        recorrido_nombre: recorrido?.nombre || null,
        distancia_objetivo_km: selectedConfig?.distancia_objetivo_km ?? recorrido?.distancia_km ?? null,
        desnivel_objetivo_m: selectedConfig?.desnivel_objetivo_m ?? recorrido?.desnivel_m ?? null,
        numero_vueltas: selectedConfig?.numero_vueltas ?? null,
        tiempo_corte_min: selectedConfig?.tiempo_corte_min ?? null,
      };
    });
  }

  return {
    races,
    loading,
    error,
    globalRaces,
    globalLoading,
    globalError,
    ctl,
    addRaceCatalogs,
    addRaceCatalogsLoading,
    filters,
    setFilter,
    filterOptionsByTab,
    filteredRaces,
    filteredEventosXerpa,
    filteredRutasLocales,
    addRace,
    deleteRace,
    updateRace,
    updateRaceByCarreraId,
    fetchRaceCategories,
    fetchCarreraById,
    fetchAddRaceCatalogs,
    fetchGlobalRaces,
    enrollToRace,
    unenrollFromRace,
    setPrepararConXerpa,
    refetch: fetchRaces,
  };
}

function applyFilters(items, { search, pais, tipoDeporte, tipoEvento, formatoEvento, copa, mes }) {
  let result = items;

  const getMonth = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
  };

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
    result = result.filter((r) => ((r.pais_nombre || r.pais || '').toLowerCase() === pais.trim().toLowerCase()));
  }
  if (tipoDeporte?.trim()) {
    const normalized = tipoDeporte.trim().toLowerCase();
    result = result.filter(
      (r) => (r.tipo_deporte_nombre || r.tipo_deporte || r.tipoDeporte || '').toLowerCase() === normalized
    );
  }
  if (tipoEvento?.trim()) {
    const normalized = tipoEvento.trim().toLowerCase();
    result = result.filter(
      (r) => (r.tipo_evento_nombre || r.tipo_evento_codigo || r.tipo_evento || '').toLowerCase() === normalized
    );
  }
  if (formatoEvento?.trim()) {
    const normalized = formatoEvento.trim().toLowerCase();
    result = result.filter(
      (r) => (r.formato_evento_nombre || r.formato_evento_codigo || '').toLowerCase() === normalized
    );
  }
  if (copa?.trim()) {
    const normalized = copa.trim().toLowerCase();
    result = result.filter((r) => (r.copa_nombre || '').toLowerCase() === normalized);
  }
  if (mes?.trim()) {
    const mesFilter = mes.trim().toUpperCase();
    result = result.filter((r) => getMonth(r.fecha_inicio) === mesFilter);
  }

  return result;
}
