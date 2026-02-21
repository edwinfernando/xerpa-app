import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bike, Zap, Droplets, Dumbbell, Activity,
  Moon, Trophy, AlertTriangle, Bot, RefreshCw,
  MapPin, Calendar,
} from 'lucide-react-native';
import { formatDateRange } from '../../utils/formatDateRange';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const RING_SEGMENTS = 40;

function formatDuracion(min) {
  if (!min || min === 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
}

function getWorkoutIcon(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('ride') || t.includes('bici') || t.includes('cycling')) return Bike;
  if (t.includes('run') || t.includes('correr') || t.includes('running')) return Zap;
  if (t.includes('swim') || t.includes('natac')) return Droplets;
  if (t.includes('strength') || t.includes('fuerza')) return Dumbbell;
  return Activity;
}

// ─────────────────────────────────────────────────────────────
// TSS Progress Ring — segmented dot ring
// ─────────────────────────────────────────────────────────────
function ProgressRing({ percentage = 0, size = 168, styles }) {
  const filled = Math.round((Math.min(Math.max(percentage, 0), 100) / 100) * RING_SEGMENTS);
  const radius = size / 2 - 16;
  const center = size / 2;

  return (
    <View style={[styles.tssRingWrapper, { width: size, height: size }]}>
      {Array.from({ length: RING_SEGMENTS }, (_, i) => {
        const angleDeg = (i / RING_SEGMENTS) * 360 - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cx = center + radius * Math.cos(angleRad);
        const cy = center + radius * Math.sin(angleRad);
        const active = i < filled;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 5,
              height: active ? 13 : 9,
              borderRadius: 3,
              backgroundColor: active ? '#00F0FF' : '#1E1E1E',
              left: cx - 2.5,
              top: cy - (active ? 6.5 : 4.5),
              transform: [{ rotate: `${angleDeg + 90}deg` }],
              shadowColor: active ? '#00F0FF' : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: active ? 0.9 : 0,
              shadowRadius: 5,
            }}
          />
        );
      })}
      {/* Center content */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={styles.tssRingCenterPct}>{percentage}%</Text>
        <Text style={styles.tssRingCenterLabel}>TSS SEMANAL</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function HeaderSection({ nombre, motivationalMessage, styles }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días,' : hour < 19 ? 'Buenas tardes,' : 'Buenas noches,';

  return (
    <View>
      <Text style={styles.headerGreeting}>{greeting}</Text>
      <Text style={styles.headerName}>{nombre} 👋</Text>
      <Text style={styles.motivationalText}>{motivationalMessage}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Weather Banner (placeholder — connects to weather API)
// ─────────────────────────────────────────────────────────────
function WeatherBanner({ styles }) {
  return (
    <View style={styles.weatherBanner}>
      <View style={styles.weatherLeft}>
        <MapPin color="#555" size={16} />
        <View>
          <Text style={styles.weatherCity}>Tu Ciudad</Text>
          <Text style={styles.weatherCondition}>Activa ubicación</Text>
        </View>
      </View>
      <View style={styles.weatherConnectBtn}>
        <Text style={styles.weatherConnectText}>Conectar →</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// TSS Progress Section
// ─────────────────────────────────────────────────────────────
function TSSSection({ tssSemanal, tssPlaneadoSemanal, tssProgressPct, styles }) {
  return (
    <View style={styles.tssSectionCard}>
      <Text style={styles.sectionLabel}>PROGRESO SEMANAL</Text>
      <ProgressRing percentage={tssProgressPct} styles={styles} />
      <View style={styles.tssNumbersRow}>
        <Text style={styles.tssActualValue}>{tssSemanal ?? '—'}</Text>
        <Text style={styles.tssActualLabel}> TSS</Text>
        <Text style={styles.tssDivider}> / </Text>
        <Text style={styles.tssPlannedValue}>{tssPlaneadoSemanal > 0 ? tssPlaneadoSemanal : '—'}</Text>
        <Text style={styles.tssPlannedLabel}> planificado</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Misión de Hoy
// ─────────────────────────────────────────────────────────────
function MisionHoy({ entreno, styles }) {
  if (!entreno) {
    return (
      <View style={styles.recoveryCard}>
        <Moon color="#39FF14" size={32} />
        <Text style={styles.recoveryTitle}>Día de Recuperación Activa</Text>
        <Text style={styles.recoveryText}>
          Sin sesión planificada. Aprovecha para hacer movilidad ligera o descanso activo.
        </Text>
      </View>
    );
  }

  const WorkoutIcon = getWorkoutIcon(entreno.tipo);

  return (
    <LinearGradient
      colors={['#00F0FF', '#39FF14']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.misionGradient}
    >
      <View style={styles.misionInner}>
        <View style={styles.misionHeader}>
          <Text style={styles.misionLabel}>MISIÓN DE HOY</Text>
          {!!entreno.tipo && (
            <View style={styles.misionTypePill}>
              <Text style={styles.misionTypePillText}>{entreno.tipo}</Text>
            </View>
          )}
        </View>
        <View style={styles.misionIconRow}>
          <View style={styles.misionIconBox}>
            <WorkoutIcon color="#39FF14" size={24} />
          </View>
          <Text style={styles.misionTitle}>{entreno.titulo || 'Entrenamiento'}</Text>
        </View>
        <View style={styles.misionMetaRow}>
          {!!entreno.duracion_min && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>Duración:</Text>
              <Text style={styles.misionMetaValue}> {formatDuracion(entreno.duracion_min)}</Text>
            </View>
          )}
          {!!entreno.tss_plan && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>TSS:</Text>
              <Text style={styles.misionMetaValue}> {entreno.tss_plan}</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
// Countdown Carrera
// ─────────────────────────────────────────────────────────────
function CountdownCard({ proximaCarrera, diasParaCarrera, styles }) {
  if (!proximaCarrera) return null;

  return (
    <View style={styles.countdownCard}>
      <Trophy color="#00F0FF" size={22} />
      <View style={styles.countdownLeft}>
        <Text style={styles.countdownSmallLabel}>PRÓXIMA CARRERA</Text>
        <Text style={styles.countdownRaceName}>{proximaCarrera.nombre}</Text>
        <Text style={styles.countdownDate}>
          <Calendar color="#555" size={10} /> {formatDateRange(proximaCarrera.fecha_inicio, proximaCarrera.fecha_fin)}
          {proximaCarrera.ciudad ? ` · ${proximaCarrera.ciudad}` : ''}
        </Text>
      </View>
      <View style={styles.countdownRight}>
        <Text style={styles.countdownNumber}>{diasParaCarrera}</Text>
        <Text style={styles.countdownUnit}>días</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────────────────────
function QuickActions({ onReportInjury, onOpenXerpa, onSyncData, styles }) {
  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.quickActionsTitle}>ACCIONES RÁPIDAS</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={[styles.quickActionCard, styles.quickActionCardDanger]} onPress={onReportInjury}>
          <AlertTriangle color="#ff5252" size={22} />
          <Text style={[styles.quickActionText, styles.quickActionTextDanger]}>Me lesioné</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionCard, styles.quickActionCardAI]} onPress={onOpenXerpa}>
          <Bot color="#00F0FF" size={22} />
          <Text style={[styles.quickActionText, styles.quickActionTextAI]}>PXERPA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionCard, styles.quickActionCardSync]} onPress={onSyncData}>
          <RefreshCw color="#39FF14" size={22} />
          <Text style={[styles.quickActionText, styles.quickActionTextSync]}>Sincronizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick Metrics (CTL / ATL / TSB)
// ─────────────────────────────────────────────────────────────
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
      <View style={[styles.metricCard, styles.metricCardTsb]}>
        <Text style={[styles.metricValue, styles.metricValueTsb]}>{tsb ?? '—'}</Text>
        <Text style={styles.metricLabel}>TSB</Text>
        <Text style={styles.metricSublabel}>Balance</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// RPE Slider
// ─────────────────────────────────────────────────────────────
function RpeSliderSection({ rpeValue, onRpeChange, rpeLabel, rpeColor, onSave, loading, styles }) {
  const cardStyle = [
    styles.rpeCard,
    {
      borderColor: rpeColor + '55',
      shadowColor: rpeColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
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
        maximumTrackTintColor="#222"
        thumbTintColor={rpeColor}
      />
      <TouchableOpacity style={styles.rpeSaveButton} onPress={onSave} disabled={loading} activeOpacity={0.8}>
        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.rpeSaveButtonGradient}
        >
          {loading
            ? <ActivityIndicator color="#121212" size="small" />
            : <Text style={styles.rpeSaveButtonText}>Guardar Entrenamiento</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function RpeSuccessMessage({ styles }) {
  return (
    <View style={styles.rpeSuccessCard}>
      <Text style={styles.rpeSuccessText}>
        ✅ Entrenamiento registrado. XERPA AI procesará tu fatiga.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────
export function DashboardView({
  nombre,
  loading,
  ctl,
  atl,
  tsb,
  tssSemanal,
  tssPlaneadoSemanal,
  tssProgressPct,
  entrenoHoy,
  hasReportedToday,
  rpeValue,
  setRpeValue,
  submittingRpe,
  saveRPE,
  getRpeColor,
  rpeLabel,
  motivationalMessage,
  proximaCarrera,
  diasParaCarrera,
  onReportInjury,
  onOpenXerpa,
  onSyncData,
  styles,
}) {
  const rpeColor = getRpeColor(rpeValue);

  if (loading) {
    return (
      <ScreenWrapper style={styles.safeContainer}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#00F0FF" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 · Header */}
        <HeaderSection nombre={nombre} motivationalMessage={motivationalMessage} styles={styles} />

        {/* 2 · Weather/Geo */}
        <WeatherBanner styles={styles} />

        {/* 3 · TSS Progress Ring */}
        <TSSSection
          tssSemanal={tssSemanal}
          tssPlaneadoSemanal={tssPlaneadoSemanal}
          tssProgressPct={tssProgressPct}
          styles={styles}
        />

        {/* 4 · Misión de Hoy */}
        <MisionHoy entreno={entrenoHoy} styles={styles} />

        {/* 5 · Countdown */}
        <CountdownCard
          proximaCarrera={proximaCarrera}
          diasParaCarrera={diasParaCarrera}
          styles={styles}
        />

        {/* 6 · Quick Actions */}
        <QuickActions
          onReportInjury={onReportInjury}
          onOpenXerpa={onOpenXerpa}
          onSyncData={onSyncData}
          styles={styles}
        />

        {/* CTL / ATL / TSB */}
        <QuickMetrics ctl={ctl} atl={atl} tsb={tsb} styles={styles} />

        {/* RPE Slider / Success */}
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
      </ScrollView>
    </ScreenWrapper>
  );
}
