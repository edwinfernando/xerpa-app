import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const dashboardStyles = StyleSheet.create({
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
    paddingBottom: 48,
    gap: 16,
  },

  // ── Header ─────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerGreeting: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  headerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  motivationalText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 18,
    opacity: 0.85,
  },

  // ── Weather Banner ──────────────────────────────────────────
  weatherBanner: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherCity: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  weatherCondition: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  weatherTemp: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weatherConnectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF33',
  },
  weatherConnectText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Glass Card (generic) ────────────────────────────────────
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  sectionLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },

  // ── TSS Progress Ring ───────────────────────────────────────
  tssSectionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
    padding: 24,
    alignItems: 'center',
  },
  tssRingWrapper: {
    marginVertical: 8,
  },
  tssRingCenterPct: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
  },
  tssRingCenterLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
  },
  tssNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  tssActualValue: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: '800',
  },
  tssActualLabel: {
    color: '#444',
    fontSize: 11,
    fontWeight: '600',
  },
  tssDivider: {
    color: '#2A2A2A',
    fontSize: 18,
    fontWeight: '300',
    marginHorizontal: 4,
  },
  tssPlannedValue: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
  },
  tssPlannedLabel: {
    color: '#444',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Misión de Hoy ───────────────────────────────────────────
  misionGradient: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  misionInner: {
    backgroundColor: '#111',
    borderRadius: 22,
    padding: 20,
  },
  misionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  misionLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  misionTypePill: {
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
  },
  misionTypePillText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
  },
  misionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  misionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(57,255,20,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  misionTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  misionMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  misionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  misionMetaLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  misionMetaValue: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Recovery Day ────────────────────────────────────────────
  recoveryCard: {
    backgroundColor: 'rgba(57,255,20,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.15)',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  recoveryTitle: {
    color: '#39FF14',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  recoveryText: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Countdown Carrera ───────────────────────────────────────
  countdownCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  countdownLeft: {
    flex: 1,
  },
  countdownSmallLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  countdownRaceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  countdownDate: {
    color: '#555',
    fontSize: 12,
    marginTop: 3,
  },
  countdownRight: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  countdownNumber: {
    color: '#00F0FF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -1,
  },
  countdownUnit: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.7,
  },

  // ── Quick Actions ───────────────────────────────────────────
  quickActionsSection: {
    gap: 10,
  },
  quickActionsTitle: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  quickActionCardDanger: {
    borderColor: 'rgba(255,82,82,0.25)',
    backgroundColor: 'rgba(255,82,82,0.05)',
  },
  quickActionCardAI: {
    borderColor: 'rgba(0,240,255,0.25)',
    backgroundColor: 'rgba(0,240,255,0.05)',
  },
  quickActionCardSync: {
    borderColor: 'rgba(57,255,20,0.2)',
    backgroundColor: 'rgba(57,255,20,0.04)',
  },
  quickActionText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  quickActionTextDanger: {
    color: '#ff5252',
  },
  quickActionTextAI: {
    color: '#00F0FF',
  },
  quickActionTextSync: {
    color: '#39FF14',
  },

  // ── Quick Metrics ───────────────────────────────────────────
  quickMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.1)',
  },
  metricCardTsb: {
    borderColor: 'rgba(255,152,0,0.15)',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricValueCtl: { color: '#39FF14' },
  metricValueAtl: { color: '#00F0FF' },
  metricValueTsb: { color: '#ff9800' },
  metricLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  metricSublabel: {
    color: '#333',
    fontSize: 10,
    marginTop: 1,
  },

  // ── RPE Card ────────────────────────────────────────────────
  rpeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
  },
  rpeCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  rpeNumberContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rpeNumber: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -3,
  },
  rpeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  rpeSlider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  rpeSaveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  rpeSaveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeSaveButtonText: {
    color: '#121212',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rpeSuccessCard: {
    backgroundColor: 'rgba(57,255,20,0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.3)',
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  rpeSuccessText: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Vincular link ───────────────────────────────────────────
  vincularLink: { marginTop: 14 },
  emptyStateLink: {
    color: '#39FF14',
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
