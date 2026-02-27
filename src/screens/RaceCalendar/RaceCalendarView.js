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
  Trophy, Flag, AlertCircle, MountainSnow, Route,
} from 'lucide-react-native';
import { formatDateRange } from '../../utils/formatDateRange';
import { showXerpaError } from '../../utils/ErrorHandler';
import { TABS } from './useRaceCalendar';
import { SmartRaceCard } from './components/SmartRaceCard';
import { EventFilters } from './components/EventFilters';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { RaceDetailSheet } from './components/RaceDetailSheet';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getDaysUntil(fechaInicioStr) {
  if (!fechaInicioStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(fechaInicioStr + 'T00:00:00');
  return Math.ceil((race - today) / 86400000);
}

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const EMPTY_FORM = {
  nombre: '', fecha_inicio: '', fecha_fin: '', ciudad: '',
  distancia_km: '', desnivel_m: '', prioridad: 'B', pais: '',
  tipo_evento: 'ruta_local', tipo_deporte: '', tss_estimado: '',
};

// ─────────────────────────────────────────────────────────────
// StatsStrip
// ─────────────────────────────────────────────────────────────
function StatsStrip({ races, styles }) {
  const total = races.length;
  const upcoming = races.filter((r) => r.estado !== 'Finalizada').length;
  const totalKm = races.reduce((s, r) => s + (Number(r.distancia_km) || 0), 0);
  const next = races.find((r) => r.estado !== 'Finalizada');
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
    setForm((prev) => ({ ...prev, [field]: value }));
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

  function handleClose() {
    reset();
    onClose();
  }

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
      setFechaInicioError('Usa el formato AAAA-MM-DD.');
      hasError = true;
    }
    if (form.fecha_fin.trim() && !DATE_REGEX.test(form.fecha_fin.trim())) {
      setFechaFinError('Usa el formato AAAA-MM-DD.');
      hasError = true;
    }
    if (form.fecha_inicio.trim() && form.fecha_fin.trim()) {
      if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
        setFechaFinError('La fecha fin debe ser igual o posterior.');
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
      setNombreError(err?.message ?? 'Error al guardar.');
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
          <Text style={styles.sheetSubtitle}>Añade tu próximo objetivo. Prioridad A/B/C para la IA.</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.formLabel}>Nombre del evento *</Text>
            <TextInput
              style={[styles.formInput, !!nombreError && styles.formInputError]}
              value={form.nombre}
              onChangeText={(v) => setField('nombre', v)}
              placeholder="Ej. XCO Copa Andalucía"
              placeholderTextColor="#333"
              editable={!saving}
            />
            {!!nombreError && <Text style={styles.formHelperText}>{nombreError}</Text>}

            <Text style={styles.formLabel}>Fecha inicio *</Text>
            <TextInput
              style={[styles.formInput, !!fechaInicioError && styles.formInputError]}
              value={form.fecha_inicio}
              onChangeText={(v) => setField('fecha_inicio', v)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#333"
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
            {!!fechaInicioError && <Text style={styles.formHelperText}>{fechaInicioError}</Text>}

            <Text style={styles.formLabel}>Fecha fin (opcional)</Text>
            <TextInput
              style={[styles.formInput, !!fechaFinError && styles.formInputError]}
              value={form.fecha_fin}
              onChangeText={(v) => setField('fecha_fin', v)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#333"
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
            {!!fechaFinError && <Text style={styles.formHelperText}>{fechaFinError}</Text>}

            <Text style={styles.formLabel}>Ciudad / País</Text>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formRowItem, styles.formInput]}
                value={form.ciudad}
                onChangeText={(v) => setField('ciudad', v)}
                placeholder="Ciudad"
                placeholderTextColor="#333"
                editable={!saving}
              />
              <TextInput
                style={[styles.formRowItem, styles.formInput]}
                value={form.pais}
                onChangeText={(v) => setField('pais', v)}
                placeholder="País"
                placeholderTextColor="#333"
                editable={!saving}
              />
            </View>

            <Text style={styles.formLabel}>Distancia (km) / Desnivel (m D+)</Text>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.formRowItem, styles.formInput]}
                value={form.distancia_km}
                onChangeText={(v) => setField('distancia_km', v)}
                placeholder="80"
                placeholderTextColor="#333"
                keyboardType="numeric"
                editable={!saving}
              />
              <TextInput
                style={[styles.formRowItem, styles.formInput]}
                value={form.desnivel_m}
                onChangeText={(v) => setField('desnivel_m', v)}
                placeholder="2400"
                placeholderTextColor="#333"
                keyboardType="numeric"
                editable={!saving}
              />
            </View>

            <Text style={styles.formLabel}>TSS estimado (para XERPA Readiness)</Text>
            <TextInput
              style={styles.formInput}
              value={form.tss_estimado}
              onChangeText={(v) => setField('tss_estimado', v)}
              placeholder="Ej. 85"
              placeholderTextColor="#333"
              keyboardType="numeric"
              editable={!saving}
            />

            <Text style={styles.formLabel}>Prioridad (A=objetivo principal, B, C)</Text>
            <View style={[styles.formRow, { gap: 8 }]}>
              {['A', 'B', 'C'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.filterChip,
                    form.prioridad === p && styles.filterChipActive,
                    { flex: 1 },
                  ]}
                  onPress={() => setField('prioridad', p)}
                >
                  <Text style={[styles.filterChipText, form.prioridad === p && styles.filterChipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                  {saving ? (
                    <ActivityIndicator color="#0D0D0D" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>💾 Guardar Carrera</Text>
                  )}
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
// RaceCalendarView
// ─────────────────────────────────────────────────────────────
export function RaceCalendarView({
  races,
  loading,
  error,
  globalRaces,
  globalLoading,
  globalError,
  filters,
  setFilter,
  filteredEventosXerpa,
  filteredRutasLocales,
  addRace,
  deleteRace,
  updateRace,
  fetchGlobalRaces,
  enrollToRace,
  unenrollFromRace,
  styles,
}) {
  const [activeTab, setActiveTab] = useState(TABS.MI_CALENDARIO);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [detailCarrera, setDetailCarrera] = useState(null);

  useEffect(() => {
    if (activeTab === TABS.EVENTOS_XERPA || activeTab === TABS.RUTAS_LOCALES) {
      fetchGlobalRaces();
    }
  }, [activeTab, fetchGlobalRaces]);

  function isEnrolledIn(carreraId) {
    return races.some((r) => r.carrera_id === carreraId || r.id === carreraId);
  }

  function handleOpenDetail(carrera) {
    setDetailCarrera(carrera);
  }

  const showFilters = activeTab === TABS.EVENTOS_XERPA || activeTab === TABS.RUTAS_LOCALES;
  const hasActiveFilters = !!(filters.pais?.trim() || filters.tipoDeporte?.trim() || filters.nivelDificultad !== '');

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Marketplace de Eventos</Text>
            <Text style={styles.headerTitle}>Carreras</Text>
          </View>
          {activeTab === TABS.MI_CALENDARIO && (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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

        {/* Tabs: Mi calendario | Carreras | Eventos (iconos + labels para usabilidad) */}
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === TABS.MI_CALENDARIO && styles.segmentBtnActive]}
            onPress={() => setActiveTab(TABS.MI_CALENDARIO)}
          >
            <Calendar color={activeTab === TABS.MI_CALENDARIO ? '#121212' : '#555'} size={16} />
            <Text style={[styles.segmentText, activeTab === TABS.MI_CALENDARIO && styles.segmentTextActive]}>
              Mi calendario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === TABS.EVENTOS_XERPA && styles.segmentBtnActive]}
            onPress={() => setActiveTab(TABS.EVENTOS_XERPA)}
          >
            <Trophy color={activeTab === TABS.EVENTOS_XERPA ? '#121212' : '#555'} size={16} />
            <Text style={[styles.segmentText, activeTab === TABS.EVENTOS_XERPA && styles.segmentTextActive]}>
              Carreras
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === TABS.RUTAS_LOCALES && styles.segmentBtnActive]}
            onPress={() => setActiveTab(TABS.RUTAS_LOCALES)}
          >
            <Route color={activeTab === TABS.RUTAS_LOCALES ? '#121212' : '#555'} size={16} />
            <Text style={[styles.segmentText, activeTab === TABS.RUTAS_LOCALES && styles.segmentTextActive]}>
              Eventos
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <EventFilters
            filters={filters}
            setFilter={setFilter}
            onOpenFilters={() => setFilterSheetVisible(true)}
            hasActiveFilters={hasActiveFilters}
            styles={styles}
          />
        )}

        {showFilters && (
          <FilterBottomSheet
            visible={filterSheetVisible}
            onClose={() => setFilterSheetVisible(false)}
            filters={filters}
            setFilter={setFilter}
            styles={styles}
          />
        )}

        {/* Tab: Mi Calendario */}
        {activeTab === TABS.MI_CALENDARIO && (
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
              races.length === 0 ? (
                <EmptyState onAdd={() => setModalVisible(true)} styles={styles} />
              ) : (
                <View style={styles.list}>
                  {races.map((item) => (
                    <SmartRaceCard
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

        {/* Tab: Eventos XERPA */}
        {activeTab === TABS.EVENTOS_XERPA && (
          <>
            {globalLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00F0FF" />
                <Text style={styles.loadingText}>Cargando eventos...</Text>
              </View>
            )}
            {!globalLoading && !!globalError && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#ff5252" size={32} />
                <Text style={styles.errorText}>{globalError}</Text>
              </View>
            )}
            {!globalLoading && !globalError && (
              filteredEventosXerpa.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconWrap}>
                    <Trophy color="#00F0FF" size={34} />
                  </View>
                  <Text style={styles.emptyTitle}>Sin eventos verificados</Text>
                  <Text style={styles.emptyText}>
                    Pronto añadiremos carreras oficiales. Revisa Rutas Locales o añade la tuya en Mi Calendario.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {filteredEventosXerpa.map((item) => (
                    <SmartRaceCard
                      key={String(item.id)}
                      item={item}
                      variant="global"
                      isEnrolled={isEnrolledIn(item.id)}
                      onPress={handleOpenDetail}
                      styles={styles}
                    />
                  ))}
                </View>
              )
            )}
          </>
        )}

        {/* Tab: Rutas Locales */}
        {activeTab === TABS.RUTAS_LOCALES && (
          <>
            {globalLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00F0FF" />
                <Text style={styles.loadingText}>Cargando rutas...</Text>
              </View>
            )}
            {!globalLoading && !!globalError && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#ff5252" size={32} />
                <Text style={styles.errorText}>{globalError}</Text>
              </View>
            )}
            {!globalLoading && !globalError && (
              filteredRutasLocales.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconWrap}>
                    <MountainSnow color="#00F0FF" size={34} />
                  </View>
                  <Text style={styles.emptyTitle}>Sin rutas locales</Text>
                  <Text style={styles.emptyText}>
                    Eventos de comunidad o travesías menores aparecerán aquí. Añade la tuya en Mi Calendario.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {filteredRutasLocales.map((item) => (
                    <SmartRaceCard
                      key={String(item.id)}
                      item={item}
                      variant="global"
                      isEnrolled={isEnrolledIn(item.id)}
                      onPress={handleOpenDetail}
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

      <RaceDetailSheet
        visible={!!detailCarrera}
        carrera={detailCarrera}
        isEnrolled={detailCarrera ? isEnrolledIn(detailCarrera.id) : false}
        onClose={() => setDetailCarrera(null)}
        onEnroll={enrollToRace}
        onUnenroll={unenrollFromRace}
        styles={styles}
      />
    </ScreenWrapper>
  );
}
