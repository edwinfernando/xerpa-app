import { StyleSheet, Platform } from 'react-native';
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

  // ── Header (alineado con Plan: headerRow, headerActionTrigger) ─
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
  headerActionTouchable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionTrigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 210, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00D2FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: {},
    }),
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

  // ── Segmented Control (glassmorphism + Azul Neón — clon Plan) ─
  segmented: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 0,
    marginBottom: 24,
    marginTop: 10,
    overflow: 'hidden',
  },
  segmentedScrollView: {
    flex: 1,
  },
  segmentedScrollContent: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  segmentedBtnActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#00D2FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  segmentedTextActive: {
    color: '#00D2FF',
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

  // ── Loading (alineado Plan) ────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#555',
    fontSize: 14,
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

  // ── Empty state (alineado Plan: emptyPlanContainer) ─────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    marginBottom: 0,
  },
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
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 280,
    marginTop: 24,
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },

  // ── Bottom Sheet (unificado: overlay, container, handle) ─────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: '92%',
    height: '92%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
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

  // ── Nueva Carrera (igual que Añadir Entrenamiento en Plan) ──
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
  manualRow: {
    flexDirection: 'row',
    gap: 12,
  },
  manualRowItem: {
    flex: 1,
  },
  prioridadPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  prioridadPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#121212',
    flex: 1,
  },
  prioridadPillActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF15',
  },
  prioridadPillText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
  },
  prioridadPillTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
  manualActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  manualSaveBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },

  // ── Formulario (alineado Plan: manualLabel, manualInput) ────
  formLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    backgroundColor: '#121212',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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

  // ── Botones del sheet (alineado Plan: manualActions) ────────
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveGradient: {
    flex: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSaveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalSaveText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Global Race Detail Sheet (alineado con sheetContainer) ──
  detailSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: theme.SHEET_PADDING_BOTTOM,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: '92%',
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
  unenrollConfirmWrap: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,82,82,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.2)',
  },
  unenrollConfirmText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  unenrollConfirmRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unenrollConfirmNo: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  unenrollConfirmNoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  unenrollConfirmYes: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ff5252',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unenrollConfirmYesText: {
    color: '#fff',
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

  // ── Smart Race Card (Marketplace) ────────────────────────────
  smartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  smartCardContent: {
    paddingRight: 16,
    paddingBottom: 16,
  },
  smartCardHeader: {
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  smartCardImage: {
    width: '100%',
    height: '100%',
  },
  smartCardImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  smartCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  smartCardHeaderContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 10,
  },
  smartCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  smartCardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  smartCardDateCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  smartCardDateText: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '600' },
  smartCardCityText: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  smartCardBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  verifiedBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: '800' },
  circuitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
    maxWidth: 120,
  },
  circuitBadgeText: { color: '#00F0FF', fontSize: 10, fontWeight: '700' },
  hardnessRow: {
    marginTop: 12,
    marginLeft: 20,
  },
  hardnessLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  readinessRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessPct: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  readinessBadge: {
    alignItems: 'center',
  },
  readinessText: {
    color: '#00F0FF',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  // ── Event Filters ───────────────────────────────────────────
  filtersContainer: {
    marginBottom: 16,
    gap: 10,
  },
  searchRow: { marginBottom: 8 },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#00F0FF',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    padding: 0,
  },
  filterRow: { gap: 10 },
  filterInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterSelectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#121212',
  },
  filterChipActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF15',
  },
  filterChipText: { color: '#555', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#00F0FF', fontWeight: '800' },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyLabel: { color: '#555', fontSize: 12, fontWeight: '700', marginRight: 4 },
  difficultyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  difficultyChipActive: {
    backgroundColor: 'rgba(57,255,20,0.15)',
    borderColor: 'rgba(57,255,20,0.4)',
  },
  difficultyChipText: { color: '#777', fontSize: 11, fontWeight: '700' },
  difficultyChipTextActive: { color: '#39FF14' },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  clearFiltersText: { color: '#00F0FF', fontSize: 12, fontWeight: '700' },

  // ── Filter Bottom Sheet ─────────────────────────────────────
  filterSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: theme.SHEET_PADDING_BOTTOM,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: '92%',
  },
  filterSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterSheetContent: {
    gap: 16,
    marginBottom: 24,
  },
  filterClearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterSheetApply: {
    backgroundColor: '#00F0FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  filterSheetApplyText: {
    color: '#0D0D0D',
    fontSize: 15,
    fontWeight: '900',
  },

  // ── Race Detail Sheet (Marketplace) — ficha técnica completa ─
  detailScroll: { paddingBottom: 24, paddingHorizontal: 0 },
  // Hero image (first in scroll, full width)
  detailHeroImageWrap: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A2A',
    marginHorizontal: -24,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  detailRaceImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A2A',
  },
  detailCircuitoLogoOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    overflow: 'hidden',
  },
  detailCircuitoLogoImg: {
    width: 48,
    height: 48,
  },
  detailCircuitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailCircuitoLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  // Title + Quick Stats
  detailHeroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 4,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  detailHeroSubtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 16,
  },
  detailQuickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  detailQuickStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailQuickStatPillText: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '600',
  },
  detailQuickStatPillTextLink: {
    color: '#00F0FF',
  },
  // XERPA Readiness card
  xerpaReadinessCard: {
    backgroundColor: 'rgba(0, 210, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
  },
  // Sticky footer
  detailStickyFooter: {
    padding: 20,
    paddingBottom: Math.max(20, theme.SHEET_PADDING_BOTTOM),
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1E1E1E',
  },
  readinessSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  readinessSectionTitle: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  readinessProgressWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  readinessProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  readinessProgressFill: {
    height: '100%',
    backgroundColor: '#00F0FF',
  },
  readinessStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  readinessTextBlock: { flex: 1 },
  readinessPctText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  readinessMessageText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  readinessPctBadge: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: '900',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickStatValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  quickStatLabel: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
  },
  dificultadQuickBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  dificultadQuickText: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  detailDescripcionText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 22,
  },
  detailSectionBody: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 22,
  },
  mapPlaceholder: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  mapPlaceholderText: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
  mapPlaceholderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mapPlaceholderBtnText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailUrlLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  detailUrlLinkText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  readinessDetail: {
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(0,240,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  readinessDetailTitle: { color: '#00F0FF', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  readinessDetailText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  readinessDetailSub: { color: '#555', fontSize: 11, marginTop: 4 },
  descripcionSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  descripcionTitle: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  descripcionText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 22,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  detailBtnPrimary: {
    backgroundColor: '#00F0FF',
  },
  detailBtnPrimaryText: {
    color: '#0D0D0D',
    fontSize: 15,
    fontWeight: '900',
  },
  detailBtnPreparar: {
    borderWidth: 2,
    borderColor: 'rgba(0,240,255,0.5)',
    backgroundColor: 'rgba(0,240,255,0.08)',
  },
  detailBtnPrepararActive: {
    backgroundColor: '#39FF14',
  },
  detailBtnPrepararText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '800',
  },
  detailBtnPrepararTextActive: {
    color: '#0D0D0D',
  },
});
