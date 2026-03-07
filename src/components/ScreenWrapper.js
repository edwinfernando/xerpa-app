import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

/**
 * ScreenWrapper — Contenedor base para todas las pantallas de XERPA.
 *
 * Proporciona:
 *  - SafeAreaView (react-native-safe-area-context) para respetar el notch
 *  - Color de fondo unificado (theme.colors.background)
 *  - paddingHorizontal estándar (theme.spacing.screenPadding) via prop `padded`
 *
 * Props:
 *  - children: contenido de la pantalla
 *  - style: estilos adicionales para el SafeAreaView
 *  - padded: (bool, default false) aplica paddingHorizontal global.
 *  - edges: array de edges para SafeAreaView (default: ['top','left','right','bottom']).
 *            Para pantallas con CollapsibleHeader usar ['left','right','bottom'] para que
 *            el header se extienda en el área del notch.
 */
export function ScreenWrapper({ children, style, padded = false, edges }) {
  return (
    <SafeAreaView
      edges={edges ?? ['top', 'left', 'right', 'bottom']}
      style={[
        styles.wrapper,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  padded: {
    paddingHorizontal: theme.SCREEN_PADDING_HORIZONTAL,
  },
});
