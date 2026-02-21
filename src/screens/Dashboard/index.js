import React from 'react';
import { Alert } from 'react-native';
import { useDashboard } from './useDashboard';
import { DashboardView } from './DashboardView';
import { dashboardStyles } from './DashboardStyles';

export default function DashboardScreen({ user }) {
  const {
    loading,
    nombre,
    ctl,
    atl,
    tsb,
    tssSemanal,
    tssPlaneadoSemanal,
    tssProgressPct,
    entrenoHoy,
    hasData,
    hasReportedToday,
    rpeValue,
    setRpeValue,
    submittingRpe,
    saveRPE,
    handleVincular,
    getRpeColor,
    rpeLabel,
    motivationalMessage,
    proximaCarrera,
    diasParaCarrera,
  } = useDashboard(user);

  const handleReportInjury = () => {
    Alert.alert('Reporte de lesión 🩹', 'Notifica a XERPA AI sobre tu malestar para ajustar tu plan.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ir a XERPA AI', onPress: () => {} },
    ]);
  };

  const handleOpenXerpa = () => {
    Alert.alert('PXERPA', 'Próximamente: acceso directo al chat con XERPA AI.');
  };

  const handleSyncData = () => {
    Alert.alert('Sincronización', 'Próximamente: sincronización con Intervalos.icu y Strava.');
  };

  return (
    <DashboardView
      nombre={nombre}
      loading={loading}
      ctl={ctl}
      atl={atl}
      tsb={tsb}
      tssSemanal={tssSemanal}
      tssPlaneadoSemanal={tssPlaneadoSemanal}
      tssProgressPct={tssProgressPct}
      entrenoHoy={entrenoHoy}
      hasData={hasData}
      hasReportedToday={hasReportedToday}
      rpeValue={rpeValue}
      setRpeValue={setRpeValue}
      submittingRpe={submittingRpe}
      saveRPE={saveRPE}
      getRpeColor={getRpeColor}
      rpeLabel={rpeLabel}
      onVincular={handleVincular}
      motivationalMessage={motivationalMessage}
      proximaCarrera={proximaCarrera}
      diasParaCarrera={diasParaCarrera}
      onReportInjury={handleReportInjury}
      onOpenXerpa={handleOpenXerpa}
      onSyncData={handleSyncData}
      styles={dashboardStyles}
    />
  );
}
