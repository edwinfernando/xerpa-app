import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../supabase';
import { useToast } from '../../context/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONBOARDING_KEY = 'xerpa_onboarding';

function mapSignUpError(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'Este correo ya está registrado. Inicia sesión o usa otro.';
  }
  if (msg.includes('invalid email')) {
    return 'Por favor, ingresa un correo electrónico válido.';
  }
  if (msg.includes('weak') || msg.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }
  return message || 'Ocurrió un error. Intenta de nuevo.';
}

export function useSignUp() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalAuthError, setGlobalAuthError] = useState('');

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setGlobalAuthError('');
  };

  const handleCreateAccount = async (onSuccess) => {
    clearErrors();
    let hasError = false;

    if (!email.trim()) {
      setEmailError('El correo es obligatorio.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Ingresa un correo electrónico válido.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      hasError = true;
    }

    if (hasError) return;

    setLoadingForm(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setGlobalAuthError(mapSignUpError(error.message));
        return;
      }

      const user = data?.user;
      if (!user?.id) {
        setGlobalAuthError('No se pudo completar el registro. Intenta de nuevo.');
        return;
      }

      // La fila en usuarios se crea automáticamente por trigger on_auth_user_created

      await AsyncStorage.setItem(
        ONBOARDING_KEY,
        JSON.stringify({ isNewUser: true, userRole: 'Atleta' })
      );

      onSuccess?.();
    } catch (err) {
      setGlobalAuthError(err?.message || 'Error inesperado. Intenta de nuevo.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleGoogleSignIn = () => {
    showToast({ type: 'info', title: 'Próximamente', message: 'El registro con Google estará disponible pronto.' });
  };

  const handleAppleSignIn = () => {
    showToast({ type: 'info', title: 'Próximamente', message: 'El registro con Apple estará disponible pronto.' });
  };

  const handleSetEmail = (text) => {
    setEmail(text);
    if (emailError || globalAuthError) clearErrors();
  };
  const handleSetPassword = (text) => {
    setPassword(text);
    if (passwordError || globalAuthError) clearErrors();
  };

  return {
    email,
    setEmail: handleSetEmail,
    password,
    setPassword: handleSetPassword,
    loadingForm,
    emailError,
    passwordError,
    globalAuthError,
    handleCreateAccount,
    handleGoogleSignIn,
    handleAppleSignIn,
  };
}
