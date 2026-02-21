import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export function LoginView({
  email,
  password,
  loading,
  emailError,
  passwordError,
  globalAuthError,
  handleSetEmail,
  handleSetPassword,
  handleLogin,
  onNavigateSignUp,
  onNavigateForgotPassword,
  styles,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>XERPA</Text>
        <Text style={styles.subtitle}>Tu guía invisible.</Text>

        <View style={styles.inputContainer}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              value={email}
              onChangeText={handleSetEmail}
              placeholder="Tu correo electrónico"
              placeholderTextColor="#888888"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {emailError ? (
              <Text style={styles.helperText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password con toggle de visibilidad */}
          <View style={styles.inputWrapper}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                value={password}
                onChangeText={handleSetPassword}
                placeholder="Contraseña"
                placeholderTextColor="#888888"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#888888"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.helperText}>{passwordError}</Text>
            ) : null}
          </View>
        </View>

        {/* Error global de autenticación (Supabase) */}
        {globalAuthError ? (
          <Text style={styles.globalAuthError}>{globalAuthError}</Text>
        ) : null}

        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR A ENTRENAR</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* "Olvidé mi contraseña" — justo debajo del botón, centrado */}
        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={onNavigateForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidé mi contraseña?</Text>
        </TouchableOpacity>

        {/* "¿Nuevo aquí? Regístrate" — anclado al fondo de la pantalla */}
        <TouchableOpacity
          style={styles.registerContainer}
          onPress={onNavigateSignUp}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            ¿Nuevo aquí?{'  '}
            <Text style={styles.registerHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
