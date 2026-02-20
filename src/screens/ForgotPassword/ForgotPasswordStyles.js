import { StyleSheet } from 'react-native';

export const forgotPasswordStyles = StyleSheet.create({
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
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    color: '#888888',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  inputWrapper: {
    width: '90%',
    marginBottom: 24,
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
  helperText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonGradient: {
    width: '90%',
    borderRadius: 12,
    marginBottom: 20,
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
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#888888',
    fontSize: 15,
  },
  backButtonHighlight: {
    color: '#00F0FF',
    fontWeight: '600',
  },
});
