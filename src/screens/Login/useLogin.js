import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu email y contraseña.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Error de inicio de sesión', error.message);
      return;
    }

    Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso.');
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu email y contraseña.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Contraseña corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (signUpError) {
      Alert.alert('Error de registro', signUpError.message);
      return;
    }

    if (data?.user) {
      const { error: insertError } = await supabase.from('usuarios').insert([
        {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.email,
          rol: 'Atleta',
        },
      ]);

      if (insertError) {
        Alert.alert('Error en la base de datos', insertError.message);
        return;
      }

      Alert.alert(
        '¡Registro exitoso!',
        'Verifica tu bandeja de entrada para confirmar tu email.'
      );
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleSignUp,
  };
}
