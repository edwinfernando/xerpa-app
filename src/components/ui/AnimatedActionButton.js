/**
 * AnimatedActionButton — Cápsula neón premium con morfismo al hacer scroll
 *
 * - Estilo: Cápsula con fondo rgba(0,210,255,0.15), borderRadius 20, height 32
 * - Al colapsar: reduce ancho hasta convertirse en círculo perfecto (solo icono)
 * - Label "Añadir" o "Editar" con opacidad y ancho animados
 * - Alineación: flex-end para coincidir con baseline del título
 */
import React from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';

const NEON_BLUE = '#00D2FF';
const CAPSULE_HEIGHT = 32;
const ICON_SIZE = 20;

export function AnimatedActionButton({
  label,
  icon,
  onPress,
  interpolations,
}) {
  const {
    labelOpacity,
    labelWidth,
    labelGap,
    actionScale,
    actionTranslateY,
    capsuleWidth,
    capsulePaddingH,
    capsuleBorderRadius,
  } = interpolations;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.touchable}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
    >
      <Animated.View
        style={[
          styles.capsule,
          {
            width: capsuleWidth,
            paddingHorizontal: capsulePaddingH,
            borderRadius: capsuleBorderRadius,
            transform: [
              { scale: actionScale },
              { translateY: actionTranslateY },
            ],
          },
        ]}
      >
        <View style={styles.innerRow}>
          <Animated.View style={[styles.labelWrap, { width: labelWidth, marginRight: labelGap }]}>
            <Animated.Text
              style={[styles.label, { opacity: labelOpacity }]}
              numberOfLines={1}
            >
              {label}
            </Animated.Text>
          </Animated.View>
          <View style={styles.iconWrap}>
            {icon}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    paddingRight: 20,
    minHeight: 44,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    paddingBottom: 2,
  },
  capsule: {
    height: CAPSULE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: NEON_BLUE,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
