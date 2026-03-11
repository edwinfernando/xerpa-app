/**
 * IntegrationCard — Integraciones simplificadas (icono + nombre integrados)
 * Diseño limpio: icono junto al nombre, estado debajo.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function IntegrationCard({
  title,
  iconName,
  iconSource,
  iconSourceTint,
  iconSourceHasBg,
  isLast,
  brandColor,
  isConnected,
  onPress,
  onDisconnect,
  isLoading = false,
}) {
  const handlePress = () => {
    if (isLoading) return;
    if (isConnected) {
      onDisconnect?.();
    } else {
      onPress?.();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast, isLoading && styles.rowDisabled]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {/* Izquierda: icono integrado al nombre */}
      <View style={styles.left}>
        <View style={styles.nameRow}>
          {iconSource ? (
            <View style={[styles.iconSmall, iconSourceHasBg && styles.iconClip]}>
              <Image
                source={iconSource}
                style={[
                  styles.iconImg,
                  iconSourceHasBg && styles.iconImgFull,
                  iconSourceTint && { tintColor: iconSourceTint },
                ]}
                resizeMode="cover"
              />
            </View>
          ) : (
            <MaterialCommunityIcons name={iconName} size={20} color={theme.colors.primary} />
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.statusRow}>
          {isLoading ? (
            <ActivityIndicator size="small" color={brandColor} />
          ) : isConnected ? (
            <>
              <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.secondary} />
              <Text style={styles.connectedText}>Conectado</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="close-circle-outline" size={14} color={theme.colors.textQuaternary} />
              <Text style={styles.disconnectedText}>No vinculado</Text>
            </>
          )}
        </View>
      </View>

      {/* Derecha */}
      {!isLoading && (
        <View style={styles.right}>
          {isConnected ? (
            <MaterialCommunityIcons name="dots-horizontal" size={18} color={theme.colors.textQuaternary} />
          ) : (
            <Text style={[styles.connectText, { color: brandColor }]}>Conectar</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowDisabled: {
    opacity: 0.85,
  },
  left: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconSmall: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconClip: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  iconImg: {
    width: 20,
    height: 20,
  },
  iconImgFull: {
    width: 24,
    height: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  connectedText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectedText: {
    color: theme.colors.textQuaternary,
    fontSize: 12,
    fontWeight: '600',
  },
  right: {
    marginLeft: 12,
  },
  connectText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
