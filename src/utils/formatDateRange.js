/**
 * Formateador de rango de fechas para eventos multi-día.
 *
 * Mismo mes:  "18 - 20 Mar, 2026"
 * Cruza meses: "29 Abr - 1 May, 2026"
 *
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD), opcional
 * @returns {string}
 */
export function formatDateRange(fechaInicio, fechaFin) {
  if (!fechaInicio) return '—';

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const parse = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return { year: y, month: m, day: d };
  };

  const start = parse(fechaInicio);
  if (!start) return '—';

  // Sin fecha fin o misma fecha → mostrar solo una fecha
  if (!fechaFin || fechaFin === fechaInicio) {
    return `${start.day} ${MONTHS[start.month - 1]}, ${start.year}`;
  }

  const end = parse(fechaFin);
  if (!end) return `${start.day} ${MONTHS[start.month - 1]}, ${start.year}`;

  const sameMonth = start.month === end.month;
  const sameYear = start.year === end.year;

  if (sameMonth && sameYear) {
    return `${start.day} - ${end.day} ${MONTHS[start.month - 1]}, ${start.year}`;
  }

  if (sameYear) {
    return `${start.day} ${MONTHS[start.month - 1]} - ${end.day} ${MONTHS[end.month - 1]}, ${start.year}`;
  }

  return `${start.day} ${MONTHS[start.month - 1]}, ${start.year} - ${end.day} ${MONTHS[end.month - 1]}, ${end.year}`;
}
