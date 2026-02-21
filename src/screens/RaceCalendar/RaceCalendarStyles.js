import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const raceCalendarStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Header ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  headerLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Segmented Control ──────────────────────────────────────
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  segmentText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#121212',
    fontWeight: '800',
  },

  // ── Stats Strip ────────────────────────────────────────────
  statsStrip: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.07)',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statValueCyan: { color: '#00F0FF' },
  statValueLime: { color: '#39FF14' },
  statValueOrange: { color: '#ff9800' },
  statLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ── List ───────────────────────────────────────────────────
  list: {
    gap: 12,
  },

  // ── Race Card ──────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  cardContent: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  raceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  raceNameFinalizada: {
    color: '#555',
  },

  // ── Countdown pill ─────────────────────────────────────────
  countdownPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.3)',
    backgroundColor: 'rgba(0,240,255,0.08)',
  },
  countdownPillToday: {
    borderColor: 'rgba(57,255,20,0.4)',
    backgroundColor: 'rgba(57,255,20,0.1)',
  },
  countdownPillText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownPillTextToday: {
    color: '#39FF14',
  },

  // ── Badge ──────────────────────────────────────────────────
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActiva: {
    backgroundColor: 'rgba(57,255,20,0.08)',
    borderColor: 'rgba(57,255,20,0.3)',
  },
  badgeProgramada: {
    backgroundColor: 'rgba(0,240,255,0.06)',
    borderColor: 'rgba(0,240,255,0.2)',
  },
  badgeFinalizada: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextActiva: { color: '#39FF14' },
  badgeTextProgramada: { color: '#00F0FF' },
  badgeTextFinalizada: { color: '#444' },

  // ── Info rows ──────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '500',
  },
  infoTextHighlight: {
    color: '#bbb',
    fontWeight: '600',
  },

  // ── Divider ────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },

  // ── Metrics row ────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricValue: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Resultado ─────────────────────────────────────────────
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  resultLabel: { color: '#444', fontSize: 12 },
  resultValue: { color: '#888', fontSize: 12, fontWeight: '600' },

  // ── Loading ───────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Error ─────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Empty state ───────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,240,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#0D0D0D',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Bottom Sheet ──────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#131313',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    color: '#444',
    fontSize: 13,
    marginBottom: 16,
  },

  // ── Formulario ────────────────────────────────────────────
  formLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginTop: 16,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  formInputError: {
    borderColor: '#ff5252',
  },
  formHelperText: {
    color: '#ff5252',
    fontSize: 12,
    marginTop: 5,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  formRowItem: {
    flex: 1,
  },
  formRowItemLabelFix: {
    marginTop: 0,
  },

  // ── Botones del sheet ─────────────────────────────────────
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveGradient: {
    flex: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSaveBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  modalSaveText: {
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: '900',
  },

  // ── Global Race Detail Sheet ───────────────────────────────
  detailSheet: {
    backgroundColor: '#131313',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '85%',
  },
  detailHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailEnrollBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 20,
  },
  detailCancelBtn: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ff5252',
    backgroundColor: 'rgba(255,82,82,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCancelBtnText: {
    color: '#ff5252',
    fontSize: 14,
    fontWeight: '800',
  },
  inscritoBadge: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
