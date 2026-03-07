import React from 'react';
import { useSignUp } from './useSignUp';
import { SignUpView } from './SignUpView';
import { signUpStyles } from './SignUpStyles';

export default function SignUpScreen({ navigation }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loadingForm,
    emailError,
    passwordError,
    globalAuthError,
    handleCreateAccount,
    handleGoogleSignIn,
    handleAppleSignIn,
  } = useSignUp();

  return (
    <SignUpView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loadingForm={loadingForm}
      emailError={emailError}
      passwordError={passwordError}
      globalAuthError={globalAuthError}
      handleCreateAccount={handleCreateAccount}
      handleGoogleSignIn={handleGoogleSignIn}
      handleAppleSignIn={handleAppleSignIn}
      onBack={() => navigation.goBack()}
      styles={signUpStyles}
    />
  );
}
