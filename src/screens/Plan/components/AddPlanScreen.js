/**
 * AddPlanScreen — Pantalla para añadir entrenamiento manual al plan
 *
 * - Formulario completo con DateTimePicker nativo para fecha
 * - Selector de tipo (Ride, Run, Strength, etc)
 * - Campos: título, hora, punto_encuentro, duración, TSS, notas
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { showXerpaError } from '../../../utils/ErrorHandler';

const TIPO_OPTIONS = ['Ride', 'Run', 'Strength', 'Rest', 'Walk', 'Other'];

function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(date) {
  if (!date) return 'Seleccionar fecha';
  const d = date instanceof Date ? date : new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'Seleccionar fecha';
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function AddPlanScreen({ onSave, onSaved, showToast, styles, navigation }) {
  const today = new Date();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipo, setTipo] = useState('Ride');
  const [duracion, setDuracion] = useState('');
  const [tss, setTss] = useState('');
  const [hora, setHora] = useState('');
  const [punto_encuentro, setPuntoEncuentro] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tituloError, setTituloError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDateChange = (evt, selected) => {
    if (evt?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setFecha(selected);
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      setTituloError('El título es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        titulo: titulo.trim(),
        fecha: formatDateForInput(fecha),
        tipo,
        duracion_min: duracion,
        tss_plan: tss,
        hora: hora.trim(),
        punto_encuentro: punto_encuentro.trim(),
        detalle,
      });
      showToast?.({ type: 'success', title: '¡Listo! 💪', message: 'Entrenamiento añadido al plan.' });
      onSaved?.();
    } catch (e) {
      showXerpaError(e, 'PLAN-ADD-01', showToast);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.manualLabel}>Título *</Text>
          <Input
            value={titulo}
            onChangeText={(t) => { setTitulo(t); if (tituloError) setTituloError(''); }}
            placeholder="Ej. Rodada zona 2 + fartlek"
            error={!!tituloError}
            errorText={tituloError}
            style={{ marginBottom: 16 }}
          />

          <Text style={styles.manualLabel}>Tipo</Text>
          <View style={styles.tipoPills}>
            {TIPO_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tipoPill, tipo === t && styles.tipoPillActive]}
                onPress={() => setTipo(t)}
              >
                <Text style={[styles.tipoPillText, tipo === t && styles.tipoPillTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.manualLabel}>Fecha</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.manualDateTrigger}
            activeOpacity={0.85}
          >
            <Calendar color="#00D2FF" size={16} />
            <Text style={styles.manualDateTriggerText}>
              {formatDateLabel(fecha)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={{ backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 12, marginBottom: 12 }}>
              <DateTimePicker
                value={fecha}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                minimumDate={getTodayStart()}
                maximumDate={new Date(2030, 11, 31)}
                locale="es-ES"
                themeVariant="dark"
              />
            </View>
          )}
          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={getTodayStart()}
              maximumDate={new Date(2030, 11, 31)}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={{ color: '#00D2FF', fontWeight: '700' }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.manualRow}>
            <View style={styles.manualRowItem}>
              <Text style={styles.manualLabel}>Hora</Text>
              <Input
                value={hora}
                onChangeText={setHora}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                style={{ marginBottom: 16 }}
              />
            </View>
            <View style={styles.manualRowItem}>
              <Text style={styles.manualLabel}>Punto de encuentro</Text>
              <Input
                value={punto_encuentro}
                onChangeText={setPuntoEncuentro}
                placeholder="Ej. Parque Central"
                style={{ marginBottom: 16 }}
              />
            </View>
          </View>

          <View style={styles.manualRow}>
            <View style={styles.manualRowItem}>
              <Text style={styles.manualLabel}>Duración (min)</Text>
              <Input
                value={duracion}
                onChangeText={setDuracion}
                placeholder="90"
                keyboardType="numeric"
                style={{ marginBottom: 16 }}
              />
            </View>
            <View style={styles.manualRowItem}>
              <Text style={styles.manualLabel}>TSS</Text>
              <Input
                value={tss}
                onChangeText={setTss}
                placeholder="80"
                keyboardType="numeric"
                style={{ marginBottom: 16 }}
              />
            </View>
          </View>

          <Text style={styles.manualLabel}>Notas / Detalle</Text>
          <Input
            value={detalle}
            onChangeText={setDetalle}
            placeholder="Descripción del entrenamiento..."
            multiline
            numberOfLines={3}
            style={{ marginBottom: 24 }}
          />

          <Button
            title="Guardar Entreno"
            variant="solid"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={[styles.manualSaveBtn, { flex: 1 }]}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
