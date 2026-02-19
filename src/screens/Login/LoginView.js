import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function LoginView({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleLogin,
  handleSignUp,
  styles,
}) {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={['#00F0FF', '#39FF14']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        />

        <Text style={styles.title}>XERPA</Text>
        <Text style={styles.subtitle}>Tu guía invisible.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Tu email de atleta"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#888888"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

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
            <Text style={styles.buttonText}>
              {loading ? 'Cargando...' : 'ENTRAR A ENTRENAR'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.linksContainer}>
          <Text style={styles.linkGray}>¿Olvidaste tu contraseña?</Text>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={handleSignUp} disabled={loading}>
            <Text style={styles.linkWhite}>¿Nuevo aquí? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
