/**
 * SmartRaceCard — Card de carrera (diseño anterior / simple)
 * - Nombre, fecha, ciudad
 * - Distancia y desnivel D+
 * - Status badge, countdown, inscrito badge
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, MapPin, Mountain, TrendingUp, Trash2 } from 'lucide-react-native';
import { formatDateRange } from '../../../utils/formatDateRange';
import { getRaceAccentColor } from '../../../utils/raceColorByNome';
import { showXerpaError } from '../../../utils/ErrorHandler';

/** Calcula % de preparación para RaceDetailSheet. */
export function computeXerpaReadinessPct(ctl, tssRequerido) {
  if (ctl == null || tssRequerido == null || tssRequerido <= 0) return null;
  const pct = Math.round((ctl / tssRequerido) * 100);
  return Math.min(100, Math.max(0, pct));
}

function getDaysUntil(fechaInicioStr) {
  if (!fechaInicioStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(fechaInicioStr + 'T00:00:00');
  return Math.ceil((race - today) / 86400000);
}

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

export function SmartRaceCard({
  item,
  variant = 'global',
  isEnrolled,
  onDelete,
  onPress,
  styles,
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isActiva = item.estado === 'Activa';
  const isFinalizada = item.estado === 'Finalizada';
  const isGlobal = variant === 'global';
  const baseColor = getRaceAccentColor(item.nombre);
  const accentColor = isFinalizada ? '#2A2A2A' : baseColor;
  const hasMetrics = item.distancia_km != null || item.desnivel_m != null;
  const idInscripcion = item.id ?? item.inscripcion_id;

  async function handleDelete() {
    if (!idInscripcion || !onDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete(idInscripcion);
      setShowConfirmDelete(false);
    } catch (e) {
      showXerpaError(e, 'RACE-DEL-02');
    } finally {
      setDeleteLoading(false);
    }
  }

  const cardContent = (
    <View style={[styles.cardContent, { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
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
          {isGlobal ? null : onDelete && !showConfirmDelete && (
            <TouchableOpacity
              onPress={() => setShowConfirmDelete(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ padding: 4 }}
            >
              <Trash2 color="#555" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isGlobal && <StatusBadge estado={item.estado} styles={styles} />}

      <View style={[styles.infoRow, { marginTop: 10 }]}>
        <Calendar color="#555" size={13} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextHighlight}>
            {formatDateRange(item.fecha_inicio, item.fecha_fin)}
          </Text>
        </Text>
      </View>

      {!!item.ciudad && (
        <View style={styles.infoRow}>
          <MapPin color="#555" size={13} />
          <Text style={styles.infoText}>{item.ciudad}</Text>
        </View>
      )}

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

      {!isGlobal && isFinalizada && item.resultado && (
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Resultado:</Text>
          <Text style={styles.resultValue}>{item.resultado}</Text>
        </View>
      )}

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
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.unenrollConfirmYesText}>Sí, eliminar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const Wrapper = isGlobal && onPress ? TouchableOpacity : View;
  const wrapperProps = isGlobal && onPress ? { onPress: () => onPress(item), activeOpacity: 0.8 } : {};

  return (
    <Wrapper {...wrapperProps} style={[styles.card, isFinalizada && { opacity: 0.55 }]}>
      {cardContent}
    </Wrapper>
  );
}
