import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from 'react-native';
import Modal from 'react-native-modal';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Plus, Sparkles, History } from 'lucide-react-native';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
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

function formatMonthYear(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const formatted = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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
const SWIPE_HEADER_HEIGHT = 120;

function WorkoutDetailSheet({ visible, workout, dateStr, onClose, onSaveFeedback, styles }) {
  const [completing, setCompleting] = useState(false);
  const [notaAtleta, setNotaAtleta] = useState('');
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setScrollOffsetY(0);
      scrollOffsetRef.current = 0;
    }
  }, [visible]);

  const propagateSwipe = useCallback((evt) => {
    const locationY = evt?.nativeEvent?.locationY ?? 0;
    return locationY > SWIPE_HEADER_HEIGHT;
  }, []);

  const scrollTo = useCallback((offset) => {
    if (offset && typeof offset.y === 'number') {
      const currentY = scrollOffsetRef.current;
      const newY = Math.max(0, currentY + offset.y);
      scrollViewRef.current?.scrollTo({ y: newY, animated: false });
    }
  }, []);

  if (!workout) return null;

  const { icon, color } = getTypeConfig(workout.tipo);
  const duracion = formatDuracion(workout.duracion_min);

  const origenBadge = workout.is_generado_ia
    ? { label: 'Generado por XERPA COACH (IA)', icon: 'sparkles' }
    : workout.entrenador_id
      ? { label: 'Asignado por Entrenador', icon: 'person' }
      : null;

  async function handleGuardarFeedback() {
    setCompleting(true);
    try {
      await onSaveFeedback(workout.id, notaAtleta);
      onClose();
    } catch (e) {
      Alert.alert('Error de XERPA', e?.message ?? 'No se pudo guardar el feedback.');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      scrollTo={scrollTo}
      scrollOffset={scrollOffsetY}
      scrollOffsetMax={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.detailModalContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View style={styles.detailSheet}>
        <View style={styles.detailHandle} />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
          onScroll={(e) => {
            const currentOffset = e.nativeEvent.contentOffset.y;
            const y = currentOffset < 0 ? 0 : currentOffset;
            setScrollOffsetY(y);
            scrollOffsetRef.current = y;
          }}
          scrollEventThrottle={16}
        >
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

          {/* Feedback: nota_atleta (si completado, mostrar nota existente; si no, formulario) */}
          {workout.completado && !!workout.nota_atleta && (
            <>
              <View style={styles.detailDivider} />
              <Text style={styles.detailSectionLabel}>Tus sensaciones</Text>
              <Text style={styles.detailText}>{workout.nota_atleta}</Text>
            </>
          )}

          {/* Formulario feedback (solo si no completado) */}
          {!workout.completado && (
            <>
              <View style={styles.detailDivider} />
              <Text style={styles.detailSectionLabel}>¿Cómo te sentiste? (opcional)</Text>
              <Input
                value={notaAtleta}
                onChangeText={setNotaAtleta}
                placeholder="Escribe tus sensaciones del entreno..."
                multiline
                numberOfLines={3}
                style={styles.detailFeedbackInput}
              />
            </>
          )}

          {/* Acciones */}
          <View style={styles.detailActions}>
            <Button
              title="Cerrar"
              variant="secondary"
              onPress={onClose}
              style={styles.detailCloseBtn}
            />
            {workout.completado ? (
              <View style={styles.detailAlreadyDone}>
                <Ionicons name="checkmark-circle" size={15} color="#39FF1477" />
                <Text style={styles.detailAlreadyDoneText}>Ya completado</Text>
              </View>
            ) : (
              <Button
                title="Guardar Feedback"
                variant="solid"
                onPress={handleGuardarFeedback}
                loading={completing}
                disabled={completing}
                style={styles.detailCompleteGradient}
              />
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
    <View style={styles.pastCardContainer}>
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

  return (
    <TouchableOpacity
      style={[styles.todayCardContainer]}
      onPress={workout && !showActionButton ? onPress : undefined}
      activeOpacity={workout && !showActionButton ? 0.82 : 1}
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
        {workout && !showTimerBtn && !showActionButton && (
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

      {/* Botón Play/Stop en esquina superior derecha (alternativa al CTA) */}
      {showTimerBtn && !showActionButton && (
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

      {/* CTA masivo: INICIAR ENTRENAMIENTO / VER DETALLES */}
      {showActionButton && (
        <TouchableOpacity
          style={styles.todayActionButton}
          onPress={handleActionPress}
          activeOpacity={0.85}
        >
          <Text style={styles.todayActionText}>
            {isRestDay ? 'VER DETALLES' : 'INICIAR ENTRENAMIENTO'}
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
// Modal: Añadir Entrenamiento Manual
// ─────────────────────────────────────────────────────────────
function AddManualModal({ visible, onClose, onSave, styles }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(todayStr);
  const [tipo, setTipo] = useState('Ride');
  const [duracion, setDuracion] = useState('');
  const [tss, setTss] = useState('');
  const [hora, setHora] = useState('');
  const [punto_encuentro, setPuntoEncuentro] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tituloError, setTituloError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setScrollOffsetY(0);
      scrollOffsetRef.current = 0;
    }
  }, [visible]);

  const SWIPE_HEADER_HEIGHT = 95;
  const propagateSwipe = useCallback((evt) => {
    const locationY = evt?.nativeEvent?.locationY ?? 0;
    return locationY > SWIPE_HEADER_HEIGHT;
  }, []);

  const scrollTo = useCallback((offset) => {
    if (offset && typeof offset.y === 'number') {
      const currentY = scrollOffsetRef.current;
      const newY = Math.max(0, currentY + offset.y);
      scrollViewRef.current?.scrollTo({ y: newY, animated: false });
    }
  }, []);

  const resetForm = () => {
    setTitulo('');
    setFecha(todayStr);
    setTipo('Ride');
    setDuracion('');
    setTss('');
    setHora('');
    setPuntoEncuentro('');
    setDetalle('');
    setTituloError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSave = async () => {
    if (!titulo.trim()) { setTituloError('El título es obligatorio.'); return; }
    setSaving(true);
    try {
      await onSave({ titulo: titulo.trim(), fecha, tipo, duracion_min: duracion, tss_plan: tss, hora: hora.trim(), punto_encuentro: punto_encuentro.trim(), detalle });
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
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      scrollTo={scrollTo}
      scrollOffset={scrollOffsetY}
      scrollOffsetMax={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        style={styles.manualModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <View style={styles.manualModalSheet}>
          <View style={styles.manualModalHandle} />
          <Text style={styles.manualModalTitle}>Añadir Entrenamiento</Text>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            onScroll={(e) => {
              const currentOffset = e.nativeEvent.contentOffset.y;
              const y = currentOffset < 0 ? 0 : currentOffset;
              setScrollOffsetY(y);
              scrollOffsetRef.current = y;
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.manualLabel}>Título *</Text>
            <Input
              value={titulo}
              onChangeText={(t) => { setTitulo(t); if (tituloError) setTituloError(''); }}
              placeholder="Ej. Rodada zona 2 + fartlek"
              error={!!tituloError}
              errorText={tituloError}
              style={{ marginBottom: 16 }}
            />

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
            <Input
              value={fecha}
              onChangeText={setFecha}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
              style={{ marginBottom: 16 }}
            />

            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>Hora</Text>
                <Input
                  value={hora}
                  onChangeText={setHora}
                  placeholder="08:00"
                  keyboardType="numbers-and-punctuation"
                  style={{ marginBottom: 16 }}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>Punto de encuentro</Text>
                <Input
                  value={punto_encuentro}
                  onChangeText={setPuntoEncuentro}
                  placeholder="Ej. Parque Central"
                  style={{ marginBottom: 16 }}
                />
              </View>
            </View>

            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>Duración (min)</Text>
                <Input
                  value={duracion}
                  onChangeText={setDuracion}
                  placeholder="90"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Text style={styles.manualLabel}>TSS</Text>
                <Input
                  value={tss}
                  onChangeText={setTss}
                  placeholder="80"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                />
              </View>
            </View>

            <Text style={styles.manualLabel}>Notas / Detalle</Text>
            <Input
              value={detalle}
              onChangeText={setDetalle}
              placeholder="Descripción del entrenamiento..."
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.manualActions}>
              <Button
                title="Guardar Entreno"
                variant="solid"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={[styles.manualSaveBtn, { flex: 1 }]}
              />
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
    <Modal isVisible={visible} animationIn="fadeIn" animationOut="fadeOut">
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
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
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
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Text style={styles.emptyPlanButtonText}>Generar Plan con XERPA AI</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Pestaña Semana Actual
// ─────────────────────────────────────────────────────────────
function WeekTab({ weekWorkouts, onGeneratePlan, isGenerating, onOpenDetail, onStopTimer, onTodayCardLayout, styles }) {
  const { monday, today } = getWeekBounds();
  const weekDays = generateWeekDays(monday);

  // Renderizado condicional estricto: o EmptyPlanState o los 7 días, nunca ambos
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
      {/* Action Bar (solo Generar Plan; Añadir está en el header) */}
      <View style={styles.actionBar}>
        <Button
          title="Generar Plan"
          variant="primary"
          onPress={onGeneratePlan}
          loading={isGenerating}
          disabled={isGenerating}
          style={styles.actionPrimary}
        />
      </View>

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
                onPress={() => workout && onOpenDetail(workout, dateStr)}
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
function HistoryTab({ historyWorkouts, onOpenDetail, onGoToWeek, styles }) {
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
  styles,
}) {
  const scrollViewRef = useRef(null);
  const [activeTab, setActiveTab] = useState('week');
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // ── Cronómetro (estado global vía WorkoutContext) ────────
  const { timerSecs, stopTimer: contextStopTimer, resetTimer } = useWorkoutContext();
  const [showFinishSheet, setShowFinishSheet] = useState(false);

  const { monday } = getWeekBounds();

  const headerDateLabel = formatMonthYear(monday);
  const { scrollHandler, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true });

  const isAnyModalVisible = !!selectedWorkout || isManualModalVisible || isGenerating || showFinishSheet;
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
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <CollapsibleHeader
        editorialLabel={headerDateLabel}
        editorialTitle="Mi Plan"
        smallTitle="Mi Plan"
        rightAction={
          <AnimatedActionButton
            label="Añadir"
            icon={<Plus color="#00D2FF" size={20} strokeWidth={2.5} />}
            onPress={() => setIsManualModalVisible(true)}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT }]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Segmented Control — glassmorphism + Azul Neón (scroll horizontal) */}
        <View style={styles.segmented}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentedScrollContent}
            style={styles.segmentedScrollView}
          >
            <TouchableOpacity
              style={[styles.segmentedBtn, activeTab === 'week' && styles.segmentedBtnActive]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab('week');
              }}
            >
              <Text style={[styles.segmentedText, activeTab === 'week' && styles.segmentedTextActive]}>
                Semana Actual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedBtn, activeTab === 'history' && styles.segmentedBtnActive]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab('history');
              }}
            >
              <Text style={[styles.segmentedText, activeTab === 'history' && styles.segmentedTextActive]}>
                Historial
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Contenido según tab */}
        {activeTab === 'week' ? (
          <WeekTab
            weekWorkouts={weekWorkouts}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
            onOpenDetail={openDetail}
            onStopTimer={stopTimer}
            onTodayCardLayout={handleTodayCardLayout}
            styles={styles}
          />
        ) : (
          <HistoryTab
            historyWorkouts={historyWorkouts}
            onOpenDetail={openDetail}
            onGoToWeek={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('week');
            }}
            styles={styles}
          />
        )}
      </Animated.ScrollView>

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
        onSaveFeedback={saveFeedback}
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
