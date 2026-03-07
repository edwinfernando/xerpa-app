/**
 * useNavigationBarColor — Gestiona el color de la barra de navegación del sistema en Android
 *
 * Al abrir un BottomSheet, cambia la barra de navegación al color del sheet para lograr
 * un acabado edge-to-edge. Al cerrar, restaura el color principal de la app.
 *
 * Solo tiene efecto en Android; en iOS la barra de navegación no es visible.
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';

let navBarBackgroundSupported = null;

function isEdgeToEdgeEnabled() {
  const expoCfg = Constants?.expoConfig?.android?.edgeToEdgeEnabled;
  if (typeof expoCfg === 'boolean') return expoCfg;
  const manifestCfg = Constants?.manifest2?.extra?.expoClient?.android?.edgeToEdgeEnabled;
  if (typeof manifestCfg === 'boolean') return manifestCfg;
  return false;
}

/**
 * @param {boolean} visible - Si el BottomSheet está visible/abierto
 * @param {string} sheetColor - Color cuando el sheet está abierto (ej. 'rgb(51, 51, 51)')
 * @param {string} defaultColor - Color de la app cuando está cerrado (ej. '#121212')
 */
export function useNavigationBarColor(visible, sheetColor, defaultColor = '#121212') {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const edgeToEdgeEnabled = isEdgeToEdgeEnabled();
    if (edgeToEdgeEnabled) return;

    async function updateColor() {
      if (navBarBackgroundSupported === false) return;
      try {
        await NavigationBar.setBackgroundColorAsync(visible ? sheetColor : defaultColor);
        navBarBackgroundSupported = true;
      } catch (e) {
        // Si el runtime no soporta cambiar color (edge-to-edge/ROM), desactivar futuros intentos.
        navBarBackgroundSupported = false;
      }
    }

    updateColor();

    return () => {
      // Al desmontar (ej. navegar con sheet abierto), restaurar color
      if (Platform.OS === 'android' && navBarBackgroundSupported !== false) {
        NavigationBar.setBackgroundColorAsync(defaultColor).catch(() => {});
      }
    };
  }, [visible, sheetColor, defaultColor]);
}
