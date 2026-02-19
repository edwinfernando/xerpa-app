import { StyleSheet } from 'react-native';

export const perfilStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 38,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#181818',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00F0FF33',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonPrimary: {
    backgroundColor: 'transparent',
    borderColor: '#00F0FF',
    borderWidth: 2,
    marginTop: 8,
  },
  buttonPrimaryText: {
    color: '#00F0FF',
  },
  buttonLogout: {
    borderColor: '#ff525233',
    marginTop: 24,
  },
  buttonLogoutText: {
    color: '#ff5252',
  },
});
