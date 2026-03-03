import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from 'react-native';
import Modal from 'react-native-modal';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import {
  Plus, Calendar, Map, MapPin, Mountain, TrendingUp,
  Trophy, AlertCircle, MountainSnow, Route,
} from 'lucide-react-native';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { formatDateRange } from '../../utils/formatDateRange';
import { showXerpaError } from '../../utils/ErrorHandler';
import { TABS } from './useRaceCalendar';
import { SmartRaceCard } from './components/SmartRaceCard';
import { EventFilters } from './components/EventFilters';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { RaceDetailSheet } from './components/RaceDetailSheet';
import { GlobalEmptyState } from '../../components/ui/GlobalEmptyState';

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
          <Text style={styles.manualModalTitle}>Nueva Carrera</Text>

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
            <Text style={styles.manualLabel}>Nombre del evento *</Text>
            <Input
              value={form.nombre}
              onChangeText={(v) => setField('nombre', v)}
              placeholder="Ej. XCO Copa Andalucía"
              error={!!nombreError}
              errorText={nombreError}
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Fecha inicio *</Text>
            <Input
              value={form.fecha_inicio}
              onChangeText={(v) => setField('fecha_inicio', v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
              error={!!fechaInicioError}
              errorText={fechaInicioError}
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Fecha fin (opcional)</Text>
            <Input
              value={form.fecha_fin}
              onChangeText={(v) => setField('fecha_fin', v)}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
              error={!!fechaFinError}
              errorText={fechaFinError}
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Ciudad / País</Text>
            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.ciudad}
                  onChangeText={(v) => setField('ciudad', v)}
                  placeholder="Ciudad"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.pais}
                  onChangeText={(v) => setField('pais', v)}
                  placeholder="País"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
            </View>

            <Text style={styles.manualLabel}>Distancia (km) / Desnivel (m D+)</Text>
            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.distancia_km}
                  onChangeText={(v) => setField('distancia_km', v)}
                  placeholder="80"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.desnivel_m}
                  onChangeText={(v) => setField('desnivel_m', v)}
                  placeholder="2400"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
            </View>

            <Text style={styles.manualLabel}>TSS estimado (para XERPA Readiness)</Text>
            <Input
              value={form.tss_estimado}
              onChangeText={(v) => setField('tss_estimado', v)}
              placeholder="Ej. 85"
              keyboardType="numeric"
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Prioridad (A=objetivo principal, B, C)</Text>
            <View style={styles.prioridadPills}>
              {['A', 'B', 'C'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prioridadPill, form.prioridad === p && styles.prioridadPillActive]}
                  onPress={() => setField('prioridad', p)}
                >
                  <Text style={[styles.prioridadPillText, form.prioridad === p && styles.prioridadPillTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.manualActions}>
              <Button
                title="Guardar Carrera"
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
// RaceCalendarView
// ─────────────────────────────────────────────────────────────
export function RaceCalendarView({
  races,
  loading,
  error,
  globalRaces,
  globalLoading,
  globalError,
  ctl,
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
    const normalized = carrera.carrera_id != null
      ? { ...carrera, id: carrera.carrera_id }
      : carrera;
    setDetailCarrera(normalized);
  }

  const { scrollHandler, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true });
  const isAnyModalVisible = modalVisible || filterSheetVisible || !!detailCarrera;
  useNavigationBarColor(isAnyModalVisible, '#131313', '#121212');

  const showFilters = activeTab === TABS.EVENTOS_XERPA || activeTab === TABS.RUTAS_LOCALES;
  const hasActiveFilters = !!(filters.pais?.trim() || filters.tipoDeporte?.trim() || filters.nivelDificultad !== '');

  const switchToMiCalendario = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(TABS.MI_CALENDARIO);
  }, []);

  const switchToEventosXerpa = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(TABS.EVENTOS_XERPA);
  }, []);

  return (
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <CollapsibleHeader
        editorialLabel="Marketplace de Eventos"
        editorialTitle="Carreras"
        smallTitle="Carreras"
        rightAction={
          <AnimatedActionButton
            label="Añadir"
            icon={<Plus color="#00D2FF" size={20} strokeWidth={2.5} />}
            onPress={() => setModalVisible(true)}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <Animated.ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT }]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Segmented Control — glassmorphism + Azul Neón (clon Plan) */}
        <View style={styles.segmented}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentedScrollContent}
            style={styles.segmentedScrollView}
          >
            <TouchableOpacity
              style={[styles.segmentedBtn, activeTab === TABS.MI_CALENDARIO && styles.segmentedBtnActive]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(TABS.MI_CALENDARIO);
              }}
            >
              <Calendar color={activeTab === TABS.MI_CALENDARIO ? '#00D2FF' : '#8E8E93'} size={16} />
              <Text style={[styles.segmentedText, activeTab === TABS.MI_CALENDARIO && styles.segmentedTextActive]}>
                Mi calendario
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedBtn, activeTab === TABS.EVENTOS_XERPA && styles.segmentedBtnActive]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(TABS.EVENTOS_XERPA);
              }}
            >
              <Trophy color={activeTab === TABS.EVENTOS_XERPA ? '#00D2FF' : '#8E8E93'} size={16} />
              <Text style={[styles.segmentedText, activeTab === TABS.EVENTOS_XERPA && styles.segmentedTextActive]}>
                Carreras
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedBtn, activeTab === TABS.RUTAS_LOCALES && styles.segmentedBtnActive]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(TABS.RUTAS_LOCALES);
              }}
            >
              <Route color={activeTab === TABS.RUTAS_LOCALES ? '#00D2FF' : '#8E8E93'} size={16} />
              <Text style={[styles.segmentedText, activeTab === TABS.RUTAS_LOCALES && styles.segmentedTextActive]}>
                Eventos
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
                <GlobalEmptyState
                  icon={<Map color="#00D2FF" size={48} strokeWidth={1.5} />}
                  title="Sin Objetivos a la Vista"
                  subtitle="No tienes carreras programadas. Explora el calendario y fija tu próxima meta para que XERPA AI adapte tu entrenamiento."
                  primaryButtonText="Explorar Carreras"
                  onPrimaryPress={switchToEventosXerpa}
                />
              ) : (
                <View style={styles.list}>
                  {races.map((item) => (
                    <SmartRaceCard
                      key={String(item.id ?? item.inscripcion_id)}
                      item={item}
                      variant="mine"
                      isEnrolled={true}
                      onPress={handleOpenDetail}
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
                <GlobalEmptyState
                  icon={<Trophy color="#555555" size={48} strokeWidth={1.5} />}
                  title="Palmarés en Blanco"
                  subtitle="Tus carreras completadas y resultados aparecerán aquí. ¡Prepárate para cruzar tu primera línea de meta!"
                  secondaryButtonText="Ir a Mi Calendario"
                  onSecondaryPress={switchToMiCalendario}
                />
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
                <GlobalEmptyState
                  icon={<MountainSnow color="#555555" size={48} strokeWidth={1.5} />}
                  title="Sin Rutas Locales"
                  subtitle="Eventos de comunidad o travesías menores aparecerán aquí. Añade la tuya en Mi Calendario o explora las carreras."
                  secondaryButtonText="Ir a Mi Calendario"
                  onSecondaryPress={switchToMiCalendario}
                />
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
      </Animated.ScrollView>

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
        ctl={ctl}
        onClose={() => setDetailCarrera(null)}
        onEnroll={enrollToRace}
        onUnenroll={unenrollFromRace}
        styles={styles}
      />
    </ScreenWrapper>
  );
}
