/**
 * XERPA Design System — Design Tokens
 * Fuente única de verdad para colores, espaciado y bordes.
 *
 * Responsive: usa flex, %, Dimensions.get('window') para contenedores.
 * Touch targets: mínimo 44x44 dp (TOUCH_TARGET_MIN).
 * Inputs: fontSize mínimo 16 para evitar zoom automático en iOS.
 */

import { Platform } from 'react-native';

export const theme = {
  /** Área táctil mínima en dp (Apple HIG / Material) */
  TOUCH_TARGET_MIN: 44,
  /** Tamaño mínimo de fuente en inputs para evitar zoom iOS */
  INPUT_FONT_SIZE_MIN: 16,
  /** Altura fija para botones principales y secundarios */
  BUTTON_HEIGHT: 52,
  /** Altura fija para inputs (formularios ordenados) */
  INPUT_HEIGHT: 50,
  /** Padding horizontal del contenedor de botones (evitar que toquen bordes) */
  SCREEN_PADDING_HORIZONTAL: 16,
  /** Padding inferior de BottomSheets (igual en iOS y Android) */
  SHEET_PADDING_BOTTOM: 24,

  colors: {
    background: '#0F1116',      // Dark mode — fondo principal
    surface: '#1C1F26',         // Tarjetas, modales
    surfaceInput: '#1E1E1E',    // Inputs, campos de formulario
    primary: '#00F0FF',         // Azul neón XERPA (links, acentos, botón back)
    linkHighlight: '#00F0FF',   // Alias: enlaces secundarios (labels inferiores)
    secondary: '#39FF14',       // Verde XERPA (accent, gradientes)
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#888888',
    textTertiary: '#555555',
    textQuaternary: '#666666',
    textOnPrimary: '#121212',   // Texto sobre fondos claros (gradiente, Apple)
    danger: '#ff5252',
    warning: '#D97706',        // Ámbar oscuro para avisos (ProfileCompletionBanner)
    border: '#333333',
    // Legacy alias
    cardBackground: '#1C1F26',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    // Alias para padding de pantalla (usar theme.SCREEN_PADDING_HORIZONTAL)
    screenPadding: 16,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 99,
  },

  /**
   * Sombras cross-platform: shadow* para iOS, elevation para Android.
   * @param {object} opts - { color, offset?, opacity?, radius?, elevation? }
   */
  shadow: (opts = {}) => {
    const { color = '#000', offset = { width: 0, height: 2 }, opacity = 0.15, radius = 8, elevation = 4 } = opts;
    return Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: offset,
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: {
        elevation,
      },
      default: {},
    });
  },
};
