import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getSetting } from '../database/database';
import { Colors } from '../constants/theme';
import { BPMascot } from '../components/BPMascot';
import * as SplashScreen from 'expo-splash-screen';

export default function EntryScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    async function determineInitialRoute() {
      try {
        const langSelected = await getSetting('has_selected_language');
        const onbCompleted = await getSetting('has_completed_onboarding');

        if (!active) return;

        if (langSelected !== 'true') {
          // First launch: Language selection
          router.replace('/language-select');
        } else if (onbCompleted !== 'true') {
          // Second step: Introductory onboarding slider screens
          router.replace('/onboarding');
        } else {
          // Regular launch: Main app tabs
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.warn('Initial route resolution error:', err);
        if (active) {
          router.replace('/language-select');
        }
      } finally {
        if (active) {
          setChecking(false);
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    determineInitialRoute();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <BPMascot size={76} mood="waving" />
      <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 24,
  },
});
