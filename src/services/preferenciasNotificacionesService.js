/**
 * PreferenciasNotificacionesService — Preferencias de notificación (1:1 con usuarios)
 *
 * Sustituye columnas obsoletas en usuarios: telegram_id, canal_preferido.
 * Tabla: preferencias_notificaciones (usuario_id UNIQUE)
 */

import { supabase } from '../../supabase';

/**
 * Upsert de preferencias de notificación para un usuario.
 * Relación 1:1: usa usuario_id como conflicto.
 *
 * @param {Object} params
 * @param {string} params.usuarioId - UUID del usuario
 * @param {'Telegram' | 'WhatsApp' | 'Email' | 'Push'} [params.canalPrincipal]
 * @param {string} [params.telegramId]
 * @param {boolean} [params.alertasEntrenamiento]
 * @param {boolean} [params.alertasSistema]
 * @returns {{ success: boolean, error?: string }}
 */
export async function upsertPreferenciasNotificaciones({
  usuarioId,
  canalPrincipal,
  telegramId,
  alertasEntrenamiento,
  alertasSistema,
}) {
  if (!usuarioId) {
    return { success: false, error: 'usuarioId es requerido.' };
  }

  try {
    const payload = {
      usuario_id: usuarioId,
      ...(canalPrincipal != null && { canal_principal: canalPrincipal }),
      ...(telegramId != null && { telegram_id: telegramId ?? null }),
      ...(alertasEntrenamiento != null && { alertas_entrenamiento: alertasEntrenamiento }),
      ...(alertasSistema != null && { alertas_sistema: alertasSistema }),
    };

    const { error } = await supabase
      .from('preferencias_notificaciones')
      .upsert(payload, { onConflict: 'usuario_id' });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? 'Error al guardar preferencias de notificación.',
    };
  }
}
