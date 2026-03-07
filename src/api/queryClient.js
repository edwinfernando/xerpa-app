/**
 * TanStack Query client y opciones por defecto.
 * Cache centralizado para lecturas Supabase (perfil, plan, carreras).
 */
import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 60 * 1000; // 1 minuto
const CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutos

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: CACHE_TIME_MS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Query keys centralizados para invalidación */
export const queryKeys = {
  userProfile: (userId) => ['user', 'profile', userId],
  plan: (userId) => ['plan', userId],
  races: (userId) => ['races', userId],
  globalRaces: () => ['races', 'global'],
};
