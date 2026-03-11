/**
 * Configuración común para Bottom Sheets (react-native-modal).
 * - Se despliegan encima del tab bar (zIndex alto).
 * - En Android: encima de la nav bar del sistema; el contenido usa safe area bottom.
 */
import { Platform } from 'react-native';

const Z_INDEX_ABOVE_TAB_BAR = 9999;

/** Estilo para el Modal: encima del tab bar, full width, anclado abajo */
export function getSheetModalStyle() {
  return {
    margin: 0,
    justifyContent: 'flex-end',
    zIndex: Z_INDEX_ABOVE_TAB_BAR,
    elevation: Platform.OS === 'android' ? Z_INDEX_ABOVE_TAB_BAR : undefined,
  };
}

/** Props comunes para <Modal> de react-native-modal (tab bar + Android nav bar) */
export function getSheetModalProps() {
  return {
    ...(Platform.OS === 'android' && { statusBarTranslucent: true }),
    coverScreen: true,
  };
}

/** Estilo para modales centrados (confirmaciones): solo zIndex/elevation para quedar encima del tab bar */
export function getCenteredModalStyle() {
  return {
    zIndex: Z_INDEX_ABOVE_TAB_BAR,
    elevation: Platform.OS === 'android' ? Z_INDEX_ABOVE_TAB_BAR : undefined,
  };
}
