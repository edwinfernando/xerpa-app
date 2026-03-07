import { useState, useEffect } from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../../supabase';
import { useUserContext } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { vincularPorCodigo } from '../../services/relacionesService';
import { upsertPreferenciasNotificaciones } from '../../services/preferenciasNotificacionesService';
import { insertContactoEmergencia, updateContactoEmergencia, deleteContactoEmergencia } from '../../services/contactosEmergenciaService';

export function usePerfil(user) {
  const { showToast } = useToast();
  const { profileData, refreshUserData } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [isSavingPerfil, setIsSavingPerfil] = useState(false);
  const [nombre, setNombreRaw] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [rol, setRol] = useState('Atleta');
  const [edad, setEdad] = useState('');
  const [tallaCm, setTallaCm] = useState('');
  const [pesoKg, setPesoKg] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showBiometriaSheet, setShowBiometriaSheet] = useState(false);
  const [showNotificacionesSheet, setShowNotificacionesSheet] = useState(false);

  // ── Password change state ──────────────────────────────────
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    if (profileData) {
      setNombreRaw(profileData.nombre || user.email?.split('@')[0] || '');
      setRol(profileData.rol || 'Atleta');
      setEdad(profileData.edad != null ? String(profileData.edad) : '');
      setTallaCm(profileData.talla_cm != null ? String(profileData.talla_cm) : '');
      setPesoKg(profileData.peso_kg != null ? String(profileData.peso_kg) : '');
      setModalidad(profileData.modalidad ?? '');
      setCategoria(profileData.categoria ?? '');
    } else {
      setNombreRaw(user.email?.split('@')[0] || '');
    }
  }, [user?.id, user?.email, profileData?.nombre, profileData?.rol, profileData?.edad, profileData?.talla_cm, profileData?.peso_kg, profileData?.modalidad, profileData?.categoria]);

  const setNombre = (value) => {
    setNombreRaw(value);
    if (nombreError) setNombreError('');
  };

  const handleGuardarBiometria = async () => {
    if (!user?.id) return;

    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio.');
      return;
    }

    setNombreError('');
    setIsSavingPerfil(true);

    const payload = {
      nombre: nombre.trim(),
      rol,
      edad: edad ? parseInt(edad, 10) || null : null,
      talla_cm: tallaCm ? parseInt(tallaCm, 10) || null : null,
      peso_kg: pesoKg ? parseFloat(pesoKg) || null : null,
      modalidad: modalidad.trim() || null,
      categoria: categoria.trim() || null,
    };

    const { error } = await supabase.from('usuarios').update(payload).eq('id', user.id);

    setIsSavingPerfil(false);

    if (error) {
      showToast({ type: 'error', title: 'Error', message: error.message ?? 'No se pudo guardar.' });
      return;
    }

    await refreshUserData();
    setShowBiometriaSheet(false);
    showToast({ type: 'success', title: '¡Listo! 🚀', message: 'Información personal actualizada.' });
  };

  const handleGuardarPreferencias = async ({ canalPrincipal, telegramId, alertasEntrenamiento, alertasSistema }) => {
    if (!user?.id) return;

    const { success, error } = await upsertPreferenciasNotificaciones({
      usuarioId: user.id,
      canalPrincipal,
      telegramId,
      alertasEntrenamiento,
      alertasSistema,
    });

    if (!success) {
      showToast({ type: 'error', title: 'Error', message: error ?? 'No se pudieron guardar las preferencias.' });
      throw new Error(error);
    }

    await refreshUserData();
    setShowNotificacionesSheet(false);
    showToast({ type: 'success', title: '¡Guardado! ✓', message: 'Preferencias de notificación actualizadas.' });
  };

  const handleInsertContacto = async ({ nombre, parentesco, telefono }) => {
    const { success, error } = await insertContactoEmergencia({
      usuarioId: user.id,
      nombre,
      parentesco,
      telefono,
    });
    if (!success) throw new Error(error);
    showToast({ type: 'success', title: '¡Añadido! ✓', message: 'Contacto de emergencia guardado.' });
  };

  const handleUpdateContacto = async ({ contactoId, nombre, parentesco, telefono }) => {
    const { success, error } = await updateContactoEmergencia({
      contactoId,
      usuarioId: user.id,
      nombre,
      parentesco,
      telefono,
    });
    if (!success) throw new Error(error);
    showToast({ type: 'success', title: '¡Actualizado! ✓', message: 'Contacto modificado.' });
  };

  const handleDeleteContacto = async ({ contactoId }) => {
    const { success, error } = await deleteContactoEmergencia({
      contactoId,
      usuarioId: user.id,
    });
    if (!success) throw new Error(error);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const handleVincularStrava = () => {
    showToast({ type: 'info', title: 'Próximamente', message: 'La vinculación con Strava estará disponible pronto.' });
  };

  // ── Vincular Intervals.icu (upsert en integraciones_terceros) ───
  const integracionIntervals = Array.isArray(profileData?.integraciones)
    ? profileData.integraciones.find((i) => i.plataforma === 'intervals')
    : null;

  const [showIntervalosSheet, setShowIntervalosSheet] = useState(false);
  const [idExterno, setIdExterno] = useState('');
  const [apiKeyIntervalos, setApiKeyIntervalos] = useState('');
  const [intervalosError, setIntervalosError] = useState('');
  const [isSavingIntervalos, setIsSavingIntervalos] = useState(false);

  useEffect(() => {
    if (showIntervalosSheet && integracionIntervals) {
      setIdExterno(integracionIntervals.id_externo || '');
      setApiKeyIntervalos(integracionIntervals.api_key || '');
    } else if (!showIntervalosSheet) {
      setIntervalosError('');
    }
  }, [showIntervalosSheet, integracionIntervals?.id_externo, integracionIntervals?.api_key]);

  const handleVincularIntervalos = () => {
    setIdExterno(integracionIntervals?.id_externo || '');
    setApiKeyIntervalos(integracionIntervals?.api_key || '');
    setIntervalosError('');
    setShowIntervalosSheet(true);
  };

  /** Abre el flujo de vinculación según plataforma. Intervals → sheet; resto → Próximamente. */
  const handlePlatformPress = (plataforma) => {
    if (plataforma === 'intervals') {
      handleVincularIntervalos();
    } else {
      showToast({ type: 'info', title: 'Próximamente', message: `${plataforma.charAt(0).toUpperCase() + plataforma.slice(1)} estará disponible pronto. OAuth o ingreso de credenciales en desarrollo.` });
    }
  };

  const handleCerrarIntervalosSheet = () => {
    setShowIntervalosSheet(false);
    setIntervalosError('');
  };

  const handleGuardarIntervalos = async () => {
    if (!user?.id) return;

    const idTrim = idExterno?.trim();
    const keyTrim = apiKeyIntervalos?.trim();

    if (!idTrim) {
      setIntervalosError('El ID de atleta es obligatorio.');
      return;
    }
    if (!keyTrim) {
      setIntervalosError('La API Key es obligatoria.');
      return;
    }

    setIntervalosError('');
    setIsSavingIntervalos(true);

    try {
      const { error } = await supabase
        .from('integraciones_terceros')
        .upsert(
          {
            usuario_id: user.id,
            plataforma: 'intervals',
            id_externo: idTrim,
            api_key: keyTrim,
            estado: 'Activa',
          },
          { onConflict: 'usuario_id,plataforma' }
        );

      if (error) throw error;

      await refreshUserData();
      handleCerrarIntervalosSheet();
      showToast({ type: 'success', title: '¡Vinculado! 🎯', message: 'Intervalos.icu conectado correctamente.' });
    } catch (err) {
      setIntervalosError(err?.message ?? 'Error al guardar la integración.');
    } finally {
      setIsSavingIntervalos(false);
    }
  };

  const codigoVinculacion = profileData?.codigo || null;

  // ── Vincular con Entrenador/Tutor (insert en relaciones_usuarios) ───
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [vincularLoading, setVincularLoading] = useState(false);
  const [vincularError, setVincularError] = useState('');

  const handleCodigoIngresadoChange = (text) => {
    setCodigoIngresado(text);
    if (vincularError) setVincularError('');
  };

  const handleVincularConCodigo = async () => {
    if (!user?.id || !codigoIngresado?.trim()) {
      setVincularError('Ingresa el código de tu entrenador o tutor.');
      return;
    }
    setVincularError('');
    setVincularLoading(true);
    try {
      const { success, error } = await vincularPorCodigo({
        atletaId: user.id,
        codigo: codigoIngresado.trim(),
      });
      if (success) {
        setCodigoIngresado('');
        await refreshUserData();
        showToast({ type: 'success', title: '¡Solicitud enviada! 🤝', message: 'Tu entrenador o tutor recibirá la solicitud. Una vez aceptada, quedarás vinculado.' });
      } else {
        setVincularError(error || 'No se pudo vincular.');
      }
    } catch (err) {
      setVincularError(err?.message ?? 'Error inesperado.');
    } finally {
      setVincularLoading(false);
    }
  };

  const relacionesActivas = (Array.isArray(profileData?.relaciones_usuarios) ? profileData.relaciones_usuarios : []).filter(
    (r) => r.estado === 'Activo' || r.estado === 'Pendiente'
  );

  const handleCopyCodigo = async () => {
    if (!codigoVinculacion) return;
    await Clipboard.setStringAsync(codigoVinculacion);
    showToast({ type: 'success', title: 'Copiado ✓', message: 'Código copiado al portapapeles.' });
  };

  const handleShareCodigo = async () => {
    if (!codigoVinculacion) return;
    try {
      await Share.share({
        message: `¡Hola! Este es mi ID de XERPA COACH: ${codigoVinculacion}. Vincúlate conmigo para ver mis entrenamientos.`,
        title: 'Mi ID XERPA COACH',
      });
    } catch (err) {
      if (err.message?.includes('User did not share')) return;
      showToast({ type: 'error', title: 'Error', message: 'No se pudo compartir el código.' });
    }
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
    showToast({ type: 'success', title: '¡Éxito! 🔐', message: '¡Contraseña actualizada correctamente!' });
  };

  return {
    profileData,
    loading,
    isSavingPerfil,
    nombre,
    setNombre,
    nombreError,
    rol,
    setRol,
    edad,
    setEdad,
    tallaCm,
    setTallaCm,
    pesoKg,
    setPesoKg,
    modalidad,
    setModalidad,
    categoria,
    setCategoria,
    email: user?.email || '',
    handleGuardarBiometria,
    handleGuardarPreferencias,
    handleInsertContacto,
    handleUpdateContacto,
    handleDeleteContacto,
    handleLogout,
    handleVincularStrava,
    handleVincularIntervalos,
    handlePlatformPress,
    codigoVinculacion,
    handleCopyCodigo,
    handleShareCodigo,
    integracionIntervals,
    showIntervalosSheet,
    idExterno,
    setIdExterno,
    apiKeyIntervalos,
    setApiKeyIntervalos,
    intervalosError,
    isSavingIntervalos,
    handleVincularIntervalos,
    handleCerrarIntervalosSheet,
    handleGuardarIntervalos,
    codigoIngresado,
    setCodigoIngresado,
    handleCodigoIngresadoChange,
    handleVincularConCodigo,
    vincularLoading,
    vincularError,
    relacionesActivas,
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
    refreshUserData,
    // BottomSheets
    showBiometriaSheet,
    showNotificacionesSheet,
    handleOpenBiometriaSheet: () => setShowBiometriaSheet(true),
    handleCloseBiometriaSheet: () => setShowBiometriaSheet(false),
    handleOpenNotificacionesSheet: () => setShowNotificacionesSheet(true),
    handleCloseNotificacionesSheet: () => setShowNotificacionesSheet(false),
    showToast,
  };
}
