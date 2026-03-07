import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const TOUCH_MIN = theme.TOUCH_TARGET_MIN;
const BUTTON_RADIUS = 14;

export const signUpStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SCREEN_PADDING_HORIZONTAL,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  backButtonTouch: {
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
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
    paddingVertical: theme.spacing.lg,
    paddingBottom: 80,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  contentArea: {
    width: '100%',
    alignItems: 'center',
  },
  switchableContent: {
    width: '100%',
    minHeight: 280,
    alignItems: 'center',
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
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    color: theme.colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 20,
  },
  manualEmailButton: {
    width: '100%',
    height: theme.BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    marginVertical: 0,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
  },
  formScrollContent: {
    width: '100%',
    paddingBottom: theme.spacing.lg,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    width: '100%',
  },
  socialButtonsColumn: {
    width: '100%',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  createAccountButton: {
    width: '100%',
    height: theme.BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    marginTop: 8,
    marginBottom: theme.spacing.sm,
  },
  globalAuthError: {
    width: '100%',
    textAlign: 'center',
    color: theme.colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  oauthButton: {
    width: '100%',
    height: theme.BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
  },
  cancelTouch: {
    marginTop: 20,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  contentFlex: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
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
  bottomLinkTouch: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  sheetForm: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingBottom: 24,
  },
  backLinkText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  backLinkHighlight: {
    color: theme.colors.linkHighlight,
    fontWeight: '600',
  },
});
