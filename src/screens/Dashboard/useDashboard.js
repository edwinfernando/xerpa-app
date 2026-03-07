import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { supabase } from '../../../supabase';
import { useUserContext } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';

if (
  Platform.OS === 'android'
  && !global?.nativeFabricUIManager
  && UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { saveTodayPlan } from '../../services/offlineStorage';
import { syncPendingEfforts } from '../../services/effortSync';
import { MOTIVATIONAL_PHRASES } from '../../constants/phrases';
import { PRIORIDADES } from '../../constants/prioridades';
import { getWeekBounds } from '../../utils/dateUtils';

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

/**
 * Obtiene la categoría horaria para las frases motivacionales.
 * morning: 5-11, midday: 12-14, afternoon: 15-19, evening: 20-22, night: 23-4
 */
function getTimeCategory() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 15) return 'midday';
  if (h >= 15 && h < 20) return 'afternoon';
  if (h >= 20 && h < 23) return 'evening';
  return 'night';
}

/**
 * Selecciona una frase aleatoria de la categoría correspondiente a la hora actual.
 */
function getRandomMotivationalPhrase() {
  const category = getTimeCategory();
  const phrases = MOTIVATIONAL_PHRASES[category];
  if (!phrases?.length) return '';
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function useDashboard(user) {
  const { profileData, racesRevision, refreshUserRaces } = useUserContext();
  const { showToast } = useToast();
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
  const [nombreLocal, setNombre] = useState('Atleta');
  const [proximaCarrera, setProximaCarrera] = useState(null);

  // ─── Location & weather (auto-detect permission, geocode, clima) ───
  const [city, setCity] = useState(null);
  const [locationPermission, setLocationPermission] = useState('undetermined'); // 'undetermined' | 'granted' | 'denied'
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [climaData, setClimaData] = useState(null); // { temp, condition, icon } | null

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
      .select('*')
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
        // athlete_id ya no existe en usuarios; se obtiene de integraciones_terceros (plataforma 'intervals')
        const integracionIntervals = profileData?.integraciones?.find?.((i) => i.plataforma === 'intervals');
        const athId = integracionIntervals?.id_externo ?? null;
        if (profileData?.nombre) setNombre(profileData.nombre);
        setHasData(!!athId);

        const [plan, wellness, reported, tssPlaneado, proxCarrera] = await Promise.all([
          fetchTodayPlan(user.id),
          fetchWellness(user.id),
          fetchEsfuerzoHoy(user.id),
          fetchTssPlaneadoSemanal(user.id),
          fetchProximaCarrera(user.id),
        ]);

        setEntrenoHoy(plan);
        if (plan) saveTodayPlan(plan).catch(() => {}); // Offline cache
        setHasReportedToday(reported);
        syncPendingEfforts(user.id).catch(() => {}); // Sincronizar esfuerzos guardados offline
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
  }, [user?.id, profileData?.integraciones, profileData?.nombre, fetchTodayPlan, fetchWellness, fetchEsfuerzoHoy, fetchTssPlaneadoSemanal, fetchProximaCarrera]);

  // ─── Refresco de próxima carrera cuando cambian inscripciones ───
  useEffect(() => {
    if (!user?.id || racesRevision === 0) return;
    let cancelled = false;
    (async () => {
      const data = await fetchProximaCarrera(user.id);
      if (cancelled) return;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setProximaCarrera(data ?? null);
    })();
    return () => { cancelled = true; };
  }, [user?.id, racesRevision, fetchProximaCarrera]);

  // ─── Ubicación: verificar permisos al montar y obtener ciudad si está concedido ───
  const fetchLocationAndCity = useCallback(async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = geo?.[0]?.city ?? geo?.[0]?.district ?? geo?.[0]?.region ?? null;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCity(cityName);
      // Mock clima (sustituir por OpenWeather cuando se integre)
      setClimaData({ temp: 24, condition: 'Despejado', icon: 'sun' });
    } catch {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCity(null);
      setClimaData(null);
    }
  }, []);

  const fetchLocationAndCityRef = useRef(fetchLocationAndCity);
  fetchLocationAndCityRef.current = fetchLocationAndCity;
  const cityRef = useRef(city);
  cityRef.current = city;

  // Refresca ubicación cada vez que el usuario entra al Dashboard (dinámico)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoadingLocation(true);
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (cancelled) return;
          setLocationPermission(status);

          if (status === 'granted') {
            await fetchLocationAndCityRef.current();
          } else {
            setCity(null);
            setClimaData(null);
          }
        } catch {
          if (cancelled) return;
          setLocationPermission('denied');
          setCity(null);
          setClimaData(null);
        } finally {
          if (!cancelled) setLoadingLocation(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  // AppState listener: usuario va a Ajustes → concede permiso → vuelve a la app (Android)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') return;
      (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          setLocationPermission(status);
          if (status === 'granted' && !cityRef.current) {
            setLoadingLocation(true);
            try {
              await fetchLocationAndCityRef.current();
            } finally {
              setLoadingLocation(false);
            }
          }
        } catch {
          setLoadingLocation(false);
        }
      })();
    });
    return () => subscription.remove();
  }, []);

  const onRequestLocation = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === 'granted') {
        // Disparo inmediato: Android requiere llamar explícitamente tras granted
        await fetchLocationAndCityRef.current();
      } else {
        setCity(null);
        setClimaData(null);
      }
    } catch {
      setLocationPermission('denied');
      setCity(null);
      setClimaData(null);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

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
      showToast({ type: 'error', title: 'Error', message: err.message || 'No se pudo registrar el esfuerzo.' });
    } finally {
      setSubmittingRpe(false);
    }
  }, [user?.id, rpeValue]);

  const handleVincular = useCallback(() => {}, []);

  const enrollToRace = useCallback(async (carreraId, prioridad = 'B') => {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const p = PRIORIDADES.includes(prioridad) ? prioridad : 'B';
    const { error } = await supabase
      .from('usuario_carreras')
      .upsert(
        { user_id: user.id, carrera_id: carreraId, prioridad: p },
        { onConflict: 'user_id,carrera_id' }
      );
    if (error) throw error;
    const data = await fetchProximaCarrera(user.id);
    setProximaCarrera(data);
    refreshUserRaces();
    showToast('¡Meta fijada! Nos vemos en la línea de salida');
  }, [user?.id, fetchProximaCarrera, refreshUserRaces, showToast]);

  const unenrollFromRace = useCallback(async (carreraId) => {
    if (!user?.id || !carreraId) throw new Error('Datos insuficientes.');
    const { data: inscripcion, error: selError } = await supabase
      .from('usuario_carreras')
      .select('id')
      .eq('user_id', user.id)
      .eq('carrera_id', carreraId)
      .maybeSingle();
    if (selError) throw selError;
    if (!inscripcion) throw new Error('No se encontró la inscripción para cancelar.');
    const { error } = await supabase.from('usuario_carreras').delete().eq('id', inscripcion.id);
    if (error) throw error;
    const data = await fetchProximaCarrera(user.id);
    setProximaCarrera(data);
    refreshUserRaces();
    showToast('Inscripción cancelada. El calendario se ha actualizado');
  }, [user?.id, fetchProximaCarrera, refreshUserRaces, showToast]);

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

  /**
   * Readiness: deriva de TSB (Training Stress Balance).
   * TSB > 0 = fresco, TSB < 0 = fatigado.
   * Mapeo: TSB -30..+30 → 0..100 aprox.
   */
  const readinessPct = tsb != null
    ? Math.min(100, Math.max(0, Math.round(50 + (Number(tsb) * 1.8))))
    : 75;

  // Compute days until next race (based on fecha_inicio — when athlete travels/starts)
  const diasParaCarrera = proximaCarrera?.fecha_inicio
    ? Math.max(0, Math.ceil(
        (new Date(proximaCarrera.fecha_inicio + 'T12:00:00') - new Date()) / 86400000
      ))
    : null;

  // Frase motivacional aleatoria por franja horaria (estable durante la sesión)
  const motivationalMessage = useMemo(() => getRandomMotivationalPhrase(), []);

  return {
    loading,
    nombre: profileData?.nombre || nombreLocal || user?.email?.split('@')[0] || 'Atleta',
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
    motivationalMessage,
    proximaCarrera,
    diasParaCarrera,
    city,
    locationPermission,
    loadingLocation,
    climaData,
    onRequestLocation,
    readinessPct,
    enrollToRace,
    unenrollFromRace,
  };
}
