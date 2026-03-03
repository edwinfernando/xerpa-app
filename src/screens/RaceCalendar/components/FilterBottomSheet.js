/**
 * FilterBottomSheet — Filtros avanzados en bottom sheet
 * País, Tipo Deporte (MTB, Ruta, Gravel), Nivel de Dificultad (1-5)
 */
import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TIPOS_DEPORTE } from '../useRaceCalendar';

const NIVELES_DIFICULTAD = [
  { value: '', label: 'Todo' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

const SWIPE_HEADER_HEIGHT = 90;

export function FilterBottomSheet({ visible, onClose, filters, setFilter, styles }) {
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const hasActive = filters.pais?.trim() || filters.tipoDeporte?.trim() || filters.nivelDificultad !== '';

  useEffect(() => {
    if (visible) {
      setScrollOffsetY(0);
      scrollOffsetRef.current = 0;
    }
  }, [visible]);

  const propagateSwipe = useCallback((evt) => {
    const locationY = evt?.nativeEvent?.locationY ?? 0;
    return locationY > SWIPE_HEADER_HEIGHT;
  }, []);

  const scrollTo = useCallback((offset) => {
    if (offset && typeof offset.y === 'number') {
      const currentY = scrollOffsetRef.current;
      const newY = Math.max(0, currentY + offset.y);
      scrollViewRef.current?.scrollTo({ y: newY, animated: false });
    }
  }, []);

  function clearAll() {
    setFilter('pais', '');
    setFilter('tipoDeporte', '');
    setFilter('nivelDificultad', '');
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
          <View style={styles.filterSheet}>
          <View style={[styles.sheetHandle, { backgroundColor: '#E5E5EA' }]} />
          <View style={styles.filterSheetHeader}>
            <Text style={styles.sheetTitle}>Filtros</Text>
            {hasActive && (
              <Button
                title="Limpiar"
                variant="ghost"
                size="compact"
                onPress={clearAll}
                style={styles.filterClearBtn}
              />
            )}
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            onScroll={(e) => {
              const currentOffset = e.nativeEvent.contentOffset.y;
              const y = currentOffset < 0 ? 0 : currentOffset;
              setScrollOffsetY(y);
              scrollOffsetRef.current = y;
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.filterSheetContent}>
              <Text style={styles.formLabel}>País</Text>
              <Input
                value={filters.pais}
                onChangeText={(v) => setFilter('pais', v)}
                placeholder="Ej. Colombia, España"
                style={{ marginBottom: 16 }}
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

            <Button
              title="Aplicar"
              variant="solid"
              onPress={onClose}
              style={styles.filterSheetApply}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
