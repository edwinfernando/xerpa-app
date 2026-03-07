/**
 * NotificacionesDashboardCard — Vista solo lectura de preferencias
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CANAL_LABELS = {
  Telegram: 'Telegram',
  WhatsApp: 'WhatsApp',
  Email: 'Email',
  Push: 'Push',
};

export function NotificacionesDashboardCard({ preferencias, onEditar, styles }) {
  const pref = preferencias ?? {};
  const canal = pref.canal_principal || '—';
  const telegramId = pref.telegram_id || '—';
  const alertasEntreno = pref.alertas_entrenamiento ?? true;
  const alertasSistema = pref.alertas_sistema ?? true;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Preferencias de notificación</Text>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Canal principal</Text>
        <Text style={styles.dashboardValue}>{CANAL_LABELS[canal] ?? canal}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Telegram ID</Text>
        <Text style={styles.dashboardValue}>{telegramId}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Alertas entrenamiento</Text>
        <Ionicons
          name={alertasEntreno ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color={alertasEntreno ? '#39FF14' : '#666'}
        />
      </View>
      <View style={[styles.dashboardRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.dashboardLabel}>Alertas sistema</Text>
        <Ionicons
          name={alertasSistema ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color={alertasSistema ? '#39FF14' : '#666'}
        />
      </View>
      {onEditar && (
        <TouchableOpacity style={styles.dashboardEditBtn} onPress={onEditar}>
          <Text style={styles.dashboardEditText}>Editar preferencias</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
