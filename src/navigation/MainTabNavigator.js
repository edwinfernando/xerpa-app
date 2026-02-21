import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LayoutDashboard, Calendar, User, Trophy } from 'lucide-react-native';
import DashboardScreen from '../screens/Dashboard';
import PlanScreen from '../screens/Plan';
import XerpaAIScreen from '../screens/XerpaAI';
import PerfilScreen from '../screens/Perfil';
import RaceCalendarScreen from '../screens/RaceCalendar';
import { useWorkoutContext } from '../context/WorkoutContext';

const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// ─────────────────────────────────────────────────────────────
// Botón central flotante — XERPA AI / Cronómetro activo
// ─────────────────────────────────────────────────────────────
function XerpaTabIcon({ focused }) {
  const { isTimerActive, timerSecs } = useWorkoutContext();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animación de pulso cuando hay grabación activa
  useEffect(() => {
    if (isTimerActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.07,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isTimerActive, pulseAnim]);

  const borderColor = isTimerActive
    ? '#ff5252'
    : focused
    ? '#00F0FF'
    : '#39FF14';

  const shadowOpacity = isTimerActive ? 0.7 : focused ? 0.75 : 0.45;
  const shadowRadius = isTimerActive ? 20 : focused ? 16 : 10;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <View
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          borderWidth: isTimerActive ? 2.5 : 3,
          borderColor,
          backgroundColor: isTimerActive ? '#1A0A0A' : '#121212',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: borderColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius,
          elevation: 12,
        }}
      >
        {isTimerActive ? (
          // ── Estado ACTIVO: punto de grabación + tiempo ──────
          <>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: '#ff5252',
                marginBottom: 4,
                shadowColor: '#ff5252',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 6,
              }}
            />
            <Text
              style={{
                color: '#ff5252',
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 1,
                fontFamily: Platform.select({
                  ios: 'Courier New',
                  android: 'monospace',
                  default: 'monospace',
                }),
              }}
            >
              {formatTimer(timerSecs)}
            </Text>
          </>
        ) : (
          // ── Estado INACTIVO: logo XERPA ─────────────────────
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />
        )}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// Botón táctil del tab central — intercepta navegación si hay
// grabación activa para llevar al usuario a PlanView
// ─────────────────────────────────────────────────────────────
function XerpaTabButton({ onPress, children, style }) {
  const { isTimerActive } = useWorkoutContext();
  const navigation = useNavigation();

  function handlePress() {
    if (isTimerActive) {
      // Lleva al usuario a Plan para que pueda pulsar Stop
      navigation.navigate('Plan');
    } else {
      onPress?.();
    }
  }

  return (
    <TouchableOpacity
      style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {children}
    </TouchableOpacity>
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
          tabBarButton: (props) => <XerpaTabButton {...props} />,
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
