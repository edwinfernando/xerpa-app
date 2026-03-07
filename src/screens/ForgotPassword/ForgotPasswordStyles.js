import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const TOUCH_MIN = theme.TOUCH_TARGET_MIN;

export const forgotPasswordStyles = StyleSheet.create({
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
    paddingVertical: theme.spacing.xl,
    paddingBottom: 80,
  },
  formContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 8,
    fontWeight: '400',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 28,
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
  helperText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    width: '100%',
    height: theme.BUTTON_HEIGHT,
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
  bottomLinkText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  bottomLinkHighlight: {
    color: theme.colors.linkHighlight,
    fontWeight: '600',
  },
});
