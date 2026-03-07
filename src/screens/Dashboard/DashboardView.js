import React, { useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { Button } from '../../components/ui/Button';
import { XerpaProgress } from '../../components/ui/XerpaProgress';
import { CircularProgress } from '../../components/ui/CircularProgress';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Moon, Trophy, MapPin, Calendar, Sun, Cloud, Cpu,
  RefreshCw,
} from 'lucide-react-native';
import { RaceDetailSheet } from '../../components/races/RaceDetailSheet';
import { raceCalendarStyles } from '../RaceCalendar/RaceCalendarStyles';
import { formatDateRange } from '../../utils/formatDateRange';
import { getProgressColorByPct } from '../../utils/colors';
import { formatDuracionOrPlaceholder } from '../../utils/formatDuracion';
import { getWorkoutIcon } from '../../utils/workoutTypeConfig';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
}

// ─────────────────────────────────────────────────────────────
// HeroCoachCard — Centro de mando biométrico (IA + Readiness + Clima)
// ─────────────────────────────────────────────────────────────
const READINESS_RING_SEGMENTS = 48;

const getReadinessColor = getProgressColorByPct;

function getReadinessMessage(nombre, pct) {
  const name = nombre || 'Atleta';
  if (pct > 80) {
    return `Hola ${name}, tu Readiness es óptimo. ¿Revisamos la estrategia de hoy?`;
  }
  if (pct >= 50) {
    return `Hola ${name}, tu Readiness es moderado. Podemos ajustar la intensidad si lo necesitas.`;
  }
  return `Hola ${name}, tu Readiness está bajo. Prioriza la recuperación hoy.`;
}

function ReadinessCircle({ percentage = 0, size = 140, styles }) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage ?? 0)));
  const color = getReadinessColor(pct);
  const filled = Math.round((pct / 100) * READINESS_RING_SEGMENTS);
  const radius = size / 2 - 12;
  const center = size / 2;

  return (
    <View style={[styles.heroReadinessRingWrap, { width: size, height: size }]}>
      {Array.from({ length: READINESS_RING_SEGMENTS }, (_, i) => {
        const angleDeg = (i / READINESS_RING_SEGMENTS) * 360 - 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cx = center + radius * Math.cos(angleRad);
        const cy = center + radius * Math.sin(angleRad);
        const active = i < filled;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 4,
              height: active ? 10 : 7,
              borderRadius: 2,
              backgroundColor: active ? color : '#1E1E1E',
              left: cx - 2,
              top: cy - (active ? 5 : 3.5),
              transform: [{ rotate: `${angleDeg + 90}deg` }],
              shadowColor: active ? color : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: active ? 0.8 : 0,
              shadowRadius: 4,
            }}
          />
        );
      })}
      <View style={[styles.heroReadinessRingCenter, { width: size, height: size }]}>
        <Text
          style={[
            styles.heroReadinessNumber,
            {
              color,
              textShadowColor: `${color}80`,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            },
          ]}
        >
          {pct}
        </Text>
        <Text style={styles.heroReadinessLabel}>readiness</Text>
      </View>
    </View>
  );
}

