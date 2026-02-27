/**
 * Construye el payload estándar para webhooks n8n.
 * Incluye contexto_dispositivo (lat, lon, push_token) manejando permisos denegados.
 * Si location o pushToken son null (permisos denegados), se envían null sin romper la app.
 *
 * WF06 (generar plan): Si se pasa carreraContext, WF06 priorizará los requerimientos
 * de esas carreras (ej. si tiene mucho desnivel, programar más intervalos de potencia en ascenso).
 *
 * @param {Object} params
 * @param {string} params.userId - ID del usuario autenticado
 * @param {string} params.mensaje - Mensaje o comando a procesar
 * @param {string} [params.rol] - Rol del usuario (opcional)
 * @param {{ lat?: number, lon?: number, city?: string } | null} params.location
 * @param {string | null} params.pushToken - ExpoPushToken o null si denegado
 * @param {boolean} [params.includeMessageAlias] - Si true, añade "message" como alias de mensaje (chat)
 * @param {Array<{ nombre: string, distancia_km?: number, desnivel_m?: number, tss_estimado?: number, prioridad: string }>} [params.carreraContext] - Carreras con preparar_con_xerpa=true para WF06
 */
export function buildN8nPayload({ userId, mensaje, rol, location, pushToken, includeMessageAlias, carreraContext }) {
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
  if (carreraContext && carreraContext.length > 0) {
    payload.carreras_priorizadas = carreraContext.map((c) => ({
      nombre: c.nombre,
      distancia_km: c.distancia_km ?? null,
      desnivel_m: c.desnivel_m ?? null,
      tss_estimado: c.tss_estimado ?? null,
      prioridad: c.prioridad ?? 'B',
    }));
  }
  return payload;
}
