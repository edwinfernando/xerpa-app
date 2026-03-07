/**
 * Skeleton — Placeholder animado para estados de carga.
 *
 * Usa Animated.View con pulso de opacity (0.3 ↔ 0.8) sobre fondo #2C2C2E.
 * Reemplaza ActivityIndicator en pantallas Plan y RaceCalendar.
 *
 * @param {number} [width]   — Ancho en px. Si no se pasa, usa flex: 1.
 * @param {number} [height]   — Altura en px.
 * @param {number} [borderRadius=8] — Radio de borde.
 * @param {object} [style]   — Estilos extra.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const SKELETON_BG = '#2C2C2E';

export function Skeleton({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        width != null && { width },
        height != null && { height },
        { borderRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: SKELETON_BG,
  },
});
