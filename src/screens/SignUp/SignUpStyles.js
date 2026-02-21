import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const signUpStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
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
    marginBottom: 6,
  },
  subtitle: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    color: '#555555',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 20,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  oauthButtonGoogle: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  oauthButtonApple: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  oauthButtonTextGoogle: {
    color: '#ffffff',
  },
  oauthButtonTextApple: {
    color: '#121212',
  },
  backLink: {
    marginTop: 32,
  },
  backLinkText: {
    color: '#888888',
    fontSize: 15,
  },
  backLinkHighlight: {
    color: '#00F0FF',
    fontWeight: '600',
  },
});
