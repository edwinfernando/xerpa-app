import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';

// Activar LayoutAnimation en Android
if (
  Platform.OS === 'android'
  && !global?.nativeFabricUIManager
  && UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function SignUpView({
  email,
  setEmail: handleSetEmail,
  password,
  setPassword: handleSetPassword,
  loadingForm,
  emailError,
  passwordError,
  globalAuthError,
  handleCreateAccount,
  handleGoogleSignIn,
  handleAppleSignIn,
  onBack,
  styles,
}) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleForm = (show) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowManualForm(show);
  };

  const handleCreate = () => {
    handleCreateAccount();
  };

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={onBack}
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
              <View style={styles.container}>
                <View style={styles.contentArea}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.title}>XERPA</Text>
                <Text style={styles.subtitle}>Únete al equipo.</Text>
                <Text style={styles.description}>
                  Entrena con inteligencia.{'\n'}Tu guía invisible te espera.
                </Text>

                <View style={styles.switchableContent}>
                  {!showManualForm ? (
                    <>
                      <View style={styles.socialButtonsColumn}>
                        <Button
                          title="Continuar con Google"
                          variant="social"
                          socialType="google"
                          onPress={handleGoogleSignIn}
                          style={styles.oauthButton}
                        />
                        <Button
                          title="Continuar con Apple"
                          variant="social"
                          socialType="apple"
                          onPress={handleAppleSignIn}
                          style={styles.oauthButton}
                        />
                      </View>

                      <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>o</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      <Button
                        title="Ingreso manual con Email"
                        variant="secondary"
                        onPress={() => toggleForm(true)}
                        style={styles.manualEmailButton}
                      />
                    </>
                  ) : (
                    <View style={styles.formContainer}>
                      <View style={styles.inputWrapper}>
                        <Input
                          value={email}
                          onChangeText={handleSetEmail}
                          placeholder="Tu correo electrónico"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loadingForm}
                          error={!!emailError}
                          errorText={emailError}
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Input
                          value={password}
                          onChangeText={handleSetPassword}
                          placeholder="Contraseña (mín. 6 caracteres)"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          editable={!loadingForm}
                          error={!!passwordError}
                          errorText={passwordError}
                          rightAccessory={
                            <TouchableOpacity
                              style={styles.eyeButton}
                              onPress={() => setShowPassword((p) => !p)}
                              disabled={loadingForm}
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

                      {globalAuthError ? (
                        <Text style={styles.globalAuthError}>{globalAuthError}</Text>
                      ) : null}

                      <Button
                        title="Crear mi cuenta"
                        variant="primary"
                        onPress={handleCreate}
                        loading={loadingForm}
                        disabled={loadingForm}
                        style={styles.createAccountButton}
                      />
                      <TouchableOpacity
                        onPress={() => toggleForm(false)}
                        disabled={loadingForm}
                        activeOpacity={0.7}
                        style={styles.cancelTouch}
                      >
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footerFixed}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.bottomLinkTouch}
          >
            <Text style={styles.backLinkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.backLinkHighlight}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
