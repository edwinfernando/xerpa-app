/**
 * Formato de duración en minutos → texto legible.
 * Fuente única para Plan, Dashboard y WorkoutActive.
 * @param {number|null|undefined} min - Minutos
 * @returns {string|null} - "45 min" | "1h 30m" | null si no hay valor
 */
export function formatDuracion(min) {
  if (min == null || min === 0) return null;
  const m = Math.round(Number(min));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return h > 0
    ? `${h}h ${rest > 0 ? rest + 'm' : ''}`.trim()
    : `${rest} min`;
}

/**
 * Para UI que debe mostrar un guion cuando no hay duración.
 * @param {number|null|undefined} min
 * @returns {string}
 */
export function formatDuracionOrPlaceholder(min) {
  const formatted = formatDuracion(min);
  return formatted ?? '—';
}
