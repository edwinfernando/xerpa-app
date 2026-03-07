/**
 * API de perfil de usuario (Supabase).
 * Usado por UserContext con React Query para cache y deduplicación.
 */
import { supabase } from '../../supabase';

const USER_SELECT_COLUMNS = 'id, email, rol, nombre, perfil_completado, talla_cm, peso_kg, modalidad, categoria, condiciones_especiales, edad, codigo';
const RELACIONES_EMBED = 'relaciones_usuarios!atleta_id(id, tipo_vinculo, estado, parentesco, vinculado:usuarios!vinculado_id(id, nombre, email, rol))';
const INTEGRACIONES_EMBED = 'integraciones_terceros(plataforma, id_externo, api_key, estado)';
const PREFERENCIAS_EMBED = 'preferencias_notificaciones(canal_principal, telegram_id, alertas_entrenamiento, alertas_sistema)';
const CONTACTOS_EMERGENCIA_EMBED = 'contactos_emergencia(id, nombre, parentesco, telefono, es_principal)';

/**
 * @param {string} userId
 * @returns {Promise<object|null>} Perfil normalizado o null
 */
export async function fetchUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('usuarios')
    .select(`${USER_SELECT_COLUMNS}, ${RELACIONES_EMBED}, ${INTEGRACIONES_EMBED}, ${PREFERENCIAS_EMBED}, ${CONTACTOS_EMERGENCIA_EMBED}`)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    const fallbackToSimple = error.code === '42703' || error.message?.includes('does not exist');
    if (fallbackToSimple) {
      const { data: simpleData, error: simpleError } = await supabase
        .from('usuarios')
        .select(USER_SELECT_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (!simpleError && simpleData) {
        return {
          ...simpleData,
          relaciones_usuarios: [],
          integraciones: [],
          preferencias: null,
          contactosEmergencia: [],
        };
      }
    }
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    preferencias: Array.isArray(data.preferencias_notificaciones) ? data.preferencias_notificaciones[0] ?? null : data.preferencias_notificaciones ?? null,
    contactosEmergencia: data.contactos_emergencia ?? [],
    integraciones: data.integraciones_terceros ?? [],
  };
}
