/**
 * Utilidades de fecha compartidas (semana ISO, agrupación por mes).
 * Fuente única para usePlan, useDashboard y vistas.
 */

/**
 * Límites de la semana actual (lunes–domingo) y fecha de hoy en YYYY-MM-DD.
 * @returns {{ monday: string, sunday: string, today: string }}
 */
export function getWeekBounds() {
  const today = new Date();
  const day = today.getDay(); // 0=Dom, 1=Lun…
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    monday: monday.toISOString().split('T')[0],
    sunday: sunday.toISOString().split('T')[0],
    today: today.toISOString().split('T')[0],
  };
}

/**
 * Genera array de 7 fechas YYYY-MM-DD a partir del lunes.
 * @param {string} mondayStr - Fecha del lunes en YYYY-MM-DD
 * @returns {string[]}
 */
export function generateWeekDays(mondayStr) {
  const days = [];
  const base = new Date(mondayStr + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Agrupa entrenamientos por mes (locale es-ES).
 * @param {Array<{ fecha: string }>} workouts
 * @returns {{ month: string, items: any[] }[]}
 */
export function groupByMonth(workouts) {
  const groups = {};
  workouts.forEach((w) => {
    const d = new Date(w.fecha + 'T00:00:00');
    const key = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });
  return Object.entries(groups).map(([month, items]) => ({ month, items }));
}
