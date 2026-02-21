import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getWeekBounds, generateWeekDays, groupByMonth } from './usePlan';

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const DAY_NAMES = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};
const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const TIPO_OPTIONS = ['Ride', 'Run', 'Strength', 'Rest', 'Walk', 'Other'];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

function formatDuracion(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m} min`;
}

function getTypeConfig(tipo) {
  const t = (tipo ?? '').toLowerCase();
  if (t.includes('ride') || t.includes('bici') || t.includes('mtb') || t.includes('cicl'))
    return { icon: 'bike', color: '#00F0FF' };
  if (t.includes('run') || t.includes('corr') || t.includes('trail') || t.includes('carrera'))
    return { icon: 'run', color: '#39FF14' };
  if (t.includes('strength') || t.includes('fuerza') || t.includes('gym') || t.includes('pesa') || t.includes('peso'))
    return { icon: 'dumbbell', color: '#ff9800' };
  if (t.includes('recov') || t.includes('recuper') || t.includes('rest') || t.includes('descan'))
    return { icon: 'heart-pulse', color: '#ff5252' };
  if (t.includes('swim') || t.includes('nat'))
    return { icon: 'swim', color: '#7C4DFF' };
  return { icon: 'lightning-bolt', color: '#ffca28' };
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

// ─────────────────────────────────────────────────────────────
// WorkoutDetailSheet — Bottom Sheet interactivo
// ─────────────────────────────────────────────────────────────
function WorkoutDetailSheet({ visible, workout, dateStr, onClose, onComplete, styles }) {
  const [completing, setCompleting] = useState(false);

  if (!workout) return null;

  const { icon, color } = getTypeConfig(workout.tipo);
  const duracion = formatDuracion(workout.duracion_min);

  async function handleComplete() {
    setCompleting(true);
    try {
      await onComplete(workout.id);
      onClose();
    } catch (e) {
      Alert.alert('Error de XERPA', e?.message ?? 'No se pudo marcar el entrenamiento como completado.');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailModalContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View style={styles.detailSheet}>
        <View style={styles.detailHandle} />

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Icono grande + pill tipo */}
          <View style={styles.detailIconRow}>
            <View style={[
              styles.detailIconWrap,
              { backgroundColor: color + '18', borderColor: color + '44' },
            ]}>
              <MaterialCommunityIcons name={icon} size={42} color={color} />
            </View>
            {!!workout.tipo && (
              <View style={[
                styles.detailTypePill,
                { borderColor: color + '50', backgroundColor: color + '14' },
              ]}>
                <Text style={[styles.detailTypePillText, { color }]}>
                  {workout.tipo}
                </Text>
              </View>
            )}
          </View>

          {/* Título */}
          <Text style={styles.detailTitle}>{workout.titulo ?? 'Entrenamiento'}</Text>

          {/* Fecha */}
          {!!dateStr && (
            <Text style={styles.detailDate}>{formatDateLabel(dateStr)}</Text>
          )}

          {/* Badge de estado */}
          <View style={styles.detailStatusRow}>
            <View style={[
              styles.detailStatusBadge,
              workout.completado ? styles.detailStatusCompleted : styles.detailStatusPending,
            ]}>
              <Ionicons
                name={workout.completado ? 'checkmark-circle' : 'time-outline'}
                size={13}
                color={workout.completado ? '#39FF14' : '#ff9800'}
              />
              <Text style={[
                styles.detailStatusText,
                workout.completado ? styles.detailStatusTextCompleted : styles.detailStatusTextPending,
              ]}>
                {workout.completado ? 'Completado' : 'Pendiente'}
              </Text>
            </View>
          </View>

          {/* Métricas */}
          {(duracion || workout.tss_plan != null) && (
            <View style={styles.detailMetricsRow}>
              {duracion && (
                <View style={styles.detailMetricBox}>
                  <Text style={[styles.detailMetricValue, { color: '#00F0FF' }]}>
                    {duracion}
                  </Text>
                  <Text style={styles.detailMetricLabel}>Duración</Text>
                </View>
              )}
              {workout.tss_plan != null && (
                <View style={styles.detailMetricBox}>
                  <Text style={[styles.detailMetricValue, { color: '#39FF14' }]}>
                    {workout.tss_plan}
                  </Text>
                  <Text style={styles.detailMetricLabel}>TSS Plan</Text>
                </View>
              )}
            </View>
          )}

          {/* Descripción / Detalle del coach */}
          {!!workout.detalle && (
            <>
              <View style={styles.detailDivider} />
              <Text style={styles.detailSectionLabel}>Instrucciones del Entreno</Text>
              <Text style={styles.detailText}>{workout.detalle}</Text>
            </>
          )}

          {/* Acciones */}
          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose}>
              <Text style={styles.detailCloseBtnText}>Cerrar</Text>
            </TouchableOpacity>

            {workout.completado ? (
              <View style={styles.detailAlreadyDone}>
                <Ionicons name="checkmark-circle" size={15} color="#39FF1477" />
                <Text style={styles.detailAlreadyDoneText}>Ya completado</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#39FF14', '#00F0FF']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.detailCompleteGradient}
              >
                <TouchableOpacity
                  style={styles.detailCompleteBtn}
                  onPress={handleComplete}
                  disabled={completing}
                >
                  {completing
                    ? <ActivityIndicator size="small" color="#0F1116" />
                    : <Text style={styles.detailCompleteBtnText}>✅ Marcar Completado</Text>
                  }
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </ScrollView>
      </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Past
// ─────────────────────────────────────────────────────────────
function PastCard({ dateStr, workout, onPress, styles }) {
  const { icon, color } = getTypeConfig(workout?.tipo);

  const inner = (
    <View style={[styles.card, styles.cardPast]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1, borderColor: color + '44' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color + '88'} />
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
  const { icon, color } = getTypeConfig(workout?.tipo);
  const { isTimerActive, startTimer } = useWorkoutContext();

  // Mostrar botón solo si hay entreno y no está completado
  const showTimerBtn = workout && !workout.completado;

  return (
    <TouchableOpacity
      style={[styles.card, styles.cardToday]}
      onPress={workout ? onPress : undefined}
      activeOpacity={workout ? 0.82 : 1}
    >
      {/* Pill "HOY" */}
      <View style={styles.todayPill}>
        <View style={styles.todayPillDot} />
        <Text style={styles.todayPillText}>Hoy · {formatDateLabel(dateStr)}</Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1.5, borderColor: color, backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardDayLabel, styles.cardDayLabelToday]}>
            {workout?.tipo ?? 'Entrenamiento'}
          </Text>
          <Text style={styles.cardTitle}>
            {workout?.titulo ?? 'Sin entrenamiento planificado'}
          </Text>
        </View>
        {workout && !showTimerBtn && (
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
          {workout.completado && (
            <View style={[styles.statItem, { marginLeft: 'auto' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#39FF14" />
              <Text style={[styles.statLabel, { color: '#39FF14' }]}> Hecho</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Botón Play/Stop en esquina superior derecha ─────── */}
      {showTimerBtn && (
        <TouchableOpacity
          style={styles.cardTimerBtn}
          onPress={isTimerActive ? onStop : startTimer}
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
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Future
// ─────────────────────────────────────────────────────────────
function FutureCard({ dateStr, workout, onPress, styles }) {
  if (!workout) {
    return (
      <View style={[styles.card, styles.cardRest]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: '#111' }]}>
            <MaterialCommunityIcons name="sleep" size={18} color="#333" />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.cardDayLabel}>{formatDateLabel(dateStr)}</Text>
            <Text style={[styles.cardTitle, styles.cardTitleRest]}>Descanso</Text>
          </View>
        </View>
      </View>
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
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal: Añadir Entrenamiento Manual
// ─────────────────────────────────────────────────────────────
function AddManualModal({ visible, onClose, onSave, styles }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(todayStr);
  const [tipo, setTipo] = useState('Ride');
  const [duracion, setDuracion] = useState('');
  const [tss, setTss] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tituloError, setTituloError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitulo('');
    setFecha(todayStr);
    setTipo('Ride');
    setDuracion('');
    setTss('');
    setDetalle('');
    setTituloError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSave = async () => {
    if (!titulo.trim()) { setTituloError('El título es obligatorio.'); return; }
    setSaving(true);
    try {
      await onSave({ titulo: titulo.trim(), fecha, tipo, duracion_min: duracion, tss_plan: tss, detalle });
      resetForm();
      onClose();
      Alert.alert('¡Listo! 💪', 'Entrenamiento añadido al plan.');
    } catch (e) {
      Alert.alert('Error de XERPA', e?.message ?? 'No se pudo guardar el entrenamiento. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.manualModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <View style={styles.manualModalSheet}>
          <View style={styles.manualModalHandle} />
          <Text style={styles.manualModalTitle}>Añadir Entrenamiento</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.manualLabel}>Título *</Text>
            <TextInput
              style={[styles.manualInput, !!tituloError && styles.manualInputError]}
              placeholder="Ej. Rodada zona 2 + fartlek"
              placeholderTextColor="#444"
              value={titulo}
              onChangeText={t => { setTitulo(t); if (tituloError) setTituloError(''); }}
            />
            {!!tituloError && <Text style={styles.manualErrorText}>{tituloError}</Text>}

            <Text style={styles.manualLabel}>Tipo</Text>
            <View style={styles.tipoPills}>
              {TIPO_OPTIONS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoPill, tipo === t && styles.tipoPillActive]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={[styles.tipoPillText, tipo === t && styles.tipoPillTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.manualLabel}>Fecha</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#444"
              value={fecha}
              onChangeText={setFecha}
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>Duración (min)</Text>
                <TextInput
                  style={styles.manualInput}
                  placeholder="90"
                  placeholderTextColor="#444"
                  value={duracion}
                  onChangeText={setDuracion}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>TSS</Text>
                <TextInput
                  style={styles.manualInput}
                  placeholder="80"
                  placeholderTextColor="#444"
                  value={tss}
                  onChangeText={setTss}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.manualLabel}>Notas / Detalle</Text>
            <TextInput
              style={[styles.manualInput, styles.manualTextarea]}
              placeholder="Descripción del entrenamiento..."
              placeholderTextColor="#444"
              value={detalle}
              onChangeText={setDetalle}
              multiline
              numberOfLines={3}
            />

            <View style={styles.manualActions}>
              <TouchableOpacity style={styles.manualCancelBtn} onPress={handleClose}>
                <Text style={styles.manualCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.manualSaveBtn}
              >
                <TouchableOpacity style={styles.manualSaveGradient} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color="#121212" />
                    : <Text style={styles.manualSaveText}>💾 Guardar Entreno</Text>
                  }
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Generating Overlay
// ─────────────────────────────────────────────────────────────
function GeneratingOverlay({ visible, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.generatingOverlay}>
        <View style={styles.generatingCard}>
          <ActivityIndicator size="large" color="#00F0FF" style={{ marginBottom: 20 }} />
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
function TimerFinishSheet({ visible, totalSecs, onClose, onSave, styles }) {
  const [rpe, setRpe] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setRpe(5);
  }, [visible]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ duracion_seg: totalSecs, rpe });
      onClose();
      Alert.alert('¡Sesión guardada! 💪', 'Tu actividad fue registrada en el diario.');
    } catch (e) {
      Alert.alert('Error de XERPA', e?.message ?? 'No se pudo guardar la sesión. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.finishModalContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View style={styles.finishSheet}>
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
          <TouchableOpacity style={styles.finishDiscardBtn} onPress={onClose}>
            <Text style={styles.finishDiscardText}>Descartar</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={['#39FF14', '#00F0FF']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.finishSaveGradient}
          >
            <TouchableOpacity
              style={styles.finishSaveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#0F1116" />
                : <Text style={styles.finishSaveText}>💾 Guardar en Diario</Text>
              }
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Pestaña Semana Actual
// ─────────────────────────────────────────────────────────────
function WeekTab({ weekWorkouts, onGeneratePlan, isGenerating, onAddManual, onOpenDetail, onStopTimer, styles }) {
  const { monday, today } = getWeekBounds();
  const weekDays = generateWeekDays(monday);

  const workoutMap = {};
  weekWorkouts.forEach(w => { workoutMap[w.fecha] = w; });

  const empty = weekWorkouts.length === 0;

  return (
    <>
      {/* Action Bar */}
      <View style={styles.actionBar}>
        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.actionPrimary}
        >
          <TouchableOpacity
            style={styles.actionPrimaryGradient}
            onPress={onGeneratePlan}
            disabled={isGenerating}
          >
            <Text style={styles.actionPrimaryText}>✨ Generar Plan</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={styles.actionGhost} onPress={onAddManual}>
          <Text style={styles.actionGhostText}>➕ Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* 7 Cards Lun-Dom */}
      {weekDays.map(dateStr => {
        const workout = workoutMap[dateStr] ?? null;
        const isPast = dateStr < today;
        const isToday = dateStr === today;

        if (isToday) {
          return (
            <TodayCard
              key={dateStr}
              dateStr={dateStr}
              workout={workout}
              onPress={() => workout && onOpenDetail(workout, dateStr)}
              onStop={onStopTimer}
              styles={styles}
            />
          );
        }
        if (isPast) {
          return (
            <PastCard
              key={dateStr}
              dateStr={dateStr}
              workout={workout}
              onPress={() => workout && onOpenDetail(workout, dateStr)}
              styles={styles}
            />
          );
        }
        return (
          <FutureCard
            key={dateStr}
            dateStr={dateStr}
            workout={workout}
            onPress={() => workout && onOpenDetail(workout, dateStr)}
            styles={styles}
          />
        );
      })}

      {empty && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin plan esta semana</Text>
          <Text style={styles.emptyText}>
            Genera un plan automático o añade tus entrenamientos manualmente.
          </Text>
        </View>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Pestaña Historial
// ─────────────────────────────────────────────────────────────
function HistoryTab({ historyWorkouts, onOpenDetail, styles }) {
  if (historyWorkouts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🗂️</Text>
        <Text style={styles.emptyTitle}>Sin historial todavía</Text>
        <Text style={styles.emptyText}>
          Aquí aparecerán tus entrenamientos completados semana a semana.
        </Text>
      </View>
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
  isGenerating,
  handleGeneratePlan,
  addManualWorkout,
  saveTimerSession,
  styles,
}) {
  const [activeTab, setActiveTab] = useState('week');
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // ── Cronómetro (estado global vía WorkoutContext) ────────
  const { timerSecs, stopTimer: contextStopTimer, resetTimer } = useWorkoutContext();
  const [showFinishSheet, setShowFinishSheet] = useState(false);

  const { monday } = getWeekBounds();

  const weekEnd = new Date(monday + 'T00:00:00');
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = `${weekEnd.getDate()} ${MONTH_ABBR[weekEnd.getMonth()]}`;
  const weekStartStr = (() => {
    const d = new Date(monday + 'T00:00:00');
    return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
  })();

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

  if (loading) {
    return (
      <ScreenWrapper style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>Cargando plan…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerMeta}>{weekStartStr} – {weekEndStr}</Text>
          <Text style={styles.headerTitle}>Plan de Entrenamiento</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'week' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('week')}
          >
            <Text style={[styles.segmentText, activeTab === 'week' && styles.segmentTextActive]}>
              Semana Actual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'history' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según tab */}
        {activeTab === 'week' ? (
          <WeekTab
            weekWorkouts={weekWorkouts}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
            onAddManual={() => setIsManualModalVisible(true)}
            onOpenDetail={openDetail}
            onStopTimer={stopTimer}
            styles={styles}
          />
        ) : (
          <HistoryTab
            historyWorkouts={historyWorkouts}
            onOpenDetail={openDetail}
            styles={styles}
          />
        )}
      </ScrollView>

      {/* Modals / Overlays */}
      <GeneratingOverlay visible={isGenerating} styles={styles} />

      <AddManualModal
        visible={isManualModalVisible}
        onClose={() => setIsManualModalVisible(false)}
        onSave={addManualWorkout}
        styles={styles}
      />

      <WorkoutDetailSheet
        visible={!!selectedWorkout}
        workout={selectedWorkout}
        dateStr={selectedDateStr}
        onClose={closeDetail}
        onComplete={markComplete}
        styles={styles}
      />

      <TimerFinishSheet
        visible={showFinishSheet}
        totalSecs={timerSecs}
        onClose={handleFinishClose}
        onSave={saveTimerSession}
        styles={styles}
      />
    </ScreenWrapper>
  );
}
