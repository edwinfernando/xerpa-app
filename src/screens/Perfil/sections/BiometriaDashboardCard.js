/**
 * BiometriaDashboardCard — Vista solo lectura de biometría
 */
import React from 'react';
import { View, Text } from 'react-native';
import { XerpaProgress } from '../../../components/ui/XerpaProgress';

function formatValue(val, suffix = '') {
  if (val == null || val === '') return '—';
  return `${val}${suffix}`;
}

export function BiometriaDashboardCard({ profileData, styles }) {
  const p = profileData ?? {};
  const completionFields = [p.nombre, p.edad, p.talla_cm, p.peso_kg, p.modalidad, p.categoria];
  const completedCount = completionFields.filter((v) => v != null && String(v).trim() !== '').length;
  const completionPct = Math.round((completedCount / completionFields.length) * 100);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Información personal y biométrica</Text>
      <View style={styles.biometriaProgressWrap}>
        <View style={styles.biometriaProgressHeader}>
          <Text style={styles.biometriaProgressLabel}>Perfil biométrico</Text>
          <Text style={styles.biometriaProgressValue}>{completionPct}%</Text>
        </View>
        <XerpaProgress progress={completionPct} color="#00D2FF" />
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Nombre</Text>
        <Text style={styles.dashboardValue}>{p.nombre || '—'}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Edad</Text>
        <Text style={styles.dashboardValue}>{formatValue(p.edad)}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Talla</Text>
        <Text style={styles.dashboardValue}>{formatValue(p.talla_cm, ' cm')}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Peso</Text>
        <Text style={styles.dashboardValue}>{formatValue(p.peso_kg, ' kg')}</Text>
      </View>
      <View style={styles.dashboardRow}>
        <Text style={styles.dashboardLabel}>Deporte / Modalidad</Text>
        <Text style={styles.dashboardValue}>{p.modalidad || '—'}</Text>
      </View>
      <View style={[styles.dashboardRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.dashboardLabel}>Categoría</Text>
        <Text style={styles.dashboardValue}>{p.categoria || '—'}</Text>
      </View>
    </View>
  );
}
