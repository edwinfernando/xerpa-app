/**
 * Tipos e interfaces para el esquema de usuarios y relaciones.
 * Refactorizado para usar la tabla relaciones_usuarios en lugar de
 * columnas directas (entrenador_id, atleta_id, codigo_asociado, parentesco).
 * Las credenciales de plataformas externas (Intervals.icu, Strava, Garmin)
 * viven en integraciones_terceros (1:N).
 */

/**
 * @typedef {Object} Usuario
 * @property {string} id - UUID del usuario (auth.users)
 * @property {string} [email]
 * @property {string} [rol] - 'Atleta' | 'Entrenador' | 'Tutor'
 * @property {string} [nombre]
 * @property {boolean} [perfil_completado]
 * @property {number} [talla_cm]
 * @property {number} [peso_kg]
 * @property {string} [modalidad]
 * @property {string} [categoria]
 * @property {string} [condiciones_especiales]
 * @property {number} [edad]
 * @property {string} [codigo] - Código único del usuario (usuarios.codigo)
 * @remarks telegram_id y canal_preferido eliminados; ahora en preferencias_notificaciones
 */

/**
 * Integración con plataforma externa (Intervals.icu, Strava, Garmin).
 * Sustituye columnas obsoletas: athlete_id, athlete_api_key, intervals_api_key.
 *
 * @typedef {Object} IntegracionTercero
 * @property {string} id - UUID de la integración
 * @property {string} usuario_id - UUID del usuario (FK a usuarios.id)
 * @property {'intervals' | 'strava' | 'garmin' | 'wahoo'} plataforma
 * @property {string} [id_externo] - Reemplaza athlete_id (ej. athlete ID de Intervals.icu)
 * @property {string} [api_key] - Reemplaza intervals_api_key
 * @property {'Activa' | 'Inactiva' | 'Revocada'} estado
 */

/**
 * @typedef {'Entrenador' | 'Tutor'} TipoVinculo
 */

/**
 * @typedef {'Activo' | 'Inactivo' | 'Pendiente'} EstadoRelacion
 */

/**
 * @typedef {Object} RelacionUsuario
 * @property {string} id - UUID de la relación
 * @property {string} atleta_id - UUID del atleta (FK usuarios)
 * @property {string} vinculado_id - UUID del entrenador/tutor (FK usuarios)
 * @property {TipoVinculo} tipo_vinculo - 'Entrenador' o 'Tutor'
 * @property {string} [parentesco] - Opcional (ej. "Padre", "Madre")
 * @property {EstadoRelacion} estado - 'Activo' | 'Inactivo' | 'Pendiente'
 */

/**
 * Usuario vinculado (resumen para mostrar en UI)
 * @typedef {Object} UsuarioVinculado
 * @property {string} id
 * @property {string} [nombre]
 * @property {string} [email]
 * @property {string} [rol]
 */

/**
 * Preferencias de notificaciones (1:1 con usuarios).
 * Sustituye columnas obsoletas: telegram_id, canal_preferido.
 *
 * @typedef {Object} PreferenciasNotificaciones
 * @property {string} id - UUID
 * @property {string} usuario_id - FK a usuarios.id (UNIQUE)
 * @property {'Telegram' | 'WhatsApp' | 'Email' | 'Push'} [canal_principal]
 * @property {string} [telegram_id]
 * @property {boolean} [alertas_entrenamiento]
 * @property {boolean} [alertas_sistema]
 */

/**
 * Contacto de emergencia (1:N con usuarios)
 *
 * @typedef {Object} ContactoEmergencia
 * @property {string} id - UUID
 * @property {string} usuario_id - FK a usuarios.id
 * @property {string} nombre
 * @property {string} parentesco
 * @property {string} telefono
 * @property {boolean} [es_principal]
 */

/**
 * Relación con datos del usuario vinculado (entrenador/tutor)
 * @typedef {Object} RelacionUsuarioConVinculado
 * @property {string} id
 * @property {TipoVinculo} tipo_vinculo
 * @property {EstadoRelacion} estado
 * @property {string} [parentesco]
 * @property {UsuarioVinculado} [vinculado] - Datos del entrenador/tutor
 */

/**
 * Perfil del usuario con relaciones, integraciones y preferencias
 * @typedef {Usuario & {
 *   relaciones_usuarios?: RelacionUsuarioConVinculado[];
 *   integraciones?: IntegracionTercero[];
 *   preferencias?: PreferenciasNotificaciones | null;
 *   contactosEmergencia?: ContactoEmergencia[];
 * }} ProfileData
 */
