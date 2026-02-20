import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const EMPTY_FORM = { nombre: '', fecha: '', ciudad: '', distancia_km: '', desnivel_m: '' };

// ─────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// RaceCard
// ─────────────────────────────────────────────────────────────
function RaceCard({ item, styles }) {
  const isActiva = item.estado === 'Activa';
  const isFinalizada = item.estado === 'Finalizada';
  const isProgramada = !isActiva && !isFinalizada;

  return (
    <View style={[
      styles.card,
      isActiva && styles.cardActive,
      isProgramada && styles.cardProgramada,
      isFinalizada && styles.cardFinalizada,
    ]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.raceName}>{item.nombre ?? 'Sin nombre'}</Text>
        <StatusBadge estado={item.estado} styles={styles} />
      </View>
      <Text style={styles.raceDate}>
        🗓{'  '}<Text style={styles.raceDateHighlight}>{formatDate(item.fecha)}</Text>
      </Text>
      {item.ciudad ? <Text style={styles.raceCity}>📍{'  '}{item.ciudad}</Text> : null}
      <View style={styles.divider} />
      <View style={styles.metricsRow}>
        {item.distancia_km != null && (
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.distancia_km}</Text>
            <Text style={styles.metricLabel}> km</Text>
          </View>
        )}
        {item.desnivel_m != null && (
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.desnivel_m}</Text>
            <Text style={styles.metricLabel}> m D+</Text>
          </View>
        )}
      </View>
      {isFinalizada && item.resultado ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Resultado:</Text>
          <Text style={styles.resultValue}>{item.resultado}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// AddRaceModal
// ─────────────────────────────────────────────────────────────
function AddRaceModal({ visible, onClose, onSave, styles }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [nombreError, setNombreError] = useState('');
  const [fechaError, setFechaError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'nombre' && nombreError) setNombreError('');
    if (field === 'fecha' && fechaError) setFechaError('');
  }

  function reset() {
    setForm(EMPTY_FORM);
    setNombreError('');
    setFechaError('');
    setSaving(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    let hasError = false;
    if (!form.nombre.trim()) {
      setNombreError('El nombre del evento es obligatorio.');
      hasError = true;
    }
    if (!form.fecha.trim()) {
      setFechaError('La fecha es obligatoria.');
      hasError = true;
    } else if (!DATE_REGEX.test(form.fecha.trim())) {
      setFechaError('Usa el formato AAAA-MM-DD (ej. 2026-10-15).');
      hasError = true;
    }
    if (hasError) return;

    setSaving(true);
    try {
      await onSave(form);
      reset();
      onClose();
    } catch (err) {
      setFechaError(err.message ?? 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Nueva Carrera</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Nombre */}
            <Text style={styles.formLabel}>Nombre del evento *</Text>
            <TextInput
              style={[styles.formInput, nombreError && styles.formInputError]}
              value={form.nombre}
              onChangeText={v => setField('nombre', v)}
              placeholder="Ej. XCO Copa Andalucía"
              placeholderTextColor="#555"
              editable={!saving}
            />
            {nombreError ? <Text style={styles.formHelperText}>{nombreError}</Text> : null}

            {/* Fecha */}
            <Text style={styles.formLabel}>Fecha *</Text>
            <TextInput
              style={[styles.formInput, fechaError && styles.formInputError]}
              value={form.fecha}
              onChangeText={v => setField('fecha', v)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#555"
              keyboardType="numbers-and-punctuation"
              editable={!saving}
            />
            {fechaError ? <Text style={styles.formHelperText}>{fechaError}</Text> : null}

            {/* Ciudad */}
            <Text style={styles.formLabel}>Ciudad</Text>
            <TextInput
              style={styles.formInput}
              value={form.ciudad}
              onChangeText={v => setField('ciudad', v)}
              placeholder="Ej. Granada, España"
              placeholderTextColor="#555"
              editable={!saving}
            />

            {/* Distancia + Desnivel en fila */}
            <View style={styles.formRow}>
              <View style={styles.formRowItem}>
                <Text style={styles.formLabel}>Distancia (km)</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.distancia_km}
                  onChangeText={v => setField('distancia_km', v)}
                  placeholder="Ej. 30"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
              <View style={[styles.formRowItem, { marginLeft: 12 }]}>
                <Text style={styles.formLabel}>Desnivel (m)</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.desnivel_m}
                  onChangeText={v => setField('desnivel_m', v)}
                  placeholder="Ej. 1200"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Acciones */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleClose}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={['#00F0FF', '#39FF14']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.modalSaveGradient}
              >
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#121212" />
                    : <Text style={styles.modalSaveText}>💾 Guardar Carrera</Text>
                  }
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd, styles }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏁</Text>
      <Text style={styles.emptyTitle}>Sin carreras programadas</Text>
      <Text style={styles.emptyText}>
        Aún no tienes carreras en tu calendario.{'\n'}¡Es hora de fijar un objetivo y entrenar para él!
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
        <Text style={styles.emptyButtonText}>+ Añadir Carrera</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// RaceCalendarView (principal)
// ─────────────────────────────────────────────────────────────
export function RaceCalendarView({ races, loading, error, addRace, styles }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Mis Objetivos</Text>
          <Text style={styles.headerTitle}>Calendario de Carreras</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#121212" size={20} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
          <Text style={styles.loadingText}>Cargando carreras...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={races}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <RaceCard item={item} styles={styles} />}
          contentContainerStyle={[styles.list, races.length === 0 && { flex: 1 }]}
          ListEmptyComponent={
            <EmptyState onAdd={() => setModalVisible(true)} styles={styles} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddRaceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addRace}
        styles={styles}
      />
    </SafeAreaView>
  );
}
