/**
 * BiometriaSheet — BottomSheet de edición: Información Personal y Biometría
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ROL_OPTIONS } from '../PerfilStyles';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../../constants/sheetModalConfig';

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
  const SWIPE_HEADER_HEIGHT = 100;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);
  const insets = useSafeAreaInsets();

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
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
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
            onScroll={onScroll}
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
