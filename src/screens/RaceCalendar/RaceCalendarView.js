import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import {
  Plus, Map, MapPin, Mountain, TrendingUp,
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
import PagerView from 'react-native-pager-view';

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
  initialCarreraId,
  fetchCarreraById,
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
  const navigation = useNavigation();
  const handledInitialCarreraRef = useRef(false);
  const [activeTab, setActiveTab] = useState(TABS.MI_CALENDARIO);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [detailCarrera, setDetailCarrera] = useState(null);
  const [detailCategories, setDetailCategories] = useState([]);
  const [detailCategoriesLoading, setDetailCategoriesLoading] = useState(false);
  const [selectedPastRace, setSelectedPastRace] = useState(null);
  const detailFetchSeqRef = useRef(0);

  // Top Tabs: indicador neón animado
  const TAB_ORDER = [TABS.MI_CALENDARIO, TABS.EVENTOS_XERPA, TABS.RUTAS_LOCALES];
  const [headerWidth, setHeaderWidth] = useState(
    () => Dimensions.get('window').width - 2 * theme.spacing.screenPadding
  );
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const tabWidth = headerWidth / 3;

  useEffect(() => {
    const idx = TAB_ORDER.indexOf(activeTab);
    const toValue = idx >= 0 ? idx * tabWidth : 0;
    Animated.spring(indicatorTranslateX, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [activeTab, tabWidth]);

  const handleHeaderLayout = useCallback((e) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setHeaderWidth(width);
  }, []);

  const pagerRef = useRef(null);
  const setPage = useCallback((index) => {
    pagerRef.current?.setPage(index);
  }, []);

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

  const { scrollHandler, scrollY, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true, hideOnScroll: true });

  const segmentBarPaddingTop = React.useMemo(
    () =>
      interpolations.headerHeight.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT],
        outputRange: [insets.top, 0],
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    [interpolations.headerHeight, HEADER_MAX_HEIGHT, insets.top]
  );

  const flatListRefs = useRef([null, null, null]);

  useEffect(() => {
    Animated.timing(scrollY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
    const idx = TAB_ORDER.indexOf(activeTab);
    flatListRefs.current[idx]?.scrollToOffset?.({ offset: 0, animated: true });
  }, [activeTab, scrollY]);
  const isAnyModalVisible = filterSheetVisible || !!detailCarrera || !!selectedPastRace;
  useNavigationBarColor(isAnyModalVisible, '#131313', '#121212');

  useEffect(() => {
    if (!initialCarreraId || !fetchCarreraById || handledInitialCarreraRef.current) return;
    handledInitialCarreraRef.current = true;
    let cancelled = false;
    (async () => {
      const carrera = await fetchCarreraById(initialCarreraId);
      if (cancelled || !carrera) return;
      handleOpenDetail(carrera);
      navigation.getParent()?.setParams?.({ carreraId: undefined });
    })();
    return () => { cancelled = true; };
  }, [initialCarreraId, fetchCarreraById, handleOpenDetail, navigation]);

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

  const listDataMisRetos = useMemo(() => {
    if (loading || error) return [];
    const nextRace = filteredRaces.find((r) => !isPastRace(r));
    const nextRaceId = nextRace ? (nextRace.id ?? nextRace.inscripcion_id ?? nextRace.carrera_id) : null;
    return filteredRaces.map((r) => {
      const id = r.id ?? r.inscripcion_id ?? r.carrera_id;
      const isNextRace = id != null && id === nextRaceId;
      const isPastRaceVal = isPastRace(r);
      return { ...r, isNextRace, isPastRace: isPastRaceVal };
    });
  }, [loading, error, filteredRaces]);

  const listDataCarreras = useMemo(
    () => (globalLoading || globalError ? [] : filteredEventosXerpa),
    [globalLoading, globalError, filteredEventosXerpa]
  );

  const listDataEventos = useMemo(
    () => (globalLoading || globalError ? [] : filteredRutasLocales),
    [globalLoading, globalError, filteredRutasLocales]
  );

  const listDataByTab = useMemo(
    () => ({
      [TABS.MI_CALENDARIO]: listDataMisRetos,
      [TABS.EVENTOS_XERPA]: listDataCarreras,
      [TABS.RUTAS_LOCALES]: listDataEventos,
    }),
    [listDataMisRetos, listDataCarreras, listDataEventos]
  );

  const showSearchBar = listDataByTab[activeTab]?.length > 0;

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

  const goToCarreras = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPage(1);
    setActiveTab(TABS.EVENTOS_XERPA);
  }, [setPage]);

  const goToMisRetos = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPage(0);
    setActiveTab(TABS.MI_CALENDARIO);
  }, [setPage]);

  const listEmptyMisRetos = useMemo(() => {
    if (loading) return null;
    if (error) return null;
    return (
      <GlobalEmptyState
        icon={<Map color="#00D2FF" size={48} strokeWidth={1.5} />}
        title="Sin Objetivos a la Vista"
        subtitle="No tienes carreras programadas. Explora el calendario y fija tu próxima meta para que XERPA AI adapte tu entrenamiento."
        primaryButtonText="Explorar Carreras"
        onPrimaryPress={goToCarreras}
      />
    );
  }, [loading, error, goToCarreras]);

  const listEmptyCarreras = useMemo(() => {
    if (globalLoading || globalError) return null;
    return (
      <GlobalEmptyState
        icon={<Trophy color="#555555" size={48} strokeWidth={1.5} />}
        title="Palmarés en Blanco"
        subtitle="Tus carreras completadas y resultados aparecerán aquí. ¡Prepárate para cruzar tu primera línea de meta!"
        secondaryButtonText="Ir a Mi Calendario"
        onSecondaryPress={goToMisRetos}
      />
    );
  }, [globalLoading, globalError, goToMisRetos]);

  const listEmptyEventos = useMemo(() => {
    if (globalLoading || globalError) return null;
    return (
      <GlobalEmptyState
        icon={<MountainSnow color="#555555" size={48} strokeWidth={1.5} />}
        title="Sin Rutas Locales"
        subtitle="Eventos de comunidad o travesías menores aparecerán aquí. Añade la tuya en Mi Calendario o explora las carreras."
        secondaryButtonText="Ir a Mi Calendario"
        onSecondaryPress={goToMisRetos}
      />
    );
  }, [globalLoading, globalError, goToMisRetos]);

  const buildListHeader = useCallback(
    (tab) => {
      const data = listDataByTab[tab] || [];
      const hasSearchBar = data.length > 0;
      return (
        <>
          {hasSearchBar && (
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
          {tab === TABS.MI_CALENDARIO && loading && <RaceCardSkeletons count={4} styles={styles} />}
          {tab === TABS.MI_CALENDARIO && !loading && !!error && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#ff5252" size={32} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {tab === TABS.EVENTOS_XERPA && globalLoading && <RaceCardSkeletons count={4} styles={styles} />}
          {tab === TABS.EVENTOS_XERPA && !globalLoading && !!globalError && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#ff5252" size={32} />
              <Text style={styles.errorText}>{globalError}</Text>
            </View>
          )}
          {tab === TABS.RUTAS_LOCALES && globalLoading && <RaceCardSkeletons count={4} styles={styles} />}
          {tab === TABS.RUTAS_LOCALES && !globalLoading && !!globalError && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#ff5252" size={32} />
              <Text style={styles.errorText}>{globalError}</Text>
            </View>
          )}
        </>
      );
    },
    [listDataByTab, filters, setFilter, setFilterSheetVisible, hasActiveFilters, styles, loading, error, globalLoading, globalError]
  );

  const FIXED_SEGMENTS_HEIGHT = 48;

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
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={TAB_ORDER.indexOf(activeTab)}
            onPageSelected={(e) => {
              const idx = e.nativeEvent.position;
              const tab = TAB_ORDER[idx];
              if (tab !== activeTab) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(tab);
              }
            }}
          >
            <View key="0" style={{ flex: 1 }} collapsable={false}>
              <AnimatedFlatList
                ref={(r) => { flatListRefs.current[0] = r; }}
                data={listDataMisRetos}
                keyExtractor={keyExtractor}
                renderItem={renderMiCalendarioItem}
                ListHeaderComponent={buildListHeader(TABS.MI_CALENDARIO)}
                ListEmptyComponent={listEmptyMisRetos}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT },
                  listDataMisRetos.length > 0 ? styles.list : undefined,
                  listDataMisRetos.length === 0 ? styles.emptyListContent : undefined,
                ]}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
            <View key="1" style={{ flex: 1 }} collapsable={false}>
              <AnimatedFlatList
                ref={(r) => { flatListRefs.current[1] = r; }}
                data={listDataCarreras}
                keyExtractor={keyExtractor}
                renderItem={renderGlobalItem}
                ListHeaderComponent={buildListHeader(TABS.EVENTOS_XERPA)}
                ListEmptyComponent={listEmptyCarreras}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT },
                  listDataCarreras.length > 0 ? styles.list : undefined,
                  listDataCarreras.length === 0 ? styles.emptyListContent : undefined,
                ]}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
            <View key="2" style={{ flex: 1 }} collapsable={false}>
              <AnimatedFlatList
                ref={(r) => { flatListRefs.current[2] = r; }}
                data={listDataEventos}
                keyExtractor={keyExtractor}
                renderItem={renderGlobalItem}
                ListHeaderComponent={buildListHeader(TABS.RUTAS_LOCALES)}
                ListEmptyComponent={listEmptyEventos}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingTop: HEADER_MAX_HEIGHT + FIXED_SEGMENTS_HEIGHT },
                  listDataEventos.length > 0 ? styles.list : undefined,
                  listDataEventos.length === 0 ? styles.emptyListContent : undefined,
                ]}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          </PagerView>
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
                  setActiveTab(TABS.MI_CALENDARIO);
                }}
              >
                <Text style={activeTab === TABS.MI_CALENDARIO ? styles.topTabTextActive : styles.topTabTextInactive}>
                  Mis Retos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.topTabBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setPage(1);
                  setActiveTab(TABS.EVENTOS_XERPA);
                }}
              >
                <Text style={activeTab === TABS.EVENTOS_XERPA ? styles.topTabTextActive : styles.topTabTextInactive}>
                  Carreras
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.topTabBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setPage(2);
                  setActiveTab(TABS.RUTAS_LOCALES);
                }}
              >
                <Text style={activeTab === TABS.RUTAS_LOCALES ? styles.topTabTextActive : styles.topTabTextInactive}>
                  Eventos
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

      {showSearchBar && (
        <FilterBottomSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
          filters={filters}
          setFilter={setFilter}
          filterOptions={filterOptions}
          filteredCount={listDataByTab[activeTab]?.length ?? 0}
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
