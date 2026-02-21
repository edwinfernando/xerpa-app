import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';

export function ForgotPasswordView({
  email,
  emailError,
  loading,
  handleSetEmail,
  handleSend,
  onBack,
  styles,
}) {
  return (
    <ScreenWrapper style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔑</Text>
        </View>

        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.description}>
          Ingresa tu correo electrónico y te enviaremos un enlace
          para restablecer tu contraseña.
        </Text>

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

        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={loading}>
          <Text style={styles.backButtonText}>
            ¿Recordaste tu contraseña?{' '}
            <Text style={styles.backButtonHighlight}>Volver al inicio de sesión</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
