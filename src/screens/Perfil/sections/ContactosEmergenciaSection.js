/**
 * ContactosEmergenciaSection — Contactos de emergencia (tabla contactos_emergencia)
 * Confirmación de eliminación vía modal propio (sin Alert nativo).
 * BottomSheet alineado con BiometriaSheet e IntervalsConnectSheet.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { useNavigationBarColor } from '../../../hooks/useNavigationBarColor';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps, getCenteredModalStyle } from '../../../constants/sheetModalConfig';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function ContactosEmergenciaSection({
  contactos,
  onInsert,
  onUpdate,
  onDelete,
  onRefresh,
  showToast,
  styles,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  useNavigationBarColor(modalVisible || !!contactToDelete, '#131313', '#121212');
  const [editingContacto, setEditingContacto] = useState(null);
  const [nombre, setNombre] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefono, setTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const SWIPE_HEADER_HEIGHT = 100;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, modalVisible);
  const insets = useSafeAreaInsets();

  const resetForm = () => {
    setEditingContacto(null);
    setNombre('');
    setParentesco('');
    setTelefono('');
    setError('');
  };

  const openAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (c) => {
    setEditingContacto(c);
    setNombre(c.nombre || '');
    setParentesco(c.parentesco || '');
    setTelefono(c.telefono || '');
    setError('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  async function handleSave() {
    if (!nombre?.trim() || !parentesco?.trim() || !telefono?.trim()) {
      setError('Nombre, parentesco y teléfono son obligatorios.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (editingContacto) {
        await onUpdate({
          contactoId: editingContacto.id,
          nombre: nombre.trim(),
          parentesco: parentesco.trim(),
          telefono: telefono.trim(),
        });
      } else {
        await onInsert({
          nombre: nombre.trim(),
          parentesco: parentesco.trim(),
          telefono: telefono.trim(),
        });
      }
      await onRefresh();
      closeModal();
    } catch (e) {
      setError(e?.message ?? 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  function openConfirmDelete(c) {
    setContactToDelete(c);
  }

  function closeConfirmDelete() {
    if (!deleteLoading) setContactToDelete(null);
  }

  async function confirmDelete() {
    if (!contactToDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete({ contactoId: contactToDelete.id });
      await onRefresh();
      setContactToDelete(null);
    } catch (e) {
      showToast?.({ type: 'error', title: 'Error', message: e?.message ?? 'No se pudo eliminar.' });
    } finally {
      setDeleteLoading(false);
    }
  }

  const list = contactos ?? [];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Contactos de emergencia</Text>

      {list.length === 0 ? (
        <Text style={styles.emptyText}>No tienes contactos de emergencia. Añade al menos uno.</Text>
      ) : (
        list.map((c) => (
          <View key={c.id} style={styles.contactoItem}>
            <View style={styles.contactoContent}>
              <Text style={styles.contactoNombre}>{c.nombre}</Text>
              <Text style={styles.contactoMeta}>
                {c.parentesco} · {c.telefono}
              </Text>
            </View>
            <View style={styles.contactoActions}>
              <TouchableOpacity style={styles.contactoActionBtn} onPress={() => openEdit(c)}>
                <Text style={styles.contactoActionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactoActionBtn, styles.contactoActionBtnDanger]} onPress={() => openConfirmDelete(c)}>
                <Text style={[styles.contactoActionText, styles.contactoActionTextDanger]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.addContactoBtn} onPress={openAdd}>
        <Text style={styles.addContactoText}>Añadir nuevo contacto</Text>
      </TouchableOpacity>

      {/* Modal Add/Edit — estilo unificado con BiometriaSheet */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        onSwipeComplete={closeModal}
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
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingContacto ? 'Editar contacto' : 'Contacto de emergencia'}
            </Text>
            <Text style={styles.sheetSubtitle}>
              {editingContacto ? 'Modifica los datos del contacto.' : 'Añade un contacto para situaciones de emergencia.'}
            </Text>

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
                placeholder="Ej: María García"
                style={{ marginBottom: 16 }}
              />

              <Text style={styles.sheetLabel}>Parentesco *</Text>
              <Input
                value={parentesco}
                onChangeText={setParentesco}
                placeholder="Ej: Madre, Padre, Pareja"
                style={{ marginBottom: 16 }}
              />

              <Text style={styles.sheetLabel}>Teléfono *</Text>
              <Input
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ej: +34 612 345 678"
                keyboardType="phone-pad"
                error={!!error}
                errorText={error}
                style={{ marginBottom: 16 }}
              />

              <View style={styles.sheetActions}>
                <Button
                  title="Guardar"
                  variant="solid"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  style={[styles.sheetSaveBtn, { flex: 1 }]}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal
        isVisible={!!contactToDelete}
        onBackdropPress={closeConfirmDelete}
        onBackButtonPress={closeConfirmDelete}
        avoidKeyboard
        backdropOpacity={0.6}
        style={[confirmStyles.modal, getCenteredModalStyle()]}
        {...getSheetModalProps()}
      >
        <View style={confirmStyles.box}>
          <Text style={confirmStyles.title}>Eliminar contacto</Text>
          <Text style={confirmStyles.message}>
            {contactToDelete
              ? `¿Eliminar a ${contactToDelete.nombre} de tus contactos de emergencia?`
              : ''}
          </Text>
          <View style={confirmStyles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={closeConfirmDelete}
              disabled={deleteLoading}
              style={confirmStyles.cancelBtn}
            />
            <Button
              title="Eliminar"
              variant="solid"
              onPress={confirmDelete}
              loading={deleteLoading}
              disabled={deleteLoading}
              style={[confirmStyles.dangerBtn, { backgroundColor: '#b00020' }]}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const confirmStyles = StyleSheet.create({
  modal: { justifyContent: 'center', alignItems: 'center', margin: 24 },
  box: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.3)',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  message: { fontSize: 15, color: '#aaa', marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1 },
  dangerBtn: { flex: 1 },
});
