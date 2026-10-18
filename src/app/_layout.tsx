import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../database/database';
import { setupNotificationChannels, scheduleAllMedicineNotifications } from '../services/notifications';
import { Colors } from '../constants/theme';

import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider } from '../context/LanguageContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await setupNotificationChannels();
        await scheduleAllMedicineNotifications();
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="language-select" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="readings/add" options={{ headerShown: false }} />
          <Stack.Screen name="readings/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="medicines/add" options={{ headerShown: false }} />
          <Stack.Screen name="medicines/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="medicines/all" options={{ headerShown: false }} />
          <Stack.Screen name="medicines/history" options={{ headerShown: false }} />
          <Stack.Screen name="health/measure" options={{ headerShown: false }} />
          <Stack.Screen name="health/tips" options={{ headerShown: false }} />
          <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="settings/language" options={{ headerShown: false }} />
          <Stack.Screen name="settings/profile" options={{ headerShown: false }} />
          <Stack.Screen name="settings/backup" options={{ headerShown: false }} />
          <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
        </Stack>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

