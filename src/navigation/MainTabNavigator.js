import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, Bot, User } from 'lucide-react-native';
import DashboardScreen from '../screens/Dashboard';
import PlanScreen from '../screens/Plan';
import XerpaAIScreen from '../screens/XerpaAI';
import PerfilScreen from '../screens/Perfil';

const Tab = createBottomTabNavigator();

export function MainTabNavigator({ user }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
          borderTopWidth: 1,
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
          tabBarLabel: 'Xerpa AI',
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
        }}
      >
        {() => <XerpaAIScreen user={user} />}
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
