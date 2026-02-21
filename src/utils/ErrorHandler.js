/**
 * Centralizador de errores XERPA.
 * Muestra Alert con título contextual y mensajes amigables según código.
 */
import { Alert } from 'react-native';

const FRIENDLY_MESSAGES = {
  '23505': 'Ya estás inscrito en esta carrera.',
  '23503': 'Perfil de usuario no encontrado en la base de datos.',
};

/**
 * @param {Error|{ message?: string, code?: string }} error
 * @param {string} contextCode - Ej: "RACE-INS-01", "RACE-DEL-01"
 */
export function showXerpaError(error, contextCode) {
  const code = error?.code ?? null;
  const friendly = code ? FRIENDLY_MESSAGES[code] : null;
  const message = friendly ?? error?.message ?? 'Ha ocurrido un error inesperado.';

  Alert.alert(`⚠️ Error XERPA [${contextCode}]`, message);
}
