/**
 * StravaConnectButton — Botón de conexión OAuth 2.0 con Strava
 * Diseño Premium/Dark. Usa expo-auth-session y expo-web-browser.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  AppState,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

// Necesario para que el navegador se cierre automáticamente al volver a la app
WebBrowser.maybeCompleteAuthSession();

const STRAVA_ORANGE = '#FC4C02';

const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
};

export function StravaConnectButton({ isConnected = false, onAuthSuccess, onAuthError }) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = makeRedirectUri({ scheme: 'xerpa', path: 'localhost' });

  // Strava requiere scopes separados por comas (no espacios como expo-auth-session por defecto)
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '210053',
      scopes: [],
      redirectUri,
      extraParams: {
        scope: 'read,activity:read_all,profile:read_all',
      },
    },
    discovery
  );

  const processedResponseRef = useRef(null);
  const onSuccessRef = useRef(onAuthSuccess);
  const onErrorRef = useRef(onAuthError);
  onSuccessRef.current = onAuthSuccess;
  onErrorRef.current = onAuthError;

  useEffect(() => {
    if (!response) return;
    if (response?.type === 'success') {
      const code = response.params?.code;
      if (code && processedResponseRef.current !== response) {
        processedResponseRef.current = response;
        setIsLoading(true);
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            if (!userId) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase.functions.invoke('strava-auth', {
              body: { code, user_id: userId },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            onSuccessRef.current?.();
          } catch (err) {
            const msg = err?.message ?? err?.error ?? 'Error desconocido';
            console.error('Error conectando Strava:', msg, err);
            Alert.alert('Error', msg || 'No pudimos conectar con Strava. Intenta de nuevo.');
            onErrorRef.current?.(err);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    } else if (response?.type === 'error') {
      onErrorRef.current?.(response.error);
    }
  }, [response]);

  // Fallback: cuando el usuario cierra el navegador, promptAsync puede no resolver.
  // Al volver la app al primer plano (de background/inactive), restauramos el botón.
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const wasInBackground = appStateRef.current.match(/inactive|background/);
      appStateRef.current = nextState;
      if (wasInBackground && nextState === 'active' && isLoading) {
        setIsLoading(false);
      }
    });
    return () => sub.remove();
  }, [isLoading]);

  const handlePress = async () => {
    if (isConnected) return;
    setIsLoading(true);
    try {
      const result = await promptAsync();
      // Manejar resultado directamente para evitar loading infinito
      if (result?.type === 'success' && result.params?.code) {
        const code = result.params.code;
        setIsLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id;
          if (!userId) throw new Error('Usuario no autenticado');

          const { data, error } = await supabase.functions.invoke('strava-auth', {
            body: { code, user_id: userId },
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          onAuthSuccess?.();
        } catch (err) {
          const msg = err?.message ?? err?.error ?? 'Error desconocido';
          console.error('Error conectando Strava:', msg, err);
          Alert.alert('Error', msg || 'No pudimos conectar con Strava. Intenta de nuevo.');
          onAuthError?.(err);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      if (result?.type === 'error') {
        onAuthError?.(result.error);
      }
    } catch (err) {
      onAuthError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || isConnected || !request;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isConnected && styles.buttonConnected,
        isDisabled && !isConnected && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : isConnected ? (
        <>
          <MaterialCommunityIcons name="check-circle" size={22} color="#39FF14" />
          <Text style={styles.textConnected}>Strava Conectado</Text>
        </>
      ) : (
        <>
          <MaterialCommunityIcons name="strava" size={24} color="#FFFFFF" />
          <Text style={styles.text}>Conectar con Strava</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: 100,
    backgroundColor: STRAVA_ORANGE,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: STRAVA_ORANGE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  buttonConnected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: STRAVA_ORANGE,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  textConnected: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});
