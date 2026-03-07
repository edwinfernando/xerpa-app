/**
 * XerpaProgress — Barra de progreso canonical del XERPA Design System.
 *
 * Actúa como token de diseño: encapsula altura, color de pista, sombra neón y
 * la paleta semáforo (verde / naranja / rojo / cyan) en un único punto de
 * verdad. Todos los indicadores de progreso de la app deben usar este
 * componente en lugar de <LinearProgress> directamente.
 *
 * Props:
 *   progress  {number}   — 0–100. Se clampea automáticamente.
 *   color     {string?}  — Override de color. Si se omite aplica la paleta
 *                          semáforo automáticamente según progress.
 *   showLabel {boolean?} — Muestra el % al costado (default false).
 *   style     {object?}  — Estilos extra aplicados al contenedor externo.
 *
 * Paleta semáforo (getProgressColorByPct):
 *   >= 80  →  #39FF14  (neon green  · listo para competir)
 *   >= 50  →  #FF9800  (orange      · en proceso)
 *    < 50  →  #FF5252  (red         · necesita entrenamiento)
 *   null   →  #00D2FF  (cyan        · sin datos)
 *
 * Spec visual:
 *   height     = 6 dp
 *   trackColor = rgba(255,255,255,0.08)
 *   glow       = shadowOpacity 0.95, shadowRadius 10 (en LinearProgress)
 *   animation  = Animated.timing 800 ms (en LinearProgress)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearProgress } from './LinearProgress';
import { getProgressColorByPct } from '../../utils/colors';

/** Altura canónica de todas las barras de progreso de la app. */
export const XERPA_PROGRESS_HEIGHT = 6;

/** Color de pista canónico de todas las barras de progreso. */
export const XERPA_PROGRESS_TRACK = 'rgba(255,255,255,0.08)';

export function XerpaProgress({ progress = 0, color, showLabel = false, style }) {
  const resolvedColor = color ?? getProgressColorByPct(progress);

  return (
    <View style={[styles.wrapper, style]}>
      <LinearProgress
        progress={progress}
        color={resolvedColor}
        height={XERPA_PROGRESS_HEIGHT}
        trackColor={XERPA_PROGRESS_TRACK}
        showLabel={showLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
