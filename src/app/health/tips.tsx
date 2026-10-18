import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function HealthTipsScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();

  const tips = [
    {
      id: 'salt',
      icon: 'nutrition-outline',
      iconColor: Colors.amberDark,
      bgColor: Colors.amberLight,
      tag: t('tip1_tag', 'Nutrition'),
      title: t('tip1_title', 'Mind Your Dietary Sodium'),
      description: t(
        'tip1_desc',
        'Excess sodium pulls water into your blood vessels, increasing blood volume and artery pressure. Try flavoring food with lemon, garlic, and fresh herbs instead of table salt.'
      ),
    },
    {
      id: 'sleep',
      icon: 'moon-outline',
      iconColor: Colors.purple,
      bgColor: Colors.purpleLight,
      tag: t('tip2_tag', 'Rest'),
      title: t('tip2_title', 'Prioritize 7-8 Hours of Sleep'),
      description: t(
        'tip2_desc',
        'Blood pressure naturally dips during deep sleep (nocturnal dipping). Consistent sleep schedules help restore healthy vascular elasticity.'
      ),
    },
    {
      id: 'movement',
      icon: 'walk-outline',
      iconColor: Colors.mintDark,
      bgColor: Colors.mintLight,
      tag: t('tip3_tag', 'Activity'),
      title: t('tip3_title', 'Daily Moderate Movement'),
      description: t(
        'tip3_desc',
        'A brisk 20–30 minute daily walk strengthens the heart muscle so it pumps blood with less effort, reducing resting systolic pressure.'
      ),
    },
    {
      id: 'stress',
      icon: 'leaf-outline',
      iconColor: Colors.mintDark,
      bgColor: Colors.mintLight,
      tag: t('tip4_tag', 'Calm'),
      title: t('tip4_title', 'Deep Abdominal Breathing'),
      description: t(
        'tip4_desc',
        'When stress surges, take 5 slow breaths into your belly (inhale for 4 seconds, hold 2, exhale for 6). This activates the parasympathetic relaxation response.'
      ),
    },
    {
      id: 'hydration',
      icon: 'water-outline',
      iconColor: Colors.primary,
      bgColor: Colors.primaryLight,
      tag: t('tip5_tag', 'Hydration'),
      title: t('tip5_title', 'Stay Regularly Hydrated'),
      description: t(
        'tip5_desc',
        'Dehydration causes blood vessels to constrict and thicken blood volume, causing sudden spikes. Drink water evenly across the day.'
      ),
    },
  ];

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(18) }]} numberOfLines={1}>
          {t('health_tips_title', 'Health Tips')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Mascot */}
        <View style={[styles.mascotBanner, Shadows.card]}>
          <BPMascot size={64} mood="encouraging" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {t('heart_wellness_title', 'Heart-Healthy Living')}
            </Text>
            <Text style={styles.bannerSub}>
              {t(
                'heart_wellness_sub',
                'Small, consistent daily habits make the biggest difference in maintaining optimal circulation.'
              )}
            </Text>
          </View>
        </View>

        {/* Tip Cards */}
        {tips.map((item) => (
          <View key={item.id} style={[styles.tipCard, Shadows.card]}>
            <View style={[styles.tipIconCircle, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
            </View>
            <View style={styles.tipContent}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.tipTitle}>{item.title}</Text>
              <Text style={styles.tipDesc}>{item.description}</Text>
            </View>
          </View>
        ))}

        {/* Clinical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="shield-outline" size={18} color={Colors.primary} />
            <Text style={styles.disclaimerTitle}>
              {t('medical_notice_title', 'Medical Guidance Notice')}
            </Text>
          </View>
          <Text style={styles.disclaimerBody}>
            {t(
              'medical_notice_body',
              'BP Buddy is an educational tracking companion, not a clinical diagnostic tool. Always follow instructions from your licensed physician. Never stop, start, or alter prescribed medication dosages without professional medical supervision.'
            )}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  mascotBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tipIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
    minWidth: 0,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  tipDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  disclaimerBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
