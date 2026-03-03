/**
 * BiometriaSheet — BottomSheet de edición: Información Personal y Biometría
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { theme } from '../../../theme/theme';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ROL_OPTIONS } from '../PerfilStyles';

export function BiometriaSheet({
  visible,
  onClose,
  nombre,
  setNombre,
  nombreError,
  edad,
  setEdad,
  tallaCm,
  setTallaCm,
  pesoKg,
  setPesoKg,
  modalidad,
  setModalidad,
  categoria,
  setCategoria,
  rol,
  setRol,
  onGuardar,
  saving,
  styles,
}) {
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const SWIPE_HEADER_HEIGHT = 100;

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
          <Text style={styles.sheetTitle}>Información personal y biométrica</Text>
          <Text style={styles.sheetSubtitle}>Edita tus datos personales y biométricos.</Text>

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
            <Text style={styles.sheetLabel}>Nombre *</Text>
            <Input
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              error={!!nombreError}
              errorText={nombreError}
              style={{ marginBottom: 16 }}
            />

            <Text style={styles.sheetLabel}>Rol</Text>
            <View style={styles.sheetRolRow}>
              {ROL_OPTIONS.map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.sheetRolPill, rol === opcion && styles.sheetRolPillActive]}
                  onPress={() => setRol(opcion)}
                >
                  <Text style={[styles.sheetRolPillText, rol === opcion && styles.sheetRolPillTextActive]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Edad</Text>
            <Input
              value={edad}
              onChangeText={setEdad}
              placeholder="Ej: 28"
              keyboardType="numeric"
              style={{ marginBottom: 16 }}
            />

            <View style={styles.sheetRow}>
              <View style={styles.sheetRowItem}>
                <Text style={styles.sheetLabel}>Talla (cm)</Text>
                <Input
                  value={tallaCm}
                  onChangeText={setTallaCm}
                  placeholder="175"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                />
              </View>
              <View style={styles.sheetRowItem}>
                <Text style={styles.sheetLabel}>Peso (kg)</Text>
                <Input
                  value={pesoKg}
                  onChangeText={setPesoKg}
                  placeholder="70"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                />
              </View>
            </View>

            <Text style={styles.sheetLabel}>Deporte / Modalidad</Text>
            <Input
              value={modalidad}
              onChangeText={setModalidad}
              placeholder="Ej: Ciclismo, Triatlón"
              style={{ marginBottom: 16 }}
            />

            <Text style={styles.sheetLabel}>Categoría</Text>
            <Input
              value={categoria}
              onChangeText={setCategoria}
              placeholder="Ej: Élite, Masters 35"
              style={{ marginBottom: 16 }}
            />

            <View style={styles.sheetActions}>
              <Button
                title="Guardar cambios"
                variant="solid"
                onPress={onGuardar}
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
