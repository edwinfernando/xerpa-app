import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 0,
    marginBottom: 0,
  },
  title: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputWrapper: {
    width: '90%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  // Contenedor relativo para el campo contraseña + ícono ojo
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  helperText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  // Error global de Supabase — centrado, encima del botón
  globalAuthError: {
    width: '90%',
    textAlign: 'center',
    color: '#FF4444',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 18,
  },
  buttonGradient: {
    width: '90%',
    borderRadius: 12,
    marginBottom: 0,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  // Enlace sutil inmediatamente debajo del botón principal
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#666666',
    fontSize: 13,
  },
  // Enlace anclado al fondo de la pantalla
  registerContainer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#888888',
    fontSize: 15,
  },
  registerHighlight: {
    color: '#00F0FF',
    fontWeight: 'bold',
  },
});
