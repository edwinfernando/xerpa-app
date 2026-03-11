import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useToast } from '../../context/ToastContext';
import Modal from 'react-native-modal';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { Button } from '../../components/ui/Button';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Plus, Sparkles, History } from 'lucide-react-native';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { getWeekBounds, generateWeekDays, groupByMonth } from '../../utils/dateUtils';
import { formatDuracion } from '../../utils/formatDuracion';
import { getTypeConfig } from '../../utils/workoutTypeConfig';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps, getCenteredModalStyle } from '../../constants/sheetModalConfig';
import { Skeleton } from '../../components/ui/Skeleton';
import PagerView from 'react-native-pager-view';

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const DAY_NAMES = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};
const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const FIXED_SEGMENTS_HEIGHT = 68;

const fixedBarStyles = StyleSheet.create({
  fixedBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

function formatMonthYear(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const formatted = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function getRpeColor(n) {
  if (n <= 3) return '#39FF14';
  if (n <= 5) return '#ffca28';
  if (n <= 7) return '#ff9800';
  return '#ff5252';
}

const RPE_LABELS = {
  1: 'Descanso activo · sin esfuerzo',
  2: 'Muy suave · casi sin esfuerzo',
  3: 'Suave · conversación fácil',
  4: 'Moderado · algo de esfuerzo',
  5: 'Algo duro · esfuerzo constante',
  6: 'Duro · hablar cuesta trabajo',
  7: 'Muy duro · solo frases cortas',
  8: 'Extremo · casi al límite',
  9: 'Severo · insostenible',
  10: 'Absoluto · todo lo que tienes',
};

import { PlanDetailSheet } from '../../components/plan/PlanDetailSheet';

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Past
// ─────────────────────────────────────────────────────────────
function PastCard({ dateStr, workout, onPress, styles }) {
  const { icon, color } = getTypeConfig(workout?.tipo);

  const inner = (
    <View style={styles.pastCardContainer}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1, borderColor: color + '66', backgroundColor: color + '12' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDayLabel}>{formatDateLabel(dateStr)}</Text>
          <Text style={styles.cardTitle}>{workout?.titulo ?? 'Entrenamiento'}</Text>
        </View>
        {workout?.completado && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#39FF14" />
            <Text style={styles.completedText}>Hecho</Text>
          </View>
        )}
      </View>
      {workout && (
        <View style={styles.cardStats}>
          {formatDuracion(workout.duracion_min) && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuracion(workout.duracion_min)}</Text>
            </View>
          )}
          {workout.tss_plan != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TSS </Text>
              <Text style={styles.statValue}>{workout.tss_plan}</Text>
            </View>
          )}
          {workout.hora && (
            <View style={styles.statItem}>
              <Ionicons name="alarm-outline" size={13} color="#555" />
              <Text style={styles.statValue}>{workout.hora}</Text>
            </View>
          )}
          {workout.punto_encuentro && (
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={13} color="#555" />
              <Text style={styles.statValue} numberOfLines={1}>{workout.punto_encuentro}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (!workout || !onPress) return inner;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      {inner}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Today (Focus Card) — ahora tappable
// ─────────────────────────────────────────────────────────────
function TodayCard({ dateStr, workout, onPress, onStop, styles }) {
  const navigation = useNavigation();
  const { icon, color } = getTypeConfig(workout?.tipo);
  const { isTimerActive, startTimer } = useWorkoutContext();

  const showTimerBtn = workout && !workout.completado;
  const isRestDay = !workout;
  const showActionButton = !workout?.completado; // Mostrar CTA si no está completado

  function handleActionPress() {
    if (isRestDay) {
      onPress?.();
      return;
    }
    if (isTimerActive) {
      onStop?.();
      return;
    }
    startTimer();
    navigation.navigate('WorkoutActive', { plan: workout });
  }

  const handleCardPress = () => {
    const payload = workout ?? { tipo: 'Rest', titulo: 'Día de descanso', fecha: dateStr };
    onPress?.(payload, dateStr);
  };

  return (
    <TouchableOpacity
      style={[styles.todayCardContainer]}
      onPress={handleCardPress}
      activeOpacity={0.82}
    >
      {/* Badge "HOY" con punto verde neón (en vivo) */}
      <View style={styles.todayPill}>
        <View style={styles.todayPillDot} />
        <Text style={styles.todayPillText}>HOY</Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1.5, borderColor: color, backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardDayLabel, styles.cardDayLabelToday]}>
            {workout?.tipo ?? 'Descanso'}
          </Text>
          <Text style={styles.cardTitleToday}>
            {workout?.titulo ?? 'Sin entrenamiento planificado'}
          </Text>
        </View>
        {(workout && !showTimerBtn) && (
          <Ionicons name="chevron-forward" size={18} color="#39FF1455" />
        )}
      </View>

      {workout && (
        <View style={styles.cardStats}>
          {formatDuracion(workout.duracion_min) && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={13} color="#555" />
              <Text style={styles.statValue}>{formatDuracion(workout.duracion_min)}</Text>
            </View>
          )}
          {workout.tss_plan != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TSS </Text>
              <Text style={styles.statValue}>{workout.tss_plan}</Text>
            </View>
          )}
          {workout.hora && (
            <View style={styles.statItem}>
              <Ionicons name="alarm-outline" size={13} color="#555" />
              <Text style={styles.statValue}>{workout.hora}</Text>
            </View>
          )}
          {workout.punto_encuentro && (
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={13} color="#555" />
              <Text style={styles.statValue} numberOfLines={1}>{workout.punto_encuentro}</Text>
            </View>
          )}
          {workout.completado && (
            <View style={[styles.statItem, { marginLeft: 'auto' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#39FF14" />
              <Text style={[styles.statLabel, { color: '#39FF14' }]}> Hecho</Text>
            </View>
          )}
        </View>
      )}

      {/* Botón Play/Stop en esquina superior derecha */}
      {showTimerBtn && (
        <TouchableOpacity
          style={styles.cardTimerBtn}
          onPress={handleActionPress}
          activeOpacity={0.75}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name={isTimerActive ? 'stop-circle' : 'play-circle'}
            size={34}
            color={isTimerActive ? '#ff5252' : '#39FF14'}
          />
        </TouchableOpacity>
      )}

      {/* CTA: abre detalle; desde el detalle se puede Iniciar Entreno */}
      {showActionButton && (
        <TouchableOpacity
          style={styles.todayActionButton}
          onPress={() => {
            if (isRestDay) handleCardPress();
            else handleActionPress();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.todayActionText}>
            {isRestDay ? 'VER DETALLE' : 'INICIAR ENTRENAMIENTO'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Future
// ─────────────────────────────────────────────────────────────
function FutureCard({ dateStr, workout, onPress, styles }) {
  const restConfig = getTypeConfig('Rest');
  if (!workout) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardRest]}
        onPress={() => onPress?.({ tipo: 'Rest', titulo: 'Día de descanso', fecha: dateStr }, dateStr)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: restConfig.color + '15', borderWidth: 1, borderColor: restConfig.color + '44' }]}>
            <MaterialCommunityIcons name={restConfig.icon} size={20} color={restConfig.color} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardDayLabel}>{formatDateLabel(dateStr)}</Text>
            <Text style={[styles.cardTitle, styles.cardTitleRest]}>Descanso</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#444" />
        </View>
      </TouchableOpacity>
    );
  }

  const { icon, color } = getTypeConfig(workout.tipo);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1, borderColor: color + '33' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDayLabel}>{formatDateLabel(dateStr)}</Text>
          <Text style={styles.cardTitle}>{workout.titulo ?? 'Entrenamiento'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#444" />
      </View>
      <View style={styles.cardStats}>
        {formatDuracion(workout.duracion_min) && (
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={13} color="#555" />
            <Text style={styles.statValue}>{formatDuracion(workout.duracion_min)}</Text>
          </View>
        )}
        {workout.tss_plan != null && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TSS </Text>
            <Text style={styles.statValue}>{workout.tss_plan}</Text>
          </View>
        )}
          {workout.hora && (
            <View style={styles.statItem}>
              <Ionicons name="alarm-outline" size={13} color="#555" />
              <Text style={styles.statValue}>{workout.hora}</Text>
            </View>
          )}
        {workout.punto_encuentro && (
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={13} color="#555" />
            <Text style={styles.statValue} numberOfLines={1}>{workout.punto_encuentro}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Generating Overlay
// ─────────────────────────────────────────────────────────────
function GeneratingOverlay({ visible, styles }) {
  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={[getCenteredModalStyle()]}
      {...getSheetModalProps()}
    >
      <View style={styles.generatingOverlay}>
        <View style={styles.generatingCard}>
          <View style={styles.generatingSkeletons}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} borderRadius={18} style={styles.generatingSkeletonCard} />
            ))}
          </View>
          <Text style={styles.generatingTitle}>Creando tu plan...</Text>
          <Text style={styles.generatingText}>
            XERPA está analizando tu perfil y creando tu semana perfecta...
            esto tomará unos segundos.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TimerFinishSheet — Sheet de finalización con RPE
// ─────────────────────────────────────────────────────────────
function TimerFinishSheet({ visible, totalSecs, onClose, onSave, showToast, styles }) {
  const [rpe, setRpe] = useState(5);
  const [saving, setSaving] = useState(false);
  const { scrollOffsetY } = useModalSwipeScroll(110, visible);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setRpe(5);
  }, [visible]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ duracion_seg: totalSecs, rpe });
      onClose();
      showToast?.({ type: 'success', title: '¡Sesión guardada! 💪', message: 'Tu actividad fue registrada en el diario.' });
    } catch (e) {
      showToast?.({ type: 'error', title: 'Error de XERPA', message: e?.message ?? 'No se pudo guardar la sesión. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <View style={styles.finishModalContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View style={[styles.finishSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.finishHandle} />

        {/* Tiempo registrado */}
        <Text style={styles.finishTimerLabel}>Tiempo registrado</Text>
        <Text style={styles.finishTimerDisplay}>{formatTimer(totalSecs)}</Text>

        {/* Selector RPE */}
        <Text style={styles.finishRpeTitle}>Esfuerzo Percibido (RPE 1–10)</Text>
        <View style={styles.finishRpeRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
            const c = getRpeColor(n);
            const active = rpe === n;
            return (
              <TouchableOpacity
                key={n}
                style={[
                  styles.finishRpePill,
                  active && { backgroundColor: c + '22', borderColor: c },
                ]}
                onPress={() => setRpe(n)}
              >
                <Text style={[
                  styles.finishRpePillText,
                  active && { color: c, fontWeight: '900' },
                ]}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Descripción RPE */}
        <Text style={[styles.finishRpeDesc, { color: getRpeColor(rpe) }]}>
          {RPE_LABELS[rpe]}
        </Text>

        {/* Botones */}
        <View style={styles.finishActions}>
          <Button
            title="Descartar"
            variant="secondary"
            onPress={onClose}
            style={styles.finishDiscardBtn}
          />
          <Button
            title="Guardar en Diario"
            variant="solid"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.finishSaveGradient}
          />
        </View>
      </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyPlanState — Oportunidad de generación con IA
// ─────────────────────────────────────────────────────────────
function EmptyPlanState({ onGeneratePlan, isGenerating, styles }) {
  return (
    <View style={styles.emptyPlanContainer}>
      <View style={styles.emptyPlanIconWrap}>
        <Sparkles color="#00D2FF" size={56} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyPlanTitle}>Semana en Blanco</Text>
      <Text style={styles.emptyPlanText}>
        Tu lienzo está listo. Deja que XERPA AI diseñe tu próximo microciclo basado en tu fatiga actual.
      </Text>
      <TouchableOpacity
        style={styles.emptyPlanButton}
        onPress={onGeneratePlan}
        disabled={isGenerating}
        activeOpacity={0.85}
      >
        {isGenerating ? (
          <Skeleton width={24} height={24} borderRadius={12} />
        ) : (
          <Text style={styles.emptyPlanButtonText}>Generar Plan con XERPA AI</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// PlanSkeletonContent — Skeletons dentro del segmento Semana Actual
// ─────────────────────────────────────────────────────────────
function PlanSkeletonContent({ styles }) {
  return (
    <>
      <View style={styles.actionBar}>
        <Skeleton height={52} borderRadius={14} style={styles.actionPrimary} />
      </View>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <View key={i} style={styles.skeletonCardWrap}>
          <View style={styles.skeletonCardRow}>
            <Skeleton width={44} height={44} borderRadius={12} />
            <View style={styles.skeletonCardMeta}>
              <Skeleton width={100} height={12} borderRadius={6} style={styles.skeletonCardLabel} />
              <Skeleton width={180} height={16} borderRadius={8} style={styles.skeletonCardTitle} />
            </View>
          </View>
          <View style={styles.skeletonStatsRow}>
            <Skeleton width={48} height={12} borderRadius={6} />
            <Skeleton width={36} height={12} borderRadius={6} />
          </View>
        </View>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// HistorySkeletonContent — Skeletons dentro del segmento Historial
// ─────────────────────────────────────────────────────────────
function HistorySkeletonContent({ styles }) {
  return (
    <>
      {[1, 2].map((group) => (
        <View key={group}>
          <View style={styles.monthHeader}>
            <Skeleton width={140} height={16} borderRadius={8} />
            <View style={styles.monthHeaderLine} />
          </View>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonHistoryItem}>
              <Skeleton width={36} height={36} borderRadius={10} />
              <View style={styles.skeletonHistoryContent}>
                <Skeleton width={180} height={14} borderRadius={7} style={{ marginBottom: 6 }} />
                <Skeleton width={120} height={12} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Pestaña Semana Actual
// ─────────────────────────────────────────────────────────────
function WeekTab({ weekWorkouts, loading, onGeneratePlan, isGenerating, onOpenDetail, onStopTimer, onTodayCardLayout, styles }) {
  const { monday, today } = getWeekBounds();
  const weekDays = generateWeekDays(monday);

  if (loading) {
    return <PlanSkeletonContent styles={styles} />;
  }

  // Renderizado condicional: EmptyPlanState o los 7 días
  if (weekWorkouts.length === 0) {
    return (
      <EmptyPlanState
        onGeneratePlan={onGeneratePlan}
        isGenerating={isGenerating}
        styles={styles}
      />
    );
  }

  const workoutMap = {};
  weekWorkouts.forEach(w => { workoutMap[w.fecha] = w; });

  return (
    <>
      {/* Generar Plan solo cuando no hay entrenos; si ya hay plan, no se muestra el botón */}
      {/* 7 Cards Lun-Dom */}
      {weekDays.map(dateStr => {
        const workout = workoutMap[dateStr] ?? null;
        const isPast = dateStr < today;
        const isToday = dateStr === today;

        if (isToday) {
          return (
            <View
              key={dateStr}
              onLayout={(e) => onTodayCardLayout?.(e.nativeEvent.layout.y)}
            >
              <TodayCard
                dateStr={dateStr}
                workout={workout}
                onPress={(w, d) => onOpenDetail(w ?? workout, d ?? dateStr)}
                onStop={onStopTimer}
                styles={styles}
              />
            </View>
          );
        }
        if (isPast) {
        return (
          <PastCard
            key={dateStr}
            dateStr={dateStr}
            workout={workout}
            onPress={(w, d) => workout && onOpenDetail(w ?? workout, d ?? dateStr)}
            styles={styles}
          />
        );
        }
        return (
          <FutureCard
            key={dateStr}
            dateStr={dateStr}
            workout={workout}
            onPress={(w, d) => onOpenDetail(w ?? workout, d ?? dateStr)}
            styles={styles}
          />
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyHistoryState — Hermano gemelo de EmptyPlanState
// ─────────────────────────────────────────────────────────────
function EmptyHistoryState({ onGoToWeek, styles }) {
  return (
    <View style={styles.emptyPlanContainer}>
      <View style={styles.emptyPlanIconWrap}>
        <History color="#8E8E93" size={56} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyPlanTitle}>Tu Leyenda Empieza Aquí</Text>
      <Text style={styles.emptyPlanText}>
        Completa tu primer entrenamiento de la semana para que aparezca en tu bitácora.
      </Text>
      <TouchableOpacity
        style={styles.emptyHistorySecondaryBtn}
        onPress={onGoToWeek}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyHistorySecondaryBtnText}>Ir a la semana actual</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Pestaña Historial
// ─────────────────────────────────────────────────────────────
function HistoryTab({ historyWorkouts, loading, onOpenDetail, onGoToWeek, styles }) {
  if (loading) {
    return <HistorySkeletonContent styles={styles} />;
  }
  if (historyWorkouts.length === 0) {
    return (
      <EmptyHistoryState
        onGoToWeek={onGoToWeek}
        styles={styles}
      />
    );
  }

  const groups = groupByMonth(historyWorkouts);

  return (
    <>
      {groups.map(({ month, items }) => (
        <View key={month}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthHeaderText}>{month}</Text>
            <View style={styles.monthHeaderLine} />
          </View>

          {items.map(item => {
            const { icon, color } = getTypeConfig(item.tipo);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => onOpenDetail(item, item.fecha)}
                activeOpacity={0.7}
              >
                <View style={[styles.historyIconBox, { borderWidth: 1, borderColor: color + '33' }]}>
                  <MaterialCommunityIcons name={icon} size={16} color={color + 'aa'} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{item.titulo ?? 'Entrenamiento'}</Text>
                  <Text style={styles.historyMeta}>
                    {formatDateLabel(item.fecha)}
                    {formatDuracion(item.duracion_min) ? `  ·  ${formatDuracion(item.duracion_min)}` : ''}
                    {item.tss_plan != null ? `  ·  TSS ${item.tss_plan}` : ''}
                    {item.hora ? `  ·  ${item.hora}` : ''}
                    {item.punto_encuentro ? `  ·  ${item.punto_encuentro}` : ''}
                  </Text>
                </View>
                <View style={[
                  styles.historyCheck,
                  !item.completado && styles.historyCheckIncomplete,
                ]}>
                  <Ionicons
                    name={item.completado ? 'checkmark' : 'remove'}
                    size={14}
                    color={item.completado ? '#39FF14' : '#444'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PlanView (raíz)
// ─────────────────────────────────────────────────────────────
export function PlanView({
  loading,
  weekWorkouts,
  historyWorkouts,
  markComplete,
  saveFeedback,
  isGenerating,
  handleGeneratePlan,
  addManualWorkout,
  saveTimerSession,
  onOpenAddPlan,
  styles,
}) {
  const { showToast } = useToast();
  const scrollViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('week');

  // Top Tabs: indicador neón animado (2 tabs)
  const [headerWidth, setHeaderWidth] = useState(
    () => Dimensions.get('window').width - 32
  );
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = headerWidth / 2;

  useEffect(() => {
    const idx = activeTab === 'week' ? 0 : 1;
    Animated.spring(indicatorTranslateX, {
      toValue: idx * tabWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [activeTab, tabWidth]);

  const handleHeaderLayout = useCallback((e) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setHeaderWidth(width);
  }, []);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // ── Cronómetro (estado global vía WorkoutContext) ────────
  const { timerSecs, stopTimer: contextStopTimer, resetTimer, startTimer } = useWorkoutContext();
  const navigation = useNavigation();
  const [showFinishSheet, setShowFinishSheet] = useState(false);

  const { monday } = getWeekBounds();

  const headerDateLabel = formatMonthYear(monday);
  const { scrollHandler, scrollY, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true, hideOnScroll: true });

  const segmentBarPaddingTop = React.useMemo(
    () =>
      interpolations.headerHeight.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT],
        outputRange: [insets.top, 8],
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    [interpolations.headerHeight, HEADER_MAX_HEIGHT, insets.top]
  );

  const pagerRef = useRef(null);
  const historyScrollRef = useRef(null);
  const setPage = useCallback((index) => {
    pagerRef.current?.setPage(index);
  }, []);

  useEffect(() => {
    Animated.timing(scrollY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
    if (activeTab === 'week') {
      scrollViewRef.current?.scrollTo?.({ y: 0, animated: true });
    } else {
      historyScrollRef.current?.scrollTo?.({ y: 0, animated: true });
    }
  }, [activeTab, scrollY]);

  const isAnyModalVisible = !!selectedWorkout || isGenerating || showFinishSheet;
  useNavigationBarColor(isAnyModalVisible, '#131313', '#121212');

  function openDetail(workout, dateStr) {
    setSelectedWorkout(workout);
    setSelectedDateStr(dateStr);
  }

  function closeDetail() {
    setSelectedWorkout(null);
    setSelectedDateStr('');
  }

  // Detiene el contexto + abre el sheet de finalización
  function stopTimer() {
    contextStopTimer();
    setShowFinishSheet(true);
  }

  function handleFinishClose() {
    setShowFinishSheet(false);
    resetTimer();
  }

  function handleTodayCardLayout(y) {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - 24),
        animated: true,
      });
    }, 250);
  }

  return (
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <CollapsibleHeader
        editorialLabel={headerDateLabel}
        editorialTitle="Mi Plan"
        smallTitle="Mi Plan"
        rightAction={
          <AnimatedActionButton
            label="Añadir"
            icon={<Plus color="#00D2FF" size={20} strokeWidth={2.5} />}
            onPress={onOpenAddPlan}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <View style={{ flex: 1 }}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={activeTab === 'week' ? 0 : 1}
          onPageSelected={(e) => {
            const idx = e.nativeEvent.position;
            const tab = idx === 0 ? 'week' : 'history';
            if (tab !== activeTab) {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab(tab);
            }
          }}
        >
          <View key="0" style={{ flex: 1 }} collapsable={false}>
            <Animated.ScrollView
              ref={scrollViewRef}
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT }]}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            >
              <WeekTab
                weekWorkouts={weekWorkouts}
                loading={loading}
                onGeneratePlan={handleGeneratePlan}
                isGenerating={isGenerating}
                onOpenDetail={openDetail}
                onStopTimer={stopTimer}
                onTodayCardLayout={handleTodayCardLayout}
                styles={styles}
              />
            </Animated.ScrollView>
          </View>
          <View key="1" style={{ flex: 1 }} collapsable={false}>
            <Animated.ScrollView
              ref={historyScrollRef}
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT }]}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            >
              <HistoryTab
                historyWorkouts={historyWorkouts}
                loading={loading}
                onOpenDetail={openDetail}
                onGoToWeek={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setPage(0);
                  setActiveTab('week');
                }}
                styles={styles}
              />
            </Animated.ScrollView>
          </View>
        </PagerView>

        <Animated.View
          style={[
            fixedBarStyles.fixedBar,
            { top: interpolations.headerHeight },
          ]}
          pointerEvents="box-none"
        >
          <View style={fixedBarStyles.background} pointerEvents="none" />
          <Animated.View
            style={[fixedBarStyles.content, { paddingTop: segmentBarPaddingTop }]}
            onLayout={handleHeaderLayout}
          >
            <View style={styles.topTabsHeader}>
              <TouchableOpacity
                style={styles.topTabBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setPage(0);
                  setActiveTab('week');
                }}
              >
                <Text style={activeTab === 'week' ? styles.topTabTextActive : styles.topTabTextInactive}>
                  Semana Actual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.topTabBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setPage(1);
                  setActiveTab('history');
                }}
              >
                <Text style={activeTab === 'history' ? styles.topTabTextActive : styles.topTabTextInactive}>
                  Historial
                </Text>
              </TouchableOpacity>
              <Animated.View
                style={[
                  styles.topTabIndicator,
                  {
                    width: tabWidth,
                    transform: [{ translateX: indicatorTranslateX }],
                  },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Modals / Overlays */}
      <GeneratingOverlay visible={isGenerating} styles={styles} />

      <PlanDetailSheet
        visible={!!selectedWorkout}
        workout={selectedWorkout}
        dateStr={selectedDateStr}
        onClose={closeDetail}
        onSaveFeedback={saveFeedback}
        onStartWorkout={(plan) => {
          startTimer();
          navigation.navigate('WorkoutActive', { plan });
        }}
        showToast={showToast}
        styles={styles}
      />

      <TimerFinishSheet
        visible={showFinishSheet}
        totalSecs={timerSecs}
        onClose={handleFinishClose}
        onSave={saveTimerSession}
        showToast={showToast}
        styles={styles}
      />
    </ScreenWrapper>
  );
}
