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
import { MeasureIllustration } from '../../components/MeasureIllustration';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';

export default function HowToMeasureScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { fs } = useResponsive();

  const steps = [
    {
      number: 1,
      title: t('step1_title', 'Rest & Relax'),
      desc: t('step1_desc', 'Sit quietly for 5 minutes before taking the measurement. Avoid rushing or talking.'),
      icon: 'time-outline',
    },
    {
      number: 2,
      title: t('step2_title', 'Support Your Back'),
      desc: t('step2_desc', 'Sit upright in a supportive chair with feet flat on the floor and legs uncrossed.'),
      icon: 'body-outline',
    },
    {
      number: 3,
      title: t('step3_title', 'Position at Heart Level'),
      desc: t('step3_desc', 'Rest your bare arm on a flat surface, with the cuff centered over the brachial artery at heart level.'),
      icon: 'heart-outline',
    },
    {
      number: 4,
      title: t('step4_title', 'Stay Still & Breathe'),
      desc: t('step4_desc', 'Remain relaxed without moving or speaking until the digital monitor beeps and finishes.'),
      icon: 'volume-mute-outline',
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
          {t('how_to_measure_title', 'How to Measure')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot Intro Card */}
        <View style={[styles.mascotGuideCard, Shadows.card]}>
          <BPMascot size={64} mood="encouraging" />
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>{t('buddy_guide_title', "Buddy's Measurement Guide")}</Text>
            <Text style={styles.guideSubtitle}>
              {t('buddy_guide_sub', 'Follow these clinical steps to ensure consistent, reliable blood pressure readings every time.')}
            </Text>
          </View>
        </View>

        {/* Medical Illustration (Vector Arm + Cuff + Digital Unit, NO human faces) */}
        <View style={[styles.illustrationCard, Shadows.card]}>
          <MeasureIllustration />
          <Text style={styles.illustrationCaption}>
            {t('illustration_caption', 'Upper arm cuff position aligned directly with heart level')}
          </Text>
        </View>

        {/* Numbered Steps */}
        <Text style={styles.sectionHeader}>{t('step_by_step', 'Step-by-Step Instructions')}</Text>
        <View style={styles.stepsList}>
          {steps.map((step) => (
            <View key={step.number} style={[styles.stepCard, Shadows.card]}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <View style={styles.stepTextContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Golden Tip Card */}
        <View style={[styles.tipCard, Shadows.card]}>
          <View style={styles.tipIconCircle}>
            <Ionicons name="bulb" size={22} color={Colors.amberDark} />
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>Golden Rule</Text>
            <Text style={styles.tipDescription}>
              Avoid caffeine, exercise, and tobacco for at least 30 minutes before taking a reading. Empty your bladder beforehand.
            </Text>
          </View>
        </View>

        {/* Clinical Note */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.disclaimerText}>
            Blood pressure varies naturally throughout the day. Taking repeat measurements 1 minute apart morning and evening provides the most accurate clinical picture.
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
  mascotGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  guideTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  guideSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  illustrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  illustrationCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  stepsList: {
    gap: 10,
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...Shadows.sm,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  stepTextContent: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  tipIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.amberDark,
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: BorderRadius.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 17,
    fontWeight: '500',
  },
});
