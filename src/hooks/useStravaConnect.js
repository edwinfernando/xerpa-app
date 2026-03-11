/**
 * useStravaConnect — Hook para el flujo OAuth 2.0 con Strava
 * Extrae la lógica de StravaConnectButton para usarla en IntegrationCard u otros componentes.
 */
import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { supabase } from '../../supabase';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
};

export function useStravaConnect({ onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const redirectUri = makeRedirectUri({ scheme: 'xerpa', path: 'localhost' });

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
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

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

  const handleConnect = async () => {
    if (isLoading || !request) return;
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result?.type === 'success' && result.params?.code) {
        const code = result.params.code;
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
          onErrorRef.current?.(err);
        }
      } else if (result?.type === 'error') {
        onErrorRef.current?.(result.error);
      }
    } catch (err) {
      onErrorRef.current?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleConnect, isLoading, isReady: !!request };
}
