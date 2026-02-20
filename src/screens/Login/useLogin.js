import { useState } from 'react';
import { supabase } from '../../../supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapLoginError(message) {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Por favor, verifica tu correo antes de entrar.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalAuthError, setGlobalAuthError] = useState('');

  const handleSetEmail = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (globalAuthError) setGlobalAuthError('');
  };

  const handleSetPassword = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (globalAuthError) setGlobalAuthError('');
  };

  const handleLogin = async () => {
    // — Validación frontend (field-level) —
    let hasError = false;

    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Por favor, ingresa un correo electrónico válido.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Ingresa tu contraseña para continuar.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      hasError = true;
    }

    if (hasError) return;

    // — Llamada a Supabase (errores → globalAuthError) —
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setGlobalAuthError(mapLoginError(error.message));
      }
    } catch {
      setGlobalAuthError('Sin conexión. Comprueba tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    loading,
    emailError,
    passwordError,
    globalAuthError,
    handleSetEmail,
    handleSetPassword,
    handleLogin,
  };
}
