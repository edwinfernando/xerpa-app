import React from 'react';
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
  } = useDashboard(user);

  return (
    <DashboardView
      nombre={nombre}
      loading={loading}
      ctl={ctl}
      atl={atl}
      tsb={tsb}
      tssSemanal={tssSemanal}
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
      styles={dashboardStyles}
    />
  );
}
