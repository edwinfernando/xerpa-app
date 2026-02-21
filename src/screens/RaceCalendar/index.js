import React from 'react';
import { useRaceCalendar } from './useRaceCalendar';
import { RaceCalendarView } from './RaceCalendarView';
import { raceCalendarStyles } from './RaceCalendarStyles';

export default function RaceCalendarScreen({ user }) {
  const {
    races,
    loading,
    error,
    globalRaces,
    globalLoading,
    globalError,
    addRace,
    deleteRace,
    updateRace,
    fetchGlobalRaces,
    enrollToRace,
    unenrollFromRace,
  } = useRaceCalendar(user);

  return (
    <RaceCalendarView
      races={races}
      loading={loading}
      error={error}
      globalRaces={globalRaces}
      globalLoading={globalLoading}
      globalError={globalError}
      addRace={addRace}
      deleteRace={deleteRace}
      updateRace={updateRace}
      fetchGlobalRaces={fetchGlobalRaces}
      enrollToRace={enrollToRace}
      unenrollFromRace={unenrollFromRace}
      styles={raceCalendarStyles}
    />
  );
}
