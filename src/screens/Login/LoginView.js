import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.contentBlock}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.title}>XERPA</Text>
                <Text style={styles.subtitle}>Tu guía invisible.</Text>

                <View style={styles.inputContainer}>
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

                  <View style={styles.inputWrapper}>
                    <Input
                      value={password}
                      onChangeText={handleSetPassword}
                      placeholder="Contraseña"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      error={!!passwordError}
                      errorText={passwordError}
                      rightAccessory={
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPassword((prev) => !prev)}
                          disabled={loading}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={22}
                            color="#888888"
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>
                </View>

                {globalAuthError ? (
                  <Text style={styles.globalAuthError}>{globalAuthError}</Text>
                ) : null}

                <View style={styles.buttonRow}>
                  <Button
                    title="ENTRAR A ENTRENAR"
                    variant="primary"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.primaryButton}
                  />

                  <TouchableOpacity
                    onPress={onNavigateForgotPassword}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={styles.forgotPasswordTouch}
                  >
                    <Text style={styles.forgotPasswordText}>¿Olvidé mi contraseña?</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footerFixed}>
          <TouchableOpacity
            onPress={onNavigateSignUp}
            disabled={loading}
            activeOpacity={0.7}
            style={styles.registerTouch}
          >
            <Text style={styles.registerText}>
              ¿Nuevo aquí?{' '}
              <Text style={styles.registerHighlight}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
