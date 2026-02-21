import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../supabase';

export function usePerfil(user) {
  const [loading, setLoading] = useState(false);       // solo para logout
  const [isSavingPerfil, setIsSavingPerfil] = useState(false);
  const [nombre, setNombreRaw] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [rol, setRol] = useState('Atleta');

  // ── Password change state ──────────────────────────────────
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadPerfil() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('usuarios')
        .select('nombre, rol')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setNombreRaw(data.nombre || user.email?.split('@')[0] || '');
        setRol(data.rol || 'Atleta');
      } else {
        setNombreRaw(user.email?.split('@')[0] || '');
      }
    }
    loadPerfil();
  }, [user?.id]);

  const setNombre = (value) => {
    setNombreRaw(value);
    if (nombreError) setNombreError('');
  };

  const handleGuardar = async () => {
    if (!user?.id) return;

    // Validate nombre
    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio para tu ficha de atleta.');
      return;
    }

    setNombreError('');
    setIsSavingPerfil(true);

    const { error } = await supabase
      .from('usuarios')
      .update({ nombre: nombre.trim(), rol })
      .eq('id', user.id);

    setIsSavingPerfil(false);

    if (error) {
      Alert.alert('Error', `Error al guardar en la base de datos: ${error.message}`);
      return;
    }

    Alert.alert('¡Listo! 🚀', '¡Perfil actualizado correctamente!');
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const handleVincularStrava = () => {
    Alert.alert('Próximamente', 'La vinculación con Strava estará disponible pronto.');
  };

  const handleVincularIntervalos = () => {
    Alert.alert('Próximamente', 'La vinculación con Intervalos.icu estará disponible pronto.');
  };

  // ── Password change handlers ───────────────────────────────
  const handleAbrirCambioContrasena = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowPasswordSheet(true);
  };

  const handleCerrarCambioContrasena = () => {
    setShowPasswordSheet(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const mapPasswordError = (error) => {
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('session') || msg.includes('token') || msg.includes('expired') || msg.includes('jwt')) {
      return 'Tu sesión expiró. Cierra sesión y vuelve a entrar para cambiar la contraseña.';
    }
    if (msg.includes('same password') || msg.includes('different')) {
      return 'La nueva contraseña debe ser diferente a la actual.';
    }
    if (msg.includes('weak') || msg.includes('strength')) {
      return 'La contraseña es demasiado débil. Usa letras y números para hacerla más segura.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
    }
    return 'Ocurrió un error al actualizar la contraseña. Intenta de nuevo.';
  };

  const handleGuardarContrasena = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Todos los campos son obligatorios.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña es demasiado corta (mín. 6 caracteres).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setPasswordError('');
    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsUpdatingPassword(false);

    if (error) {
      setPasswordError(mapPasswordError(error));
      return;
    }

    handleCerrarCambioContrasena();
    Alert.alert('¡Éxito! 🔐', '¡Contraseña actualizada correctamente!');
  };

  return {
    loading,
    isSavingPerfil,
    nombre,
    setNombre,
    nombreError,
    rol,
    setRol,
    email: user?.email || '',
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
  };
}
