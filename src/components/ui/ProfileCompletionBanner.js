import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../context/UserContext';
import { Button } from './Button';
import { theme } from '../../theme/theme';

/**
 * Banner global que se muestra cuando el perfil del usuario está incompleto.
 * Lee del UserContext (reactivo): cuando la IA actualiza el perfil, desaparece al instante.
 */
export function ProfileCompletionBanner({ user }) {
  const navigation = useNavigation();
  const { profileData } = useUserContext();

  if (!user?.id) return null;

  const data = profileData ?? {};
  // Condición maestra: ocultar banner estrictamente cuando perfil_completado es true
  if (data.perfil_completado === true) return null;

  const handleCompletarAhora = () => {
    navigation.navigate('MainTabs', { screen: 'XerpaAI' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={2}>
          Completa tu perfil para una experiencia XERPA completa.
        </Text>
        <Button
          title="Completar ahora"
          variant="secondary"
          onPress={handleCompletarAhora}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  text: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
  },
});
