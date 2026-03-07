/**
 * SmartRaceCard — Card de carrera adaptativa (inmersiva con imagen / compacta sin imagen)
 *
 * @exports SmartRaceCard, computeXerpaReadinessPct
 *
 * RENDERIZADO ADAPTATIVO
 * - hasImage: layout inmersivo (hero 140px, LinearGradient, contenido marginTop 80).
 * - !hasImage: encabezado compacto, contenido en flujo normal, sin huecos.
 *
 * Badges con BlurView (glassmorphism). Telemetría dinámica (solo bloques con datos).
 *
 * PROPS: item, variant, isEnrolled, isNextRace, isPastRace, ctl?, onPress, onDelete, styles
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, Mountain, Trash2, ExternalLink, Trophy, Flag } from 'lucide-react-native';
import { formatDateRange } from '../../../utils/formatDateRange';
import { showXerpaError } from '../../../utils/ErrorHandler';
import { computeXerpaReadinessPct, isPastRace as isPastRaceUtil } from '../../../utils/raceReadiness';
import { XerpaProgress } from '../../../components/ui/XerpaProgress';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../context/ToastContext';

export { computeXerpaReadinessPct };

function getDaysUntil(fechaInicioStr) {
  if (!fechaInicioStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(fechaInicioStr + 'T00:00:00');
  return Math.ceil((race - today) / 86400000);
}

function StatusBadge({ estado, styles }) {
  if (!estado || estado === 'Programada') return null;
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
        {estado}
      </Text>
    </View>
  );
}

/** Badge derecho: estado temporal (próximo / pasado / countdown). Puede devolver null. */
function TiempoBadge({ isNextRace, isPastRace, hasStoredResult, hasPosicion, fechaInicio, estado, styles }) {
  if (isPastRace) {
    const label = hasStoredResult ? (hasPosicion ? 'COMPLETADA' : 'FINALIZADA') : 'RESULTADOS PENDIENTES';
    return (
      <View style={[styles.badgeTiempoBase, hasStoredResult ? styles.badgeTiempoFinalizada : styles.badgeTiempoPendientes]}>
        <Text style={[styles.badgeTiempoText, hasStoredResult ? styles.badgeTiempoTextFinalizada : styles.badgeTiempoTextPendientes]}>
          {label}
        </Text>
      </View>
    );
  }
  if (isNextRace) {
    const days = getDaysUntil(fechaInicio);
    if (days === null || days < 0) return null;
    const label = days === 0 ? '¡HOY!' : days === 1 ? 'Falta 1 día' : `Faltan ${days} días`;
    return (
      <View style={styles.badgeTiempoNextRace}>
        <Text style={styles.badgeTiempoTextNextRace}>{label}</Text>
      </View>
    );
  }
  if (estado === 'Finalizada') return null;
  const days = getDaysUntil(fechaInicio);
  if (days === null || days < 0) return null;
  const isToday = days === 0;
  return (
    <View style={[styles.badgeTiempoBase, styles.badgeTiempoCountdown, isToday && styles.badgeTiempoToday]}>
      <Text style={[styles.badgeTiempoTextCountdown, isToday && styles.badgeTiempoTextToday]}>
        {isToday ? '¡HOY!' : `${days}d`}
      </Text>
    </View>
  );
}

/** Indica si el badge derecho tiene contenido para mostrar */
function hasTiempoBadgeContent({ isPastRace, isNextRace, estado, fechaInicio, isEnrolled }) {
  if (isPastRace && !isEnrolled) return false;
  if (isPastRace) return true;
  if (isNextRace) {
    const days = getDaysUntil(fechaInicio);
    return days != null && days >= 0;
  }
  if (estado === 'Finalizada') return false;
  const days = getDaysUntil(fechaInicio);
  return days != null && days >= 0;
}

const DIFICULTAD_LABELS = ['', 'Fácil', 'Moderado', 'Medio', 'Duro', 'Hard'];

