import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike } from 'lucide-react-native';

function NeonProgressCircle({ styles }) {
  return (
    <View style={styles.progressCircle}>
      <View style={styles.progressCircleInner}>
        <Text style={styles.progressCircleText}>LISTO</Text>
      </View>
    </View>
  );
}

function StatusWidget({ tssSemanal, styles }) {
  return (
    <View style={styles.statusWidget}>
      <NeonProgressCircle styles={styles} />
      <Text style={styles.statusWidgetText}>
        TSS Semanal: <Text style={styles.statusWidgetValue}>{tssSemanal ?? '—'}</Text>
      </Text>
    </View>
  );
}

function formatDuracion(duracionMin) {
  if (duracionMin == null || duracionMin === 0) return '—';
  const h = Math.floor(duracionMin / 60);
  const m = duracionMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function WorkoutCard({ entreno, styles }) {
  if (!entreno) return null;
  return (
    <LinearGradient
      colors={['#00F0FF', '#39FF14']}
      start={{ x: 0, y: 0.1 }}
      end={{ x: 1, y: 0.9 }}
      style={styles.workoutCardGradient}
    >
      <View style={styles.workoutCardInner}>
        <View style={styles.workoutCardIconContainer}>
          <Text style={styles.workoutCardIconLabel}>HOY</Text>
          <Bike color="#39FF14" size={25} />
        </View>
        <View style={styles.workoutCardContent}>
          <Text style={styles.workoutCardTitle}>{entreno.titulo || 'Entrenamiento'}</Text>
          <Text style={styles.workoutCardSubtext}>
            Duración: <Text style={styles.workoutCardSubtextHighlight}>{formatDuracion(entreno.duracion_min)}</Text>
          </Text>
          {(entreno.tipo || entreno.tss_plan) && (
            <Text style={styles.workoutCardSubtext}>
              {entreno.tipo}
              {entreno.tss_plan ? ` • TSS: ${entreno.tss_plan}` : ''}
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

function EmptyOrNoSensorsState({ onVincular, hasData, styles }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>¿Entrenaste hoy por tu cuenta?</Text>
      <Text style={styles.emptyStateText}>
        Registra tu esfuerzo percibido (RPE) más abajo para llevar un seguimiento sin sensores.
      </Text>
      {!hasData && (
        <TouchableOpacity onPress={onVincular} style={styles.vincularLink}>
          <Text style={styles.emptyStateLink}>Vincular Intervalos.icu para datos automáticos →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RpeSliderSection({ rpeValue, onRpeChange, rpeLabel, rpeColor, onSave, loading, styles }) {
  const cardStyle = [
    styles.rpeCard,
    {
      borderColor: rpeColor + '66',
      shadowColor: rpeColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
  ];

  return (
    <View style={cardStyle}>
      <Text style={styles.rpeCardTitle}>¿Cómo te sentiste hoy?</Text>
      <View style={styles.rpeNumberContainer}>
        <Text style={[styles.rpeNumber, { color: rpeColor }]}>{Math.round(rpeValue)}</Text>
        <Text style={[styles.rpeLabel, { color: rpeColor }]}>{rpeLabel}</Text>
      </View>
      <Slider
        style={styles.rpeSlider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={rpeValue}
        onValueChange={onRpeChange}
        minimumTrackTintColor={rpeColor}
        maximumTrackTintColor="#333"
        thumbTintColor={rpeColor}
      />
      <TouchableOpacity
        style={styles.rpeSaveButton}
        onPress={onSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.rpeSaveButtonGradient}
        >
          {loading ? (
            <ActivityIndicator color="#121212" size="small" />
          ) : (
            <Text style={styles.rpeSaveButtonText}>Guardar Entrenamiento</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function RpeSuccessMessage({ styles }) {
  return (
    <View style={styles.rpeSuccessCard}>
      <Text style={styles.rpeSuccessText}>
        ¡Entrenamiento registrado! La IA procesará tu fatiga.
      </Text>
    </View>
  );
}

function QuickMetrics({ ctl, atl, tsb, styles }) {
  return (
    <View style={styles.quickMetricsRow}>
      <View style={styles.metricCard}>
        <Text style={[styles.metricValue, styles.metricValueCtl]}>{ctl ?? '—'}</Text>
        <Text style={styles.metricLabel}>CTL</Text>
        <Text style={styles.metricSublabel}>Forma</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={[styles.metricValue, styles.metricValueAtl]}>{atl ?? '—'}</Text>
        <Text style={styles.metricLabel}>ATL</Text>
        <Text style={styles.metricSublabel}>Fatiga</Text>
      </View>
      <View style={[styles.metricCard, styles.metricCardLast, styles.metricCardTsb]}>
        <Text style={[styles.metricValue, styles.metricValueTsb]}>{tsb ?? '—'}</Text>
        <Text style={styles.metricLabel}>TSB</Text>
        <Text style={styles.metricSublabel}>Balance</Text>
      </View>
    </View>
  );
}

export function DashboardView({
  nombre,
  loading,
  ctl,
  atl,
  tsb,
  tssSemanal,
  entrenoHoy,
  hasData,
  hasReportedToday,
  rpeValue,
  setRpeValue,
  submittingRpe,
  saveRPE,
  getRpeColor,
  rpeLabel,
  onVincular,
  styles,
}) {
  const rpeColor = getRpeColor(rpeValue);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerGreeting}>Hola,</Text>
          <Text style={styles.headerName}>{nombre}</Text>
        </View>

        <StatusWidget tssSemanal={tssSemanal} styles={styles} />

        {entrenoHoy && hasData ? (
          <WorkoutCard entreno={entrenoHoy} styles={styles} />
        ) : (
          <EmptyOrNoSensorsState onVincular={onVincular} hasData={hasData} styles={styles} />
        )}

        {!hasReportedToday ? (
          <RpeSliderSection
            rpeValue={rpeValue}
            onRpeChange={setRpeValue}
            rpeLabel={rpeLabel}
            rpeColor={rpeColor}
            onSave={saveRPE}
            loading={submittingRpe}
            styles={styles}
          />
        ) : (
          <RpeSuccessMessage styles={styles} />
        )}

        <QuickMetrics ctl={ctl} atl={atl} tsb={tsb} styles={styles} />
      </ScrollView>
    </SafeAreaView>
  );
}
