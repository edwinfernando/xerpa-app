/**
 * ContactosEmergenciaService — CRUD de contactos de emergencia (1:N con usuarios)
 *
 * Tabla: contactos_emergencia
 */

import { supabase } from '../../supabase';

/**
 * Agrega un contacto de emergencia.
 *
 * @param {Object} params
 * @param {string} params.usuarioId - UUID del usuario
 * @param {string} params.nombre
 * @param {string} params.parentesco
 * @param {string} params.telefono
 * @param {boolean} [params.esPrincipal]
 * @returns {{ success: boolean, data?: import('../../types/usuarios').ContactoEmergencia, error?: string }}
 */
export async function insertContactoEmergencia({
  usuarioId,
  nombre,
  parentesco,
  telefono,
  esPrincipal = false,
}) {
  if (!usuarioId || !nombre?.trim() || !parentesco?.trim() || !telefono?.trim()) {
    return { success: false, error: 'usuarioId, nombre, parentesco y telefono son requeridos.' };
  }

  try {
    const { data, error } = await supabase
      .from('contactos_emergencia')
      .insert({
        usuario_id: usuarioId,
        nombre: nombre.trim(),
        parentesco: parentesco.trim(),
        telefono: telefono.trim(),
        es_principal: !!esPrincipal,
      })
      .select('id, nombre, parentesco, telefono, es_principal')
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? 'Error al agregar contacto de emergencia.',
    };
  }
}

/**
 * Actualiza un contacto de emergencia.
 *
 * @param {Object} params
 * @param {string} params.contactoId - UUID del contacto
 * @param {string} [params.usuarioId] - Para validar que el contacto pertenece al usuario
 * @param {string} [params.nombre]
 * @param {string} [params.parentesco]
 * @param {string} [params.telefono]
 * @param {boolean} [params.esPrincipal]
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export async function updateContactoEmergencia({
  contactoId,
  usuarioId,
  nombre,
  parentesco,
  telefono,
  esPrincipal,
}) {
  if (!contactoId) {
    return { success: false, error: 'contactoId es requerido.' };
  }

  try {
    const payload = {};
    if (nombre != null) payload.nombre = nombre.trim();
    if (parentesco != null) payload.parentesco = parentesco.trim();
    if (telefono != null) payload.telefono = telefono.trim();
    if (esPrincipal != null) payload.es_principal = esPrincipal;

    if (Object.keys(payload).length === 0) {
      return { success: false, error: 'No hay campos para actualizar.' };
    }

    let query = supabase
      .from('contactos_emergencia')
      .update(payload)
      .eq('id', contactoId);

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { data, error } = await query
      .select('id, nombre, parentesco, telefono, es_principal')
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? 'Error al actualizar contacto de emergencia.',
    };
  }
}

/**
 * Elimina un contacto de emergencia.
 *
 * @param {Object} params
 * @param {string} params.contactoId - UUID del contacto
 * @param {string} [params.usuarioId] - Para validar que el contacto pertenece al usuario (RLS)
 * @returns {{ success: boolean, error?: string }}
 */
export async function deleteContactoEmergencia({ contactoId, usuarioId }) {
  if (!contactoId) {
    return { success: false, error: 'contactoId es requerido.' };
  }

  try {
    let query = supabase.from('contactos_emergencia').delete().eq('id', contactoId);

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    const { error } = await query;

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? 'Error al eliminar contacto de emergencia.',
    };
  }
}
