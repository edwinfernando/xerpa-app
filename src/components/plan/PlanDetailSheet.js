/**
 * PlanDetailSheet — Detalle completo del entreno del plan
 * Muestra: tipo, título, fecha, hora, punto encuentro, duración, TSS,
 * instrucciones, origen (IA/Entrenador), estado, feedback y CTA Iniciar.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getTypeConfig } from '../../utils/workoutTypeConfig';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../constants/sheetModalConfig';
import { formatDuracion } from '../../utils/formatDuracion';

const DAY_NAMES = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
};
const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

const SWIPE_HEADER_HEIGHT = 120;

export function PlanDetailSheet({
  visible,
  workout,
  dateStr,
  onClose,
  onSaveFeedback,
  onStartWorkout,
  showToast,
  styles,
}) {
  const [completing, setCompleting] = useState(false);
  const [notaAtleta, setNotaAtleta] = useState('');

  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const insets = useSafeAreaInsets();
  if (!workout) return null;

  const { icon, color } = getTypeConfig(workout.tipo);
  const duracion = formatDuracion(workout.duracion_min);
  const isRestDay = (workout.tipo || '').toLowerCase().includes('rest') || (workout.titulo || '').toLowerCase().includes('descanso');

  const origenBadge = workout.is_generado_ia
    ? { label: 'Generado por XERPA COACH (IA)', icon: 'sparkles' }
    : workout.entrenador_id
      ? { label: 'Asignado por Entrenador', icon: 'person' }
      : null;

  async function handleGuardarFeedback() {
    setCompleting(true);
    try {
      await onSaveFeedback(workout.id, notaAtleta);
      onClose();
    } catch (e) {
      showToast?.({ type: 'error', title: 'Error de XERPA', message: e?.message ?? 'No se pudo guardar el feedback.' });
    } finally {
      setCompleting(false);
    }
  }

  function handleIniciar() {
    onClose();
    onStartWorkout?.(workout);
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
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
      <View style={styles.detailModalContainer}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.detailSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.detailHandle} />

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {/* Icono grande + pill tipo */}
            <View style={styles.detailIconRow}>
              <View style={[
                styles.detailIconWrap,
                { backgroundColor: color + '18', borderColor: color + '44' },
              ]}>
                <MaterialCommunityIcons name={icon} size={42} color={color} />
              </View>
              {!!workout.tipo && (
                <View style={[
                  styles.detailTypePill,
                  { borderColor: color + '50', backgroundColor: color + '14' },
                ]}>
                  <Text style={[styles.detailTypePillText, { color }]}>
                    {workout.tipo}
                  </Text>
                </View>
              )}
            </View>

            {/* Título */}
            <Text style={styles.detailTitle}>{workout.titulo ?? 'Entrenamiento'}</Text>

            {/* Fecha */}
            {!!dateStr && (
              <Text style={styles.detailDate}>{formatDateLabel(dateStr)}</Text>
            )}

            {/* Hora y punto encuentro */}
            {(workout.hora || workout.punto_encuentro) && (
              <View style={styles.detailHoraPuntoRow}>
                {workout.hora && (
                  <View style={styles.detailHoraPuntoItem}>
                    <Ionicons name="alarm-outline" size={16} color="#00F0FF" />
                    <Text style={styles.detailHoraPuntoText}>{workout.hora}</Text>
                  </View>
                )}
                {workout.punto_encuentro && (
                  <View style={styles.detailHoraPuntoItem}>
                    <Ionicons name="location-outline" size={16} color="#00F0FF" />
                    <Text style={styles.detailHoraPuntoText} numberOfLines={2}>{workout.punto_encuentro}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Badge de origen (IA / Entrenador) */}
            {origenBadge && (
              <View style={[styles.detailOrigenBadge, styles.detailOrigenBadgeIa]}>
                <Ionicons name={origenBadge.icon} size={14} color="#00F0FF" />
                <Text style={styles.detailOrigenBadgeText}>{origenBadge.label}</Text>
              </View>
            )}

            {/* Badge de estado */}
            <View style={styles.detailStatusRow}>
              <View style={[
                styles.detailStatusBadge,
                workout.completado ? styles.detailStatusCompleted : styles.detailStatusPending,
              ]}>
                <Ionicons
                  name={workout.completado ? 'checkmark-circle' : 'time-outline'}
                  size={13}
                  color={workout.completado ? '#39FF14' : '#ff9800'}
                />
                <Text style={[
                  styles.detailStatusText,
                  workout.completado ? styles.detailStatusTextCompleted : styles.detailStatusTextPending,
                ]}>
                  {workout.completado ? 'Completado' : 'Pendiente'}
                </Text>
              </View>
            </View>

            {/* Métricas */}
            {(duracion || workout.tss_plan != null) && !isRestDay && (
              <View style={styles.detailMetricsRow}>
                {duracion && (
                  <View style={styles.detailMetricBox}>
                    <Text style={[styles.detailMetricValue, { color: '#00F0FF' }]}>
                      {duracion}
                    </Text>
                    <Text style={styles.detailMetricLabel}>Duración</Text>
                  </View>
                )}
                {workout.tss_plan != null && workout.tss_plan > 0 && (
                  <View style={styles.detailMetricBox}>
                    <Text style={[styles.detailMetricValue, { color: '#39FF14' }]}>
                      {workout.tss_plan}
                    </Text>
                    <Text style={styles.detailMetricLabel}>TSS Plan</Text>
                  </View>
                )}
              </View>
            )}

            {/* Descripción / Instrucciones */}
            {!!workout.detalle && (
              <>
                <View style={styles.detailDivider} />
                <Text style={styles.detailSectionLabel}>Instrucciones del Entreno</Text>
                <Text style={styles.detailText}>{workout.detalle}</Text>
              </>
            )}

            {/* Tus sensaciones (si completado) */}
            {workout.completado && !!workout.nota_atleta && (
              <>
                <View style={styles.detailDivider} />
                <Text style={styles.detailSectionLabel}>Tus sensaciones</Text>
                <Text style={styles.detailText}>{workout.nota_atleta}</Text>
              </>
            )}

            {/* Formulario feedback (solo si no completado y tiene id) */}
            {!workout.completado && workout.id && (
              <>
                <View style={styles.detailDivider} />
                <Text style={styles.detailSectionLabel}>¿Cómo te sentiste? (opcional)</Text>
                <Input
                  value={notaAtleta}
                  onChangeText={setNotaAtleta}
                  placeholder="Escribe tus sensaciones del entreno..."
                  multiline
                  numberOfLines={3}
                  style={styles.detailFeedbackInput}
                />
              </>
            )}

            {/* Acciones */}
            <View style={[styles.detailActions, { flexWrap: 'wrap' }]}>
              <Button
                title="Cerrar"
                variant="secondary"
                onPress={onClose}
                style={styles.detailCloseBtn}
              />
              {workout.completado ? (
                <View style={styles.detailAlreadyDone}>
                  <Ionicons name="checkmark-circle" size={15} color="#39FF1477" />
                  <Text style={styles.detailAlreadyDoneText}>Ya completado</Text>
                </View>
              ) : (
                <>
                  {!isRestDay && onStartWorkout && (
                    <Button
                      title="Iniciar Entreno"
                      variant="solid"
                      onPress={handleIniciar}
                      style={styles.detailCompleteGradient}
                    />
                  )}
                  {workout.id && (
                    <Button
                      title="Guardar Feedback"
                      variant="solid"
                      onPress={handleGuardarFeedback}
                      loading={completing}
                      disabled={completing}
                      style={styles.detailCompleteGradient}
                    />
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