function HeroCoachCard({
  nombre,
  readinessPct,
  onPressXerpa,
  city,
  climaData,
  locationPermission,
  loadingLocation,
  onRequestLocation,
  styles,
}) {
  const message = getReadinessMessage(nombre, readinessPct ?? 0);

  const hasLocation = !!city;
  const WeatherIcon = climaData?.icon === 'cloud' ? Cloud : Sun;

  const handlePress = () => {
    onPressXerpa?.();
  };

  return (
    <TouchableOpacity
      style={styles.heroCoachCard}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Fila superior — Clima */}
      <View style={styles.heroTopRow}>
        <Text style={styles.heroLabel}>XERPA AI COACH</Text>
        <View style={styles.heroWeatherRight}>
          {!hasLocation ? (
            <TouchableOpacity
              onPress={onRequestLocation}
              disabled={loadingLocation}
              style={styles.heroLocationBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MapPin color="#00F0FF" size={18} />
            </TouchableOpacity>
          ) : climaData ? (
            <View style={styles.heroWeatherRow}>
              <WeatherIcon color="#00F0FF" size={16} />
              <Text style={styles.heroWeatherText}>
                {climaData.temp}°C — {climaData.condition}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Sección central — Readiness anillo */}
      <View style={styles.heroReadinessSection}>
        <ReadinessCircle percentage={readinessPct} size={140} styles={styles} />
      </View>

      {/* Sección inferior — Mensaje IA */}
      <View style={styles.heroMessageSection}>
        <View style={styles.heroMessageInner}>
          <Cpu color="#00D2FF" size={20} strokeWidth={2.5} />
          <Text style={styles.heroMessageText} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Misión de Hoy — Colores dinámicos según intensidad
// ─────────────────────────────────────────────────────────────
const MISION_INTENSIDAD = {
  alta: { gradient: ['#FF9800', '#FF5252'], iconColor: '#FF5252' },
  media: { gradient: ['#00D2FF', '#007BFF'], iconColor: '#00D2FF' },
  recuperacion: { gradient: ['#39FF14', '#00C853'], iconColor: '#39FF14' },
};

function getWorkoutIntensity(entreno) {
  if (!entreno) return MISION_INTENSIDAD.recuperacion;

  const tss = Number(entreno.tss_plan) || 0;
  const texto = `${entreno.titulo || ''} ${entreno.tipo || ''}`.toLowerCase();

  // Alta: TSS > 80 o palabras clave
  if (tss > 80 || /series|umbral|race/.test(texto)) {
    return MISION_INTENSIDAD.alta;
  }

  // Recuperación: TSS < 40 o palabras clave
  if (tss > 0 && tss < 40) return MISION_INTENSIDAD.recuperacion;
  if (/recuperaci[oó]n|active recovery|suave|descanso/.test(texto)) {
    return MISION_INTENSIDAD.recuperacion;
  }

  // Media: TSS 40–80 o Base, Tempo
  if (tss >= 40 && tss <= 80) return MISION_INTENSIDAD.media;
  if (/base|tempo/.test(texto)) return MISION_INTENSIDAD.media;

  // Inferir por duración si no hay TSS
  const dur = entreno.duracion_min || 0;
  if (dur >= 120) return MISION_INTENSIDAD.alta;
  if (dur <= 45) return MISION_INTENSIDAD.recuperacion;

  return MISION_INTENSIDAD.media;
}

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
  const { gradient, iconColor } = getWorkoutIntensity(entreno);

  const gradientStyle = [
    styles.misionGradient,
    {
      shadowColor: iconColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
  ];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={gradientStyle}
    >
      <View style={styles.misionInner}>
        <View style={styles.misionHeader}>
          <Text style={styles.misionLabel}>MISIÓN DE HOY</Text>
          {!!entreno.tipo && (
            <View style={[styles.misionTypePill, { borderColor: `${iconColor}40`, backgroundColor: `${iconColor}15` }]}>
              <Text style={[styles.misionTypePillText, { color: iconColor }]}>{entreno.tipo}</Text>
            </View>
          )}
        </View>
        <View style={styles.misionIconRow}>
          <View style={[styles.misionIconBox, { borderColor: `${iconColor}40`, backgroundColor: `${iconColor}12` }]}>
            <WorkoutIcon color={iconColor} size={24} />
          </View>
          <Text style={styles.misionTitle}>{entreno.titulo || 'Entrenamiento'}</Text>
        </View>
        <View style={styles.misionMetaRow}>
          {!!entreno.duracion_min && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>Duración:</Text>
              <Text style={styles.misionMetaValue}> {formatDuracionOrPlaceholder(entreno.duracion_min)}</Text>
            </View>
          )}
          {!!entreno.tss_plan && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>TSS:</Text>
              <Text style={styles.misionMetaValue}> {entreno.tss_plan}</Text>
            </View>
          )}
          {!!entreno.hora && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>Hora:</Text>
              <Text style={styles.misionMetaValue}> {entreno.hora}</Text>
            </View>
          )}
          {!!entreno.punto_encuentro && (
            <View style={styles.misionMetaItem}>
              <Text style={styles.misionMetaLabel}>Lugar:</Text>
              <Text style={styles.misionMetaValue}> {entreno.punto_encuentro}</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────
// Countdown Carrera — Atajo interactivo hacia detalles
// ─────────────────────────────────────────────────────────────
function CountdownCard({ proximaCarrera, diasParaCarrera, onPress, styles }) {
  if (!proximaCarrera) return null;

  const content = (
    <>
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
    </>
  );

  if (!onPress) {
    return <View style={styles.countdownCard}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.countdownCard} onPress={onPress} activeOpacity={0.8}>
      {content}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// TelemetryCarousel — TSS + Estado Físico en carrusel horizontal
// ─────────────────────────────────────────────────────────────
const CAROUSEL_CARD_WIDTH = 280;
const CAROUSEL_CARD_HEIGHT = 160;
const CAROUSEL_CARD_MARGIN = 16;
const TSS_RING_SIZE = 88;

function TelemetryCarousel({ ctl, atl, tsb, tssSemanal, tssPlaneado, tssProgress, styles }) {
  const snapInterval = CAROUSEL_CARD_WIDTH + CAROUSEL_CARD_MARGIN;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={snapInterval}
      snapToAlignment="start"
      decelerationRate="fast"
      contentContainerStyle={styles.telemetryCarouselContent}
    >
      {/* Tarjeta 1 — TSS Semanal */}
      <View style={styles.telemetryCard}>
        <Text style={styles.telemetryCardLabel}>TSS SEMANAL</Text>
        <View style={styles.telemetryTssRow}>
          <View style={styles.telemetryTssRingWrap}>
            <CircularProgress
              progress={tssProgress}
              size={TSS_RING_SIZE}
              strokeWidth={7}
              color="#00D2FF"
              showLabel
            />
          </View>
          <View style={styles.telemetryTssNumbers}>
            <Text style={styles.telemetryTssActual}>{tssSemanal ?? '—'}</Text>
            <Text style={styles.telemetryTssDivider}>/</Text>
            <Text style={styles.telemetryTssPlanned}>{tssPlaneado > 0 ? tssPlaneado : '—'} plan</Text>
          </View>
        </View>
        <XerpaProgress
          progress={tssProgress}
          color="#00D2FF"
          style={styles.telemetryProgressWrap}
        />
      </View>

      {/* Tarjeta 2 — Estado Físico (CTL / ATL / TSB) */}
      <View style={[styles.telemetryCard, { marginRight: 0 }]}>
        <Text style={styles.telemetryCardLabel}>ESTADO FÍSICO</Text>
        <View style={styles.telemetryMetricsGrid}>
          <View style={styles.telemetryMetricItem}>
            <Text style={[styles.telemetryMetricValue, styles.telemetryMetricCtl]}>{ctl ?? '—'}</Text>
            <Text style={styles.telemetryMetricLabel}>CTL</Text>
            <Text style={styles.telemetryMetricSublabel}>Forma</Text>
          </View>
          <View style={styles.telemetryMetricItem}>
            <Text style={[styles.telemetryMetricValue, styles.telemetryMetricAtl]}>{atl ?? '—'}</Text>
            <Text style={styles.telemetryMetricLabel}>ATL</Text>
            <Text style={styles.telemetryMetricSublabel}>Fatiga</Text>
          </View>
          <View style={styles.telemetryMetricItem}>
            <Text style={[styles.telemetryMetricValue, styles.telemetryMetricTsb]}>{tsb ?? '—'}</Text>
            <Text style={styles.telemetryMetricLabel}>TSB</Text>
            <Text style={styles.telemetryMetricSublabel}>Balance</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
      <Button
        title="Guardar Entrenamiento"
        variant="primary"
        onPress={onSave}
        loading={loading}
        disabled={loading}
        style={styles.rpeSaveButton}
      />
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
  readinessPct,
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
  onOpenXerpa,
  onSyncData,
  enrollToRace,
  unenrollFromRace,
  city,
  climaData,
  locationPermission,
  loadingLocation,
  onRequestLocation,
  styles,
}) {
  const rpeColor = getRpeColor(rpeValue);
  const { scrollHandler, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader();
  const greeting = getGreeting();
  const [detailCarrera, setDetailCarrera] = useState(null);

  function handleOpenRaceDetail(carrera) {
    if (!carrera) return;
    const normalized = carrera.carrera_id != null
      ? { ...carrera, id: carrera.carrera_id }
      : carrera;
    setDetailCarrera(normalized);
  }

  const isEnrolled = detailCarrera != null;

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
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <CollapsibleHeader
        bigTitleRow1={greeting}
        bigTitleRow2={nombre || 'Atleta'}
        bigSubtitleNeon={motivationalMessage}
        smallTitle={nombre ? nombre : 'Dashboard'}
        rightAction={
          <AnimatedActionButton
            label="Sync"
            icon={<RefreshCw color="#00D2FF" size={20} strokeWidth={2.5} />}
            onPress={onSyncData}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <Animated.ScrollView
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* 0 · HeroCoachCard */}
        <HeroCoachCard
          nombre={nombre}
          readinessPct={readinessPct ?? 75}
          onPressXerpa={onOpenXerpa}
          city={city}
          climaData={climaData}
          locationPermission={locationPermission}
          loadingLocation={loadingLocation}
          onRequestLocation={onRequestLocation}
          styles={styles}
        />

        {/* 1 · Misión de Hoy */}
        <MisionHoy entreno={entrenoHoy} styles={styles} />

        {/* 2 · RPE Slider / Success */}
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

        {/* 3 · CountdownCard — Acceso directo a detalles de la carrera */}
        <CountdownCard
          proximaCarrera={proximaCarrera}
          diasParaCarrera={diasParaCarrera}
          onPress={() => handleOpenRaceDetail(proximaCarrera)}
          styles={styles}
        />

        {/* 4 · TelemetryCarousel — CTL/ATL/TSB + TSS horizontal */}
        <TelemetryCarousel
          ctl={ctl}
          atl={atl}
          tsb={tsb}
          tssSemanal={tssSemanal}
          tssPlaneado={tssPlaneadoSemanal}
          tssProgress={tssProgressPct}
          styles={styles}
        />
      </Animated.ScrollView>

      <RaceDetailSheet
        visible={!!detailCarrera}
        carrera={detailCarrera}
        isEnrolled={isEnrolled}
        ctl={ctl}
        onClose={() => setDetailCarrera(null)}
        onEnroll={enrollToRace}
        onUnenroll={unenrollFromRace}
        styles={raceCalendarStyles}
      />
    </ScreenWrapper>
  );
}
