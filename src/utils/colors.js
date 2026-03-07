/**
 * getProgressColorByPct — Función canónica de color para barras de progreso
 * y anillos de readiness en toda la app.
 *
 * Tabla semáforo:
 *   >= 80  →  '#39FF14'  (neon green · listo para competir)
 *   >= 50  →  '#FF9800'  (orange     · en proceso)
 *    < 50  →  '#FF5252'  (red        · necesitas más entrenamiento)
 *   null   →  '#00D2FF'  (cyan       · sin datos suficientes)
 *
 * @param {number|null|undefined} pct - Porcentaje 0–100
 * @returns {string} Hex color
 */
export function getProgressColorByPct(pct) {
  if (pct == null || !Number.isFinite(Number(pct))) return '#00D2FF';
  const n = Number(pct);
  if (n >= 80) return '#39FF14';
  if (n >= 50) return '#FF9800';
  return '#FF5252';
}
