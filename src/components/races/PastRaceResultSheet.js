/**
 * PastRaceResultSheet — Captura de resultados poscarrera
 *
 * Diseño motivacional + glassmorphism + botones duales (IA vs Manual).
 * - Header motivacional con trofeo
 * - Posición (posicion) y Sensaciones (notas)
 * - Sticky footer: "Contarle a XERPA AI" (navega al chat) y "Guardar Manualmente"
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { Trophy, Sparkles } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '@react-navigation/native';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../constants/sheetModalConfig';
import { theme } from '../../theme/theme';
import { useAdaptiveSheetHeight } from '../../hooks/useAdaptiveSheetHeight';

const INITIAL_FORM = {
  posicion: '',
  notas: '',
};

const SHEET_BG = '#1C1C1E';
const SWIPE_HEADER_HEIGHT = 120;

export function PastRaceResultSheet({
  visible,
  carrera,
  onClose,
  onSaveResult,
}) {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ posicion: '', notas: '' });

  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const insets = useSafeAreaInsets();
  const hasStoredResult = !!(carrera?.posicion != null || carrera?.notas?.trim());
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
    minHeight: 360,
    maxHeightRatio: 0.9,
    minBodyHeight: 180,
  });

  useEffect(() => {
    if (visible && carrera) {
      setForm({
        posicion: carrera.posicion != null ? String(carrera.posicion) : '',
        notas: (carrera.notas || '').trim(),
      });
      setFieldErrors({ posicion: '', notas: '' });
    }
  }, [visible, carrera?.id, carrera?.posicion, carrera?.notas]);

  const clearFieldErrors = () => setFieldErrors({ posicion: '', notas: '' });

  const handleSaveManual = async () => {
    const posicionVal = form.posicion.trim() ? parseInt(form.posicion.trim(), 10) : null;
    const notasVal = form.notas.trim() || null;
    const bothEmpty = posicionVal == null && !notasVal;

    if (bothEmpty) {
      const msg = 'Añade al menos posición o sensaciones para guardar.';
      setFieldErrors({ posicion: msg, notas: msg });
      showToast({ type: 'info', title: 'Sin datos', message: msg });
      return;
    }
    setFieldErrors({ posicion: '', notas: '' });
    setSaving(true);
    try {
      await onSaveResult?.({ posicion: Number.isFinite(posicionVal) ? posicionVal : null, notas: notasVal });
      showToast({ type: 'success', title: 'Guardado', message: 'Resultados guardados correctamente.' });
      setForm(INITIAL_FORM);
      onClose?.();
    } catch (e) {
      showToast({ type: 'error', title: 'Error', message: e?.message ?? 'No se pudieron guardar los resultados.' });
    } finally {
      setSaving(false);
    }
  };

  const handleContarAXerpaAI = () => {
    onClose?.();
    navigation.navigate('XerpaAI', {
      initialContext: carrera
        ? `Acabo de completar la carrera "${carrera.nombre ?? 'Carrera'}". Posición: ${form.posicion || '—'}. Sensaciones: ${form.notas || '—'}`
        : undefined,
    });
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setFieldErrors({ posicion: '', notas: '' });
    onClose?.();
  };

  if (!carrera) return null;

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
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <View
            style={[
              styles.sheetContainer,
              {
                height: computedSheetHeight,
                minHeight: MIN_SHEET_HEIGHT,
                maxHeight: MAX_SHEET_HEIGHT,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View onLayout={onHeaderLayout}>
              <View style={styles.sheetHandle} />

              <View style={styles.header}>
                <Text style={styles.headerTitle}>Resultados de Carrera</Text>
              </View>

              <Text style={styles.carreraNombre} numberOfLines={2}>
                {carrera.nombre ?? 'Carrera'}
              </Text>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={[styles.scroll, { maxHeight: maxBodyHeight }]}
              showsVerticalScrollIndicator={false}
              bounces={shouldScroll}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={shouldScroll}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onContentSizeChange={onBodyContentSizeChange}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.motivationalHeader}>
                <Trophy size={40} color="#FFD700" />
                <Text style={styles.motivationalTitle}>¡El trabajo duro está hecho!</Text>
                <Text style={styles.motivationalSubtitle}>
                  Registra tu resultado para que XERPA AI calibre tu fatiga y planifique tu recuperación.
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label="POSICIÓN FINAL (PUESTO)"
                  value={form.posicion}
                  onChangeText={(v) => {
                    setForm((p) => ({ ...p, posicion: v }));
                    if (fieldErrors.posicion || fieldErrors.notas) clearFieldErrors();
                  }}
                  placeholder="Ej. 15"
                  keyboardType="numeric"
                  variant="glass"
                  error={!!fieldErrors.posicion}
                  errorText={fieldErrors.posicion}
                  containerStyle={styles.inputWrap}
                />
                <Input
                  label="SENSACIONES Y OBJETIVOS"
                  value={form.notas}
                  onChangeText={(v) => {
                    setForm((p) => ({ ...p, notas: v }));
                    if (fieldErrors.posicion || fieldErrors.notas) clearFieldErrors();
                  }}
                  placeholder="¿Cómo respondieron las piernas? ¿Cumpliste tu objetivo?"
                  multiline
                  numberOfLines={4}
                  variant="glass"
                  error={!!fieldErrors.notas}
                  errorText={fieldErrors.notas}
                  containerStyle={[styles.inputWrap, styles.inputSensaciones]}
                  inputStyle={styles.inputSensacionesInner}
                />
              </View>
            </ScrollView>

            <View
              style={styles.stickyFooter}
              onLayout={onFooterLayout}
            >
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleContarAXerpaAI}
                activeOpacity={0.9}
              >
                <Sparkles size={18} color="#000" strokeWidth={2.5} />
                <Text style={styles.btnPrimaryText}>Contarle a XERPA AI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={handleSaveManual}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <Text style={styles.btnSecondaryText}>Guardando…</Text>
                ) : (
                  <Text style={styles.btnSecondaryText}>Guardar Manualmente</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  carreraNombre: {
    color: '#8E8E93',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scroll: {
    flex: 1,
    minHeight: 220,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  motivationalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  motivationalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 12,
  },
  motivationalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    marginBottom: 8,
  },
  inputWrap: {
    marginBottom: 16,
  },
  inputSensaciones: {
    minHeight: 100,
  },
  inputSensacionesInner: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stickyFooter: {
    padding: 20,
    paddingBottom: Math.max(20, theme.SHEET_PADDING_BOTTOM),
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: SHEET_BG,
    gap: 12,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D2FF',
    borderRadius: 14,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#00D2FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  btnPrimaryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    color: '#00D2FF',
    fontSize: 15,
    fontWeight: '600',
  },
});
