/**
 * RaceDetailSheet — Detalle de carrera (diseño anterior Inscripciones)
 * - Nombre, fecha, ciudad, métricas
 * - Botón Inscribirme / Cancelar inscripción
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  MapPin,
  Mountain,
  TrendingUp,
  ExternalLink,
  Trash2,
} from 'lucide-react-native';
import { formatDateRange } from '../../../utils/formatDateRange';
import { showXerpaError } from '../../../utils/ErrorHandler';

export function RaceDetailSheet({
  visible,
  carrera,
  isEnrolled,
  onClose,
  onEnroll,
  onUnenroll,
  styles,
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirmUnenroll, setShowConfirmUnenroll] = useState(false);

  if (!carrera) return null;

  const hasMetrics = carrera.distancia_km != null || carrera.desnivel_m != null;
  const urlInscripcion = carrera.url_inscripcion?.trim();

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
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => (showConfirmUnenroll ? setShowConfirmUnenroll(false) : onClose())}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
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
                <Text style={styles.infoText}>
                  {carrera.ciudad}
                  {!!carrera.pais && ` · ${carrera.pais}`}
                </Text>
              </View>
            )}

            {hasMetrics && (
              <View style={[styles.metricsRow, { marginTop: 12 }]}>
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
              showConfirmUnenroll ? (
                <View style={styles.unenrollConfirmWrap}>
                  <Text style={styles.unenrollConfirmText}>
                    ¿Estás seguro que deseas retirarte de esta carrera?
                  </Text>
                  <View style={styles.unenrollConfirmRow}>
                    <TouchableOpacity
                      style={styles.unenrollConfirmNo}
                      onPress={() => setShowConfirmUnenroll(false)}
                      disabled={loading}
                    >
                      <Text style={styles.unenrollConfirmNoText}>No, mantener</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.unenrollConfirmYes}
                      onPress={handleUnenroll}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.unenrollConfirmYesText}>Sí, retirarme</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.detailCancelBtn}
                  onPress={() => setShowConfirmUnenroll(true)}
                  disabled={loading}
                >
                  <Trash2 color="#ff5252" size={16} />
                  <Text style={styles.detailCancelBtnText}>Cancelar inscripción</Text>
                </TouchableOpacity>
              )
            ) : (
              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.detailEnrollBtn}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  onPress={handleInscribirme}
                  disabled={loading}
                >
                  {urlInscripcion ? (
                    <>
                      <ExternalLink color="#0D0D0D" size={18} />
                      <Text style={styles.modalSaveText}>Inscribirme (web oficial)</Text>
                    </>
                  ) : loading ? (
                    <ActivityIndicator color="#0D0D0D" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Inscribirme</Text>
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
