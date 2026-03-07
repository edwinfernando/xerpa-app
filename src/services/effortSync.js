/**
 * Effort Sync — Guarda esfuerzo manual en Supabase o AsyncStorage (offline)
 *
 * Flujo:
 *  1. Intenta INSERT en esfuerzo_manual (Supabase)
 *  2. Si falla (ej. sin internet) → guarda en pending_manual_efforts
 *  3. Marca plan_entrenamiento como completado (online) o lo registra en pending
 */

import { supabase } from '../../supabase';
import {
  appendPendingEffort,
  getPendingManualEfforts,
  removePendingEfforts,
} from './offlineStorage';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} params.rpe (1-10)
 * @param {string} params.fecha YYYY-MM-DD
 * @param {number} params.duracionMin minutos del cronómetro
 * @param {string} [params.tipo='Ride']
 * @param {string} [params.planEntrenamientoId] para marcar completado
 * @returns {{ success: boolean, offline?: boolean, toastMessage?: string }}
 */
export async function saveManualEffort({
  userId,
  rpe,
  fecha,
  duracionMin,
  tipo = 'Ride',
  planEntrenamientoId,
}) {
  const effortPayload = {
    user_id: userId,
    rpe,
    fecha,
    duracion_min: duracionMin,
    tipo,
  };

  try {
    // Compatibilidad estable: persistimos en minutos (schema actual) y la DB
    // puede derivar segundos vía trigger/migración sin romper clientes.
    const insertPayload = { user_id: userId, rpe, fecha, duracion_min: Math.max(0, Math.round(duracionMin || 0)) };
    const { error: insertError } = await supabase.from('esfuerzo_manual').insert(insertPayload);

    if (insertError) throw insertError;

    // Marcar plan como completado (online)
    if (planEntrenamientoId) {
      await supabase
        .from('plan_entrenamientos')
        .update({ completado: true })
        .eq('id', planEntrenamientoId);
    }

    return { success: true };
  } catch (err) {
    // Offline o error de red → guardar en AsyncStorage
    await appendPendingEffort({
      ...effortPayload,
      plan_entrenamiento_id: planEntrenamientoId,
    });

    return {
      success: true,
      offline: true,
      toastMessage: 'Guardado offline. Se sincronizará al recuperar conexión.',
    };
  }
}

/**
 * Sincroniza esfuerzos pendientes cuando hay conexión.
 * Llamar al iniciar app o cuando NetInfo indique que hay internet.
 */
export async function syncPendingEfforts(userId) {
  const pending = await getPendingManualEfforts();
  if (pending.length === 0) return { synced: 0 };

  const toRemove = [];

  for (let i = 0; i < pending.length; i++) {
    try {
      const p = pending[i];
      const syncPayload = {
        user_id: p.user_id || userId,
        rpe: p.rpe,
        fecha: p.fecha,
        duracion_min: Math.max(0, Math.round(p.duracion_min ?? 0)),
      };
      const { error } = await supabase.from('esfuerzo_manual').insert(syncPayload);

      if (!error && p.plan_entrenamiento_id) {
        await supabase
          .from('plan_entrenamientos')
          .update({ completado: true })
          .eq('id', p.plan_entrenamiento_id);
      }

      if (!error) toRemove.push(i);
    } catch {
      // Dejar pendiente para el próximo intento
    }
  }

  if (toRemove.length > 0) {
    await removePendingEfforts(toRemove);
  }

  return { synced: toRemove.length };
}
