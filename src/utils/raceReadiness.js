/**
 * Determina si una carrera ya pasó o está finalizada.
 * Fuente única de verdad para toda la app.
 * @param {object} item - Objeto carrera con fecha_inicio y estado
 * @returns {boolean}
 */
export function isPastRace(item) {
  if (!item) return false;
  if (item.estado === 'Finalizada') return true;
  const fecha = item.fecha_inicio;
  if (!fecha) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raceDate = new Date(String(fecha).trim() + 'T00:00:00');
  return raceDate < today;
}

/**
 * Cálculo de % de preparación XERPA (CTL vs TSS requerido de la carrera).
 * Usado por SmartRaceCard y RaceDetailSheet.
 * @param {number|null|undefined} ctl - CTL actual del atleta
 * @param {number|null|undefined} tssRequerido - TSS estimado de la carrera
 * @returns {number|null}
 */
export function computeXerpaReadinessPct(ctl, tssRequerido) {
  if (ctl == null || tssRequerido == null || tssRequerido <= 0) return null;
  const pct = Math.round((ctl / tssRequerido) * 100);
  return Math.min(100, Math.max(0, pct));
}
