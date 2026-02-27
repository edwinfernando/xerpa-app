/**
 * FilterBottomSheet — Filtros avanzados en bottom sheet
 * País, Tipo Deporte (MTB, Ruta, Gravel), Nivel de Dificultad (1-5)
 */
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import { TIPOS_DEPORTE } from '../useRaceCalendar';

const NIVELES_DIFICULTAD = [
  { value: '', label: 'Todo' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

export function FilterBottomSheet({ visible, onClose, filters, setFilter, styles }) {
  const hasActive = filters.pais?.trim() || filters.tipoDeporte?.trim() || filters.nivelDificultad !== '';

  function clearAll() {
    setFilter('pais', '');
    setFilter('tipoDeporte', '');
    setFilter('nivelDificultad', '');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.filterSheetHeader}>
            <Text style={styles.sheetTitle}>Filtros</Text>
            {hasActive && (
              <TouchableOpacity onPress={clearAll} style={styles.filterClearBtn}>
                <Text style={styles.clearFiltersText}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterSheetContent}>
            <Text style={styles.formLabel}>País</Text>
            <TextInput
              style={styles.formInput}
              value={filters.pais}
              onChangeText={(v) => setFilter('pais', v)}
              placeholder="Ej. Colombia, España"
              placeholderTextColor="#444"
            />

            <Text style={styles.formLabel}>Tipo de deporte</Text>
            <View style={styles.filterSelectWrap}>
              {TIPOS_DEPORTE.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterChip, filters.tipoDeporte === t && styles.filterChipActive]}
                  onPress={() => setFilter('tipoDeporte', filters.tipoDeporte === t ? '' : t)}
                >
                  <Text style={[styles.filterChipText, filters.tipoDeporte === t && styles.filterChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Nivel de dificultad</Text>
            <View style={styles.filterSelectWrap}>
              {NIVELES_DIFICULTAD.map(({ value, label }) => (
                <TouchableOpacity
                  key={value || 'all'}
                  style={[styles.filterChip, filters.nivelDificultad === value && styles.filterChipActive]}
                  onPress={() => setFilter('nivelDificultad', value)}
                >
                  <Text style={[styles.filterChipText, filters.nivelDificultad === value && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.filterSheetApply} onPress={onClose}>
            <Text style={styles.filterSheetApplyText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
