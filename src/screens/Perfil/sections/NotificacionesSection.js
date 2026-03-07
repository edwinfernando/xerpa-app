/**
 * NotificacionesSection — Preferencias de notificación (tabla preferencias_notificaciones)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

const CANAL_OPTIONS = [
  { value: 'Telegram', label: 'Telegram', icon: 'logo-telegram' },
  { value: 'WhatsApp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { value: 'Email', label: 'Email', icon: 'mail-outline' },
  { value: 'Push', label: 'Push', icon: 'notifications-outline' },
];

export function NotificacionesSection({
  preferencias,
  onGuardar,
  styles,
}) {
  const [telegramId, setTelegramId] = useState('');
  const [canalPrincipal, setCanalPrincipal] = useState('Telegram');
  const [alertasEntrenamiento, setAlertasEntrenamiento] = useState(true);
  const [alertasSistema, setAlertasSistema] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferencias) {
      setTelegramId(preferencias.telegram_id ?? '');
      setCanalPrincipal(preferencias.canal_principal ?? 'Telegram');
      setAlertasEntrenamiento(preferencias.alertas_entrenamiento ?? true);
      setAlertasSistema(preferencias.alertas_sistema ?? true);
    }
  }, [preferencias]);

  async function handleGuardar() {
    setSaving(true);
    try {
      await onGuardar({
        canalPrincipal,
        telegramId: telegramId.trim() || null,
        alertasEntrenamiento,
        alertasSistema,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Preferencias de notificación</Text>

      <Text style={styles.label}>Telegram ID</Text>
      <Input
        value={telegramId}
        onChangeText={setTelegramId}
        placeholder="Ej: @usuario o 123456789"
        autoCapitalize="none"
        style={{ marginBottom: 16 }}
      />

      <Text style={styles.label}>Canal principal</Text>
      <View style={styles.canalRow}>
        {CANAL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.canalPill, canalPrincipal === opt.value && styles.canalPillActive]}
            onPress={() => setCanalPrincipal(opt.value)}
          >
            <Ionicons
              name={opt.icon}
              size={18}
              color={canalPrincipal === opt.value ? '#121212' : '#666'}
            />
            <Text style={[styles.canalPillText, canalPrincipal === opt.value && styles.canalPillTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Alertas de entrenamiento</Text>
        <Switch
          value={alertasEntrenamiento}
          onValueChange={setAlertasEntrenamiento}
          trackColor={{ false: '#333', true: 'rgba(0,240,255,0.5)' }}
          thumbColor={alertasEntrenamiento ? '#00F0FF' : '#666'}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Alertas del sistema</Text>
        <Switch
          value={alertasSistema}
          onValueChange={setAlertasSistema}
          trackColor={{ false: '#333', true: 'rgba(0,240,255,0.5)' }}
          thumbColor={alertasSistema ? '#00F0FF' : '#666'}
        />
      </View>

      <Button
        title="Guardar preferencias"
        variant="primary"
        onPress={handleGuardar}
        loading={saving}
        disabled={saving}
        style={styles.guardarBtn}
      />
    </View>
  );
}
