/**
 * IntegracionesSection — Integraciones multi-plataforma (profileData.integraciones)
 * Plataformas: Intervals.icu, Strava, Garmin, Wahoo.
 * Badge: Conectado (verde) / No vinculado (gris). Al pulsar abre flujo correspondiente.
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const PLATFORMS = [
  { key: 'intervals', label: 'Intervals.icu', icon: 'fitness' },
  { key: 'strava', label: 'Strava', icon: 'logo-firefox' },
  { key: 'garmin', label: 'Garmin', icon: 'watch' },
  { key: 'wahoo', label: 'Wahoo', icon: 'hardware-chip' },
];

function getIntegracionForPlatform(integraciones, key) {
  if (!Array.isArray(integraciones)) return null;
  return integraciones.find((i) => i.plataforma === key) ?? null;
}

export function IntegracionesSection({ integraciones, onPlatformPress, styles }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Integraciones y dispositivos</Text>

      {PLATFORMS.map(({ key, label, icon }, idx) => {
        const integracion = getIntegracionForPlatform(integraciones, key);
        const isConnected = integracion && integracion.estado === 'Activa';
        const isLast = idx === PLATFORMS.length - 1;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.integracionRow, isLast && { borderBottomWidth: 0 }]}
            onPress={() => onPlatformPress(key)}
            activeOpacity={0.7}
          >
            <View style={styles.integracionInfo}>
              <View style={styles.integracionNameRow}>
                <Ionicons
                  name={icon}
                  size={20}
                  color="#00F0FF"
                  style={styles.integracionIcon}
                />
                <Text style={styles.integracionName}>{label}</Text>
              </View>
              <View
                style={[
                  styles.integracionBadge,
                  isConnected ? styles.integracionBadgeConnected : styles.integracionBadgeDisconnected,
                ]}
              >
                <Ionicons
                  name={isConnected ? 'checkmark-circle' : 'close-circle-outline'}
                  size={14}
                  color={isConnected ? '#39FF14' : '#666'}
                />
                <Text
                  style={[
                    styles.integracionBadgeText,
                    isConnected ? styles.integracionBadgeTextConnected : styles.integracionBadgeTextDisconnected,
                  ]}
                >
                  {isConnected ? 'Conectado' : 'No vinculado'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
