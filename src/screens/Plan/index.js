import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChevronLeft } from 'lucide-react-native';
import { usePlan } from './usePlan';
import { PlanView } from './PlanView';
import { AddPlanScreen } from './components/AddPlanScreen';
import { planStyles } from './PlanStyles';
import { useToast } from '../../context/ToastContext';

const Stack = createStackNavigator();

export default function PlanScreen({ user }) {
  const { showToast } = useToast();
  const {
    loading,
    weekWorkouts,
    historyWorkouts,
    isGenerating,
    markComplete,
    saveFeedback,
    handleGeneratePlan,
    addManualWorkout,
    saveTimerSession,
  } = usePlan(user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="PlanHome" options={{ headerShown: false }}>
        {({ navigation }) => (
          <PlanView
            loading={loading}
            weekWorkouts={weekWorkouts}
            historyWorkouts={historyWorkouts}
            isGenerating={isGenerating}
            markComplete={markComplete}
            saveFeedback={saveFeedback}
            handleGeneratePlan={handleGeneratePlan}
            addManualWorkout={addManualWorkout}
            saveTimerSession={saveTimerSession}
            onOpenAddPlan={() => navigation.navigate('AddPlan')}
            styles={planStyles}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AddPlan"
        options={({ navigation }) => ({
          title: 'Añadir Entrenamiento',
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
        })}
      >
        {({ navigation }) => (
          <AddPlanScreen
            onSave={addManualWorkout}
            showToast={showToast}
            onSaved={() => navigation.goBack()}
            styles={planStyles}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
