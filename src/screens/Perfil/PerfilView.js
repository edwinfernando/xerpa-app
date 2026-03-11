/**
 * PerfilView — Dashboard de Identidad Estático con edición modular vía BottomSheets
 *
 * Arquitectura:
 * 1. Hero: Avatar circular, Nombre, Email, botón Editar → BiometriaSheet
 * 2. Social ID Card: ID XERPA (estilo tarjeta crédito/licencia) → Copiar/Compartir
 * 3. Cards estáticas: Biometría, Notificaciones, Contactos, Integraciones, Entrenador
 * 4. BottomSheets: BiometriaSheet, NotificacionesSheet (preferencias_notificaciones)
 * Toda data de notificaciones viene de profileData.preferencias (no usuarios).
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CollapsibleHeader } from '../../components/CollapsibleHeader';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogOut, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { AnimatedActionButton } from '../../components/ui/AnimatedActionButton';
import { UserIdCard } from './sections/UserIdCard';
import { BiometriaDashboardCard } from './sections/BiometriaDashboardCard';
import { NotificacionesDashboardCard } from './sections/NotificacionesDashboardCard';
import { ContactosEmergenciaSection } from './sections/ContactosEmergenciaSection';
import { IntegracionesSection } from './sections/IntegracionesSection';
import { EntrenadorSection } from './sections/EntrenadorSection';
import { BiometriaSheet } from './sheets/BiometriaSheet';
import { NotificacionesSheet } from './sheets/NotificacionesSheet';
import { IntervalsConnectSheet } from './sheets/IntervalsConnectSheet';
import { EntrenadorPreviewSheet } from './sheets/EntrenadorPreviewSheet';
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps, getCenteredModalStyle } from '../../constants/sheetModalConfig';

// ─────────────────────────────────────────────────────────────
// Change Password Bottom Sheet — Estilo unificado con BiometriaSheet
// ─────────────────────────────────────────────────────────────
function ChangePasswordSheet({
  visible,
  onClose,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  isUpdating,
  onSave,
  styles,
}) {
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const SWIPE_HEADER_HEIGHT = 100;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const insets = useSafeAreaInsets();
  const eyeBtnStyle = { paddingHorizontal: 14, paddingVertical: 14 };

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
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Cambiar contraseña</Text>
          <Text style={styles.sheetSubtitle}>
            Tu nueva contraseña debe tener al menos 6 caracteres.
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
            <Text style={styles.sheetLabel}>Nueva contraseña *</Text>
            <Input
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry={!showNew}
              autoCapitalize="none"
              error={!!passwordError}
              rightAccessory={
                <TouchableOpacity style={eyeBtnStyle} onPress={() => setShowNew((v) => !v)}>
                  {showNew ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
                </TouchableOpacity>
              }
              style={{ marginBottom: 16 }}
            />

            <Text style={styles.sheetLabel}>Confirmar contraseña *</Text>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              error={!!passwordError}
              errorText={passwordError}
              rightAccessory={
                <TouchableOpacity style={eyeBtnStyle} onPress={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
                </TouchableOpacity>
              }
              style={{ marginBottom: 16 }}
            />

            <View style={styles.sheetActions}>
              <Button
                title="Guardar cambios"
                variant="solid"
                onPress={onSave}
                loading={isUpdating}
                disabled={isUpdating}
                style={[styles.sheetSaveBtn, { flex: 1 }]}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// PerfilView (raíz)
// ─────────────────────────────────────────────────────────────
export function PerfilView({
  profileData,
  loading,
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
  email,
  isSavingPerfil,
  handleGuardarBiometria,
  handleGuardarPreferencias,
  handleInsertContacto,
  handleUpdateContacto,
  handleDeleteContacto,
  handleLogout,
  handleStravaAuthSuccess,
  handleVincularIntervalos,
  codigoVinculacion,
  handlePlatformPress,
  handleDisconnect,
  handleCloseDisconnectModal,
  handleConfirmDisconnect,
  platformToDisconnect,
  disconnectingPlatform,
  handleCopyCodigo,
  handleShareCodigo,
  showIntervalosSheet,
  idExterno,
  setIdExterno,
  apiKeyIntervalos,
  setApiKeyIntervalos,
  intervalosError,
  isSavingIntervalos,
  handleCerrarIntervalosSheet,
  handleGuardarIntervalos,
  codigoIngresado,
  handleCodigoIngresadoChange,
  handleBuscarCodigo,
  previewVinculado,
  buscarLoading,
  onClosePreview,
  onConfirmVinculacion,
  vincularLoading,
  vincularError,
  relacionesEntrenadores,
  relacionesTutores,
  relacionToDesvincular,
  onDesvincular,
  onCloseDesvincularModal,
  onConfirmDesvincular,
  desvincularLoading,
  showPasswordSheet,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  isUpdatingPassword,
  handleAbrirCambioContrasena,
  handleCerrarCambioContrasena,
  handleGuardarContrasena,
  refreshUserData,
  showBiometriaSheet,
  showNotificacionesSheet,
  handleOpenBiometriaSheet,
  handleCloseBiometriaSheet,
  handleOpenNotificacionesSheet,
  handleCloseNotificacionesSheet,
  showToast,
  styles,
}) {
  const { scrollHandler, HEADER_MAX_HEIGHT, interpolations, insets } = useCollapsibleHeader({ compact: true });
  const displayNombre = profileData?.nombre || nombre;
  const scrollRef = useRef(null);
  const [vinculacionSectionY, setVinculacionSectionY] = useState(0);

  const handleCodigoInputFocus = useCallback(() => {
    const offset = Math.max(0, vinculacionSectionY - 60);
    const scroll = scrollRef.current?.scrollTo ? scrollRef.current : scrollRef.current?.getNode?.();
    scroll?.scrollTo?.({ y: offset, animated: true });
  }, [vinculacionSectionY]);

  const isAnySheetVisible = showBiometriaSheet || showNotificacionesSheet || showIntervalosSheet || showPasswordSheet || !!platformToDisconnect || !!previewVinculado || !!relacionToDesvincular;
  useNavigationBarColor(isAnySheetVisible, '#131313', '#121212');

  return (
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <CollapsibleHeader
        editorialLabel={displayNombre || email || '—'}
        editorialTitle="Perfil"
        smallTitle="Perfil"
        rightAction={
          <AnimatedActionButton
            label="Editar"
            icon={<Ionicons name="pencil-outline" size={20} color="#00D2FF" />}
            onPress={handleOpenBiometriaSheet}
            interpolations={interpolations}
          />
        }
        interpolations={interpolations}
        insets={insets}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0}
      >
      <Animated.ScrollView
        ref={scrollRef}
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Social ID Card (tarjeta crédito / licencia deportiva) */}
        <UserIdCard
          codigo={codigoVinculacion}
          onCopy={handleCopyCodigo}
          onShare={handleShareCodigo}
          styles={styles}
        />

        {/* 3. Card Biometría (estática, label + valor técnico) */}
        <BiometriaDashboardCard profileData={profileData} styles={styles} />

        {/* 4. Card Notificaciones (estática, preferencias_notificaciones, Editar → Sheet) */}
        <NotificacionesDashboardCard
          preferencias={profileData?.preferencias}
          onEditar={handleOpenNotificacionesSheet}
          styles={styles}
        />

        {/* 5. Contactos de emergencia (estática + Modal Añadir/Editar) */}
        <ContactosEmergenciaSection
          contactos={profileData?.contactosEmergencia}
          onInsert={handleInsertContacto}
          onUpdate={handleUpdateContacto}
          onDelete={handleDeleteContacto}
          onRefresh={refreshUserData}
          showToast={showToast}
          styles={styles}
        />

        {/* 6. Conexiones de Datos (Strava, Intervals.icu) */}
        <IntegracionesSection
          integraciones={profileData?.integraciones}
          onPlatformPress={handlePlatformPress}
          onStravaAuthSuccess={handleStravaAuthSuccess}
          onDisconnect={handleDisconnect}
          disconnectingPlatform={disconnectingPlatform}
          showToast={showToast}
          styles={styles}
        />

        {/* 7. Mi entrenador / Vinculación (relaciones_usuarios) */}
        <View onLayout={(e) => setVinculacionSectionY(e.nativeEvent.layout.y)}>
        <EntrenadorSection
          rol={rol}
          relacionesEntrenadores={relacionesEntrenadores}
          relacionesTutores={relacionesTutores}
          codigoIngresado={codigoIngresado}
          onCodigoIngresadoChange={handleCodigoIngresadoChange}
          onCodigoInputFocus={handleCodigoInputFocus}
          onBuscarCodigo={handleBuscarCodigo}
          previewVinculado={previewVinculado}
          buscarLoading={buscarLoading}
          onClosePreview={onClosePreview}
          onConfirmVinculacion={onConfirmVinculacion}
          vincularLoading={vincularLoading}
          vincularError={vincularError}
          relacionToDesvincular={relacionToDesvincular}
          onDesvincular={onDesvincular}
          onCloseDesvincularModal={onCloseDesvincularModal}
          onConfirmDesvincular={onConfirmDesvincular}
          desvincularLoading={desvincularLoading}
          styles={styles}
        />
        </View>

        {/* 8. Seguridad */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecurity]}
            onPress={handleAbrirCambioContrasena}
          >
            <ShieldCheck color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* 9. Cerrar sesión */}
        <TouchableOpacity
          style={[styles.button, styles.buttonLogout]}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut color="#ff5252" size={22} />
          <Text style={[styles.buttonText, styles.buttonLogoutText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* BottomSheets: edición delegada (handlers en usePerfil, refreshUserData tras guardar) */}
      <BiometriaSheet
        visible={showBiometriaSheet}
        onClose={handleCloseBiometriaSheet}
        nombre={nombre}
        setNombre={setNombre}
        nombreError={nombreError}
        edad={edad}
        setEdad={setEdad}
        tallaCm={tallaCm}
        setTallaCm={setTallaCm}
        pesoKg={pesoKg}
        setPesoKg={setPesoKg}
        modalidad={modalidad}
        setModalidad={setModalidad}
        categoria={categoria}
        setCategoria={setCategoria}
        rol={rol}
        setRol={setRol}
        onGuardar={handleGuardarBiometria}
        saving={isSavingPerfil}
        styles={styles}
      />

      <NotificacionesSheet
        visible={showNotificacionesSheet}
        onClose={handleCloseNotificacionesSheet}
        preferencias={profileData?.preferencias}
        onGuardar={handleGuardarPreferencias}
        styles={styles}
      />

      {/* Modals */}
      <IntervalsConnectSheet
        visible={showIntervalosSheet}
        onClose={handleCerrarIntervalosSheet}
        idExterno={idExterno}
        setIdExterno={setIdExterno}
        apiKeyIntervalos={apiKeyIntervalos}
        setApiKeyIntervalos={setApiKeyIntervalos}
        error={intervalosError}
        isSaving={isSavingIntervalos}
        onSave={handleGuardarIntervalos}
      />

      <ChangePasswordSheet
        visible={showPasswordSheet}
        onClose={handleCerrarCambioContrasena}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordError={passwordError}
        isUpdating={isUpdatingPassword}
        onSave={handleGuardarContrasena}
        styles={styles}
      />

      {/* Modal confirmar desvincular (estilo XERPA) */}
      <Modal
        isVisible={!!platformToDisconnect}
        onBackdropPress={handleCloseDisconnectModal}
        onBackButtonPress={handleCloseDisconnectModal}
        avoidKeyboard
        backdropOpacity={0.6}
        style={[confirmModalStyles.modal, getCenteredModalStyle()]}
        {...getSheetModalProps()}
      >
        <View style={confirmModalStyles.box}>
          <Text style={confirmModalStyles.title}>Desvincular</Text>
          <Text style={confirmModalStyles.message}>
            {platformToDisconnect === 'strava' && '¿Desvincular Strava? Perderás el acceso a tus datos de entrenamiento recientes.'}
            {platformToDisconnect === 'intervals' && '¿Desvincular Intervals.icu? Perderás el acceso a tus datos de entrenamiento recientes.'}
          </Text>
          <View style={confirmModalStyles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={handleCloseDisconnectModal}
              disabled={!!disconnectingPlatform}
              style={confirmModalStyles.cancelBtn}
            />
            <Button
              title="Desvincular"
              variant="danger"
              onPress={handleConfirmDisconnect}
              loading={!!disconnectingPlatform}
              disabled={!!disconnectingPlatform}
              style={confirmModalStyles.dangerBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet: preview entrenador/tutor al buscar por código */}
      <EntrenadorPreviewSheet
        visible={!!previewVinculado}
        onClose={onClosePreview}
        preview={previewVinculado}
        onConfirm={onConfirmVinculacion}
        loading={!!vincularLoading}
        error={vincularError || null}
      />

      {/* Modal confirmar desvincular entrenador/tutor */}
      <Modal
        isVisible={!!relacionToDesvincular}
        onBackdropPress={onCloseDesvincularModal}
        onBackButtonPress={onCloseDesvincularModal}
        avoidKeyboard
        backdropOpacity={0.6}
        style={[confirmModalStyles.modal, getCenteredModalStyle()]}
        {...getSheetModalProps()}
      >
        <View style={[confirmModalStyles.box, confirmModalStyles.boxDanger]}>
          <Text style={confirmModalStyles.title}>Desvincular</Text>
          <Text style={confirmModalStyles.message}>
            {relacionToDesvincular
              ? `¿Desvincular a ${relacionToDesvincular.vinculado?.nombre || 'este contacto'}?`
              : ''}
          </Text>
          <View style={confirmModalStyles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCloseDesvincularModal}
              disabled={!!desvincularLoading}
              style={confirmModalStyles.cancelBtn}
            />
            <Button
              title="Desvincular"
              variant="danger"
              onPress={onConfirmDesvincular}
              loading={!!desvincularLoading}
              disabled={!!desvincularLoading}
              style={confirmModalStyles.dangerBtn}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const confirmModalStyles = StyleSheet.create({
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
  boxDanger: { borderColor: 'rgba(255,82,82,0.4)' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  message: { fontSize: 15, color: '#aaa', marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,240,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#00F0FF', fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  errorText: { fontSize: 13, color: '#ff5252', marginBottom: 8, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1 },
  dangerBtn: { flex: 1 },
  confirmBtn: { flex: 1 },
});
