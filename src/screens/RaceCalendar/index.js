import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChevronLeft } from 'lucide-react-native';
import { useRaceCalendar } from './useRaceCalendar';
import { RaceCalendarView } from './RaceCalendarView';
import { raceCalendarStyles } from './RaceCalendarStyles';
import { AddRaceScreen } from './components/AddRaceScreen';
import { AddRaceMapPickerScreen } from './components/AddRaceMapPickerScreen';
import { useToast } from '../../context/ToastContext';

const Stack = createStackNavigator();

const headerOptions = (navigation, title) => ({
  title,
  headerBackTitleVisible: false,
  headerBackTitle: '',
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ marginLeft: Platform.OS === 'ios' ? 8 : 16, padding: 8 }}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
    >
      <ChevronLeft color="#FFFFFF" size={28} strokeWidth={2.5} />
    </TouchableOpacity>
  ),
  headerStyle: { backgroundColor: '#121212' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' },
});

export default function RaceCalendarScreen({ user, route }) {
  const { showToast } = useToast();
  const initialCarreraId = route?.params?.carreraId ?? null;
  const {
    races,
    loading,
    error,
    globalRaces,
    globalLoading,
    globalError,
    ctl,
    addRaceCatalogs,
    addRaceCatalogsLoading,
    filters,
    setFilter,
    filterOptionsByTab,
    filteredRaces,
    filteredEventosXerpa,
    filteredRutasLocales,
    addRace,
    deleteRace,
    updateRace,
    updateRaceByCarreraId,
    fetchRaceCategories,
    fetchCarreraById,
    fetchAddRaceCatalogs,
    fetchGlobalRaces,
    enrollToRace,
    unenrollFromRace,
  } = useRaceCalendar(user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="RaceCalendarHome" options={{ headerShown: false }}>
        {({ navigation }) => (
          <RaceCalendarView
            initialCarreraId={initialCarreraId}
            fetchCarreraById={fetchCarreraById}
            races={races}
            loading={loading}
            error={error}
            globalRaces={globalRaces}
            ctl={ctl}
            globalLoading={globalLoading}
            globalError={globalError}
            filters={filters}
            setFilter={setFilter}
            filterOptionsByTab={filterOptionsByTab}
            filteredRaces={filteredRaces}
            filteredEventosXerpa={filteredEventosXerpa}
            filteredRutasLocales={filteredRutasLocales}
            deleteRace={deleteRace}
            updateRace={updateRace}
            updateRaceByCarreraId={updateRaceByCarreraId}
            fetchRaceCategories={fetchRaceCategories}
            fetchGlobalRaces={fetchGlobalRaces}
            enrollToRace={enrollToRace}
            unenrollFromRace={unenrollFromRace}
            onOpenAddRace={() => navigation.navigate('AddRace')}
            styles={raceCalendarStyles}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="AddRace"
        options={({ navigation }) => ({
          presentation: 'fullScreenModal',
          ...headerOptions(navigation, 'Nueva Carrera'),
        })}
      >
        {({ navigation, route }) => (
          <AddRaceScreen
            onSave={addRace}
            showToast={showToast}
            styles={raceCalendarStyles}
            catalogs={addRaceCatalogs}
            catalogLoading={addRaceCatalogsLoading}
            onLoadCatalogs={fetchAddRaceCatalogs}
            onSaved={() => navigation.goBack()}
            navigation={navigation}
            route={route}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="AddRaceMapPicker"
        component={AddRaceMapPickerScreen}
        options={({ navigation }) => ({
          presentation: 'fullScreenModal',
          ...headerOptions(navigation, 'Seleccionar en mapa'),
        })}
      />
    </Stack.Navigator>
  );
}
