/**
 * UserContext — Estado global del perfil del usuario
 *
 * Usa React Query para cache y deduplicación. refreshUserData invalida la query
 * para que toda la UI se actualice (p. ej. tras actualización desde XERPA AI).
 */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { LayoutAnimation, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryClient';
import { fetchUserProfile } from '../api/userProfileApi';

const UserContext = createContext({
  profileData: null,
  refreshUserData: () => Promise.resolve(),
  refreshUserRaces: () => {},
  racesRevision: 0,
});

export function UserContextProvider({ children, authUser }) {
  const queryClient = useQueryClient();
  const userId = authUser?.id ?? null;

  const { data: profileData } = useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  const [racesRevision, setRacesRevision] = React.useState(0);

  const refreshUserData = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(userId) });
  }, [queryClient, userId]);

  const refreshUserRaces = useCallback(() => {
    setRacesRevision((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      profileData: profileData ?? null,
      refreshUserData,
      refreshUserRaces,
      racesRevision,
    }),
    [profileData, refreshUserData, refreshUserRaces, racesRevision]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
