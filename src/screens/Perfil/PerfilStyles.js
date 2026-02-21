import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const ROL_OPTIONS = ['Atleta', 'Entrenador', 'Tutor'];

export { ROL_OPTIONS };

export const perfilStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 20,
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
    marginBottom: 6,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff5252',
    marginBottom: 4,
  },
  inputErrorText: {
    color: '#ff5252',
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },

  // ── Rol pill selector ──────────────────────────────────────
  rolPills: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rolPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolPillActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF12',
  },
  rolPillText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  rolPillTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },

  // ── Guardar button (gradient) ──────────────────────────────
  guardarBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  guardarGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardarBtnText: {
    color: '#121212',
    fontSize: 15,
    fontWeight: '800',
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
  buttonSecurity: {
    borderColor: '#00F0FF55',
    backgroundColor: '#00F0FF08',
  },
  buttonLogout: {
    borderColor: '#ff525233',
    marginTop: 24,
  },
  buttonLogoutText: {
    color: '#ff5252',
  },

  // ── Change Password Bottom Sheet ───────────────────────────
  pwSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  pwSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  pwSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pwSheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  pwSheetSubtitle: {
    color: '#555',
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  pwLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pwInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
  },
  pwInputWrapperError: {
    borderColor: '#ff5252',
  },
  pwInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pwEyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pwErrorText: {
    color: '#ff5252',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 16,
    lineHeight: 18,
  },
  pwActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  pwCancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pwCancelText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  pwSaveBtn: {
    flex: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pwSaveGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pwSaveText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Progress Overlays ──────────────────────────────────────
  updatingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  updatingCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00F0FF33',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    width: '100%',
  },
  updatingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  updatingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
