import { StyleSheet } from 'react-native';

export const planStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 38,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  listItem: {
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00F0FF33',
  },
  listItemDate: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  listItemTitulo: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  listItemDetalle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
