/**
 * GlobalEmptyState — Componente universal de estado vacío (diseño premium Plan)
 * Reutilizable en Plan, RaceCalendar y cualquier pantalla que necesite empty states.
 * Centrado igual que PlanView (emptyPlanContainer).
 *
 * Props: icon, title, subtitle, primaryButtonText, onPrimaryPress, secondaryButtonText, onSecondaryPress
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

const MIN_HEIGHT_EMPTY = Math.max(380, Dimensions.get('window').height * 0.45);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: MIN_HEIGHT_EMPTY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconWrap: {
    marginBottom: 0,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#00D2FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonGap: {
    marginTop: 12,
  },
});

export function GlobalEmptyState({
  icon,
  title,
  subtitle,
  primaryButtonText,
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  primaryLoading = false,
}) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {primaryButtonText && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onPrimaryPress}
          disabled={primaryLoading}
          activeOpacity={0.85}
        >
          {primaryLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
          )}
        </TouchableOpacity>
      )}

      {secondaryButtonText && (
        <TouchableOpacity
          style={[styles.secondaryButton, primaryButtonText && styles.buttonGap]}
          onPress={onSecondaryPress}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
