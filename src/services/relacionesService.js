/**
 * RelacionesService — Gestión de relaciones atleta-entrenador/tutor
 *
 * Refactorizado: ya no se usa update en usuarios (entrenador_id), sino
 * insert en relaciones_usuarios con estado inicial 'Pendiente'.
 *
 * Esquema relaciones_usuarios:
 *   id, atleta_id, vinculado_id, tipo_vinculo, parentesco, estado
 */

import { supabase } from '../../supabase';

/** @type {'Activo' | 'Inactivo' | 'Pendiente'} */
const ESTADO_PENDIENTE = 'Pendiente';

/** @type {'Entrenador' | 'Tutor'} */
const TIPO_ENTRENADOR = 'Entrenador';

/**
 * Vincula un atleta con un entrenador/tutor mediante el código de vinculación.
 * Inserta en relaciones_usuarios con estado 'Pendiente'.
 *
 * @param {Object} params
 * @param {string} params.atletaId - UUID del atleta que desea vincularse
 * @param {string} params.codigo - Código de vinculación del entrenador/tutor
 * @param {'Entrenador' | 'Tutor'} [params.tipoVinculo='Entrenador']
 * @param {string} [params.parentesco] - Opcional (ej. para Tutores: "Padre", "Madre")
 * @returns {{ success: boolean, error?: string }}
 */
export async function vincularPorCodigo({
  atletaId,
  codigo,
  tipoVinculo = TIPO_ENTRENADOR,
  parentesco,
}) {
  if (!atletaId || !codigo || typeof codigo !== 'string') {
    return { success: false, error: 'Atleta y código son requeridos.' };
  }

  const codigoTrim = codigo.trim();
  if (!codigoTrim) {
    return { success: false, error: 'El código no puede estar vacío.' };
  }

  try {
    const { data: vinculado, error: lookupError } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('codigo', codigoTrim)
      .maybeSingle();

    if (lookupError) {
      return { success: false, error: `Error al buscar el código: ${lookupError.message}` };
    }

    if (!vinculado) {
      return { success: false, error: 'Código no válido. Verifica que sea correcto.' };
    }

    if (vinculado.id === atletaId) {
      return { success: false, error: 'No puedes vincular tu propio código.' };
    }

    const rolValido = ['Entrenador', 'Tutor'].includes(vinculado.rol);
    if (!rolValido) {
      return { success: false, error: 'El código pertenece a un Atleta. Solo puedes vincular con Entrenador o Tutor.' };
    }

    const { error: insertError } = await supabase
      .from('relaciones_usuarios')
      .insert({
        atleta_id: atletaId,
        vinculado_id: vinculado.id,
        tipo_vinculo: vinculado.rol === 'Tutor' ? 'Tutor' : tipoVinculo,
        parentesco: parentesco?.trim() || null,
        estado: ESTADO_PENDIENTE,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'Ya tienes una solicitud de vinculación pendiente o activa con este usuario.' };
      }
      return { success: false, error: `Error al vincular: ${insertError.message}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err?.message ?? 'Error inesperado al vincular.',
    };
  }
}
