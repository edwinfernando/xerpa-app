/**
 * Construye el payload estándar para webhooks n8n.
 * Incluye contexto_dispositivo (lat, lon, push_token) manejando permisos denegados.
 * Si location o pushToken son null (permisos denegados), se envían null sin romper la app.
 *
 * @param {Object} params
 * @param {string} params.userId - ID del usuario autenticado
 * @param {string} params.mensaje - Mensaje o comando a procesar
 * @param {string} [params.rol] - Rol del usuario (opcional)
 * @param {{ lat?: number, lon?: number, city?: string } | null} params.location
 * @param {string | null} params.pushToken - ExpoPushToken o null si denegado
 * @param {boolean} [params.includeMessageAlias] - Si true, añade "message" como alias de mensaje (chat)
 */
export function buildN8nPayload({ userId, mensaje, rol, location, pushToken, includeMessageAlias }) {
  const payload = {
    user_id: userId,
    mensaje: mensaje ?? null,
    ...(rol != null && { rol }),
    contexto_dispositivo: {
      lat: location?.lat ?? null,
      lon: location?.lon ?? null,
      push_token: pushToken ?? null,
    },
  };
  if (includeMessageAlias && mensaje != null) {
    payload.message = mensaje;
  }
  return payload;
}
