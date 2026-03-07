import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const TOUCH_MIN = theme.TOUCH_TARGET_MIN;
const BUTTON_RADIUS = 14;

export const loginStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.SCREEN_PADDING_HORIZONTAL,
    paddingVertical: 24,
    paddingBottom: 80,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.surfaceInput,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.INPUT_FONT_SIZE_MIN,
  },
  inputError: {
    borderColor: theme.colors.danger,
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
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  helperText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  globalAuthError: {
    width: '100%',
    textAlign: 'center',
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonRow: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: theme.BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    marginBottom: 0,
  },
  forgotPasswordTouch: {
    marginTop: 20,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: theme.colors.textQuaternary,
    fontSize: 13,
    fontWeight: '500',
  },
  footerFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
  },
  registerTouch: {
    paddingVertical: 10,
    justifyContent: 'center',
  },
  contentBlock: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  registerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  registerHighlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
