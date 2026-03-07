/**
 * PushNotifications — Utilitario de notificaciones push con expo-notifications
 *
 * - Handler global para mostrar notificaciones en foreground
 * - registerForPushNotificationsAsync(): obtiene token y configura canales Android
 *
 * En Expo Go (SDK 53+) las push en Android no están soportadas; se omiten silenciosamente.
 */

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Configura el handler global para mostrar notificaciones en foreground.
 * Debe llamarse después del montaje (p. ej. en useEffect) para evitar errores
 * de bridge en Expo Go / New Architecture.
 * Importante: retornar booleanos puros (true/false), NUNCA strings ('true'/'false').
 */
export function configureNotificationHandler() {
  if (Platform.OS === 'web' || isExpoGo) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log('Error de notificaciones nativas omitido:', error);
  }
}

/**
 * Registra el dispositivo para notificaciones push.
 * @returns {Promise<string|null>} Token Expo push o null si no disponible
 */
export async function registerForPushNotificationsAsync() {
  try {
    // Web no soporta push nativo como iOS/Android — omitir silenciosamente
    if (Platform.OS === 'web') {
      return null;
    }

    // Expo Go (SDK 53+) no soporta push en Android; omitir para evitar error
    if (isExpoGo) {
      return null;
    }

    // Solo dispositivos físicos (no simuladores/emuladores para el token)
    if (!Device.isDevice) {
      return null;
    }

    // 1. Configurar canal Android — tipos nativos JS (boolean/number[]), sin strings
    if (Platform.OS === 'android') {
      try {
        const vibrationPattern = [0, 250, 250, 250];
        await Notifications.setNotificationChannelAsync('xerpa-default', {
          name: 'XERPA Notificaciones',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern,
          lightColor: '#00F0FF',
          enableVibrate: true,
          enableLights: true,
        });
      } catch (channelError) {
        console.log('Error de notificaciones nativas omitido:', channelError);
      }
    }

    // 2. Solicitar permisos
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // 3. Obtener token Expo — blindaje contra Expo Go (SDK 53+), puede fallar en Android
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData?.data ?? null;
    } catch (tokenErr) {
      console.log('Error de notificaciones nativas omitido:', tokenErr);
      return null;
    }
  } catch (err) {
    console.log('Error de notificaciones nativas omitido:', err);
    return null;
  }
}
