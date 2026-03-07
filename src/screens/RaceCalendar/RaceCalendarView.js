import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  FlatList,
  StyleSheet,
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import {
  Plus, Calendar, Map, MapPin, Mountain, TrendingUp,
  Trophy, AlertCircle, MountainSnow, Route,
} from 'lucide-react-native';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { formatDateRange } from '../../utils/formatDateRange';
import { isPastRace } from '../../utils/raceReadiness';
import { useToast } from '../../context/ToastContext';
import { TABS } from './useRaceCalendar';
import { SmartRaceCard } from './components/SmartRaceCard';
import { EventFilters } from './components/EventFilters';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { RaceDetailSheet } from '../../components/races/RaceDetailSheet';
import { PastRaceResultSheet } from '../../components/races/PastRaceResultSheet';
import { GlobalEmptyState } from '../../components/ui/GlobalEmptyState';
import { theme } from '../../theme/theme';
import { Skeleton } from '../../components/ui/Skeleton';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// RaceCardSkeletons — Layout horizontal tipo SmartRaceCard
// ─────────────────────────────────────────────────────────────
function RaceCardSkeletons({ count = 4, styles }) {
  return (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.skeletonCardRow}>
          <Skeleton width={120} height={120} borderRadius={16} style={styles.skeletonMedia} />
          <View style={styles.skeletonContent}>
            <Skeleton height={18} borderRadius={8} style={styles.skeletonTitle} />
            <Skeleton height={12} borderRadius={6} style={styles.skeletonSubtitle} />
            <Skeleton height={36} borderRadius={10} style={styles.skeletonStats} />
          </View>
        </View>
      ))}
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
  ctl,
  filters,
  setFilter,
  filterOptionsByTab,
  filteredRaces,
  filteredEventosXerpa,
  filteredRutasLocales,
  deleteRace,
  updateRace,
  updateRaceByCarreraId,
  fetchRaceCategories,
  fetchGlobalRaces,
  enrollToRace,
  unenrollFromRace,
  onOpenAddRace,
  styles,
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(TABS.MI_CALENDARIO);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [detailCarrera, setDetailCarrera] = useState(null);
  const [detailCategories, setDetailCategories] = useState([]);
  const [detailCategoriesLoading, setDetailCategoriesLoading] = useState(false);
  const [selectedPastRace, setSelectedPastRace] = useState(null);
  const detailFetchSeqRef = useRef(0);

  useEffect(() => {
    if (activeTab === TABS.EVENTOS_XERPA || activeTab === TABS.RUTAS_LOCALES) {
      fetchGlobalRaces();
    }
  }, [activeTab, fetchGlobalRaces]);

  function isEnrolledIn(carreraId) {
    return races.some((r) => r.carrera_id === carreraId || r.id === carreraId);
  }

  const handleOpenDetail = useCallback(async (carrera) => {
    const normalized = carrera.carrera_id != null
      ? { ...carrera, id: carrera.carrera_id }
      : carrera;
    const seq = ++detailFetchSeqRef.current;
    setDetailCategoriesLoading(true);
    setDetailCategories([]);
    setDetailCarrera(normalized);

    if (!normalized?.id || !fetchRaceCategories) {
      setDetailCategoriesLoading(false);
      return;
    }

    try {
      const categories = await fetchRaceCategories(normalized);
      if (detailFetchSeqRef.current !== seq) return;
      setDetailCategories(Array.isArray(categories) ? categories : []);
    } catch {
      if (detailFetchSeqRef.current !== seq) return;
      setDetailCategories([]);
    } finally {
      if (detailFetchSeqRef.current === seq) {
        setDetailCategoriesLoading(false);
      }
    }
  }, [fetchRaceCategories]);

  const { scrollHandler, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true });
  const isAnyModalVisible = filterSheetVisible || !!detailCarrera || !!selectedPastRace;
  useNavigationBarColor(isAnyModalVisible, '#131313', '#121212');

  function openPastRaceSheet(item) {
    setSelectedPastRace(item);
  }

  const handleCardPress = useCallback(
    (item) => {
      const past = isPastRace(item);
      if (past) {
        if (isEnrolledIn(item.id)) {
          openPastRaceSheet(item);
        } else {
          showToast({ type: 'info', title: 'Carrera finalizada', message: 'Esta carrera ya finalizó y no estás inscrito.' });
        }
        return;
      }
      handleOpenDetail(item);
    },
    [isEnrolledIn, openPastRaceSheet, handleOpenDetail, showToast]
  );

  const hasActiveFilters = !!(
    filters.search?.trim() ||
    filters.pais?.trim() ||
    filters.tipoDeporte?.trim() ||
    filters.tipoEvento?.trim() ||
    filters.formatoEvento?.trim() ||
    filters.copa?.trim() ||
    filters.mes?.trim() ||
    (filters.sortBy && filters.sortBy !== 'fecha_asc')
  );

  const filterOptions = filterOptionsByTab?.[activeTab] || {
    meses: [],
    paises: [],
    deportes: [],
    tiposEvento: [],
    formatos: [],
    copas: [],
  };

  const switchToMiCalendario = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(TABS.MI_CALENDARIO);
  }, []);

  const switchToEventosXerpa = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(TABS.EVENTOS_XERPA);
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const listData = useMemo(() => {
    if (activeTab === TABS.MI_CALENDARIO) {
      if (loading || error) return [];
      const nextRace = filteredRaces.find((r) => !isPastRace(r));
      const nextRaceId = nextRace ? (nextRace.id ?? nextRace.inscripcion_id ?? nextRace.carrera_id) : null;
      return filteredRaces.map((r) => {
        const id = r.id ?? r.inscripcion_id ?? r.carrera_id;
        const isNextRace = id != null && id === nextRaceId;
        const isPastRaceVal = isPastRace(r);
        return { ...r, isNextRace, isPastRace: isPastRaceVal };
      });
    }
    if (activeTab === TABS.EVENTOS_XERPA) return globalLoading || globalError ? [] : filteredEventosXerpa;
    return globalLoading || globalError ? [] : filteredRutasLocales;
  }, [activeTab, loading, error, filteredRaces, globalLoading, globalError, filteredEventosXerpa, filteredRutasLocales]);

  const showSearchBar = listData.length > 0;

  const keyExtractor = useCallback((item) => String(item.id ?? item.inscripcion_id ?? item.carrera_id ?? Math.random()), []);

  const renderMiCalendarioItem = useCallback(
    ({ item }) => (
      <SmartRaceCard
        item={item}
        variant="mine"
        isEnrolled={true}
        isNextRace={item.isNextRace === true}
        isPastRace={item.isPastRace === true}
        ctl={ctl}
        onPress={() => (item.isPastRace ? openPastRaceSheet(item) : handleOpenDetail(item))}
        onDelete={deleteRace}
        styles={styles}
      />
    ),
    [handleOpenDetail, deleteRace, openPastRaceSheet, ctl, styles]
  );

  const renderGlobalItem = useCallback(
    ({ item }) => (
      <SmartRaceCard
        item={item}
        variant="global"
        isEnrolled={isEnrolledIn(item.id)}
        ctl={ctl}
        onPress={handleCardPress}
        styles={styles}
      />
    ),
    [handleCardPress, isEnrolledIn, ctl, styles]
  );

  const renderItem = useCallback(
    (args) =>
      activeTab === TABS.MI_CALENDARIO
        ? renderMiCalendarioItem(args)
        : renderGlobalItem(args),
    [activeTab, renderMiCalendarioItem, renderGlobalItem]
  );

  const listEmptyComponent = useMemo(() => {
    if (activeTab === TABS.MI_CALENDARIO) {
      if (loading) return null;
      if (error) return null;
      return (
        <GlobalEmptyState
          icon={<Map color="#00D2FF" size={48} strokeWidth={1.5} />}
          title="Sin Objetivos a la Vista"
          subtitle="No tienes carreras programadas. Explora el calendario y fija tu próxima meta para que XERPA AI adapte tu entrenamiento."
          primaryButtonText="Explorar Carreras"
          onPrimaryPress={switchToEventosXerpa}
        />
      );
    }
    if (activeTab === TABS.EVENTOS_XERPA) {
      if (globalLoading || globalError) return null;
      return (
        <GlobalEmptyState
          icon={<Trophy color="#555555" size={48} strokeWidth={1.5} />}
          title="Palmarés en Blanco"
          subtitle="Tus carreras completadas y resultados aparecerán aquí. ¡Prepárate para cruzar tu primera línea de meta!"
          secondaryButtonText="Ir a Mi Calendario"
          onSecondaryPress={switchToMiCalendario}
        />
      );
    }
    if (globalLoading || globalError) return null;
    return (
      <GlobalEmptyState
        icon={<MountainSnow color="#555555" size={48} strokeWidth={1.5} />}
        title="Sin Rutas Locales"
        subtitle="Eventos de comunidad o travesías menores aparecerán aquí. Añade la tuya en Mi Calendario o explora las carreras."
        secondaryButtonText="Ir a Mi Calendario"
        onSecondaryPress={switchToMiCalendario}
      />
    );
  }, [activeTab, loading, error, globalLoading, globalError, switchToEventosXerpa, switchToMiCalendario]);

  const FIXED_SEGMENTS_HEIGHT = 48;

  const listHeaderComponent = useMemo(
    () => (
      <>
        {showSearchBar && (
          <View style={{ marginTop: Platform.OS === 'android' ? 20 : 16 }}>
            <EventFilters
              filters={filters}
              setFilter={setFilter}
              onOpenFilters={() => setFilterSheetVisible(true)}
              hasActiveFilters={hasActiveFilters}
              styles={styles}
            />
          </View>
        )}
        {activeTab === TABS.MI_CALENDARIO && loading && (
          <RaceCardSkeletons count={4} styles={styles} />
        )}
        {activeTab === TABS.MI_CALENDARIO && !loading && !!error && (
          <View style={styles.errorContainer}>
            <AlertCircle color="#ff5252" size={32} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {activeTab === TABS.EVENTOS_XERPA && globalLoading && (
          <RaceCardSkeletons count={4} styles={styles} />
        )}
        {activeTab === TABS.EVENTOS_XERPA && !globalLoading && !!globalError && (
          <View style={styles.errorContainer}>
            <AlertCircle color="#ff5252" size={32} />
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        )}
        {activeTab === TABS.RUTAS_LOCALES && globalLoading && (
          <RaceCardSkeletons count={4} styles={styles} />
        )}
        {activeTab === TABS.RUTAS_LOCALES && !globalLoading && !!globalError && (
          <View style={styles.errorContainer}>
            <AlertCircle color="#ff5252" size={32} />
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        )}
      </>
    ),
    [
      activeTab,
      showSearchBar,
      filters,
      setFilter,
      setFilterSheetVisible,
      hasActiveFilters,
      styles,
      loading,
      error,
      globalLoading,
      globalError,
    ]
  );

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
            onPress={onOpenAddRace}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <View style={{ flex: 1 }}>
        <View style={fixedBarStyles.listWrap}>
        <AnimatedFlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={listEmptyComponent}
          key={activeTab}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT },
            listData.length > 0 ? styles.list : undefined,
            listData.length === 0 ? styles.emptyListContent : undefined,
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
        </View>
        {/* Segmentos fijos encima del listado */}
        <Animated.View
          style={[
            fixedBarStyles.fixedBar,
            { top: interpolations.headerHeight },
          ]}
          pointerEvents="box-none"
        >
          <View style={fixedBarStyles.background} pointerEvents="none" />
          <View style={fixedBarStyles.content}>
            <View style={[styles.segmented, { marginTop: 0, marginBottom: 12 }]}>
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
          </View>
        </Animated.View>
      </View>

      {showSearchBar && (
        <FilterBottomSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
          filters={filters}
          setFilter={setFilter}
          filterOptions={filterOptions}
          filteredCount={listData.length}
          onClearAll={() => {
            setFilter('search', '');
            setFilter('pais', '');
            setFilter('tipoDeporte', '');
            setFilter('tipoEvento', '');
            setFilter('formatoEvento', '');
            setFilter('copa', '');
            setFilter('mes', '');
            setFilter('sortBy', 'fecha_asc');
          }}
          styles={styles}
        />
      )}

      <RaceDetailSheet
        visible={!!detailCarrera}
        carrera={detailCarrera}
        isEnrolled={detailCarrera ? isEnrolledIn(detailCarrera.id) : false}
        categoryOptions={detailCategories}
        categoryLoading={detailCategoriesLoading}
        ctl={ctl}
        onClose={() => {
          detailFetchSeqRef.current += 1;
          setDetailCarrera(null);
          setDetailCategories([]);
          setDetailCategoriesLoading(false);
        }}
        onEnroll={enrollToRace}
        onUnenroll={unenrollFromRace}
        styles={styles}
      />

      <PastRaceResultSheet
        visible={!!selectedPastRace}
        carrera={selectedPastRace}
        onClose={() => setSelectedPastRace(null)}
        onSaveResult={async (data) => {
          if (!selectedPastRace) return;
          try {
            const idInscripcion = selectedPastRace.id ?? selectedPastRace.inscripcion_id;
            const carreraId = selectedPastRace.carrera_id;
            if (carreraId && updateRaceByCarreraId) {
              await updateRaceByCarreraId(carreraId, data);
            } else if (idInscripcion && updateRace) {
              await updateRace(idInscripcion, data);
            }
          } finally {
            setSelectedPastRace(null);
          }
        }}
      />
    </ScreenWrapper>
  );
}

const fixedBarStyles = StyleSheet.create({
  fixedBar: {
    position: 'absolute',
    left: theme.spacing.screenPadding,
    right: theme.spacing.screenPadding,
    zIndex: 10,
    ...(Platform.OS === 'android' && { elevation: 10 }),
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 17, 22, 0.92)',
    borderRadius: 0,
  },
  content: {
    paddingHorizontal: 0,
  },
  listWrap: {
    flex: 1,
    zIndex: 0,
    ...(Platform.OS === 'android' && { elevation: 0 }),
  },
});
