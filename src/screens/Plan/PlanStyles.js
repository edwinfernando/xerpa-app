import { StyleSheet } from 'react-native';

export const planStyles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 48 },

  // ── Header ───────────────────────────────────────────────
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
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
    marginHorizontal: 20,
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
    paddingHorizontal: 20,
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

  // ── Day Label ─────────────────────────────────────────────
  daySection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  // ── Card Base ─────────────────────────────────────────────
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginHorizontal: 20,
    marginBottom: 12,
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
    marginHorizontal: 14,
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

  // ── Focus Card Buttons ────────────────────────────────────
  focusActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  focusEditBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  focusEditText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  focusCompleteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#39FF1422',
    borderWidth: 1,
    borderColor: '#39FF14',
    alignItems: 'center',
  },
  focusCompleteText: {
    color: '#39FF14',
    fontSize: 13,
    fontWeight: '800',
  },
  focusCompletedBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#39FF1411',
    borderWidth: 1,
    borderColor: '#39FF1444',
    alignItems: 'center',
  },
  focusCompletedText: {
    color: '#39FF1488',
    fontSize: 13,
    fontWeight: '700',
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
});
