/**
 * RelacionesService — Gestión de relaciones atleta-entrenador/tutor
 *
 * Esquema relaciones_usuarios:
 *   id, atleta_id, vinculado_id, tipo_vinculo, parentesco, estado
 */

import { supabase } from '../../supabase';

/** @type {'Activo' | 'Inactivo' | 'Pendiente'} */
const ESTADO_PENDIENTE = 'Pendiente';
const ESTADO_INACTIVO = 'Inactivo';

/**
 * Busca un usuario Entrenador/Tutor por código y su perfil extendido (perfil_entrenador + avatar).
 * @param {string} codigo
 * @returns {Promise<BuscarEntrenadorResult | null>}
 * @typedef {Object} BuscarEntrenadorResult
 * @property {string} id
 * @property {string} nombre
 * @property {string} rol
 * @property {string} [avatar_url]
 * @property {string} [codigo] - guardado para usarlo al confirmar vinculación
 * @property {PerfilEntrenador} [perfil]
 * @typedef {Object} PerfilEntrenador
 * @property {string} [profesion]
 * @property {string} [club]
 * @property {string} [descripcion]
 * @property {boolean} [es_tambien_atleta]
 * @property {number} [calificacion_promedio]
 * @property {number} [total_valoraciones]
 * @property {Array<{titulo?: string, descripcion?: string, anio?: number}>} [logros]
 */
export async function buscarUsuarioPorCodigo(codigo) {
  if (!codigo?.trim()) return null;
  const code = codigo.trim();

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, nombre, rol, avatar_url')
    .eq('codigo', code)
    .maybeSingle();

  if (error || !usuario) return null;

  const { data: perfil } = await supabase
    .from('perfil_entrenador')
    .select('profesion, club, descripcion, es_tambien_atleta, calificacion_promedio, total_valoraciones, logros')
    .eq('usuario_id', usuario.id)
    .maybeSingle();

  return {
    id: usuario.id,
    nombre: usuario.nombre || 'Sin nombre',
    rol: usuario.rol || 'Atleta',
    avatar_url: usuario.avatar_url || null,
    codigo: code,
    perfil: perfil
      ? {
          profesion: perfil.profesion ?? null,
          club: perfil.club ?? null,
          descripcion: perfil.descripcion ?? null,
          es_tambien_atleta: perfil.es_tambien_atleta ?? false,
          calificacion_promedio: perfil.calificacion_promedio ?? null,
          total_valoraciones: perfil.total_valoraciones ?? 0,
          logros: Array.isArray(perfil.logros) ? perfil.logros : [],
        }
      : null,
  };
}

/**
 * Desvincula (soft delete: estado Inactivo).
 * @param {Object} params
 * @param {string} params.atletaId - UUID del atleta
 * @param {string} params.relacionId - UUID de la relación
 * @returns {{ success: boolean, error?: string }}
 */
export async function desvincular({ atletaId, relacionId }) {
  if (!atletaId || !relacionId) {
    return { success: false, error: 'Datos incompletos.' };
  }
  try {
    const { error } = await supabase
      .from('relaciones_usuarios')
      .update({ estado: ESTADO_INACTIVO })
      .eq('id', relacionId)
      .eq('atleta_id', atletaId);

    if (error) {
      return { success: false, error: error.message ?? 'No se pudo desvincular.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message ?? 'Error inesperado.' };
  }
}

/**
 * Vincula un atleta con un entrenador/tutor mediante el código de vinculación.
 * Inserta en relaciones_usuarios con estado 'Pendiente'.
 * El tipo_vinculo se deriva del rol del vinculado (Entrenador o Tutor).
 *
 * @param {Object} params
 * @param {string} params.atletaId - UUID del atleta que desea vincularse
 * @param {string} params.codigo - Código de vinculación del entrenador/tutor
 * @param {string} [params.parentesco] - Opcional (ej. para Tutores: "Padre", "Madre")
 * @returns {{ success: boolean, error?: string }}
 */
export async function vincularPorCodigo({ atletaId, codigo, parentesco }) {
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
        tipo_vinculo: vinculado.rol,
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
