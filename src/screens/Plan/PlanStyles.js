import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../styles/theme';

export const planStyles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    paddingBottom: 8,
  },
  headerMeta: {
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
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 16,
  },

  // ── Segmented Control ─────────────────────────────────────
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

  // ── Action Bar ────────────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  actionPrimary: {
    flex: 1.3,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 6,
  },
  actionPrimaryText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionGhost: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  actionGhostText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Card Base ─────────────────────────────────────────────
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },

  // ── Card Timer Button (play/stop en esquina) ──────────────
  cardTimerBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
  },

  // ── Card Past ─────────────────────────────────────────────
  cardPast: {
    opacity: 0.5,
  },

  // ── Card Today (Focus) ────────────────────────────────────
  cardToday: {
    borderColor: '#39FF14',
    borderWidth: 2,
    backgroundColor: '#141A14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginHorizontal: -6,
    padding: 20,
  },

  // ── Card Rest (no workout) ────────────────────────────────
  cardRest: {
    backgroundColor: '#141414',
    borderColor: '#1E1E1E',
    borderStyle: 'dashed',
    paddingVertical: 14,
  },

  // ── Card Header Row ───────────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardMeta: { flex: 1 },
  cardDayLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardDayLabelToday: { color: '#39FF14' },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardTitleRest: { color: '#444' },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Card Stats ────────────────────────────────────────────
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    color: '#555',
    fontSize: 12,
  },

  // ── Today Pill Label ──────────────────────────────────────
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  todayPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#39FF14',
  },
  todayPillText: {
    color: '#39FF14',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Historial ─────────────────────────────────────────────
  monthHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthHeaderText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  monthHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  historyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: { flex: 1 },
  historyTitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  historyMeta: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  historyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#39FF1420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCheckIncomplete: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 44, marginBottom: 16 },
  emptyTitle: {
    color: '#00F0FF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Loading ───────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: '#555', fontSize: 14 },

  // ── Manual Workout Modal ───────────────────────────────────
  manualModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  manualModalSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: '90%',
  },
  manualModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  manualModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  manualLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  manualInput: {
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  manualInputError: {
    borderColor: '#ff5252',
  },
  manualErrorText: {
    color: '#ff5252',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 12,
  },
  manualRowItem: {
    flex: 1,
  },
  manualTextarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  tipoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tipoPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#121212',
  },
  tipoPillActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF15',
  },
  tipoPillText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  tipoPillTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
  manualActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  manualCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualCancelText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  manualSaveBtn: {
    flex: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  manualSaveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  manualSaveText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Generating Overlay ────────────────────────────────────
  generatingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  generatingCard: {
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
  generatingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  generatingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Timer Finish Sheet ────────────────────────────────────
  finishModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  finishSheet: {
    backgroundColor: '#131313',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  finishHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 28,
  },
  finishTimerLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },
  finishTimerDisplay: {
    color: '#fff',
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
  },
  finishRpeTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  finishRpeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  finishRpePill: {
    width: 29,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishRpePillText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },
  finishRpeDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '600',
    lineHeight: 18,
  },
  finishActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  finishDiscardBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishDiscardText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },
  finishSaveGradient: {
    flex: 1.8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  finishSaveBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishSaveText: {
    color: '#0F1116',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  // ── Workout Detail Sheet ───────────────────────────────────
  detailModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: '#131313',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '88%',
  },
  detailHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },

  // Icon + type pill row
  detailIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  detailIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTypePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  detailTypePillText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Title + date
  detailTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 6,
  },
  detailDate: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
  },

  // Status badge
  detailStatusRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  detailStatusCompleted: {
    backgroundColor: 'rgba(57,255,20,0.08)',
    borderColor: 'rgba(57,255,20,0.3)',
  },
  detailStatusPending: {
    backgroundColor: 'rgba(255,152,0,0.08)',
    borderColor: 'rgba(255,152,0,0.3)',
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailStatusTextCompleted: {
    color: '#39FF14',
  },
  detailStatusTextPending: {
    color: '#ff9800',
  },

  // Metrics row
  detailMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailMetricBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailMetricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  detailMetricLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.3,
  },

  // Description section
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  detailSectionLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  detailText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Action buttons
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  detailCloseBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  detailAlreadyDone: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(57,255,20,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.15)',
  },
  detailAlreadyDoneText: {
    color: '#39FF1477',
    fontSize: 13,
    fontWeight: '700',
  },
  detailCompleteGradient: {
    flex: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  detailCompleteBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCompleteBtnText: {
    color: '#0F1116',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
