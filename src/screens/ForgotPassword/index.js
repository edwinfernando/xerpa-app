import React from 'react';
import { useForgotPassword } from './useForgotPassword';
import { ForgotPasswordView } from './ForgotPasswordView';
import { forgotPasswordStyles } from './ForgotPasswordStyles';

export default function ForgotPasswordScreen({ navigation }) {
  const { email, emailError, loading, handleSetEmail, handleSend } = useForgotPassword();

  return (
    <ForgotPasswordView
      email={email}
      emailError={emailError}
      loading={loading}
      handleSetEmail={handleSetEmail}
      handleSend={handleSend}
      onBack={() => navigation.goBack()}
      styles={forgotPasswordStyles}
    />
  );
}
