import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

export function usePerfil(user) {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('Atleta');

  useEffect(() => {
    async function loadPerfil() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('usuarios')
        .select('nombre, rol')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setNombre(data.nombre || user.email?.split('@')[0] || '');
        setRol(data.rol || 'Atleta');
      } else {
        setNombre(user.email?.split('@')[0] || '');
      }
    }
    loadPerfil();
  }, [user?.id]);

  const handleGuardar = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase
      .from('usuarios')
      .update({ nombre, rol })
      .eq('id', user.id);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Guardado', 'Tu perfil se actualizó correctamente.');
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const handleVincularStrava = () => {
    Alert.alert('Próximamente', 'La vinculación con Strava estará disponible pronto.');
  };

  const handleVincularIntervalos = () => {
    Alert.alert('Próximamente', 'La vinculación con Intervalos.icu estará disponible pronto.');
  };

  return {
    loading,
    nombre,
    setNombre,
    rol,
    setRol,
    email: user?.email || '',
    handleGuardar,
    handleLogout,
    handleVincularStrava,
    handleVincularIntervalos,
  };
}
