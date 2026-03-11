/**
 * IntegracionesSection — Conexiones de datos (Strava, Intervals.icu)
 * Usa IntegrationCard para un diseño premium unificado.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { IntegrationCard } from '../../../components/IntegrationCard';
import { useStravaConnect } from '../../../hooks/useStravaConnect';

function getIntegracionForPlatform(integraciones, key) {
  if (!Array.isArray(integraciones)) return null;
  return integraciones.find((i) => i.plataforma === key) ?? null;
}

export function IntegracionesSection({
  integraciones,
  onPlatformPress,
  onStravaAuthSuccess,
  onDisconnect,
  disconnectingPlatform,
  showToast,
  styles,
}) {
  const integracionStrava = getIntegracionForPlatform(integraciones, 'strava');
  const integracionIntervals = getIntegracionForPlatform(integraciones, 'intervals');
  const isStravaConnected = integracionStrava && integracionStrava.estado === 'Activa';
  const isIntervalsConnected = integracionIntervals && integracionIntervals.estado === 'Activa';

  const { handleConnect: handleStravaConnect, isLoading: stravaLoading } = useStravaConnect({
    onSuccess: onStravaAuthSuccess,
    onError: (err) => {
      showToast?.({
        type: 'error',
        title: 'Error Strava',
        message: err?.message ?? 'No se pudo conectar con Strava.',
      });
    },
  });

  const stravaLoadingState = stravaLoading || disconnectingPlatform === 'strava';
  const intervalsLoadingState = disconnectingPlatform === 'intervals';

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Conexiones de Datos</Text>

      <IntegrationCard
        title="Intervals.icu"
        iconName="chart-timeline-variant"
        brandColor="#E63946"
        isConnected={isIntervalsConnected}
        onPress={() => onPlatformPress?.('intervals')}
        onDisconnect={() => onDisconnect?.('intervals')}
        isLoading={intervalsLoadingState}
      />

      <IntegrationCard
        title="Strava"
        iconSource={require('../../../../assets/strava-icon.png')}
        iconSourceHasBg
        isLast
        brandColor="#FC4C02"
        isConnected={isStravaConnected}
        onPress={handleStravaConnect}
        onDisconnect={() => onDisconnect?.('strava')}
        isLoading={stravaLoadingState}
      />
    </View>
  );
}
