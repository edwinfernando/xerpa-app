/**
 * Configuración de tipo de entrenamiento: icono (nombre para MaterialCommunityIcons)
 * y color. También exporta componente Lucide para Dashboard.
 */

import {
  Bike,
  Zap,
  Droplets,
  Dumbbell,
  Activity,
} from 'lucide-react-native';

const DEFAULT_ICON = 'lightning-bolt';
const DEFAULT_COLOR = '#ffca28';

const TYPE_CONFIG = [
  {
    keywords: ['ride', 'bici', 'mtb', 'cicl', 'cycling'],
    icon: 'bike',
    color: '#00F0FF',
    LucideIcon: Bike,
  },
  {
    keywords: ['run', 'corr', 'trail', 'carrera', 'running'],
    icon: 'run',
    color: '#39FF14',
    LucideIcon: Zap,
  },
  {
    keywords: ['strength', 'fuerza', 'gym', 'pesa', 'peso'],
    icon: 'dumbbell',
    color: '#ff9800',
    LucideIcon: Dumbbell,
  },
  {
    keywords: ['recov', 'recuper', 'rest', 'descan'],
    icon: 'heart-pulse',
    color: '#ff5252',
    LucideIcon: Activity,
  },
  {
    keywords: ['swim', 'nat'],
    icon: 'swim',
    color: '#7C4DFF',
    LucideIcon: Droplets,
  },
];

/**
 * Para PlanView y otros que usan MaterialCommunityIcons / Ionicons por nombre.
 * @param {string} tipo - Tipo de entrenamiento
 * @returns {{ icon: string, color: string }}
 */
export function getTypeConfig(tipo) {
  const t = (tipo ?? '').toLowerCase();
  const config = TYPE_CONFIG.find((c) => c.keywords.some((k) => t.includes(k)));
  return config
    ? { icon: config.icon, color: config.color }
    : { icon: DEFAULT_ICON, color: DEFAULT_COLOR };
}

/**
 * Para Dashboard y vistas que usan Lucide (componente React).
 * @param {string} tipo - Tipo de entrenamiento
 * @returns {React.ComponentType} - Componente Lucide
 */
export function getWorkoutIcon(tipo) {
  const t = (tipo || '').toLowerCase();
  const config = TYPE_CONFIG.find((c) => c.keywords.some((k) => t.includes(k)));
  return config ? config.LucideIcon : Activity;
}
