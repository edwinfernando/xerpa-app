import React from 'react';
import { usePerfil } from './usePerfil';
import { PerfilView } from './PerfilView';
import { perfilStyles } from './PerfilStyles';

export default function PerfilScreen({ user }) {
  const {
    loading,
    nombre,
    setNombre,
    rol,
    setRol,
    email,
    handleGuardar,
    handleLogout,
    handleVincularStrava,
    handleVincularIntervalos,
  } = usePerfil(user);

  return (
    <PerfilView
      nombre={nombre}
      setNombre={setNombre}
      rol={rol}
      setRol={setRol}
      email={email}
      loading={loading}
      handleGuardar={handleGuardar}
      handleLogout={handleLogout}
      handleVincularStrava={handleVincularStrava}
      handleVincularIntervalos={handleVincularIntervalos}
      styles={perfilStyles}
    />
  );
}
