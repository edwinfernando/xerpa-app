/**
 * Asigna color de acento según el nombre de la carrera (tipo de copa).
 *
 * - "Copa Valle" -> Neón Azul/Cyan (#00F0FF)
 * - "Copa Nacional" -> Neón Naranja/Fuego (#FF5722)
 * - "Campeonato" -> Neón Morado (#B14AED)
 * - Por defecto -> Verde Neón XERPA (#39FF14)
 */
export function getRaceAccentColor(nombre) {
  if (!nombre || typeof nombre !== 'string') return '#39FF14';

  const n = nombre.toLowerCase();

  if (n.includes('copa valle') || n.includes('copa del valle')) return '#00F0FF';
  if (n.includes('copa nacional')) return '#FF5722';
  if (n.includes('campeonato')) return '#B14AED';

  return '#39FF14';
}
