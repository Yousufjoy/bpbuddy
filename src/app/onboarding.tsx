import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { BPMascot, MascotMood } from '../components/BPMascot';
import { useResponsive } from '../hooks/use-responsive';
import { setSetting, getSetting } from '../database/database';
import { useLanguage } from '../context/LanguageContext';
import { LanguageModal } from '../components/LanguageModal';

interface OnboardingSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  mood: MascotMood;
  accentColor: string;
  accentBg: string;
  haloBg: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  features: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
  }[];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, isCompact, isTablet, isShort, fs } = useResponsive();
  const { t, language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Check that language has been chosen first
  useEffect(() => {
    async function checkLanguagePrompt() {
      try {
        const selected = await getSetting('has_selected_language');
        if (selected !== 'true') {
          router.replace('/language-select');
        }
      } catch {
        router.replace('/language-select');
      }
    }
    checkLanguagePrompt();
  }, [router]);

  const handleLanguageConfirm = async () => {
    setShowLanguageModal(false);
    try {
      await setSetting('has_selected_language', 'true');
    } catch (e) {
      console.warn('Failed to save language prompt state:', e);
    }
  };

  // Subtle breathing animation for mascot
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  // Reactive localized slides
  const slides: OnboardingSlide[] = useMemo(
    () => [
      {
        id: 'welcome',
        badge: t('onb_slide1_badge', 'WELCOME TO BP BUDDY'),
        title: t('onb_slide1_title', 'Your Friendly Heart Companion'),
        subtitle: t(
          'onb_slide1_sub',
          'A warm, stress-free space designed to help you monitor blood pressure, understand your numbers, and celebrate every healthy step.'
        ),
        mood: 'waving',
        accentColor: Colors.coral,
        accentBg: Colors.coralLight,
        haloBg: 'rgba(255, 107, 107, 0.14)',
        badgeIcon: 'heart',
        features: [
          {
            icon: 'heart-circle',
            title: t('onb_slide1_f1_title', 'Friendly & Calming'),
            description: t('onb_slide1_f1_desc', 'Designed to reassure you, not make you feel anxious.'),
          },
          {
            icon: 'shield-checkmark',
            title: t('onb_slide1_f2_title', '100% Private & Offline'),
            description: t('onb_slide1_f2_desc', 'Your sensitive health data stays securely on your phone.'),
          },
        ],
      },
      {
        id: 'tracking',
        badge: t('onb_slide2_badge', 'SMART LOGGING'),
        title: t('onb_slide2_title', 'Track Your Blood Pressure'),
        subtitle: t(
          'onb_slide2_sub',
          'Record systolic, diastolic, and pulse in seconds. Visual cards and color-coded tags show you instantly where your reading stands.'
        ),
        mood: 'happy',
        accentColor: Colors.primary,
        accentBg: Colors.primaryLight,
        haloBg: 'rgba(22, 119, 242, 0.14)',
        badgeIcon: 'speedometer',
        features: [
          {
            icon: 'color-palette-outline',
            title: t('onb_slide2_f1_title', 'AHA & WHO Categories'),
            description: t('onb_slide2_f1_desc', 'Clear color tags: Normal, Elevated, Stage 1, & Stage 2.'),
          },
          {
            icon: 'trending-up',
            title: t('onb_slide2_f2_title', 'Trend Insights & PDF Export'),
            description: t('onb_slide2_f2_desc', 'Watch progress over time and share clean reports with your doctor.'),
          },
        ],
      },
      {
        id: 'medicines',
        badge: t('onb_slide3_badge', 'MEDICATION MANAGER'),
        title: t('onb_slide3_title', 'Never Miss Your Medicine'),
        subtitle: t(
          'onb_slide3_sub',
          'Keep track of your daily prescriptions and supplements with gentle, timely notifications that fit right into your routine.'
        ),
        mood: 'medicine',
        accentColor: Colors.mintDark,
        accentBg: Colors.mintLight,
        haloBg: 'rgba(16, 185, 129, 0.16)',
        badgeIcon: 'medical',
        features: [
          {
            icon: 'notifications',
            title: t('onb_slide3_f1_title', 'Reliable Daily Reminders'),
            description: t('onb_slide3_f1_desc', 'Custom alerts for morning, afternoon, evening, and bedtime.'),
          },
          {
            icon: 'checkmark-done-circle',
            title: t('onb_slide3_f2_title', '1-Tap Dose Confirmation'),
            description: t('onb_slide3_f2_desc', 'Quickly mark doses as taken and build a reliable adherence history.'),
          },
        ],
      },
      {
        id: 'health',
        badge: t('onb_slide4_badge', 'HEALTHY HABITS'),
        title: t('onb_slide4_title', 'Stay on Top of Your Health'),
        subtitle: t(
          'onb_slide4_sub',
          'Build long-term consistency with daily wellness advice, lifestyle tips, and friendly encouragement on your journey to vitality.'
        ),
        mood: 'celebrating',
        accentColor: Colors.amberDark,
        accentBg: Colors.amberLight,
        haloBg: 'rgba(245, 158, 11, 0.18)',
        badgeIcon: 'ribbon',
        features: [
          {
            icon: 'sparkles',
            title: t('onb_slide4_f1_title', 'Consistency Streaks'),
            description: t('onb_slide4_f1_desc', 'Stay motivated with tracking streaks and milestone celebrations.'),
          },
          {
            icon: 'fitness',
            title: t('onb_slide4_f2_title', 'Practical Lifestyle Tips'),
            description: t('onb_slide4_f2_desc', 'Simple sodium, hydration, sleep, and exercise reminders.'),
          },
        ],
      },
    ],
    [t]
  );

  const handleFinish = async () => {
    try {
      await setSetting('has_completed_onboarding', 'true');
    } catch (e) {
      console.warn('Failed to save onboarding completion state:', e);
    }
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
      setCurrentIndex(prevIdx);
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index >= 0 && index < slides.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  // Responsive mascot sizing
  const mascotSize = isShort ? 88 : isCompact ? 104 : isTablet ? 144 : 124;
  const haloSize = mascotSize * 1.5;

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Top Bar with Language Picker / Skip */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {currentIndex > 0 ? (
            <TouchableOpacity
              onPress={handlePrev}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>BP BUDDY</Text>
            </View>
          )}
        </View>

        {/* Language Switcher Chip */}
        <TouchableOpacity
          style={styles.langChip}
          onPress={() => setShowLanguageModal(true)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Change language"
        >
          <Ionicons name="globe-outline" size={13} color={Colors.primary} />
          <Text style={styles.langChipText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {currentIndex + 1} of {slides.length}
          </Text>
        </View>

        <View style={styles.topBarRight}>
          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={styles.skipText}>{t('skip', 'Skip')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>
      </View>

      {/* Swipeable Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }: { item: OnboardingSlide }) => {
          return (
            <View style={[styles.slideContainer, { width }]}>
              <ScrollView
                contentContainerStyle={[
                  styles.slideScrollContent,
                  { minHeight: isShort ? undefined : height * 0.65 },
                ]}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Visual Mascot Showcase */}
                <View style={[styles.mascotShowcase, { marginVertical: isShort ? 10 : 20 }]}>
                  {/* Outer Pulsing Halo */}
                  <View
                    style={[
                      styles.haloCircle,
                      {
                        width: haloSize,
                        height: haloSize,
                        borderRadius: haloSize / 2,
                        backgroundColor: item.haloBg,
                      },
                    ]}
                  />

                  {/* Inner Halo Ring */}
                  <View
                    style={[
                      styles.haloInner,
                      {
                        width: mascotSize * 1.25,
                        height: mascotSize * 1.25,
                        borderRadius: (mascotSize * 1.25) / 2,
                        backgroundColor: item.accentBg,
                      },
                    ]}
                  />

                  {/* Floating mascot with gentle animation */}
                  <Animated.View
                    style={[
                      styles.mascotWrapper,
                      {
                        transform: [{ translateY: floatAnim }],
                      },
                    ]}
                  >
                    <BPMascot size={mascotSize} mood={item.mood} />
                  </Animated.View>

                  {/* Floating Decorative Badges */}
                  <View
                    style={[
                      styles.floatingChip,
                      {
                        backgroundColor: item.accentColor,
                        top: 4,
                        right: isCompact ? '18%' : '24%',
                      },
                    ]}
                  >
                    <Ionicons name={item.badgeIcon} size={14} color="#FFFFFF" />
                  </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  {/* Category Pill */}
                  <View
                    style={[
                      styles.pillBadge,
                      {
                        backgroundColor: item.accentBg,
                        borderColor: item.accentColor + '33',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillBadgeText,
                        { color: item.accentColor, fontSize: fs(11) },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text
                    style={[
                      styles.slideTitle,
                      {
                        fontSize: isCompact ? 22 : isTablet ? 30 : 26,
                        lineHeight: isCompact ? 28 : isTablet ? 38 : 32,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>

                  {/* Subtitle */}
                  <Text
                    style={[
                      styles.slideSubtitle,
                      {
                        fontSize: isCompact ? 13 : isTablet ? 16 : 14,
                        lineHeight: isCompact ? 19 : isTablet ? 24 : 21,
                      },
                    ]}
                  >
                    {item.subtitle}
                  </Text>

                  {/* Feature Highlights */}
                  <View style={styles.featuresContainer}>
                    {item.features.map((feat, fIdx) => (
                      <View key={fIdx} style={styles.featureRow}>
                        <View
                          style={[
                            styles.featureIconWrap,
                            {
                              backgroundColor: item.accentBg,
                              borderColor: item.accentColor + '25',
                            },
                          ]}
                        >
                          <Ionicons
                            name={feat.icon}
                            size={18}
                            color={item.accentColor}
                          />
                        </View>
                        <View style={styles.featureTextWrap}>
                          <Text
                            style={[
                              styles.featureTitle,
                              { fontSize: isCompact ? 13 : 14 },
                            ]}
                          >
                            {feat.title}
                          </Text>
                          <Text
                            style={[
                              styles.featureDesc,
                              { fontSize: isCompact ? 11 : 12 },
                            ]}
                          >
                            {feat.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        }}
      />

      {/* Bottom Controls: Pagination Indicators + Next/Get Started Button */}
      <View style={styles.bottomControls}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                key={slide.id}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                  setCurrentIndex(index);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                style={[
                  styles.dot,
                  isActive
                    ? [
                        styles.dotActive,
                        {
                          backgroundColor: slide.accentColor,
                          width: isCompact ? 24 : 28,
                        },
                      ]
                    : styles.dotInactive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          style={[
            styles.actionButton,
            isLastSlide ? styles.actionButtonFinal : styles.actionButtonNext,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? t('get_started', 'Get Started') : t('next', 'Next')}
        >
          <Text style={styles.actionButtonText}>
            {isLastSlide ? t('get_started', 'Get Started') : t('next', 'Next')}
          </Text>
          <Ionicons
            name={isLastSlide ? 'sparkles' : 'arrow-forward'}
            size={18}
            color="#FFFFFF"
            style={styles.actionButtonIcon}
          />
        </TouchableOpacity>
      </View>

      {/* First-launch / Change Language Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        isFirstLaunch={true}
        onConfirm={handleLanguageConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 48,
  },
  topBarLeft: {
    minWidth: 70,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
    marginRight: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    gap: 4,
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  topBarRight: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  skipPlaceholder: {
    width: 40,
    height: 20,
  },
  slideContainer: {
    flex: 1,
  },
  slideScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotShowcase: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloCircle: {
    position: 'absolute',
  },
  haloInner: {
    position: 'absolute',
  },
  mascotWrapper: {
    zIndex: 2,
  },
  floatingChip: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    ...Shadows.sm,
  },
  textContent: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  pillBadgeText: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  slideSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: '100%',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.sm,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
    gap: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  actionButton: {
    width: '100%',
    maxWidth: 440,
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  actionButtonNext: {
    backgroundColor: Colors.primary,
  },
  actionButtonFinal: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionButtonIcon: {
    marginLeft: 8,
  },
});
