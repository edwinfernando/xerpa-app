import React from 'react';
import { useLogin } from './useLogin';
import { LoginView } from './LoginView';
import { loginStyles } from './LoginStyles';

export default function LoginScreen({ navigation }) {
  const {
    email,
    password,
    loading,
    emailError,
    passwordError,
    globalAuthError,
    handleSetEmail,
    handleSetPassword,
    handleLogin,
  } = useLogin();

  return (
    <LoginView
      email={email}
      password={password}
      loading={loading}
      emailError={emailError}
      passwordError={passwordError}
      globalAuthError={globalAuthError}
      handleSetEmail={handleSetEmail}
      handleSetPassword={handleSetPassword}
      handleLogin={handleLogin}
      onNavigateSignUp={() => navigation.navigate('SignUp')}
      onNavigateForgotPassword={() => navigation.navigate('ForgotPassword')}
      styles={loginStyles}
    />
  );
}
