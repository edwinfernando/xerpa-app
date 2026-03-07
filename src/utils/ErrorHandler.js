/**
 * Centralizador de errores XERPA.
 * Muestra feedback vía showToast (sin Alert nativo).
 */

const FRIENDLY_MESSAGES = {
  '23505': 'Ya estás inscrito en esta carrera.',
  '23503': 'Perfil de usuario no encontrado en la base de datos.',
};

/**
 * @param {Error|{ message?: string, code?: string }} error
 * @param {string} contextCode - Ej: "RACE-INS-01", "RACE-DEL-01"
 * @param {(payload: { type: string, title: string, message: string }) => void} showToast
 */
export function showXerpaError(error, contextCode, showToast) {
  if (!showToast) return;
  const code = error?.code ?? null;
  const friendly = code ? FRIENDLY_MESSAGES[code] : null;
  const message = friendly ?? error?.message ?? 'Ha ocurrido un error inesperado.';

  showToast({ type: 'error', title: `Error XERPA [${contextCode}]`, message });
}
