import { StyleSheet } from 'react-native';

export const raceCalendarStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ── Tarjeta ──────────────────────────────────────────────
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardActive: {
    borderColor: '#39FF14',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardProgramada: {
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  cardFinalizada: {
    opacity: 0.65,
  },

  // ── Fila superior (nombre + badge estado) ────────────────
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  raceName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeActiva: {
    backgroundColor: '#39FF1422',
  },
  badgeProgramada: {
    backgroundColor: '#00F0FF22',
  },
  badgeFinalizada: {
    backgroundColor: '#33333355',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextActiva: {
    color: '#39FF14',
  },
  badgeTextProgramada: {
    color: '#00F0FF',
  },
  badgeTextFinalizada: {
    color: '#666',
  },

  // ── Fecha y ciudad ────────────────────────────────────────
  raceDate: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  raceDateHighlight: {
    color: '#ccc',
    fontWeight: '600',
  },
  raceCity: {
    color: '#666',
    fontSize: 13,
    marginBottom: 14,
  },

  // ── Separador ─────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginBottom: 12,
  },

  // ── Métricas (km / desnivel) ──────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#666',
    fontSize: 13,
  },

  // ── Resultado (solo si Finalizada) ────────────────────────
  resultRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultLabel: {
    color: '#666',
    fontSize: 12,
  },
  resultValue: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Loading ───────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },

  // ── Error ─────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
  },

  // ── Empty state ───────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#39FF14',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyButtonText: {
    color: '#39FF14',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Bottom Sheet (Añadir Carrera) ─────────────────────────
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
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  // ── Formulario ────────────────────────────────────────────
  formLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  formInput: {
    backgroundColor: '#111',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  formInputError: {
    borderColor: '#FF4444',
  },
  formHelperText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
  formRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  formRowItem: {
    flex: 1,
  },

  // ── Botones del sheet ─────────────────────────────────────
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    marginBottom: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveGradient: {
    flex: 1.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSaveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalSaveText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '800',
  },
});
