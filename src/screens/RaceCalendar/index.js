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
    filters,
    setFilter,
    filteredEventosXerpa,
    filteredRutasLocales,
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
      filters={filters}
      setFilter={setFilter}
      filteredEventosXerpa={filteredEventosXerpa}
      filteredRutasLocales={filteredRutasLocales}
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
