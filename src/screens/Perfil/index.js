import React from 'react';
import { usePerfil } from './usePerfil';
import { PerfilView } from './PerfilView';
import { perfilStyles } from './PerfilStyles';

export default function PerfilScreen({ user }) {
  const {
    loading,
    isSavingPerfil,
    nombre,
    setNombre,
    nombreError,
    rol,
    setRol,
    email,
    handleGuardar,
    handleLogout,
    handleVincularStrava,
    handleVincularIntervalos,
    // Password change
    showPasswordSheet,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    isUpdatingPassword,
    handleAbrirCambioContrasena,
    handleCerrarCambioContrasena,
    handleGuardarContrasena,
  } = usePerfil(user);

  return (
    <PerfilView
      nombre={nombre}
      setNombre={setNombre}
      nombreError={nombreError}
      rol={rol}
      setRol={setRol}
      email={email}
      loading={loading}
      isSavingPerfil={isSavingPerfil}
      handleGuardar={handleGuardar}
      handleLogout={handleLogout}
      handleVincularStrava={handleVincularStrava}
      handleVincularIntervalos={handleVincularIntervalos}
      // Password change
      showPasswordSheet={showPasswordSheet}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      passwordError={passwordError}
      isUpdatingPassword={isUpdatingPassword}
      handleAbrirCambioContrasena={handleAbrirCambioContrasena}
      handleCerrarCambioContrasena={handleCerrarCambioContrasena}
      handleGuardarContrasena={handleGuardarContrasena}
      styles={perfilStyles}
    />
  );
}
