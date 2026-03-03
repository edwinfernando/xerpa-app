/**
 * WorkoutActiveScreen — Pantalla de ejecución del entrenamiento (Offline First)
 *
 * - Cabecera: título + tiempo objetivo
 * - Cronómetro grande (HH:MM:SS)
 * - Controles: Iniciar, Pausar, Finalizar (mantener presionado)
 * - Modal RPE al finalizar → guardar en Supabase o AsyncStorage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useFocusEffect } from '@react-navigation/native';
import { getTodayPlan } from '../../services/offlineStorage';
import { saveManualEffort } from '../../services/effortSync';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { theme } from '../../styles/theme';

// ─── Constantes ─────────────────────────────────────────────
const RPE_LABELS = {
  1: 'Descanso activo',
  2: 'Muy suave',
  3: 'Suave',
  4: 'Moderado',
  5: 'Algo duro',
  6: 'Duro',
  7: 'Muy duro',
  8: 'Extremo',
  9: 'Severo',
  10: 'Absoluto',
};

function getRpeColor(n) {
  if (n <= 3) return theme.colors.primary; // verde
  if (n <= 6) return '#ffca28'; // amarillo
  return theme.colors.danger; // rojo
}

function formatDuracion(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}`.trim() : `${m} min`;
}

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// ─── Toast simple ───────────────────────────────────────────
function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (!visible || !message) return;
    const t = setTimeout(() => onHide?.(), 3000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);

  if (!visible || !message) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// ─── Modal RPE (BottomSheet) ────────────────────────────────
function RPEBottomSheet({ visible, totalSecs, onClose, onSave }) {
  const [rpe, setRpe] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setRpe(5);
  }, [visible]);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await onSave({ duracionMin: totalSecs / 60, rpe });
      onClose(result);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => onClose()}
      onBackButtonPress={() => onClose()}
      onSwipeComplete={() => onClose()}
      swipeDirection={['down']}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => onClose()} />

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>¿Qué tan duro fue el entrenamiento?</Text>
          <Text style={styles.sheetTimer}>{formatTimer(totalSecs)}</Text>

          <View style={styles.rpeRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
              const c = getRpeColor(n);
              const active = rpe === n;
              return (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.rpePill,
                    active && { backgroundColor: c + '30', borderColor: c, borderWidth: 2 },
                  ]}
                  onPress={() => setRpe(n)}
                >
                  <Text style={[styles.rpePillText, active && { color: c, fontWeight: '900' }]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.rpeDesc, { color: getRpeColor(rpe) }]}>{RPE_LABELS[rpe]}</Text>

          <View style={styles.sheetActions}>
            <Button
              title="Descartar"
              variant="secondary"
              onPress={() => onClose()}
              style={styles.discardBtn}
            />
            <Button
              title="Guardar"
              variant="solid"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── WorkoutActiveScreen ────────────────────────────────────
export function WorkoutActiveScreen({ user, navigation, route }) {
  const { isTimerActive, timerSecs, startTimer, stopTimer, resumeTimer, resetTimer } = useWorkoutContext();
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [showRpeSheet, setShowRpeSheet] = useState(false);

  useNavigationBarColor(showRpeSheet, '#131313', '#121212');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [holdProgress, setHoldProgress] = useState(new Animated.Value(0));
  const holdTimerRef = React.useRef(null);

  // Cargar plan desde params o AsyncStorage (offline first)
  useFocusEffect(
    useCallback(() => {
      const planFromParams = route?.params?.plan ?? null;
      if (planFromParams) {
        setPlan(planFromParams);
        setLoadingPlan(false);
        return;
      }
      (async () => {
        setLoadingPlan(true);
        try {
          const cached = await getTodayPlan();
          setPlan(cached);
        } catch {
          setPlan(null);
        } finally {
          setLoadingPlan(false);
        }
      })();
    }, [route?.params?.plan])
  );

  const handleSaveEffort = useCallback(
    async ({ duracionMin, rpe }) => {
      const userId = user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const hoy = new Date().toISOString().split('T')[0];
      const result = await saveManualEffort({
        userId,
        rpe,
        fecha: hoy,
        duracionMin,
        tipo: 'Ride',
        planEntrenamientoId: plan?.id,
      });

      if (result.offline && result.toastMessage) {
        setToastMessage(result.toastMessage);
        setShowToast(true);
      }
      return result;
    },
    [user?.id, plan?.id]
  );

  function handleRpeClose(result) {
    setShowRpeSheet(false);
    resetTimer();
    if (result?.success) {
      if (result?.offline) {
        setToastMessage(result?.toastMessage ?? 'Guardado offline.');
      } else {
        setToastMessage('¡Entrenamiento guardado! 💪');
      }
      setShowToast(true);
    }
    navigation.goBack();
  }

  function handleStop() {
    stopTimer();
    setShowRpeSheet(true);
  }

  // Long press para Finalizar (evitar toques accidentales con guantes)
  const LONG_PRESS_MS = 800;

  function handleFinalizarPressIn() {
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: LONG_PRESS_MS,
      useNativeDriver: false,
    }).start();
    holdTimerRef.current = setTimeout(() => {
      handleStop();
      holdProgress.setValue(0);
    }, LONG_PRESS_MS);
  }

  function handleFinalizarPressOut() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdProgress.setValue(0);
  }

  if (loadingPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando entrenamiento…</Text>
        </View>
      </View>
    );
  }

  const titulo = plan?.titulo ?? 'Entrenamiento';
  const tiempoObjetivo = plan?.duracion_min ? formatDuracion(plan.duracion_min) : null;

  return (
    <View style={styles.container}>
      {/* Cabecera + Cerrar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {titulo}
          </Text>
          {tiempoObjetivo && (
            <Text style={styles.headerMeta}>Objetivo: {tiempoObjetivo}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={28} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Cronómetro grande */}
      <View style={styles.timerSection}>
        <Text style={styles.timerDisplay}>{formatTimer(timerSecs)}</Text>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        {timerSecs === 0 ? (
          <TouchableOpacity style={styles.btnIniciar} onPress={startTimer} activeOpacity={0.8}>
            <Text style={styles.btnIniciarText}>Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <>
            {isTimerActive ? (
              <TouchableOpacity style={styles.btnPausar} onPress={stopTimer} activeOpacity={0.8}>
                <Text style={styles.btnPausarText}>Pausar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnReanudar} onPress={resumeTimer} activeOpacity={0.8}>
                <Text style={styles.btnReanudarText}>Reanudar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.btnFinalizar}
              onPressIn={handleFinalizarPressIn}
              onPressOut={handleFinalizarPressOut}
              activeOpacity={1}
            >
              <Text style={styles.btnFinalizarText}>Mantén para finalizar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <RPEBottomSheet
        visible={showRpeSheet}
        totalSecs={timerSecs}
        onClose={handleRpeClose}
        onSave={handleSaveEffort}
      />

      <Toast message={toastMessage} visible={showToast} onHide={() => setShowToast(false)} />
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
    paddingRight: 44,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerMeta: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    color: theme.colors.primary,
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 48,
  },
  btnIniciar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '25',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIniciarText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnPausar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffca2825',
    borderWidth: 3,
    borderColor: '#ffca28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPausarText: {
    color: '#ffca28',
    fontSize: 16,
    fontWeight: '800',
  },
  btnReanudar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '25',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReanudarText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  btnFinalizar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.danger + '25',
    borderWidth: 3,
    borderColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  btnFinalizarText: {
    color: theme.colors.danger,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },

  // Modal (alineado con resto de BottomSheets)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: theme.SHEET_PADDING_BOTTOM,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  sheetTimer: {
    color: theme.colors.primary,
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 28,
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  rpeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rpePill: {
    width: 28,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpePillText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
  },
  rpeDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '900',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '44',
  },
  toastText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
