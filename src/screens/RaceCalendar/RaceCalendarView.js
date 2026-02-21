import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus, Calendar, MapPin, Mountain, TrendingUp,
  Trophy, Flag, AlertCircle, Trash2,
} from 'lucide-react-native';
import { formatDateRange } from '../../utils/formatDateRange';
import { getRaceAccentColor } from '../../utils/raceColorByNome';
import { showXerpaError } from '../../utils/ErrorHandler';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Días hasta fecha_inicio (cuando el atleta viaja o empieza las gymcanas). */
function getDaysUntil(fechaInicioStr) {
  if (!fechaInicioStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(fechaInicioStr + 'T00:00:00');
  return Math.ceil((race - today) / 86400000);
}

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const EMPTY_FORM = { nombre: '', fecha_inicio: '', fecha_fin: '', ciudad: '', distancia_km: '', desnivel_m: '' };

// ─────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ estado, styles }) {
  const isActiva = estado === 'Activa';
  const isFinalizada = estado === 'Finalizada';
  return (
    <View style={[
      styles.badge,
      isActiva ? styles.badgeActiva : isFinalizada ? styles.badgeFinalizada : styles.badgeProgramada,
    ]}>
      <Text style={[
        styles.badgeText,
        isActiva ? styles.badgeTextActiva : isFinalizada ? styles.badgeTextFinalizada : styles.badgeTextProgramada,
      ]}>
        {estado ?? 'Programada'}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// CountdownPill
// ─────────────────────────────────────────────────────────────
function CountdownPill({ fechaInicio, estado, styles }) {
  if (estado === 'Finalizada') return null;
  const days = getDaysUntil(fechaInicio);
  if (days === null || days < 0) return null;

  const isToday = days === 0;

  return (
    <View style={[styles.countdownPill, isToday && styles.countdownPillToday]}>
      <Text style={[styles.countdownPillText, isToday && styles.countdownPillTextToday]}>
        {isToday ? '¡HOY!' : `${days}d`}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// RaceCard — Reutilizable para mis-carreras y calendario-global
// ─────────────────────────────────────────────────────────────
function RaceCard({ item, variant = 'mine', isEnrolled, onDelete, onPress, styles }) {
  const isActiva = item.estado === 'Activa';
  const isFinalizada = item.estado === 'Finalizada';
  const isProgramada = !isActiva && !isFinalizada;
  const isGlobal = variant === 'global';

  const baseColor = getRaceAccentColor(item.nombre);
  const accentColor = isFinalizada ? '#2A2A2A' : baseColor;
  const hasMetrics = item.distancia_km != null || item.desnivel_m != null;

  const cardContent = (
    <View style={[styles.cardContent, { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
        {/* Top row: name + countdown + delete / inscrito badge */}
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.raceName,
                isFinalizada && styles.raceNameFinalizada,
                !isFinalizada && { color: baseColor },
              ]}
              numberOfLines={2}
            >
              {item.nombre ?? 'Sin nombre'}
            </Text>
            {isGlobal && isEnrolled && (
              <Text style={styles.inscritoBadge}>✅ Inscrito</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CountdownPill fechaInicio={item.fecha_inicio} estado={item.estado ?? 'Programada'} styles={styles} />
            {isGlobal ? null : onDelete && (
              <TouchableOpacity
                onPress={() => {
                  const id = item.id ?? item.inscripcion_id;
                  if (!id) return;
                  Alert.alert(
                    'Eliminar carrera',
                    `¿Quitar "${item.nombre ?? 'esta carrera'}" de tu calendario?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await onDelete(id);
                          } catch (e) {
                            showXerpaError(e, 'RACE-DEL-02');
                          }
                        },
                      },
                    ]
                  );
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ padding: 4 }}
              >
                <Trash2 color="#555" size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status badge (solo mis-carreras) */}
        {!isGlobal && <StatusBadge estado={item.estado} styles={styles} />}

        {/* Date range */}
        <View style={[styles.infoRow, { marginTop: 10 }]}>
          <Calendar color="#555" size={13} />
          <Text style={styles.infoText}>
            <Text style={styles.infoTextHighlight}>
              {formatDateRange(item.fecha_inicio, item.fecha_fin)}
            </Text>
          </Text>
        </View>

        {/* City */}
        {!!item.ciudad && (
          <View style={styles.infoRow}>
            <MapPin color="#555" size={13} />
            <Text style={styles.infoText}>{item.ciudad}</Text>
          </View>
        )}

        {/* Metrics */}
        {hasMetrics && (
          <>
            <View style={styles.divider} />
            <View style={styles.metricsRow}>
              {item.distancia_km != null && (
                <View style={styles.metricItem}>
                  <TrendingUp color="#555" size={13} />
                  <Text style={styles.metricValue}>{item.distancia_km}</Text>
                  <Text style={styles.metricLabel}>km</Text>
                </View>
              )}
              {item.desnivel_m != null && (
                <View style={styles.metricItem}>
                  <Mountain color="#555" size={13} />
                  <Text style={styles.metricValue}>{item.desnivel_m}</Text>
                  <Text style={styles.metricLabel}>m D+</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Result (solo mis-carreras finalizadas) */}
        {!isGlobal && isFinalizada && item.resultado && (
          <View style={styles.resultRow}>
            <Flag color="#444" size={12} />
            <Text style={styles.resultLabel}>Resultado:</Text>
            <Text style={styles.resultValue}>{item.resultado}</Text>
          </View>
        )}
    </View>
  );

  const Wrapper = isGlobal && onPress ? TouchableOpacity : View;
  const wrapperProps = isGlobal && onPress
    ? { onPress: () => onPress(item), activeOpacity: 0.8 }
    : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.card, isFinalizada && { opacity: 0.55 }]}>
      {cardContent}
    </Wrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// StatsStrip
// ─────────────────────────────────────────────────────────────
function StatsStrip({ races, styles }) {
  const total = races.length;
  const upcoming = races.filter(r => r.estado !== 'Finalizada').length;
  const totalKm = races.reduce((s, r) => s + (Number(r.distancia_km) || 0), 0);

  const next = races.find(r => r.estado !== 'Finalizada');
  const daysNext = next ? getDaysUntil(next.fecha_inicio) : null;

  if (total === 0) return null;

  return (
    <View style={styles.statsStrip}>
      <View style={styles.statCell}>
        <Text style={[styles.statValue, styles.statValueCyan]}>{total}</Text>
        <Text style={styles.statLabel}>Totales</Text>
      </View>
      <View style={[styles.statCell, styles.statCellBorder]}>
        <Text style={[styles.statValue, styles.statValueLime]}>{upcoming}</Text>
        <Text style={styles.statLabel}>Próximas</Text>
      </View>
      <View style={[styles.statCell, styles.statCellBorder]}>
        <Text style={[styles.statValue, styles.statValueOrange]}>
          {daysNext !== null && daysNext >= 0 ? `${daysNext}d` : '—'}
        </Text>
        <Text style={styles.statLabel}>Siguiente</Text>
      </View>
      {totalKm > 0 && (
        <View style={[styles.statCell, styles.statCellBorder]}>
          <Text style={styles.statValue}>{totalKm}</Text>
          <Text style={styles.statLabel}>Km total</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// AddRaceModal
// ─────────────────────────────────────────────────────────────
function AddRaceModal({ visible, onClose, onSave, styles }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [nombreError, setNombreError] = useState('');
  const [fechaInicioError, setFechaInicioError] = useState('');
  const [fechaFinError, setFechaFinError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'nombre' && nombreError) setNombreError('');
    if (field === 'fecha_inicio' && fechaInicioError) setFechaInicioError('');
    if (field === 'fecha_fin' && fechaFinError) setFechaFinError('');
  }

  function reset() {
    setForm(EMPTY_FORM);
    setNombreError('');
    setFechaInicioError('');
    setFechaFinError('');
    setSaving(false);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSave() {
    let hasError = false;
    if (!form.nombre.trim()) {
      setNombreError('El nombre del evento es obligatorio.');
      hasError = true;
    }
    if (!form.fecha_inicio.trim()) {
      setFechaInicioError('La fecha de inicio es obligatoria.');
      hasError = true;
    } else if (!DATE_REGEX.test(form.fecha_inicio.trim())) {
      setFechaInicioError('Usa el formato AAAA-MM-DD (ej. 2026-10-15).');
      hasError = true;
    }
    if (form.fecha_fin.trim() && !DATE_REGEX.test(form.fecha_fin.trim())) {
      setFechaFinError('Usa el formato AAAA-MM-DD.');
      hasError = true;
    }
    if (form.fecha_inicio.trim() && form.fecha_fin.trim()) {
      if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
        setFechaFinError('La fecha fin debe ser igual o posterior a la de inicio.');
        hasError = true;
      }
    }
    if (hasError) return;

    setSaving(true);
    try {
      await onSave(form);
      reset();
      onClose();
    } catch (err) {
      showXerpaError(err, 'RACE-ADD-01');
      setFechaInicioError(err?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetTitleRow}>
            <Trophy color="#00F0FF" size={20} />
            <Text style={styles.sheetTitle}>Nueva Carrera</Text>
          </View>
          <Text style={styles.sheetSubtitle}>Añade tu próximo objetivo al calendario.</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Nombre */}
            <Text style={styles.formLabel}>Nombre del evento *</Text>
            <TextInput
              style={[styles.formInput, !!nombreError && styles.formInputError]}
              value={form.nombre}
              onChangeText={v => setField('nombre', v)}
              placeholder="Ej. XCO Copa Andalucía"
              placeholderTextColor="#333"
              editable={!saving}
            />
            {!!nombreError && <Text style={styles.formHelperText}>{nombreError}</Text>}

            {/* Fecha inicio */}
            <Text style={styles.formLabel}>Fecha inicio *</Text>
            <TextInput
              style={[styles.formInput, !!fechaInicioError && styles.formInputError]}
              value={form.fecha_inicio}
              onChangeText={v => setField('fecha_inicio', v)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#333"
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
            {!!fechaInicioError && <Text style={styles.formHelperText}>{fechaInicioError}</Text>}

            {/* Fecha fin (opcional - eventos multi-día) */}
            <Text style={styles.formLabel}>Fecha fin (opcional)</Text>
            <TextInput
              style={[styles.formInput, !!fechaFinError && styles.formInputError]}
              value={form.fecha_fin}
              onChangeText={v => setField('fecha_fin', v)}
              placeholder="AAAA-MM-DD — dejar vacío si es un solo día"
              placeholderTextColor="#333"
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
            {!!fechaFinError && <Text style={styles.formHelperText}>{fechaFinError}</Text>}

            {/* Ciudad */}
            <Text style={styles.formLabel}>Ciudad</Text>
            <TextInput
              style={styles.formInput}
              value={form.ciudad}
              onChangeText={v => setField('ciudad', v)}
              placeholder="Ej. Granada, España"
              placeholderTextColor="#333"
              editable={!saving}
            />

            {/* Distancia + Desnivel */}
            <View style={styles.formRow}>
              <View style={styles.formRowItem}>
                <Text style={[styles.formLabel, { marginTop: 0 }]}>Distancia (km)</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.distancia_km}
                  onChangeText={v => setField('distancia_km', v)}
                  placeholder="Ej. 80"
                  placeholderTextColor="#333"
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
              <View style={styles.formRowItem}>
                <Text style={[styles.formLabel, { marginTop: 0 }]}>Desnivel (m)</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.desnivel_m}
                  onChangeText={v => setField('desnivel_m', v)}
                  placeholder="Ej. 2400"
                  placeholderTextColor="#333"
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleClose} disabled={saving}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.modalSaveGradient}
              >
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#0D0D0D" size="small" />
                    : <Text style={styles.modalSaveText}>💾 Guardar Carrera</Text>
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
// GlobalRaceDetailSheet — BottomSheet dinámico Inscribir / Cancelar
// ─────────────────────────────────────────────────────────────
function GlobalRaceDetailSheet({ visible, carrera, isEnrolled, onClose, onEnroll, onUnenroll, styles }) {
  const [loading, setLoading] = useState(false);

  if (!carrera) return null;

  const hasMetrics = carrera.distancia_km != null || carrera.desnivel_m != null;

  async function handleEnroll() {
    setLoading(true);
    try {
      await onEnroll(carrera.id);
      onClose();
      Alert.alert('¡Inscrito! 🏁', 'La carrera se añadió a tu calendario.');
    } catch (e) {
      showXerpaError(e, 'RACE-INS-01');
    } finally {
      setLoading(false);
    }
  }

  function handleUnenrollPress() {
    Alert.alert(
      'Cancelar inscripción',
      '¿Estás seguro que deseas retirarte de esta carrera?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, retirarme', style: 'destructive', onPress: handleUnenroll },
      ]
    );
  }

  async function handleUnenroll() {
    setLoading(true);
    try {
      await onUnenroll(carrera.id);
      onClose();
      Alert.alert('Inscripción cancelada', 'Te has retirado de la carrera.');
    } catch (e) {
      showXerpaError(e, 'RACE-DEL-01');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>{carrera.nombre ?? 'Carrera'}</Text>
            <View style={[styles.infoRow, { marginTop: 8 }]}>
              <Calendar color="#00F0FF" size={14} />
              <Text style={styles.infoTextHighlight}>
                {formatDateRange(carrera.fecha_inicio, carrera.fecha_fin)}
              </Text>
            </View>
            {!!carrera.ciudad && (
              <View style={styles.infoRow}>
                <MapPin color="#555" size={14} />
                <Text style={styles.infoText}>{carrera.ciudad}</Text>
              </View>
            )}
            {hasMetrics && (
              <View style={styles.metricsRow}>
                {carrera.distancia_km != null && (
                  <View style={styles.metricItem}>
                    <TrendingUp color="#555" size={13} />
                    <Text style={styles.metricValue}>{carrera.distancia_km}</Text>
                    <Text style={styles.metricLabel}>km</Text>
                  </View>
                )}
                {carrera.desnivel_m != null && (
                  <View style={styles.metricItem}>
                    <Mountain color="#555" size={13} />
                    <Text style={styles.metricValue}>{carrera.desnivel_m}</Text>
                    <Text style={styles.metricLabel}>m D+</Text>
                  </View>
                )}
              </View>
            )}

            {isEnrolled ? (
              <TouchableOpacity
                style={styles.detailCancelBtn}
                onPress={handleUnenrollPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ff5252" size="small" />
                ) : (
                  <Text style={styles.detailCancelBtnText}>Cancelar Inscripción</Text>
                )}
              </TouchableOpacity>
            ) : (
              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.detailEnrollBtn}
              >
                <TouchableOpacity
                  style={{ paddingVertical: 4, paddingHorizontal: 24 }}
                  onPress={handleEnroll}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0D0D0D" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Inscribirme a esta Carrera</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd, styles }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Trophy color="#00F0FF" size={34} />
      </View>
      <Text style={styles.emptyTitle}>Sin carreras programadas</Text>
      <Text style={styles.emptyText}>
        Añade tu primer objetivo para que XERPA AI adapte tu entrenamiento hacia él.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>+ Añadir Carrera</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// RaceCalendarView (principal)
// ─────────────────────────────────────────────────────────────
export function RaceCalendarView({
  races,
  loading,
  error,
  globalRaces,
  globalLoading,
  globalError,
  addRace,
  deleteRace,
  updateRace,
  fetchGlobalRaces,
  enrollToRace,
  unenrollFromRace,
  styles,
}) {
  const [activeTab, setActiveTab] = useState('mis-carreras');
  const [modalVisible, setModalVisible] = useState(false);
  const [globalDetailCarrera, setGlobalDetailCarrera] = useState(null);

  useEffect(() => {
    if (activeTab === 'calendario-global') {
      fetchGlobalRaces();
    }
  }, [activeTab, fetchGlobalRaces]);

  function isEnrolledIn(carreraId) {
    return races.some(r => r.carrera_id === carreraId);
  }

  function handleOpenGlobalDetail(carrera) {
    setGlobalDetailCarrera(carrera);
  }

  async function handleEnroll(carreraId) {
    await enrollToRace(carreraId);
  }

  async function handleUnenroll(carreraId) {
    await unenrollFromRace(carreraId);
  }

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Mis Objetivos</Text>
            <Text style={styles.headerTitle}>Calendario de Carreras</Text>
          </View>
          {activeTab === 'mis-carreras' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.addButtonGradient}
              >
                <Plus color="#0D0D0D" size={20} strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Segmented Control */}
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'mis-carreras' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('mis-carreras')}
          >
            <Text style={[styles.segmentText, activeTab === 'mis-carreras' && styles.segmentTextActive]}>
              Mis Carreras
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'calendario-global' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('calendario-global')}
          >
            <Text style={[styles.segmentText, activeTab === 'calendario-global' && styles.segmentTextActive]}>
              Calendario Global
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab: Mis Carreras */}
        {activeTab === 'mis-carreras' && (
          <>
            {!loading && !error && <StatsStrip races={races} styles={styles} />}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00F0FF" />
                <Text style={styles.loadingText}>Cargando carreras...</Text>
              </View>
            )}
            {!loading && !!error && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#ff5252" size={32} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {!loading && !error && (
              races.length === 0
                ? <EmptyState onAdd={() => setModalVisible(true)} styles={styles} />
                : (
                  <View style={styles.list}>
                    {races.map(item => (
                      <RaceCard
                        key={String(item.id ?? item.inscripcion_id)}
                        item={item}
                        variant="mine"
                        onDelete={deleteRace}
                        styles={styles}
                      />
                    ))}
                  </View>
                )
            )}
          </>
        )}

        {/* Tab: Calendario Global */}
        {activeTab === 'calendario-global' && (
          <>
            {globalLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00F0FF" />
                <Text style={styles.loadingText}>Cargando calendario...</Text>
              </View>
            )}
            {!globalLoading && !!globalError && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#ff5252" size={32} />
                <Text style={styles.errorText}>{globalError}</Text>
              </View>
            )}
            {!globalLoading && !globalError && (
              globalRaces.length === 0
                ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconWrap}>
                      <Trophy color="#00F0FF" size={34} />
                    </View>
                    <Text style={styles.emptyTitle}>Sin carreras en el catálogo</Text>
                    <Text style={styles.emptyText}>
                      Pronto añadiremos más eventos. Prueba la pestaña Mis Carreras para añadir la tuya.
                    </Text>
                  </View>
                )
                : (
                  <View style={styles.list}>
                    {globalRaces.map(item => (
                      <RaceCard
                        key={String(item.id)}
                        item={item}
                        variant="global"
                        isEnrolled={isEnrolledIn(item.id)}
                        onPress={handleOpenGlobalDetail}
                        styles={styles}
                      />
                    ))}
                  </View>
                )
            )}
          </>
        )}
      </ScrollView>

      <AddRaceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addRace}
        styles={styles}
      />

      <GlobalRaceDetailSheet
        visible={!!globalDetailCarrera}
        carrera={globalDetailCarrera}
        isEnrolled={globalDetailCarrera ? isEnrolledIn(globalDetailCarrera.id) : false}
        onClose={() => setGlobalDetailCarrera(null)}
        onEnroll={handleEnroll}
        onUnenroll={handleUnenroll}
        styles={styles}
      />
    </ScreenWrapper>
  );
}
