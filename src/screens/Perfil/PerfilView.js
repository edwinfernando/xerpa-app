import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, ExternalLink, ShieldCheck, Eye, EyeOff } from 'lucide-react-native';
import { ROL_OPTIONS } from './PerfilStyles';

// ─────────────────────────────────────────────────────────────
// Saving Perfil Progress Overlay
// ─────────────────────────────────────────────────────────────
function SavingPerfilOverlay({ visible, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.updatingOverlay}>
        <View style={styles.updatingCard}>
          <ActivityIndicator size="large" color="#00F0FF" style={{ marginBottom: 20 }} />
          <Text style={styles.updatingTitle}>Sincronizando perfil...</Text>
          <Text style={styles.updatingText}>
            Sincronizando tus datos con XERPA... 🚀
          </Text>
        </View>
      </View>
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
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={[styles.pwInputWrapper, !!passwordError && styles.pwInputWrapperError]}>
            <TextInput
              style={styles.pwInput}
              placeholder="••••••••"
              placeholderTextColor="#444"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.pwEyeBtn} onPress={() => setShowNew(v => !v)}>
              {showNew ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.pwLabel}>Confirmar Contraseña</Text>
          <View style={[styles.pwInputWrapper, !!passwordError && styles.pwInputWrapperError]}>
            <TextInput
              style={styles.pwInput}
              placeholder="••••••••"
              placeholderTextColor="#444"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.pwEyeBtn} onPress={() => setShowConfirm(v => !v)}>
              {showConfirm ? <EyeOff color="#555" size={20} /> : <Eye color="#555" size={20} />}
            </TouchableOpacity>
          </View>

          {!!passwordError && (
            <Text style={styles.pwErrorText}>{passwordError}</Text>
          )}

          <View style={styles.pwActions}>
            <TouchableOpacity style={styles.pwCancelBtn} onPress={onClose} disabled={isUpdating}>
              <Text style={styles.pwCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <LinearGradient
              colors={['#00F0FF', '#39FF14']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.pwSaveBtn}
            >
              <TouchableOpacity style={styles.pwSaveGradient} onPress={onSave} disabled={isUpdating}>
                {isUpdating
                  ? <ActivityIndicator size="small" color="#121212" />
                  : <Text style={styles.pwSaveText}>Guardar Cambios 💾</Text>
                }
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Updating Password Progress Overlay
// ─────────────────────────────────────────────────────────────
function UpdatingPasswordOverlay({ visible, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.updatingOverlay}>
        <View style={styles.updatingCard}>
          <ActivityIndicator size="large" color="#00F0FF" style={{ marginBottom: 20 }} />
          <Text style={styles.updatingTitle}>Actualizando credenciales...</Text>
          <Text style={styles.updatingText}>
            Actualizando tus credenciales de seguridad... 🛡️
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────
export function PerfilView({
  nombre,
  setNombre,
  nombreError,
  rol,
  setRol,
  email,
  loading,
  isSavingPerfil,
  handleGuardar,
  handleLogout,
  handleVincularStrava,
  handleVincularIntervalos,
  // Password change
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
  styles,
}) {
  return (
    <ScreenWrapper style={styles.safeContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfil</Text>

        {/* INFORMACIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, !!nombreError && styles.inputError]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#666"
          />
          {!!nombreError && (
            <Text style={styles.inputErrorText}>{nombreError}</Text>
          )}

          <Text style={styles.label}>Rol</Text>
          <View style={styles.rolPills}>
            {ROL_OPTIONS.map(opcion => (
              <TouchableOpacity
                key={opcion}
                style={[styles.rolPill, rol === opcion && styles.rolPillActive]}
                onPress={() => setRol(opcion)}
              >
                <Text style={[styles.rolPillText, rol === opcion && styles.rolPillTextActive]}>
                  {opcion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 4 }]}>Email</Text>
          <Text style={[styles.input, { color: '#888' }]}>{email}</Text>

          <LinearGradient
            colors={['#00F0FF', '#39FF14']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.guardarBtn}
          >
            <TouchableOpacity
              style={styles.guardarGradient}
              onPress={handleGuardar}
              disabled={isSavingPerfil}
            >
              {isSavingPerfil
                ? <ActivityIndicator size="small" color="#121212" />
                : <Text style={styles.guardarBtnText}>💾 Guardar Cambios</Text>
              }
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* SEGURIDAD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEGURIDAD</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecurity]}
            onPress={handleAbrirCambioContrasena}
          >
            <ShieldCheck color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* VINCULAR CUENTAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VINCULAR CUENTAS</Text>
          <TouchableOpacity style={styles.button} onPress={handleVincularStrava}>
            <ExternalLink color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Vincular Strava</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleVincularIntervalos}>
            <ExternalLink color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Intervalos.icu</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonLogout]}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut color="#ff5252" size={22} />
          <Text style={[styles.buttonText, styles.buttonLogoutText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Saving Perfil Progress Overlay */}
      <SavingPerfilOverlay visible={isSavingPerfil} styles={styles} />

      {/* Change Password Bottom Sheet */}
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

      {/* Updating Password Progress Overlay */}
      <UpdatingPasswordOverlay visible={isUpdatingPassword} styles={styles} />
    </ScreenWrapper>
  );
}
