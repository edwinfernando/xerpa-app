import React from 'react';
import { useRaceCalendar } from './useRaceCalendar';
import { RaceCalendarView } from './RaceCalendarView';
import { raceCalendarStyles } from './RaceCalendarStyles';

export default function RaceCalendarScreen({ user }) {
  const { races, loading, error, addRace } = useRaceCalendar(user);

  return (
    <RaceCalendarView
      races={races}
      loading={loading}
      error={error}
      addRace={addRace}
      styles={raceCalendarStyles}
    />
  );
}
