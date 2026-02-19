import React from 'react';
import { useLogin } from './useLogin';
import { LoginView } from './LoginView';
import { loginStyles } from './LoginStyles';

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    handleSignUp,
  } = useLogin();

  return (
    <LoginView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loading={loading}
      handleLogin={handleLogin}
      handleSignUp={handleSignUp}
      styles={loginStyles}
    />
  );
}
