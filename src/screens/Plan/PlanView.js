import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Past
// ─────────────────────────────────────────────────────────────
function PastCard({ dateStr, workout, styles }) {
  const { icon, color } = getTypeConfig(workout?.tipo);
  return (
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
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Today (Focus Card)
// ─────────────────────────────────────────────────────────────
function TodayCard({ dateStr, workout, onComplete, styles }) {
  const { icon, color } = getTypeConfig(workout?.tipo);
  return (
    <View style={[styles.card, styles.cardToday]}>
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
        </View>
      )}

      {workout && (
        <View style={styles.focusActions}>
          <TouchableOpacity
            style={styles.focusEditBtn}
            onPress={() => Alert.alert('Próximamente', 'La edición de entrenamientos estará disponible pronto.')}
          >
            <Text style={styles.focusEditText}>✏️  Editar</Text>
          </TouchableOpacity>
          {workout.completado ? (
            <View style={styles.focusCompletedBtn}>
              <Text style={styles.focusCompletedText}>✅  Completado</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.focusCompleteBtn} onPress={() => onComplete(workout.id)}>
              <Text style={styles.focusCompleteText}>✅  Completar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// WorkoutCard — Future
// ─────────────────────────────────────────────────────────────
function FutureCard({ dateStr, workout, styles }) {
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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { borderWidth: 1, borderColor: color + '33' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDayLabel}>{formatDateLabel(dateStr)}</Text>
          <Text style={styles.cardTitle}>{workout.titulo ?? 'Entrenamiento'}</Text>
        </View>
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
    </View>
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
    } catch {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento. Intenta de nuevo.');
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
            {/* Título */}
            <Text style={styles.manualLabel}>Título *</Text>
            <TextInput
              style={[styles.manualInput, !!tituloError && styles.manualInputError]}
              placeholder="Ej. Rodada zona 2 + fartlek"
              placeholderTextColor="#444"
              value={titulo}
              onChangeText={t => { setTitulo(t); if (tituloError) setTituloError(''); }}
            />
            {!!tituloError && <Text style={styles.manualErrorText}>{tituloError}</Text>}

            {/* Tipo */}
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

            {/* Fecha */}
            <Text style={styles.manualLabel}>Fecha</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#444"
              value={fecha}
              onChangeText={setFecha}
              keyboardType="numbers-and-punctuation"
            />

            {/* Duración + TSS */}
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

            {/* Detalle */}
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

            {/* Botones */}
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
// Pestaña Semana Actual
// ─────────────────────────────────────────────────────────────
function WeekTab({ weekWorkouts, onComplete, onGeneratePlan, isGenerating, onAddManual, styles }) {
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

        <TouchableOpacity
          style={styles.actionGhost}
          onPress={onAddManual}
        >
          <Text style={styles.actionGhostText}>➕ Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* 7 Cards Mon-Sun */}
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
              onComplete={onComplete}
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
              styles={styles}
            />
          );
        }
        return (
          <FutureCard
            key={dateStr}
            dateStr={dateStr}
            workout={workout}
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
function HistoryTab({ historyWorkouts, styles }) {
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
          {/* Cabecera de mes */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthHeaderText}>{month}</Text>
            <View style={styles.monthHeaderLine} />
          </View>

          {/* Items del mes */}
          {items.map(item => {
            const { icon, color } = getTypeConfig(item.tipo);
            return (
              <View key={item.id} style={styles.historyItem}>
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
              </View>
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
export function PlanView({ loading, weekWorkouts, historyWorkouts, markComplete, isGenerating, handleGeneratePlan, addManualWorkout, styles }) {
  const [activeTab, setActiveTab] = useState('week');
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const { monday } = getWeekBounds();

  const weekEnd = new Date(monday + 'T00:00:00');
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = `${weekEnd.getDate()} ${MONTH_ABBR[weekEnd.getMonth()]}`;
  const weekStartStr = (() => {
    const d = new Date(monday + 'T00:00:00');
    return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
  })();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>Cargando plan…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
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
            onComplete={markComplete}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
            onAddManual={() => setIsManualModalVisible(true)}
            styles={styles}
          />
        ) : (
          <HistoryTab
            historyWorkouts={historyWorkouts}
            styles={styles}
          />
        )}
      </ScrollView>
      <GeneratingOverlay visible={isGenerating} styles={styles} />
      <AddManualModal
        visible={isManualModalVisible}
        onClose={() => setIsManualModalVisible(false)}
        onSave={addManualWorkout}
        styles={styles}
      />
    </SafeAreaView>
  );
}
