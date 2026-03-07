/**
 * UserIdCard — Social ID Card (estilo tarjeta de crédito / licencia deportiva)
 * Muestra ID XERPA con gradiente sutil, Copiar y Compartir (API nativa Share).
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function UserIdCard({ codigo, onCopy, onShare, styles }) {
  const hasCodigo = !!codigo?.trim();

  return (
    <LinearGradient
      colors={['#0D1A1D', '#0A1518', '#061012']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.userIdCard}
    >
      <View style={styles.userIdCardInner}>
        <Text style={styles.userIdLabel}>ID XERPA</Text>
        <Text style={styles.userIdValue} numberOfLines={1} adjustsFontSizeToFit>
          {hasCodigo ? codigo : '—'}
        </Text>
        <View style={styles.userIdActions}>
          <TouchableOpacity
            style={[styles.userIdActionBtn, !hasCodigo && styles.userIdActionBtnDisabled]}
            onPress={onCopy}
            disabled={!hasCodigo}
          >
            <Text style={[styles.userIdActionText, !hasCodigo && styles.userIdActionTextDisabled]}>
              Copiar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userIdActionBtn, !hasCodigo && styles.userIdActionBtnDisabled]}
            onPress={onShare}
            disabled={!hasCodigo}
          >
            <Text style={[styles.userIdActionText, !hasCodigo && styles.userIdActionTextDisabled]}>
              Compartir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
