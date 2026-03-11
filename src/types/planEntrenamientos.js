/**
 * Tipos e interfaces para plan_entrenamientos.
 * Esquema actualizado con hora, punto_encuentro, is_generado_ia,
 * entrenador_id y nota_atleta.
 */

/**
 * @typedef {Object} PlanEntrenamiento
 * @property {string} id - UUID del plan
 * @property {string} user_id - UUID del atleta (FK usuarios)
 * @property {string} fecha - Fecha en formato AAAA-MM-DD
 * @property {string} [semana_inicio] - Lunes de la semana (YYYY-MM-DD). Auto-rellenado por trigger.
 * @property {string} [tipo] - Ej: Ride, Run, Strength, Rest, Walk
 * @property {string} [titulo]
 * @property {string} [detalle] - Instrucciones del entreno
 * @property {number|null} [duracion_min]
 * @property {number|null} [tss_plan]
 * @property {number|null} [tss_real]
 * @property {boolean} [completado]
 * @property {string|null} [hora] - Hora del entreno (ej. "08:00")
 * @property {string|null} [punto_encuentro]
 * @property {boolean} [is_generado_ia] - Si el plan fue generado por XERPA COACH (IA)
 * @property {string|null} [entrenador_id] - UUID del entrenador si fue asignado por uno
 * @property {string|null} [nota_atleta] - Feedback/sensaciones post-entreno
 */
