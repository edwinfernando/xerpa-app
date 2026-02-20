import React from 'react';
import { View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, User, Trophy } from 'lucide-react-native';
import DashboardScreen from '../screens/Dashboard';
import PlanScreen from '../screens/Plan';
import XerpaAIScreen from '../screens/XerpaAI';
import PerfilScreen from '../screens/Perfil';
import RaceCalendarScreen from '../screens/RaceCalendar';

const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────
// Botón central flotante — XERPA AI
// ─────────────────────────────────────────────────────────────
function XerpaTabIcon({ focused }) {
  const borderColor = focused ? '#00F0FF' : '#39FF14';

  return (
    <View
      style={{
        width: 62,
        height: 62,
        borderRadius: 31,
        borderWidth: 3,
        borderColor,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        // Glow effect
        shadowColor: borderColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: focused ? 0.75 : 0.45,
        shadowRadius: focused ? 16 : 10,
        elevation: 12,
      }}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 38, height: 38 }}
        resizeMode="contain"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Navigator
// ─────────────────────────────────────────────────────────────
export function MainTabNavigator({ user }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#222',
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 0,
        },
        tabBarActiveTintColor: '#00F0FF',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      >
        {() => <DashboardScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Plan"
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      >
        {() => <PlanScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="XerpaAI"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <XerpaTabIcon focused={focused} />,
        }}
      >
        {() => <XerpaAIScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Carreras"
        options={{
          tabBarLabel: 'Carreras',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      >
        {() => <RaceCalendarScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Perfil"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      >
        {() => <PerfilScreen user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
