import React from 'react';
import { usePlan } from './usePlan';
import { PlanView } from './PlanView';
import { planStyles } from './PlanStyles';

export default function PlanScreen({ user }) {
  const {
    loading,
    weekWorkouts,
    historyWorkouts,
    isGenerating,
    markComplete,
    handleGeneratePlan,
    addManualWorkout,
    saveTimerSession,
  } = usePlan(user);

  return (
    <PlanView
      loading={loading}
      weekWorkouts={weekWorkouts}
      historyWorkouts={historyWorkouts}
      isGenerating={isGenerating}
      markComplete={markComplete}
      handleGeneratePlan={handleGeneratePlan}
      addManualWorkout={addManualWorkout}
      saveTimerSession={saveTimerSession}
      styles={planStyles}
    />
  );
}
