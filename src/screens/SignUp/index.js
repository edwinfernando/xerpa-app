import React from 'react';
import { useSignUp } from './useSignUp';
import { SignUpView } from './SignUpView';
import { signUpStyles } from './SignUpStyles';

export default function SignUpScreen({ navigation }) {
  const { loadingGoogle, loadingApple, handleGoogleSignIn, handleAppleSignIn } = useSignUp();

  return (
    <SignUpView
      loadingGoogle={loadingGoogle}
      loadingApple={loadingApple}
      handleGoogleSignIn={handleGoogleSignIn}
      handleAppleSignIn={handleAppleSignIn}
      onBack={() => navigation.goBack()}
      styles={signUpStyles}
    />
  );
}