function getEventContext(item) {
  const formatoRaw = String(
    item.formato_evento_codigo || item.formato_evento_nombre || item.formato_evento || ''
  ).toLowerCase();
  const tipoRaw = String(item.tipo_evento_codigo || item.tipo_evento || '').toLowerCase();
  const validaN = item.evento_numero_valida ?? item.numero_valida;

  if (formatoRaw.includes('valida') || validaN != null) {
    return {
      icon: Flag,
      label: validaN != null ? `VÁLIDA ${validaN}` : 'VÁLIDA',
    };
  }
  if (formatoRaw.includes('copa') || !!item.copa_nombre) {
    return {
      icon: Trophy,
      label: item.copa_nombre ? `COPA · ${item.copa_nombre}` : 'COPA',
    };
  }
  if (tipoRaw === 'ruta_local' || tipoRaw === 'travesia') {
    return {
      icon: Mountain,
      label: tipoRaw === 'ruta_local' ? 'RUTA LOCAL' : 'TRAVESÍA',
    };
  }
  return { icon: Trophy, label: 'COMPETENCIA' };
}

function getInscriptionCategory(item) {
  const value = item?.evento_categoria_nombre || item?.categoria || '';
  const normalized = String(value).trim();
  return normalized || null;
}

export function SmartRaceCard({
  item,
  variant = 'global',
  isEnrolled,
  isNextRace = false,
  isPastRace: isPastRaceProp = false,
  ctl = null,
  onDelete,
  onPress,
  styles,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { showToast } = useToast();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isPastRace = isPastRaceUtil(item) || isPastRaceProp;
  const isPastAndNotEnrolled = isPastRace && !isEnrolled;
  const isCompactCard = screenWidth < 380;
  const isWideCard = screenWidth >= 430;
  const mediaSize = isCompactCard ? 98 : isWideCard ? 132 : 120;
  const mediaRadius = isCompactCard ? 14 : 16;
  const cardPadding = isCompactCard ? 10 : isWideCard ? 14 : 12;
  const mapButtonSize = isCompactCard ? 32 : 36;
  const titleSize = isCompactCard ? 16 : isWideCard ? 19 : 18;
  const titleLineHeight = isCompactCard ? 20 : isWideCard ? 23 : 22;
  const titleLines = isCompactCard ? 2 : isWideCard ? 3 : 2;
  const telemetryMinWidth = isCompactCard ? 56 : isWideCard ? 68 : 62;

  const hasImage = false;

  const isFinalizada = item.estado === 'Finalizada';
  const isGlobal = variant === 'global';
  const idInscripcion = item.id ?? item.inscripcion_id;
  const circuitoNombre = item.circuito_nombre?.trim();
  const inscriptionCategory = getInscriptionCategory(item);
  const hasPosicion = item.posicion != null && Number.isFinite(Number(item.posicion));
  const hasStoredResult = hasPosicion || !!(item.resultado?.trim()) || !!(item.notas?.trim());
  const eventContext = getEventContext(item);
  const EventIcon = eventContext.icon;
  const hasMap = !!item.latitud && !!item.longitud;
  const formattedDate = formatDateRange(item.fecha_inicio, item.fecha_fin);
  const locationLabel = item.ciudad
    ? `${item.ciudad}${item.pais ? `, ${item.pais}` : ''}`
    : (item.pais || '');

  const showRightBadge = hasTiempoBadgeContent({
    isPastRace,
    isNextRace,
    estado: item.estado ?? 'Programada',
    fechaInicio: item.fecha_inicio,
    isEnrolled,
  });

  const readiness = computeXerpaReadinessPct(ctl, item.tss_estimado);
  const stats = [];
  if (isPastRace && hasPosicion) {
    stats.unshift({ value: `🏆 ${item.posicion}`, label: 'PUESTO' });
  }
  if (item.tipo_deporte != null && String(item.tipo_deporte).trim() !== '') {
    stats.push({ value: String(item.tipo_deporte).trim(), label: 'MODALIDAD' });
  }
  if (item.distancia_km != null && item.distancia_km !== '') {
    stats.push({ value: String(item.distancia_km), label: 'KM' });
  }
  if (item.desnivel_m != null && item.desnivel_m !== '') {
    stats.push({ value: String(item.desnivel_m), label: 'm D+' });
  }
  if (readiness != null) {
    stats.push({ value: `${readiness}%`, label: 'PREPARACIÓN' });
  } else if (item.nivel_dificultad != null && item.nivel_dificultad !== '') {
    const n = Number(item.nivel_dificultad);
    const label = DIFICULTAD_LABELS[n] || `Nivel ${n}`;
    stats.push({ value: label, label: 'DIFICULTAD' });
  }
  const visibleStats = stats.slice(0, 4);

  async function handleDelete() {
    if (!idInscripcion || !onDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete(idInscripcion);
      setShowConfirmDelete(false);
    } catch (e) {
      showXerpaError(e, 'RACE-DEL-02', showToast);
    } finally {
      setDeleteLoading(false);
    }
  }

  const handleOpenMap = (e) => {
    e?.stopPropagation();
    const latLng = `${item.latitud},${item.longitud}`;
    const label = item.ciudad || item.nombre;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    if (!url) return;
    Linking.openURL(url).catch(() => console.log('Error abriendo mapa'));
  };

  const cardContainerStyle = [
    styles.cardImmersive,
    { padding: cardPadding },
    isPastRace && styles.cardPastRace,
    isPastAndNotEnrolled && styles.cardPastRaceClosed,
    isNextRace && styles.cardNextRace,
    !isNextRace && !isPastRace && isFinalizada && { opacity: 0.85 },
    !hasImage && styles.cardImmersiveCompact,
  ];

  const contentContainerStyle = styles.catalogContent;

  const cardContent = (
    <View style={cardContainerStyle}>
      <View style={styles.catalogRow}>
        <View style={contentContainerStyle}>
          <View style={styles.cardHeaderTop}>
            <View style={styles.cardHeaderMain}>
              {!!circuitoNombre && (
                <Text style={styles.cardCircuitoNombre} numberOfLines={isWideCard ? 2 : 1}>
                  {circuitoNombre}
                </Text>
              )}
              {!!eventContext?.label && (
                <Text style={styles.cardEventContext} numberOfLines={1}>
                  {eventContext.label}
                </Text>
              )}
              {!hasImage ? (
                <View style={styles.cardTitleWithIconRow}>
                  <EventIcon
                    size={isCompactCard ? 14 : 16}
                    color="#00D2FF"
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.cardTitleImmersive,
                      styles.cardTitleWithIconText,
                      { fontSize: titleSize, lineHeight: titleLineHeight },
                    ]}
                    numberOfLines={titleLines}
                  >
                    {item.nombre ?? 'Sin nombre'}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.cardTitleImmersive,
                    { fontSize: titleSize, lineHeight: titleLineHeight },
                  ]}
                  numberOfLines={titleLines}
                >
                  {item.nombre ?? 'Sin nombre'}
                </Text>
              )}
            </View>
            <View style={styles.badgesTopRight}>
              {showRightBadge && (
                <BlurView intensity={30} tint="dark" style={styles.badgeTiempo}>
                  <TiempoBadge
                    isNextRace={isNextRace}
                    isPastRace={isPastRace}
                    hasStoredResult={hasStoredResult}
                    hasPosicion={hasPosicion}
                    fechaInicio={item.fecha_inicio}
                    estado={item.estado ?? 'Programada'}
                    styles={styles}
                  />
                </BlurView>
              )}
            </View>
          </View>

          {!isGlobal && <StatusBadge estado={item.estado} styles={styles} />}

          {!isGlobal && !!inscriptionCategory && (
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryBadgeText} numberOfLines={1}>
                {`Categoría: ${inscriptionCategory}`}
              </Text>
            </View>
          )}

          <View style={styles.cardSubtitleRow}>
            <View style={styles.cardSubtitleLeftCol}>
              <Text style={styles.cardDateText}>
                {formattedDate}
              </Text>
              {!!locationLabel && (
                <Text
                  style={[styles.cardLocationText, isCompactCard && { fontSize: 11 }]}
                  numberOfLines={isWideCard ? 2 : 1}
                >
                  {locationLabel}
                </Text>
              )}
            </View>
            {hasMap && (
              <TouchableOpacity
                onPress={handleOpenMap}
                activeOpacity={0.7}
                style={[
                  styles.mapQuickButton,
                  { width: mapButtonSize, height: mapButtonSize, borderRadius: mapButtonSize / 2 },
                ]}
              >
                <MapPin size={isCompactCard ? 16 : 18} color="#00D2FF" />
              </TouchableOpacity>
            )}
          </View>

          {visibleStats.length > 0 && (
            <View style={styles.telemetryPanel}>
              {visibleStats.map((stat, index) => (
                <View
                  key={`${stat.label}-${index}`}
                  style={[styles.telemetryBlock, { minWidth: telemetryMinWidth }]}
                >
                  <Text style={styles.telemetryValue} numberOfLines={1}>{stat.value}</Text>
                  <Text style={styles.telemetryLabel} numberOfLines={1}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}

          {readiness != null && (
            <XerpaProgress
              progress={readiness}
              style={styles.readinessInCardWrap}
            />
          )}

          {!isGlobal && isFinalizada && item.resultado && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Resultado:</Text>
              <Text style={styles.resultValue}>{item.resultado}</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            {isGlobal && isPastAndNotEnrolled ? (
              <Text style={styles.pastRaceClosedText}>Carrera Finalizada</Text>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { height: isCompactCard ? 34 : 38, borderRadius: isCompactCard ? 17 : 19 },
                  isGlobal && isEnrolled && styles.primaryActionBtnEnrolled,
                ]}
                activeOpacity={0.85}
                onPress={(e) => {
                  e?.stopPropagation();
                  onPress?.(item);
                }}
              >
                <Text style={[
                  styles.primaryActionText,
                  isCompactCard && { fontSize: 11, letterSpacing: 0.5 },
                  isGlobal && isEnrolled && styles.primaryActionTextEnrolled,
                ]}>
                  {isGlobal ? (isEnrolled ? 'INSCRITO' : 'INSCRIBIRME') : 'VER CARRERA'}
                </Text>
              </TouchableOpacity>
            )}

            {!isGlobal ? (
              !!onDelete && !showConfirmDelete && (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtnDanger,
                    {
                      width: isCompactCard ? 34 : 38,
                      height: isCompactCard ? 34 : 38,
                      borderRadius: isCompactCard ? 17 : 19,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={(e) => {
                    e?.stopPropagation();
                    setShowConfirmDelete(true);
                  }}
                >
                  <Trash2 size={isCompactCard ? 14 : 16} color="#FF3B30" />
                </TouchableOpacity>
              )
            ) : !isPastAndNotEnrolled ? (
              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  {
                    width: isCompactCard ? 34 : 38,
                    height: isCompactCard ? 34 : 38,
                    borderRadius: isCompactCard ? 17 : 19,
                  },
                ]}
                activeOpacity={0.8}
                onPress={(e) => {
                  e?.stopPropagation();
                  onPress?.(item);
                }}
              >
                <ExternalLink size={isCompactCard ? 14 : 16} color="#00D2FF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {!isGlobal && onDelete && showConfirmDelete && (
            <View style={styles.unenrollConfirmWrap}>
              <Text style={styles.unenrollConfirmText}>
                {`¿Quitar "${item.nombre ?? 'esta carrera'}" de tu calendario?`}
              </Text>
              <View style={styles.unenrollConfirmRow}>
                <TouchableOpacity
                  style={styles.unenrollConfirmNo}
                  onPress={() => setShowConfirmDelete(false)}
                  disabled={deleteLoading}
                >
                  <Text style={styles.unenrollConfirmNoText}>No, mantener</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.unenrollConfirmYes}
                  onPress={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Skeleton width={20} height={20} borderRadius={10} />
                  ) : (
                    <Text style={styles.unenrollConfirmYesText}>Sí, eliminar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const isTappable = onPress && !showConfirmDelete && !(isGlobal && isPastAndNotEnrolled);
  const Wrapper = isTappable ? TouchableOpacity : View;
  const wrapperProps = isTappable ? { onPress: () => onPress(item), activeOpacity: 0.8 } : {};

  if (isNextRace && styles.cardNextRaceWrapper) {
    return (
      <View style={styles.cardNextRaceWrapper}>
        <Wrapper {...wrapperProps} style={styles.cardWrapper}>
          {cardContent}
        </Wrapper>
      </View>
    );
  }

  return (
    <Wrapper {...wrapperProps} style={styles.cardWrapper}>
      {cardContent}
    </Wrapper>
  );
}
