/**
 * DeviceContext — Contexto global de dispositivo para XERPA AI
 *
 * Responsabilidades:
 *  1. Solicitar permiso de geolocalización y obtener lat/lon/ciudad
 *  2. Solicitar permiso de notificaciones push y obtener el expo_push_token
 *  3. Sincronizar ambos datos en la tabla `usuarios` de Supabase (fire-and-forget)
 *  4. Exponer { location, pushToken } a cualquier hook/componente via useDeviceContext()
 *
 * Uso:
 *   const { location, pushToken } = useDeviceContext();
 *   // location = { lat, lon, city } | null
 *   // pushToken = "ExponentPushToken[...]" | null
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../../supabase';

// ─── Configuración de canal (Android) ────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Context ─────────────────────────────────────────────────
const DeviceContext = createContext({
  location: null,
  pushToken: null,
  loading: true,
  error: null,
});

// ─── Provider ────────────────────────────────────────────────
export function DeviceContextProvider({ children, user }) {
  const [location, setLocation] = useState(null);  // { lat, lon, city }
  const [pushToken, setPushToken] = useState(null); // ExponentPushToken[...]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || initializedRef.current) return;
    initializedRef.current = true;
    _init(user.id);
  }, [user?.id]);

  // ── Init paralelo ─────────────────────────────────────────
  async function _init(userId) {
    setLoading(true);
    setError(null);
    try {
      const [locationData, token] = await Promise.all([
        _requestLocation(),
        _requestPushToken(),
      ]);
      // Sync silencioso — no bloquea la UI
      _syncToSupabase(userId, locationData, token);
    } catch (err) {
      setError(err?.message ?? 'Error al obtener permisos del dispositivo');
    } finally {
      setLoading(false);
    }
  }

  // ── Geolocalización ───────────────────────────────────────
  async function _requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const { latitude: lat, longitude: lon } = pos.coords;

      // Geocodificación inversa → nombre de ciudad
      let city = null;
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        city = geo?.[0]?.city ?? geo?.[0]?.district ?? geo?.[0]?.region ?? null;
      } catch {}

      const locationData = { lat, lon, city };
      setLocation(locationData);
      return locationData;
    } catch {
      return null;
    }
  }

  // ── Push Notifications ────────────────────────────────────
  async function _requestPushToken() {
    try {
      // Crear canal en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('xerpa-default', {
          name: 'XERPA Notificaciones',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00F0FF',
        });
      }

      // Verificar/solicitar permisos
      const { status: existing } = await Notifications.getPermissionsAsync();
      const finalStatus = existing !== 'granted'
        ? (await Notifications.requestPermissionsAsync()).status
        : existing;

      if (finalStatus !== 'granted') return null;

      // Intentar Expo Push Token primero (requiere EAS projectId en producción)
      // En Expo Go/desarrollo funciona sin projectId
      let token = null;
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId ??
          undefined;

        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : {}
        );
        token = tokenData.data;
      } catch {
        // Fallback: token nativo del dispositivo (formato APNs / FCM)
        try {
          const native = await Notifications.getDevicePushTokenAsync();
          token = native.data ?? null;
        } catch {}
      }

      if (token) setPushToken(token);
      return token;
    } catch {
      return null;
    }
  }

  // ── Sync Supabase ─────────────────────────────────────────
  async function _syncToSupabase(userId, locationData, token) {
    try {
      const update = {};
      if (token) update.push_token = token;
      if (locationData?.lat != null) update.ultima_lat = locationData.lat;
      if (locationData?.lon != null) update.ultima_lon = locationData.lon;
      if (locationData?.city) update.ultima_ciudad = locationData.city;

      if (Object.keys(update).length === 0) return;

      await supabase
        .from('usuarios')
        .update(update)
        .eq('id', userId);
    } catch {
      // No interrumpir la app si el sync falla
    }
  }

  return (
    <DeviceContext.Provider value={{ location, pushToken, loading, error }}>
      {children}
    </DeviceContext.Provider>
  );
}

// ─── Hook de consumo ─────────────────────────────────────────
export function useDeviceContext() {
  return useContext(DeviceContext);
}
