import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme/theme';
import { sharedScreenStyles } from '../../styles/sharedScreenStyles';

const HEADER_TOP = Platform.OS === 'ios' ? 4 : 0;

export const planStyles = StyleSheet.create({
  ...sharedScreenStyles,

  safeContainer: { flex: 1, backgroundColor: theme.colors.background },

  // ── Header (Plan-specific: marginTop, headerLeft) ──────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: HEADER_TOP,
    paddingBottom: 16,
    minHeight: 50,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },

  // ── Top Tabs (Premium Dark + Neón) ────────────────────────
  topTabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 0,
    position: 'relative',
  },
  topTabBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabTextActive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  topTabTextInactive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  topTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: '#00D2FF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    shadowColor: '#00D2FF',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { height: -2, width: 0 },
    ...(Platform.OS === 'android' && { elevation: 8 }),
  },

  // ── Action Bar ────────────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionPrimary: {
    flex: 1,
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

  // ── Card Past (contenedor atenuado) ────────────────────────
  pastCardContainer: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0,
  },
  cardPast: {
    // Hereda del contenedor; sin bordes brillantes
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
  },

  // ── Card Today (Focus + Glow dominante) ────────────────────
  todayCardContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#00D2FF',
    ...Platform.select({
      ios: {
        shadowColor: '#00D2FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  cardToday: {
    // Hereda del contenedor; sin duplicar estilos
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
    padding: 0,
  },

  // ── Today Action Button (CTA masivo) ───────────────────────
  todayActionButton: {
    backgroundColor: '#00D2FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  todayActionText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
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

  // ── Today Pill / Badge "HOY" (en vivo) ─────────────────────
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
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
  cardTitleToday: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
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
    paddingHorizontal: 24,
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

  // ── Empty Plan State (Semana en Blanco) ────────────────────
  emptyPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyPlanIconWrap: {
    marginBottom: 0,
  },
  emptyPlanTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyPlanText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyPlanButton: {
    backgroundColor: '#00D2FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  emptyPlanButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },

  // ── Empty History State (hermano gemelo de EmptyPlanState) ──
  emptyHistorySecondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  emptyHistorySecondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Loading (Skeleton dentro de segmentos) ──────────────────
  skeletonCardWrap: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  skeletonCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  skeletonCardMeta: {
    flex: 1,
  },
  skeletonCardLabel: {
    marginBottom: 6,
  },
  skeletonCardTitle: {},
  skeletonStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  skeletonHistoryContent: {
    flex: 1,
  },

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
    paddingHorizontal: 16,
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
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  manualDateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  manualDateTriggerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  manualDateTriggerPlaceholder: {
    color: '#8E8E93',
    fontWeight: '500',
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
    paddingHorizontal: 20,
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
  generatingSkeletons: {
    gap: 10,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  generatingSkeletonCard: {
    alignSelf: 'stretch',
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
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
  detailHoraPuntoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  detailHoraPuntoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailHoraPuntoText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Badge de origen (IA / Entrenador)
  detailOrigenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  detailOrigenBadgeIa: {
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderColor: 'rgba(0,240,255,0.35)',
  },
  detailOrigenBadgeText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  detailFeedbackInput: {
    marginBottom: 16,
  },
});
