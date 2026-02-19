import React from 'react';
import { usePlan } from './usePlan';
import { PlanView } from './PlanView';
import { planStyles } from './PlanStyles';

export default function PlanScreen({ user }) {
  const { loading, dias } = usePlan(user);

  return (
    <PlanView
      loading={loading}
      dias={dias}
      styles={planStyles}
    />
  );
}
