import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './supabase';
import { registerForPushNotificationsAsync, configureNotificationHandler } from './src/utils/PushNotifications';
import { AuthStack } from './src/navigation/AuthStack';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { WorkoutActiveScreen } from './src/screens/WorkoutActive';
import { AnimatedSplashScreen } from './src/screens/AnimatedSplashScreen';
import { UserContextProvider } from './src/context/UserContext';
import { ToastContextProvider } from './src/context/ToastContext';
import { DeviceContextProvider } from './src/context/DeviceContext';
import { WorkoutContextProvider } from './src/context/WorkoutContext';
import { ProfileCompletionBanner } from './src/components/ui/ProfileCompletionBanner';
import { queryClient } from './src/api/queryClient';

// Mantener splash nativo visible hasta que la animación React esté lista
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const ONBOARDING_KEY = 'xerpa_onboarding'; // isNewUser + userRole → evita race condition post-SignUp

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState(null);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  const handleSplashReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setSplashVisible(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          const msg = error?.message?.toLowerCase() || '';
          if (msg.includes('refresh') && msg.includes('token')) {
            supabase.auth.signOut().finally(() => {
              setUser(null);
              setLoading(false);
            });
            return;
          }
        }
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setOnboardingReady(true);
      setOnboardingData(null);
      return;
    }
    setOnboardingReady(false); // esperar lectura antes de mostrar MainTabs
    let cancelled = false;
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const data = JSON.parse(raw);
            setOnboardingData(data);
            AsyncStorage.removeItem(ONBOARDING_KEY);
          } catch {}
        }
        setOnboardingReady(true);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => { configureNotificationHandler(); }, []);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (cancelled || !token) return;
        await supabase.from('usuarios').update({ push_token: token }).eq('id', user.id);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const showMainApp = user && onboardingReady;
  const showLoading = loading || (user && !onboardingReady);

  const mainContent = showLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00F0FF" />
    </View>
  ) : (
    <NavigationContainer
      linking={{
        prefixes: ['xerpa://'],
        config: {
          screens: {
            MainTabs: {
              path: '',
              screens: {
                Carreras: {
                  path: 'carreras/race/:carreraId',
                },
              },
            },
          },
        },
      }}
    >
      <ToastContextProvider>
        {showMainApp ? (
          <UserContextProvider authUser={user}>
            <DeviceContextProvider user={user}>
              <WorkoutContextProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="MainTabs">
                    {() => (
                      <View style={styles.mainTabsWrapper}>
                        <ProfileCompletionBanner user={user} />
                        <View style={styles.tabsContainer}>
                          <MainTabNavigator
                            user={user}
                            initialTab={onboardingData?.isNewUser ? 'XerpaAI' : undefined}
                            onboardingParams={onboardingData}
                            onOnboardingConsumed={() => setOnboardingData(null)}
                          />
                        </View>
                      </View>
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="WorkoutActive"
                    options={{ presentation: 'modal' }}
                  >
                    {props => <WorkoutActiveScreen {...props} user={user} />}
                  </Stack.Screen>
                </Stack.Navigator>
              </WorkoutContextProvider>
            </DeviceContextProvider>
          </UserContextProvider>
        ) : (
          <AuthStack />
        )}
      </ToastContextProvider>
    </NavigationContainer>
  );

  return (
    <QueryClientProvider client={queryClient}>
    <View style={styles.root}>
      {mainContent}
      {splashVisible && (
        <AnimatedSplashScreen
          onReady={handleSplashReady}
          onFinish={handleSplashFinish}
        />
      )}
    </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabsWrapper: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
  },
});
