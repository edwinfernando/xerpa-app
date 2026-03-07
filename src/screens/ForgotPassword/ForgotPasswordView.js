import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';

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
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={onBack}
          disabled={loading}
          style={styles.backButtonTouch}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.formContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>🔑</Text>
                </View>

                <Text style={styles.title}>Recuperar Contraseña</Text>
                <Text style={styles.description}>
                  Ingresa tu correo electrónico y te enviaremos un enlace
                  para restablecer tu contraseña.
                </Text>

                <View style={styles.inputWrapper}>
                  <Input
                    value={email}
                    onChangeText={handleSetEmail}
                    placeholder="Tu correo electrónico"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    error={!!emailError}
                    errorText={emailError}
                  />
                </View>

                <Button
                  title="Enviar enlace de recuperación"
                  variant="primary"
                  onPress={handleSend}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                />
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footerFixed}>
          <TouchableOpacity
            onPress={onBack}
            disabled={loading}
            activeOpacity={0.7}
            style={styles.bottomLinkTouch}
          >
            <Text style={styles.bottomLinkText}>
              ¿Recordaste tu contraseña?{' '}
              <Text style={styles.bottomLinkHighlight}>Volver al inicio</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
