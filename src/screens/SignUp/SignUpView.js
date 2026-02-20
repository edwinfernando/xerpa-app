import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

function GoogleIcon() {
  return (
    <Text style={{ fontSize: 20 }}>G</Text>
  );
}

function AppleIcon() {
  return (
    <Text style={{ fontSize: 20, color: '#121212' }}></Text>
  );
}

export function SignUpView({
  loadingGoogle,
  loadingApple,
  handleGoogleSignIn,
  handleAppleSignIn,
  onBack,
  styles,
}) {
  const isAnyLoading = loadingGoogle || loadingApple;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
      <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>XERPA</Text>
        <Text style={styles.subtitle}>Únete al equipo.</Text>
        <Text style={styles.description}>
          Crea tu cuenta para comenzar a entrenar{'\n'}con inteligencia.
        </Text>

        {/* Botón Google */}
        <TouchableOpacity
          style={[styles.oauthButton, styles.oauthButtonGoogle]}
          onPress={handleGoogleSignIn}
          disabled={isAnyLoading}
          activeOpacity={0.8}
        >
          {loadingGoogle ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <GoogleIcon />
              <Text style={[styles.oauthButtonText, styles.oauthButtonTextGoogle]}>
                Continuar con Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botón Apple */}
        <TouchableOpacity
          style={[styles.oauthButton, styles.oauthButtonApple]}
          onPress={handleAppleSignIn}
          disabled={isAnyLoading}
          activeOpacity={0.8}
        >
          {loadingApple ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <>
              <AppleIcon />
              <Text style={[styles.oauthButtonText, styles.oauthButtonTextApple]}>
                Continuar con Apple
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={onBack} disabled={isAnyLoading}>
          <Text style={styles.backLinkText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.backLinkHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
