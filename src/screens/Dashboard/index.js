import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../context/ToastContext';
import { useDashboard } from './useDashboard';
import { DashboardView } from './DashboardView';
import { dashboardStyles } from './DashboardStyles';

export default function DashboardScreen({ user }) {
  const { showToast } = useToast();
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
    city,
    climaData,
    locationPermission,
    loadingLocation,
    onRequestLocation,
    readinessPct,
    enrollToRace,
    unenrollFromRace,
  } = useDashboard(user);

  const navigation = useNavigation();

  const handleOpenXerpa = () => {
    navigation.navigate('XerpaAI');
  };

  const handleSyncData = () => {
    showToast({ type: 'info', title: 'Sincronización', message: 'Próximamente: sincronización con Intervalos.icu y Strava.' });
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
      readinessPct={readinessPct}
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
      city={city}
      climaData={climaData}
      locationPermission={locationPermission}
      loadingLocation={loadingLocation}
      onRequestLocation={onRequestLocation}
      onOpenXerpa={handleOpenXerpa}
      onSyncData={handleSyncData}
      enrollToRace={enrollToRace}
      unenrollFromRace={unenrollFromRace}
      styles={dashboardStyles}
    />
  );
}
