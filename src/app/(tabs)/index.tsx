import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { getAllReadings, getTodayDoses, getSetting } from '../../database/database';
import { BloodPressureReading } from '../../types/reading';
import { ScheduledDoseItem } from '../../types/medicine';
import { BloodPressureCard } from '../../components/BloodPressureCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { NextMedicineCard } from '../../components/NextMedicineCard';
import { MotivationalTipCard } from '../../components/MotivationalTipCard';
import { BPMascot } from '../../components/BPMascot';
import { MiniSparkline } from '../../components/MiniSparkline';
import { useResponsive } from '../../hooks/use-responsive';
import { useLanguage } from '../../context/LanguageContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isCompact, isTablet, fs } = useResponsive();
  const mascotSize = isCompact ? 40 : isTablet ? 56 : 48;
  const [allReadings, setAllReadings] = useState<BloodPressureReading[]>([]);
  const [latestReading, setLatestReading] = useState<BloodPressureReading | null>(null);
  const [nextDose, setNextDose] = useState<ScheduledDoseItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('good_morning', 'Good morning'), icon: 'sunny', mood: 'waving' as const };
    if (hour < 17) return { text: t('good_afternoon', 'Good afternoon'), icon: 'partly-sunny', mood: 'happy' as const };
    return { text: t('good_evening', 'Good evening'), icon: 'moon', mood: 'resting' as const };
  };

  const greeting = getGreeting();

  useEffect(() => {
    let active = true;
    async function checkGates() {
      try {
        const langSelected = await getSetting('has_selected_language');
        if (langSelected !== 'true' && active) {
          router.replace('/language-select');
          return;
        }
        const completed = await getSetting('has_completed_onboarding');
        if (completed !== 'true' && active) {
          router.replace('/onboarding');
        }
      } catch (e) {
        console.warn('Failed to check onboarding state:', e);
      }
    }
    checkGates();
    return () => {
      active = false;
    };
  }, [router]);

  const loadData = async () => {
    try {
      const readings = await getAllReadings();
      setAllReadings(readings);
      setLatestReading(readings.length > 0 ? readings[0] : null);

      const doses = await getTodayDoses();
      // Find first pending dose
      const upcoming = doses.find((d) => d.status === 'pending') || (doses.length > 0 ? doses[0] : null);
      setNextDose(upcoming);
    } catch (error) {
      console.warn('Failed to load home data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Warm, Welcoming Header with Mascot */}
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greetingText, { fontSize: fs(13) }]} numberOfLines={1}>{greeting.text}</Text>
              <Ionicons
                name={greeting.icon as any}
                size={16}
                color={Colors.amber}
                style={{ marginLeft: 4 }}
              />
            </View>
            <Text style={[styles.appTitle, { fontSize: fs(26) }]} numberOfLines={1}>BP Buddy</Text>
            <Text style={[styles.appTagline, { fontSize: fs(12) }]} numberOfLines={2}>
              {t('app_tagline', 'Healthy heart, better days')}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.mascotBadge}
              onPress={() => router.push('/health/tips')}
              activeOpacity={0.8}
            >
              <BPMascot size={mascotSize} mood={greeting.mood} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/(tabs)/more')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Blood Pressure Card */}
        <BloodPressureCard
          reading={latestReading}
          onPress={() => {
            if (latestReading) {
              router.push(`/readings/${latestReading.id}` as any);
            } else {
              router.push('/readings/add');
            }
          }}
          onAddPress={() => router.push('/readings/add')}
        />

        {/* Compact 7-Day Trend Sparkline (Appears when readings exist) */}
        {allReadings.length >= 2 && <MiniSparkline readings={allReadings} />}

        {/* Prominent Refined Add Reading Button */}
        <PrimaryButton
          title={t('add_reading', 'Add Reading')}
          icon={<Ionicons name="add" size={22} color="#FFFFFF" />}
          onPress={() => router.push('/readings/add')}
          style={styles.addButton}
        />

        {/* Next Medicine Reminder Card */}
        <NextMedicineCard
          dose={nextDose}
          onPress={() => router.push('/(tabs)/medicine')}
          onAddMedicine={() => router.push('/medicines/add')}
        />

        {/* Engaging Wellness Companion Card */}
        <MotivationalTipCard
          title={t('keep_going', 'Keep going!')}
          message={t('wellness_sub', 'Small steps every day make a big difference in maintaining healthy circulation.')}
          onPress={() => router.push('/health/measure')}
          mood="encouraging"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 4,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greetingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  mascotBadge: {
    padding: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.sm,
  },
  addButton: {
    marginVertical: 10,
    minHeight: 54,
  },
});
