/**
 * Estilos compartidos entre Plan y RaceCalendar (header, segmented control).
 * Fuente única para evitar duplicación y mantener consistencia visual.
 */
import { Platform } from 'react-native';
import { theme } from '../theme/theme';

export const sharedScreenStyles = {
  scrollContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 48,
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
};
