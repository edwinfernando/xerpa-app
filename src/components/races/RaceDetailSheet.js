/**
 * RaceDetailSheet — Ficha técnica de carrera (componente compartido)
 *
 * - Handle + título fijo + imagen estándar dentro del scroll
 * - XERPA Readiness, Quick Stats (km, desnivel, dificultad)
 * - Secciones: Sobre la carrera, Puntos hidratación, Material obligatorio
 * - CTA sticky footer "Inscribirme"
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Share,
  useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../ui/Button';
import { XerpaProgress } from '../ui/XerpaProgress';
import {
  Calendar,
  MapPin,
  Mountain,
  Route,
  ExternalLink,
  Droplets,
  Info,
  Package,
  Trophy,
  Share2,
  Copy,
} from 'lucide-react-native';
import { formatDateRange } from '../../utils/formatDateRange';
import { PLAY_STORE_URL, IOS_APP_STORE_URL } from '../../constants/appUrls';
import { showXerpaError } from '../../utils/ErrorHandler';
import { useToast } from '../../context/ToastContext';
import { computeXerpaReadinessPct } from '../../utils/raceReadiness';
import { getProgressColorByPct } from '../../utils/colors';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';
import { useAdaptiveSheetHeight } from '../../hooks/useAdaptiveSheetHeight';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../constants/sheetModalConfig';

function DificultadBadge({ nivel, styles }) {
  const n = nivel != null ? Number(nivel) : null;
  const labels = { 1: 'Fácil', 2: 'Moderado', 3: 'Medio', 4: 'Duro', 5: 'Hard' };
  const label = n != null ? (labels[n] ?? `Dificultad ${n}/5`) : '—';
  const isHard = n >= 4;
  const bg =
    n == null
      ? 'rgba(255,255,255,0.05)'
      : isHard
        ? '#ff5252'
        : n >= 3
          ? '#ff9800'
          : 'rgba(0,240,255,0.2)';
  const textColor =
    n == null ? '#555' : isHard ? '#fff' : n >= 3 ? '#fff' : '#00F0FF';
  return (
    <View style={[styles.dificultadQuickBadge, { backgroundColor: bg }]}>
      <Text style={[styles.dificultadQuickText, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

function XerpaReadinessSection({ pct, styles }) {
  const hasPct = pct != null && pct >= 0;
  const displayPct = hasPct ? Math.min(100, Math.max(0, pct)) : null;
  const badgeColor = getProgressColorByPct(displayPct);
  const message =
    !hasPct
      ? 'Conecta CTL y TSS de la carrera para ver tu preparación'
      : displayPct >= 80
        ? '¡Estás listo para el podio!'
        : displayPct < 50
          ? 'Necesitas más vatios en las piernas'
          : 'Sigue entrenando, vas bien';
  return (
    <View style={styles.readinessSection}>
      <Text style={styles.readinessSectionTitle}>XERPA Readiness</Text>
      <XerpaProgress progress={displayPct ?? 0} />
      <View style={styles.readinessStatsRow}>
        <View style={styles.readinessTextBlock}>
          <Text style={styles.readinessPctText} numberOfLines={1}>
            {hasPct ? `${displayPct}%` : '—'} de Preparación
          </Text>
          <Text style={styles.readinessMessageText} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <Text
          style={[styles.readinessPctBadge, { color: badgeColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {hasPct ? `${displayPct}%` : '—'}
        </Text>
      </View>
    </View>
  );
}

export function RaceDetailSheet({
  visible,
  carrera,
  isEnrolled,
  categoryOptions = [],
  categoryLoading = false,
  ctl,
  onClose,
  onEnroll,
  onUnenroll,
  styles,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [showConfirmUnenroll, setShowConfirmUnenroll] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(null);
  const [showCollapsedHeader, setShowCollapsedHeader] = React.useState(false);
  const SWIPE_HEADER_HEIGHT = 110;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const insets = useSafeAreaInsets();
  const SHEET_BG = '#1C1C1E';
  const {
    minSheetHeight: MIN_SHEET_HEIGHT,
    maxSheetHeight: MAX_SHEET_HEIGHT,
    maxBodyHeight,
    shouldScroll,
    computedSheetHeight,
    onHeaderLayout,
    onFooterLayout,
    onBodyContentSizeChange,
  } = useAdaptiveSheetHeight({
    visible,
    minHeight: 340,
    maxHeightRatio: 0.9,
    minBodyHeight: 180,
  });

  const handleRequestClose = () =>
    showConfirmUnenroll ? setShowConfirmUnenroll(false) : onClose();
  const hasCategoryOptions = Array.isArray(categoryOptions) && categoryOptions.length > 0;
  const selectedCategory = hasCategoryOptions
    ? (categoryOptions.find((x) => x.id === selectedCategoryId) || null)
    : null;

  React.useEffect(() => {
    if (!visible) {
      setSelectedCategoryId(null);
      return;
    }
    if (!hasCategoryOptions) {
      setSelectedCategoryId(null);
      return;
    }
    const preselected = carrera?.evento_fecha_categoria_id;
    if (preselected && categoryOptions.some((x) => x.id === preselected)) {
      setSelectedCategoryId(preselected);
      return;
    }
    const firstActive = categoryOptions.find((x) => x.activo !== false);
    setSelectedCategoryId((firstActive || categoryOptions[0]).id);
  }, [visible, carrera?.evento_fecha_categoria_id, hasCategoryOptions, categoryOptions]);

  const imagenUrl = carrera?.imagen_url?.trim();
  const urlInscripcion = carrera?.url_inscripcion?.trim();
  const nivelDificultad =
    carrera?.nivel_dificultad != null ? Number(carrera.nivel_dificultad) : null;
  const descripcionOrganizador = carrera?.descripcion_organizador?.trim();
  const circuitoNombre = carrera?.circuito_nombre?.trim();
  const circuitoLogo =
    carrera?.circuito_logo_url?.trim() || carrera?.circuito_logo?.trim();
  const lat = carrera?.latitud != null ? Number(carrera.latitud) : null;
  const lng = carrera?.longitud != null ? Number(carrera.longitud) : null;
  const hasLocation = lat != null && lng != null;
  const tssEstimado = carrera?.tss_estimado != null ? Number(carrera.tss_estimado) : null;
  const readinessPct = computeXerpaReadinessPct(ctl, tssEstimado);
  const hasReadiness = readinessPct != null;
  const hasDificultad = nivelDificultad != null;
  const hasDescripcion = !!descripcionOrganizador;
  const hidratacionText = carrera?.puntos_hidratacion?.trim();
  const materialText = carrera?.material_obligatorio?.trim();
  const hasHidratacion = !!hidratacionText;
  const hasMaterial = !!materialText;
  const locationLabel = [circuitoNombre, carrera?.ciudad, carrera?.pais]
    .filter(Boolean)
    .join(', ');
  const hasAnyLocationInfo = !!locationLabel || hasLocation;
  const nivel = carrera?.nivel?.trim();
  const estado = carrera?.estado?.trim();
  const tipoDeporte = carrera?.tipo_deporte?.trim();
  const tipoEvento = carrera?.tipo_evento?.trim();
  const tipoEventoLabel =
    tipoEvento === 'xerpa'
      ? 'XERPA'
      : tipoEvento === 'ruta_local'
        ? 'Ruta local'
        : null;
  const isVerificada = carrera?.verificado === true;
  const summaryLocation = [carrera?.ciudad, carrera?.pais].filter(Boolean).join(', ') || 'Sin ubicación';
  const isNarrowSummary = screenWidth < 390;
  const heroHeight = Math.max(168, Math.min(228, Math.round(screenWidth * 0.52)));
  const heroFullBleedStyle = {
    width: screenWidth,
    marginLeft: -24,
    marginRight: -24,
    alignSelf: 'center',
  };
  const collapseThreshold = Math.max(72, heroHeight - 56);
  const summaryItems = [
    { key: 'fecha', label: 'FECHA', value: formatDateRange(carrera?.fecha_inicio, carrera?.fecha_fin) },
    { key: 'ubicacion', label: 'UBICACIÓN', value: summaryLocation },
  ];
  const eventMetaItems = [
    estado ? { key: 'estado', value: estado } : null,
    nivel ? { key: 'nivel', value: nivel } : null,
    tipoEventoLabel ? { key: 'evento', value: tipoEventoLabel } : null,
    tipoDeporte ? { key: 'deporte', value: tipoDeporte } : null,
    isVerificada ? { key: 'verificada', value: 'Verificada' } : null,
  ].filter(Boolean);
  const performanceItems = [
    carrera?.distancia_km != null ? { key: 'distancia', label: 'DISTANCIA', value: `${carrera.distancia_km} km`, icon: Route, color: '#00F0FF' } : null,
    carrera?.desnivel_m != null ? { key: 'desnivel', label: 'ALTIMETRÍA', value: `${carrera.desnivel_m} m`, icon: Mountain, color: '#39FF14' } : null,
  ].filter(Boolean);
  const subtitleText = circuitoNombre || carrera?.ciudad
    ? [circuitoNombre, carrera?.ciudad].filter(Boolean).join(' · ')
    : 'Ficha técnica de la carrera';
  const shouldRenderFloatingHeader = !!imagenUrl && showCollapsedHeader;

  function getMapsUrl() {
    if (!hasLocation) return null;
    if (Platform.OS === 'ios') return `maps:0,0?q=${lat},${lng}`;
    if (Platform.OS === 'android') return `geo:${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  async function handleOpenLocation() {
    const url = getMapsUrl();
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      );
    }
  }

  async function handleCopyCoords() {
    if (!hasLocation) return;
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    await Clipboard.setStringAsync(coords);
    showToast({
      type: 'success',
      title: 'Coordenadas copiadas',
      message: coords,
    });
  }

  async function handleShareCoords() {
    if (!hasLocation) return;
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const mapsUrl = getMapsUrl();
    try {
      await Share.share({
        message: mapsUrl
          ? `Ubicación: ${coords}\n\nVer en mapa: ${mapsUrl}`
          : coords,
        title: 'Coordenadas de la carrera',
      });
    } catch (err) {
      if (err?.message?.includes('User did not share')) return;
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo compartir.',
      });
    }
  }

  function buildShareRaceText() {
    const lines = [];
    lines.push(`🏁 ${carrera?.nombre ?? 'Carrera'}`);
    if (circuitoNombre || carrera?.ciudad) {
      lines.push([circuitoNombre, carrera?.ciudad, carrera?.pais].filter(Boolean).join(' · '));
    }
    lines.push(`📅 ${formatDateRange(carrera?.fecha_inicio, carrera?.fecha_fin)}`);
    if (carrera?.distancia_km != null) lines.push(`📍 ${carrera.distancia_km} km`);
    if (carrera?.desnivel_m != null) lines.push(`⛰ ${carrera.desnivel_m} m D+`);
    if (hasLocation) {
      lines.push(`🗺 ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      lines.push(getMapsUrl());
    }
    if (urlInscripcion) lines.push(`\nInscripción: ${urlInscripcion}`);
    const carreraId = carrera?.id ?? carrera?.carrera_id;
    lines.push('\nDescubre más carreras en XERPA');
    if (carreraId) {
      lines.push(`xerpa://carreras/race/${carreraId}`);
      lines.push('Descarga la app:');
      lines.push(`Android: ${PLAY_STORE_URL}`);
      if (IOS_APP_STORE_URL) lines.push(`iOS: ${IOS_APP_STORE_URL}`);
    }
    return lines.filter(Boolean).join('\n');
  }

  async function handleShareCarrera() {
    try {
      await Share.share({
        message: buildShareRaceText(),
        title: `${carrera?.nombre ?? 'Carrera'} — XERPA`,
      });
    } catch (err) {
      if (err?.message?.includes('User did not share')) return;
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo compartir la carrera.',
      });
    }
  }

  async function handleInscribirme() {
    if (hasCategoryOptions && !selectedCategoryId) {
      showToast({
        type: 'info',
        title: 'Selecciona una categoría',
        message: 'Elige tu categoría antes de confirmar la inscripción.',
      });
      return;
    }
    if (!isEnrolled) {
      setLoading(true);
      try {
        await onEnroll(carrera.id, 'B', selectedCategoryId || null);
        onClose();
      } catch (e) {
        showXerpaError(e, 'RACE-INS-01', showToast);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleUnenroll() {
    setLoading(true);
    try {
      await onUnenroll(carrera.id);
      onClose();
    } catch (e) {
      showXerpaError(e, 'RACE-DEL-01', showToast);
    } finally {
      setLoading(false);
      setShowConfirmUnenroll(false);
    }
  }

  React.useEffect(() => {
    if (!visible) {
      setShowCollapsedHeader(false);
      return;
    }
    setShowCollapsedHeader(false);
  }, [visible, carrera?.id]);

  const handleBodyScroll = React.useCallback((e) => {
    onScroll(e);
    if (!imagenUrl) return;
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    const next = y > collapseThreshold;
    setShowCollapsedHeader((prev) => (prev === next ? prev : next));
  }, [onScroll, imagenUrl, collapseThreshold]);

  if (!carrera) return null;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleRequestClose}
      onBackButtonPress={handleRequestClose}
      onSwipeComplete={handleRequestClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      scrollTo={scrollTo}
      scrollOffset={scrollOffsetY}
      scrollOffsetMax={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <View style={styles.sheetOverlay}>
        <View
          style={[
            localStyles.sheetContainer,
            {
              backgroundColor: SHEET_BG,
              height: computedSheetHeight,
              minHeight: MIN_SHEET_HEIGHT,
              maxHeight: MAX_SHEET_HEIGHT,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {shouldRenderFloatingHeader && (
            <View style={[localStyles.floatingHeaderWrap, { pointerEvents: 'box-none' }]}>
              <View style={localStyles.floatingHeaderRow}>
                <View style={localStyles.titleRow}>
                  <Trophy color="#00F0FF" size={18} />
                  <Text style={styles.sheetTitle} numberOfLines={1}>
                    {carrera.nombre ?? 'Carrera'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={localStyles.headerShareBtn}
                  onPress={handleShareCarrera}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Share2 color="#00D2FF" size={20} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.sheetSubtitle, localStyles.floatingSubtitle]} numberOfLines={1}>
                {subtitleText}
              </Text>
            </View>
          )}

          <View onLayout={onHeaderLayout}>
            {imagenUrl ? (
              <View style={localStyles.heroHandleOverlay}>
                <View style={[styles.sheetHandle, localStyles.heroHandle, { backgroundColor: '#E5E5EA' }]} />
              </View>
            ) : (
              <View style={[styles.sheetHandle, { backgroundColor: '#E5E5EA' }]} />
            )}
            {!imagenUrl && (
              <>
                <View style={localStyles.header}>
                  <View style={localStyles.titleRow}>
                    <Trophy color="#00F0FF" size={20} />
                    <Text style={styles.sheetTitle} numberOfLines={2}>
                      {carrera.nombre ?? 'Carrera'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={localStyles.headerShareBtn}
                    onPress={handleShareCarrera}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Share2 color="#00D2FF" size={20} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.sheetSubtitle, localStyles.subtitle]}>
                  {subtitleText}
                </Text>
              </>
            )}
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={localStyles.keyboardWrap}
          >
            <ScrollView
              ref={scrollViewRef}
              style={[localStyles.scroll, { maxHeight: maxBodyHeight }]}
              showsVerticalScrollIndicator={false}
              bounces={shouldScroll}
              decelerationRate="fast"
              keyboardShouldPersistTaps="handled"
              overScrollMode="never"
              contentContainerStyle={styles.detailScroll}
              scrollEnabled={shouldScroll}
              onScroll={handleBodyScroll}
              scrollEventThrottle={16}
              onContentSizeChange={onBodyContentSizeChange}
            >
              {!!imagenUrl && (
                <View style={[styles.detailHeroImageWrap, heroFullBleedStyle, { height: heroHeight }]}>
                  <Image
                    source={{ uri: imagenUrl }}
                    style={[styles.detailRaceImage, { height: heroHeight }]}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.22)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.detailHeroImageOverlay}
                  />
                  <LinearGradient
                    colors={['rgba(28,28,30,0)', 'rgba(28,28,30,0.9)']}
                    start={{ x: 0.5, y: 0.45 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.detailHeroBottomFade}
                  />
                  <TouchableOpacity
                    style={localStyles.heroShareBtn}
                    onPress={handleShareCarrera}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Share2 color="#00D2FF" size={22} strokeWidth={2} />
                  </TouchableOpacity>
                  <View style={styles.detailHeroTextOverlay}>
                    <View style={localStyles.heroTitleRow}>
                      <Trophy color="#00F0FF" size={18} />
                      <Text style={styles.detailHeroTitleOnImage} numberOfLines={2}>
                        {carrera.nombre ?? 'Carrera'}
                      </Text>
                    </View>
                    <Text style={styles.detailHeroSubtitleOnImage} numberOfLines={1}>
                      {subtitleText}
                    </Text>
                  </View>
                  {!!circuitoLogo && (
                    <View style={styles.detailCircuitoLogoOverlay}>
                      <Image
                        source={{ uri: circuitoLogo }}
                        style={styles.detailCircuitoLogoImg}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                </View>
              )}

            <View style={[styles.detailSummaryRow, isNarrowSummary && styles.detailSummaryRowWrap]}>
              {summaryItems.map((item) => (
                <View
                  key={item.key}
                  style={[
                    styles.detailSummaryCard,
                    isNarrowSummary && styles.detailSummaryCardHalf,
                  ]}
                >
                  <Text style={styles.detailSummaryLabel}>{item.label}</Text>
                  <Text style={styles.detailSummaryValue} numberOfLines={2}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {!!eventMetaItems.length && (
              <>
                <Text style={localStyles.groupLabel}>CONTEXTO DEL EVENTO</Text>
                <View style={[styles.detailQuickStatsGrid, { marginTop: 6 }]}>
                  {eventMetaItems.map((item) => (
                    <View key={item.key} style={styles.detailQuickStatPill}>
                      <Text style={styles.detailQuickStatPillText}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {!!performanceItems.length && (
              <>
                <Text style={localStyles.groupLabel}>RECORRIDO</Text>
                <View style={[styles.detailQuickStatsGrid, { marginTop: 6 }]}>
                  {performanceItems.map((item) => (
                    <View key={item.key} style={[styles.detailQuickStatPill, localStyles.performancePill]}>
                      {item.icon ? <item.icon color={item.color || '#00F0FF'} size={14} /> : null}
                      <Text style={[styles.detailQuickStatPillText, localStyles.performancePillText]}>{item.value}</Text>
                    </View>
                  ))}
                  {hasDificultad && <DificultadBadge nivel={nivelDificultad} styles={styles} />}
                </View>
              </>
            )}

            {hasReadiness && (
              <View style={styles.xerpaReadinessCard}>
                <XerpaReadinessSection pct={readinessPct} styles={styles} />
              </View>
            )}

            <View style={styles.detailSection}>
              <View style={styles.detailSectionTitleRow}>
                <Trophy color="#00F0FF" size={14} />
                <Text style={styles.detailSectionTitle}>Categorías</Text>
              </View>
              {categoryLoading ? (
                <Text style={styles.detailSectionBody}>Cargando categorías disponibles...</Text>
              ) : hasCategoryOptions ? (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.detailCategoryChipsRow}
                  >
                    {categoryOptions.map((option) => {
                      const isActive = option.id === selectedCategoryId;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.detailCategoryChip,
                            isActive && styles.detailCategoryChipActive,
                          ]}
                          onPress={() => setSelectedCategoryId(option.id)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.detailCategoryChipText,
                              isActive && styles.detailCategoryChipTextActive,
                            ]}
                          >
                            {option.nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  {!!selectedCategory && (
                    <View style={styles.detailCategoryMetaWrap}>
                      {selectedCategory.recorrido_nombre ? (
                        <View style={styles.detailQuickStatPill}>
                          <Route color="#00F0FF" size={14} />
                          <Text style={styles.detailQuickStatPillText}>
                            {selectedCategory.recorrido_nombre}
                          </Text>
                        </View>
                      ) : null}
                      {selectedCategory.numero_vueltas ? (
                        <View style={styles.detailQuickStatPill}>
                          <Text style={[styles.detailQuickStatPillText, localStyles.metaLabel]}>
                            VUELTAS
                          </Text>
                          <Text style={styles.detailQuickStatPillText}>
                            {selectedCategory.numero_vueltas}
                          </Text>
                        </View>
                      ) : null}
                      {selectedCategory.distancia_objetivo_km ? (
                        <View style={styles.detailQuickStatPill}>
                          <Text style={styles.detailQuickStatPillText}>
                            {selectedCategory.distancia_objetivo_km} km
                          </Text>
                        </View>
                      ) : null}
                      {selectedCategory.desnivel_objetivo_m ? (
                        <View style={styles.detailQuickStatPill}>
                          <Text style={styles.detailQuickStatPillText}>
                            {selectedCategory.desnivel_objetivo_m} m D+
                          </Text>
                        </View>
                      ) : null}
                      {selectedCategory.precio != null ? (
                        <View style={styles.detailQuickStatPill}>
                          <Text style={styles.detailQuickStatPillText}>
                            {`$${selectedCategory.precio}`}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.detailSectionBody}>
                  Esta carrera no tiene categorías configuradas.
                </Text>
              )}
            </View>

            {hasDescripcion && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionTitleRow}>
                  <Info color="#00F0FF" size={14} />
                  <Text style={styles.detailSectionTitle}>Sobre la carrera</Text>
                </View>
                <Text style={styles.detailDescripcionText}>{descripcionOrganizador}</Text>
              </View>
            )}

            {hasAnyLocationInfo && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionTitleRow}>
                  <MapPin color="#00F0FF" size={14} />
                  <Text style={styles.detailSectionTitle}>Ubicación</Text>
                </View>
                <Text style={styles.detailSectionBody}>
                  {locationLabel || 'Ubicación general de la carrera'}
                </Text>
                {hasLocation ? (
                  <>
                    <View style={styles.detailCoordsRow}>
                      <Text style={styles.detailCoordsLabel}>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </Text>
                      <View style={styles.detailCoordsActions}>
                        <TouchableOpacity
                          style={styles.detailCoordsIconBtn}
                          onPress={handleCopyCoords}
                          activeOpacity={0.8}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Copy color="#00D2FF" size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.detailCoordsIconBtn}
                          onPress={handleShareCoords}
                          activeOpacity={0.8}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Share2 color="#00D2FF" size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.detailVerMapaButton}
                      onPress={handleOpenLocation}
                      activeOpacity={0.8}
                    >
                      <MapPin color="#00D2FF" size={20} strokeWidth={2} />
                      <Text style={styles.detailVerMapaButtonText}>Ver mapa</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={[styles.detailSectionBody, { marginTop: 10, color: '#8E8E93' }]}>
                    Esta carrera no tiene coordenadas exactas todavía.
                  </Text>
                )}
              </View>
            )}

            {hasHidratacion && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionTitleRow}>
                  <Droplets color="#00F0FF" size={14} />
                  <Text style={styles.detailSectionTitle}>Puntos de hidratación</Text>
                </View>
                <Text style={styles.detailSectionBody}>{hidratacionText}</Text>
              </View>
            )}

            {hasMaterial && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionTitleRow}>
                  <Package color="#00F0FF" size={14} />
                  <Text style={styles.detailSectionTitle}>Material obligatorio</Text>
                </View>
                <Text style={styles.detailSectionBody}>{materialText}</Text>
              </View>
            )}

            {!!urlInscripcion && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionTitleRow}>
                  <ExternalLink color="#00F0FF" size={14} />
                  <Text style={styles.detailSectionTitle}>Inscripción</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailUrlLink}
                  onPress={() =>
                    Linking.canOpenURL(urlInscripcion).then(
                      (ok) => ok && Linking.openURL(urlInscripcion)
                    )
                  }
                >
                  <Text style={styles.detailUrlLinkText}>
                    Ver página de inscripción
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            </ScrollView>

            <View
              style={styles.detailStickyFooter}
              onLayout={onFooterLayout}
            >
              {showConfirmUnenroll ? (
                <>
                  <Text style={[styles.unenrollConfirmText, localStyles.unenrollText]}>
                    ¿Estás seguro que deseas retirarte de esta carrera?
                  </Text>
                  <View style={[styles.detailFooterActions, localStyles.confirmActions]}>
                    <Button
                      title="Sí, retirarme"
                      variant="danger"
                      onPress={handleUnenroll}
                      loading={loading}
                      disabled={loading}
                      style={[styles.modalSaveGradient, { flex: 1 }]}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.detailFooterActions}>
                  {isEnrolled ? (
                    <Button
                      title="Cancelar inscripción"
                      variant="secondary"
                      onPress={() => setShowConfirmUnenroll(true)}
                      disabled={loading}
                      style={[styles.modalCancelBtn, { flex: 1 }]}
                    />
                  ) : (
                    <Button
                      title="Inscribirme"
                      variant="solid"
                      onPress={handleInscribirme}
                      loading={loading}
                      disabled={loading}
                      style={[styles.modalSaveGradient, { flex: 1 }]}
                    />
                  )}
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  heroHandleOverlay: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 3,
    pointerEvents: 'none',
  },
  heroHandle: {
    marginBottom: 0,
  },
  floatingHeaderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: '#1C1C1E',
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerShareBtn: {
    padding: 6,
  },
  floatingSubtitle: {
    paddingHorizontal: 0,
    marginTop: 2,
  },
  heroShareBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
  },
  headerCategoryBadge: {
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  keyboardWrap: {
    flexShrink: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  unenrollText: {
    marginBottom: 12,
  },
  confirmActions: {
    marginTop: 12,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  groupLabel: {
    marginTop: 8,
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  performancePill: {
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderColor: 'rgba(0, 210, 255, 0.35)',
  },
  performancePillText: {
    color: '#E6FBFF',
    fontWeight: '800',
  },
});
