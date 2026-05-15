import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { requestNotificationPermission } from '../lib/notifications';

LogBox.ignoreLogs([
  'Firestore',
  '@firebase/firestore',
  'Could not reach Cloud Firestore',
  'AsyncStorage has been extracted',
]);

import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync();
requestNotificationPermission();

function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const booted = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!booted.current) {
      booted.current = true;
      router.replace('/onboarding');
      SplashScreen.hideAsync();
      return;
    }

    if (!user && segments[0] === '(tabs)') {
      router.replace('/onboarding');
    }
  }, [loading, user, segments]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} initialRouteName="onboarding">
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="auto" />
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <RootNavigator />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
