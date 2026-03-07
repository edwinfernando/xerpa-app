/**
 * NotificacionesSheet — BottomSheet de edición: Preferencias y Notificaciones
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';

const CANAL_OPTIONS = [
  { value: 'Telegram', label: 'Telegram', icon: 'logo-telegram' },
  { value: 'WhatsApp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { value: 'Email', label: 'Email', icon: 'mail-outline' },
  { value: 'Push', label: 'Push', icon: 'notifications-outline' },
];

export function NotificacionesSheet({
  visible,
  onClose,
  preferencias,
  onGuardar,
  styles,
}) {
  const [telegramId, setTelegramId] = useState('');
  const [canalPrincipal, setCanalPrincipal] = useState('Telegram');
  const [alertasEntrenamiento, setAlertasEntrenamiento] = useState(true);
  const [alertasSistema, setAlertasSistema] = useState(true);
  const [saving, setSaving] = useState(false);

  const SWIPE_HEADER_HEIGHT = 100;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  useEffect(() => {
    if (preferencias) {
      setTelegramId(preferencias.telegram_id ?? '');
      setCanalPrincipal(preferencias.canal_principal ?? 'Telegram');
      setAlertasEntrenamiento(preferencias.alertas_entrenamiento ?? true);
      setAlertasSistema(preferencias.alertas_sistema ?? true);
    }
  }, [visible, preferencias]);

  async function handleGuardar() {
    setSaving(true);
    try {
      await onGuardar({
        canalPrincipal,
        telegramId: telegramId.trim() || null,
        alertasEntrenamiento,
        alertasSistema,
      });
      onClose();
    } finally {
      setSaving(false);
    }
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
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={[styles.sheetHandle, { backgroundColor: '#E5E5EA' }]} />
          <Text style={styles.sheetTitle}>Preferencias y notificaciones</Text>
          <Text style={styles.sheetSubtitle}>Configura cómo quieres recibir las alertas.</Text>

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
            <Text style={styles.sheetLabel}>Telegram ID</Text>
            <Input
              value={telegramId}
              onChangeText={setTelegramId}
              placeholder="Ej: @usuario o 123456789"
              autoCapitalize="none"
              style={{ marginBottom: 16 }}
            />

            <Text style={styles.sheetLabel}>Canal principal</Text>
            <View style={styles.sheetCanalRow}>
              {CANAL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sheetCanalPill, canalPrincipal === opt.value && styles.sheetCanalPillActive]}
                  onPress={() => setCanalPrincipal(opt.value)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={canalPrincipal === opt.value ? '#121212' : '#666'}
                  />
                  <Text style={[styles.sheetCanalPillText, canalPrincipal === opt.value && styles.sheetCanalPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetSwitchRow}>
              <Text style={styles.sheetSwitchLabel}>Alertas de entrenamiento</Text>
              <Switch
                value={alertasEntrenamiento}
                onValueChange={setAlertasEntrenamiento}
                trackColor={{ false: '#333', true: 'rgba(0,240,255,0.5)' }}
                thumbColor={alertasEntrenamiento ? '#00F0FF' : '#666'}
              />
            </View>
            <View style={styles.sheetSwitchRow}>
              <Text style={styles.sheetSwitchLabel}>Alertas del sistema</Text>
              <Switch
                value={alertasSistema}
                onValueChange={setAlertasSistema}
                trackColor={{ false: '#333', true: 'rgba(0,240,255,0.5)' }}
                thumbColor={alertasSistema ? '#00F0FF' : '#666'}
              />
            </View>

            <View style={styles.sheetActions}>
              <Button
                title="Guardar preferencias"
                variant="solid"
                onPress={handleGuardar}
                loading={saving}
                disabled={saving}
                style={[styles.sheetSaveBtn, { flex: 1 }]}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
