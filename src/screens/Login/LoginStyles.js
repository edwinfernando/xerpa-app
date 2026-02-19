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
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
    fontSize: 16,
  },
  buttonGradient: {
    width: '90%',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
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
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  linkGray: {
    color: '#888888',
    fontSize: 15,
  },
  linkWhite: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  spacer: {
    width: 20,
  },
});
