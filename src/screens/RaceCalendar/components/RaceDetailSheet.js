/**
 * RaceDetailSheet — Ficha técnica de carrera
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
  Alert,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../../components/ui/Button';
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
} from 'lucide-react-native';
import { formatDateRange } from '../../../utils/formatDateRange';
import { showXerpaError } from '../../../utils/ErrorHandler';
import { computeXerpaReadinessPct } from '../../../utils/raceReadiness';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';

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
  const message =
    !hasPct
      ? 'Conecta CTL y TSS de la carrera para ver tu preparación'
      : displayPct > 80
        ? '¡Estás listo para el podio!'
        : displayPct < 50
          ? 'Necesitas más vatios en las piernas'
          : 'Sigue entrenando, vas bien';
  return (
    <View style={styles.readinessSection}>
      <Text style={styles.readinessSectionTitle}>XERPA Readiness</Text>
      <View style={styles.readinessProgressWrap}>
        <View style={styles.readinessProgressTrack}>
          <View
            style={[
              styles.readinessProgressFill,
              { width: displayPct != null ? `${displayPct}%` : '0%' },
            ]}
          />
        </View>
        <View style={styles.readinessStatsRow}>
          <View style={styles.readinessTextBlock}>
            <Text style={styles.readinessPctText} numberOfLines={1}>
              {hasPct ? `${displayPct}%` : '—'} de Preparación
            </Text>
            <Text
              style={styles.readinessMessageText}
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>
          <Text
            style={styles.readinessPctBadge}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {hasPct ? `${displayPct}%` : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function RaceDetailSheet({
  visible,
  carrera,
  isEnrolled,
  ctl,
  onClose,
  onEnroll,
  onUnenroll,
  styles,
}) {
  const { height: screenHeight } = useWindowDimensions();
  const [loading, setLoading] = React.useState(false);
  const [showConfirmUnenroll, setShowConfirmUnenroll] = React.useState(false);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [footerHeight, setFooterHeight] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const SWIPE_HEADER_HEIGHT = 110;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const SHEET_BG = '#1A1A1A';
  const MAX_SHEET_HEIGHT = Math.floor(screenHeight * 0.9);
  const MIN_SHEET_HEIGHT = 340;

  const handleRequestClose = () =>
    showConfirmUnenroll ? setShowConfirmUnenroll(false) : onClose();

  const imagenUrl = carrera?.imagen_url?.trim();

  if (!carrera) return null;

  const urlInscripcion = carrera.url_inscripcion?.trim();
  const nivelDificultad =
    carrera.nivel_dificultad != null ? Number(carrera.nivel_dificultad) : null;
  const descripcionOrganizador = carrera.descripcion_organizador?.trim();
  const circuitoNombre = carrera.circuito_nombre?.trim();
  const circuitoLogo =
    carrera.circuito_logo_url?.trim() || carrera.circuito_logo?.trim();
  const lat = carrera.latitud != null ? Number(carrera.latitud) : null;
  const lng = carrera.longitud != null ? Number(carrera.longitud) : null;
  const hasLocation = lat != null && lng != null;
  const locationLabel = [circuitoNombre, carrera.ciudad, carrera.pais]
    .filter(Boolean)
    .join(', ');
  const hasAnyLocationInfo = !!locationLabel || hasLocation;
  const tssEstimado = carrera.tss_estimado != null ? Number(carrera.tss_estimado) : null;
  const readinessPct = computeXerpaReadinessPct(ctl, tssEstimado);
  const maxBodyHeight = Math.max(180, MAX_SHEET_HEIGHT - headerHeight - footerHeight);
  const shouldScroll = contentHeight > maxBodyHeight;
  const desiredSheetHeight = headerHeight + footerHeight + (shouldScroll ? maxBodyHeight : contentHeight);
  const computedSheetHeight = Math.max(
    MIN_SHEET_HEIGHT,
    Math.min(MAX_SHEET_HEIGHT, desiredSheetHeight || MIN_SHEET_HEIGHT)
  );

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
    Alert.alert('Coordenadas copiadas', coords);
  }

  async function handleInscribirme() {
    if (urlInscripcion) {
      const supported = await Linking.canOpenURL(urlInscripcion);
      if (supported) {
        await Linking.openURL(urlInscripcion);
      } else {
        Alert.alert('Enlace no válido', 'No se pudo abrir la página de inscripción.');
      }
    } else {
      if (!isEnrolled) {
        setLoading(true);
        try {
          await onEnroll(carrera.id);
          onClose();
        } catch (e) {
          showXerpaError(e, 'RACE-INS-01');
        } finally {
          setLoading(false);
        }
      }
    }
  }

  async function handleUnenroll() {
    setLoading(true);
    try {
      await onUnenroll(carrera.id);
      onClose();
    } catch (e) {
      showXerpaError(e, 'RACE-DEL-01');
    } finally {
      setLoading(false);
      setShowConfirmUnenroll(false);
    }
  }

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
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleRequestClose} />
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: SHEET_BG,
              maxHeight: MAX_SHEET_HEIGHT,
              minHeight: MIN_SHEET_HEIGHT,
              height: computedSheetHeight,
            },
          ]}
        >
          <View
            onLayout={(e) => {
              const h = Math.ceil(e.nativeEvent.layout.height || 0);
              if (!h) return;
              setHeaderHeight((prev) => (Math.abs(prev - h) >= 2 ? h : prev));
            }}
          >
            <View style={[styles.sheetHandle, { backgroundColor: '#E5E5EA' }]} />
            <View style={styles.sheetTitleRow}>
              <Trophy color="#00F0FF" size={20} />
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {carrera.nombre ?? 'Carrera'}
              </Text>
            </View>
            <Text style={styles.sheetSubtitle}>
              {circuitoNombre || carrera.ciudad
                ? [circuitoNombre, carrera.ciudad].filter(Boolean).join(' · ')
                : 'Ficha técnica de la carrera'}
            </Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{ maxHeight: maxBodyHeight }}
            showsVerticalScrollIndicator={false}
            bounces={shouldScroll}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            contentContainerStyle={styles.detailScroll}
            scrollEnabled={shouldScroll}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(_, h) => {
              const next = Math.ceil(h || 0);
              if (!next) return;
              setContentHeight((prev) => (Math.abs(next - prev) >= 2 ? next : prev));
            }}
          >
            {/* Hero: imagen a ancho completo, circuito superpuesto */}
            {!!imagenUrl && (
              <View style={styles.detailHeroImageWrap}>
                <Image
                  source={{ uri: imagenUrl }}
                  style={styles.detailRaceImage}
                  resizeMode="cover"
                />
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

            {/* Quick Stats en píldoras */}
            <View style={styles.detailQuickStatsGrid}>
              <View style={styles.detailQuickStatPill}>
                <Calendar color="#00F0FF" size={14} />
                <Text style={styles.detailQuickStatPillText}>
                  {formatDateRange(carrera.fecha_inicio, carrera.fecha_fin)}
                </Text>
              </View>
              {(carrera.ciudad || carrera.pais) && (
                <TouchableOpacity
                  style={styles.detailQuickStatPill}
                  onPress={hasLocation ? handleOpenLocation : undefined}
                  activeOpacity={hasLocation ? 0.7 : 1}
                  disabled={!hasLocation}
                >
                  <MapPin color={hasLocation ? '#00F0FF' : '#555'} size={14} />
                  <Text
                    style={[
                      styles.detailQuickStatPillText,
                      hasLocation && styles.detailQuickStatPillTextLink,
                    ]}
                    numberOfLines={1}
                  >
                    {[carrera.ciudad, carrera.pais].filter(Boolean).join(', ')}
                  </Text>
                </TouchableOpacity>
              )}
              {carrera.distancia_km != null && (
                <View style={styles.detailQuickStatPill}>
                  <Route color="#00F0FF" size={14} />
                  <Text style={styles.detailQuickStatPillText}>
                    {carrera.distancia_km} km
                  </Text>
                </View>
              )}
              {carrera.desnivel_m != null && (
                <View style={styles.detailQuickStatPill}>
                  <Mountain color="#39FF14" size={14} />
                  <Text style={styles.detailQuickStatPillText}>
                    {carrera.desnivel_m} m
                  </Text>
                </View>
              )}
              <DificultadBadge nivel={nivelDificultad} styles={styles} />
            </View>

            {/* XERPA Readiness — tarjeta destacada */}
            <View style={styles.xerpaReadinessCard}>
              <XerpaReadinessSection pct={readinessPct} styles={styles} />
            </View>

            <View style={styles.detailSection}>
              <View style={styles.detailSectionTitleRow}>
                <Info color="#00F0FF" size={14} />
                <Text style={styles.detailSectionTitle}>Sobre la carrera</Text>
              </View>
              <Text style={styles.detailDescripcionText}>
                {descripcionOrganizador ||
                  'No hay descripción disponible para esta carrera.'}
              </Text>
            </View>

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
                <TouchableOpacity
                  onPress={handleCopyCoords}
                  activeOpacity={0.8}
                  style={{ marginTop: 6, alignSelf: 'flex-start' }}
                >
                  <Text style={[styles.detailSectionBody, { color: '#8E8E93' }]}>
                    {`${lat.toFixed(6)}, ${lng.toFixed(6)} · tocar para copiar`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailUrlLink, { marginTop: 10 }]}
                  onPress={handleOpenLocation}
                >
                  <Text style={styles.detailUrlLinkText}>Ver en mapa</Text>
                  <ExternalLink color="#00F0FF" size={14} />
                </TouchableOpacity>
                </>
              ) : (
                <Text style={[styles.detailSectionBody, { marginTop: 10, color: '#8E8E93' }]}>
                  Esta carrera no tiene coordenadas exactas todavía.
                </Text>
              )}
            </View>
            )}

            <View style={styles.detailSection}>
              <View style={styles.detailSectionTitleRow}>
                <Droplets color="#00F0FF" size={14} />
                <Text style={styles.detailSectionTitle}>Puntos de hidratación</Text>
              </View>
              <Text style={styles.detailSectionBody}>
                {carrera.puntos_hidratacion?.trim() ||
                  'Consulta la información oficial de la carrera para los avituallamientos.'}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <View style={styles.detailSectionTitleRow}>
                <Package color="#00F0FF" size={14} />
                <Text style={styles.detailSectionTitle}>Material obligatorio</Text>
              </View>
              <Text style={styles.detailSectionBody}>
                {carrera.material_obligatorio?.trim() ||
                  'Revisa el reglamento de la prueba para el equipo obligatorio.'}
              </Text>
            </View>

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

          {/* Sticky Footer — Acciones */}
          <View
            style={styles.detailStickyFooter}
            onLayout={(e) => {
              const h = Math.ceil(e.nativeEvent.layout.height || 0);
              if (!h) return;
              setFooterHeight((prev) => (Math.abs(prev - h) >= 2 ? h : prev));
            }}
          >
            {showConfirmUnenroll ? (
              <>
                <Text style={styles.unenrollConfirmText}>
                  ¿Estás seguro que deseas retirarte de esta carrera?
                </Text>
                <View style={[styles.modalActions, { marginTop: 16, marginBottom: 0 }]}>
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
              <View style={styles.modalActions}>
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
                    title={urlInscripcion ? 'Inscribirme (web oficial)' : 'Inscribirme'}
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
        </View>
      </View>
    </Modal>
  );
}
