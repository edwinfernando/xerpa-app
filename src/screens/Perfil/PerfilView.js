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
import React from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import { useNavigationBarColor } from '../../hooks/useNavigationBarColor';
import { useModalSwipeScroll } from '../../hooks/useModalSwipeScroll';

// ─────────────────────────────────────────────────────────────
// Intervals.icu Integration Sheet
// ─────────────────────────────────────────────────────────────
function IntervalsSheet({
  visible,
  onClose,
  idExterno,
  setIdExterno,
  apiKeyIntervalos,
  setApiKeyIntervalos,
  error,
  isSaving,
  onSave,
  styles,
}) {
  const { scrollOffsetY } = useModalSwipeScroll(110, visible);
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        style={styles.pwSheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.pwSheet}>
          <View style={styles.pwSheetHandle} />
          <Text style={styles.pwSheetTitle}>Vincular Intervals.icu</Text>
          <Text style={styles.pwSheetSubtitle}>
            Ingresa tu ID de atleta y API Key para sincronizar datos.
          </Text>

          <Text style={styles.pwLabel}>ID de atleta (Athlete ID)</Text>
          <Input
            value={idExterno}
            onChangeText={setIdExterno}
            placeholder="Ej: 12345"
            keyboardType="numeric"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />

          <Text style={styles.pwLabel}>API Key</Text>
          <Input
            value={apiKeyIntervalos}
            onChangeText={setApiKeyIntervalos}
            placeholder="Tu API Key de Intervals.icu"
            secureTextEntry
            autoCapitalize="none"
            error={!!error}
            errorText={error}
            style={{ marginBottom: 16 }}
          />

          <View style={styles.pwActions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              disabled={isSaving}
              style={styles.pwCancelBtn}
            />
            <Button
              title="Guardar credenciales"
              variant="primary"
              onPress={onSave}
              loading={isSaving}
              disabled={isSaving}
              style={styles.pwSaveBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Change Password Bottom Sheet
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
  const { scrollOffsetY } = useModalSwipeScroll(110, visible);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        style={styles.pwSheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.pwSheet}>
          <View style={styles.pwSheetHandle} />
          <Text style={styles.pwSheetTitle}>Cambiar Contraseña</Text>
          <Text style={styles.pwSheetSubtitle}>
            Tu nueva contraseña debe tener al menos 6 caracteres.
          </Text>

          <Text style={styles.pwLabel}>Nueva Contraseña</Text>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry={!showNew}
            autoCapitalize="none"
            error={!!passwordError}
            rightAccessory={
              <TouchableOpacity style={styles.pwEyeBtn} onPress={() => setShowNew((v) => !v)}>
                {showNew ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
              </TouchableOpacity>
            }
            style={{ marginBottom: 16 }}
          />

          <Text style={styles.pwLabel}>Confirmar Contraseña</Text>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            error={!!passwordError}
            errorText={passwordError}
            rightAccessory={
              <TouchableOpacity style={styles.pwEyeBtn} onPress={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
              </TouchableOpacity>
            }
            style={{ marginBottom: 16 }}
          />

          {!!passwordError && <Text style={styles.pwErrorText}>{passwordError}</Text>}

          <View style={styles.pwActions}>
            <Button
              title="Guardar Cambios"
              variant="primary"
              onPress={onSave}
              loading={isUpdating}
              disabled={isUpdating}
              style={[styles.pwSaveBtn, { flex: 1 }]}
            />
          </View>
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
  handleVincularIntervalos,
  codigoVinculacion,
  handlePlatformPress,
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
  handleVincularConCodigo,
  vincularLoading,
  vincularError,
  relacionesActivas,
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

  const isAnySheetVisible = showBiometriaSheet || showNotificacionesSheet || showIntervalosSheet || showPasswordSheet;
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
      <Animated.ScrollView
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_MAX_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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

        {/* 6. Integraciones (Intervals, Strava, Garmin, Wahoo; badge estado; tap → flujo) */}
        <IntegracionesSection
          integraciones={profileData?.integraciones}
          onPlatformPress={handlePlatformPress}
          styles={styles}
        />

        {/* 7. Mi entrenador / Vinculación (relaciones_usuarios) */}
        <EntrenadorSection
          rol={rol}
          relacionesActivas={relacionesActivas}
          codigoIngresado={codigoIngresado}
          onCodigoIngresadoChange={handleCodigoIngresadoChange}
          onVincularConCodigo={handleVincularConCodigo}
          vincularLoading={vincularLoading}
          vincularError={vincularError}
          styles={styles}
        />

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
      <IntervalsSheet
        visible={showIntervalosSheet}
        onClose={handleCerrarIntervalosSheet}
        idExterno={idExterno}
        setIdExterno={setIdExterno}
        apiKeyIntervalos={apiKeyIntervalos}
        setApiKeyIntervalos={setApiKeyIntervalos}
        error={intervalosError}
        isSaving={isSavingIntervalos}
        onSave={handleGuardarIntervalos}
        styles={styles}
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
    </ScreenWrapper>
  );
}
