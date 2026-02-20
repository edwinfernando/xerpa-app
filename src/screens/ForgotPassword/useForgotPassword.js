import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapForgotPasswordError(message) {
  const msg = message.toLowerCase();
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  return 'No pudimos enviar el enlace. Verifica tu correo.';
}

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetEmail = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handleSend = async () => {
    // — Validación frontend —
    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // — Llamada a Supabase —
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        setEmailError(mapForgotPasswordError(error.message));
      } else {
        Alert.alert(
          'Correo enviado ✓',
          'Revisa tu bandeja de entrada para restablecer tu contraseña.'
        );
      }
    } catch {
      setEmailError('Sin conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    emailError,
    loading,
    handleSetEmail,
    handleSend,
  };
}
