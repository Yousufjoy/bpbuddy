import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageModal } from '../../components/LanguageModal';

export default function MoreScreen() {
  const router = useRouter();
  const { t, languageOption } = useLanguage();
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);

  const menuItems = [
    {
      id: 'language',
      title: t('language_menu', 'Language / ভাষা'),
      subtitle: `${languageOption.flag} ${languageOption.nativeName} (${languageOption.name})`,
      icon: 'language-outline',
      color: Colors.coral,
      bgColor: Colors.coralLight,
      badge: languageOption.flag,
      onPress: () => router.push('/settings/language?from=settings'),
    },
    {
      id: 'profile',
      title: t('profile_title', 'Profile & Account'),
      subtitle: t('profile_sub', 'Guest / Cloud sync'),
      icon: 'person-outline',
      color: Colors.primary,
      bgColor: Colors.primaryLight,
      badge: t('coming_soon', 'Coming Soon'),
      onPress: () => {
        Alert.alert(
          t('coming_soon', 'Coming Soon'),
          'Profile & Account management will be available in an upcoming update.'
        );
      },
    },
    {
      id: 'family',
      title: t('family_members', 'Family Members'),
      subtitle: t('family_sub', 'Multi-profile logging'),
      icon: 'people-outline',
      color: Colors.purple,
      bgColor: Colors.purpleLight,
      badge: t('coming_soon', 'Coming Soon'),
      onPress: () => {
        Alert.alert(t('coming_soon', 'Coming Soon'), 'Multi-user family tracking will be available in an upcoming update.');
      },
    },
    {
      id: 'reminders',
      title: t('medicine_reminders', 'Medicine Reminders'),
      subtitle: t('reminders_sub', 'Sound & vibration channels'),
      icon: 'notifications-outline',
      color: Colors.amberDark,
      bgColor: Colors.amberLight,
      onPress: () => router.push('/settings/notifications'),
    },
    {
      id: 'units',
      title: t('units_title', 'Units of Measurement'),
      subtitle: t('units_sub', 'mmHg (Standard)'),
      icon: 'speedometer-outline',
      color: Colors.mintDark,
      bgColor: Colors.mintLight,
      onPress: () => {
        Alert.alert(
          t('units_title', 'Standard Blood Pressure Unit'),
          t('standard_unit_msg', 'BP Buddy uses standard mmHg (millimeters of mercury) for all clinical blood pressure measurements.')
        );
      },
    },
    {
      id: 'about',
      title: t('about_title', 'About BP Buddy'),
      subtitle: t('about_sub', 'Version 1.0.0 • Offline-ready'),
      icon: 'information-circle-outline',
      color: Colors.purple,
      bgColor: Colors.purpleLight,
      onPress: () => {
        Alert.alert(
          t('about_title', 'About BP Buddy'),
          'BP Buddy v1.0.0\n\nA lightweight, privacy-conscious health tracking companion for monitoring blood pressure trends and daily medication schedules.\n\nDisclaimer: This application is an educational logging utility and is not a substitute for professional clinical medical advice or diagnosis.'
        );
      },
    },
    {
      id: 'tour',
      title: t('welcome_tour', 'Welcome Tour'),
      subtitle: t('welcome_tour_sub', 'Revisit the intro slider screens'),
      icon: 'sparkles-outline',
      color: Colors.coral,
      bgColor: Colors.coralLight,
      onPress: () => router.push('/onboarding'),
    },
    {
      id: 'help',
      title: t('health_tips_title', 'Health Tips & Guide'),
      subtitle: t('daily_doses_sub', 'Measurement & habits'),
      icon: 'help-circle-outline',
      color: Colors.mintDark,
      bgColor: Colors.mintLight,
      onPress: () => router.push('/health/tips'),
    },
  ];

  return (
    <ScreenContainer style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.screenTitle}>{t('settings_more', 'Settings & More')}</Text>
        <Text style={styles.screenSubtitle}>{t('settings_sub', 'Preferences and data management')}</Text>
      </View>

      <LanguageModal
        visible={isLangModalVisible}
        onClose={() => setIsLangModalVisible(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile / Mascot Greeting Header Card */}
        <TouchableOpacity
          style={[styles.profileHeaderCard, Shadows.card]}
          onPress={() => {
            Alert.alert(
              t('coming_soon', 'Coming Soon'),
              'Profile & Account management will be available in an upcoming update.'
            );
          }}
          activeOpacity={0.88}
        >
          <BPMascot size={58} mood="waving" />
          <View style={styles.profileTextGroup}>
            <Text style={styles.profileName}>{t('companion_name', 'BP Buddy Companion')}</Text>
            <Text style={styles.profileStatus}>{t('private_profile', 'Local-First Private Profile')}</Text>
            <View style={styles.profileBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.profileBadgeText}>{t('device_storage_active', 'Device Storage Active')}</Text>
            </View>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>{t('coming_soon', 'Coming Soon')}</Text>
          </View>
        </TouchableOpacity>

        {/* How to Measure Quick Banner */}
        <TouchableOpacity
          style={[styles.howToMeasureButton, Shadows.card]}
          onPress={() => router.push('/health/measure')}
          activeOpacity={0.85}
        >
          <View style={styles.howToMeasureIcon}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color={Colors.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.howToMeasureTitle}>{t('how_to_measure_title', 'How to Measure Blood Pressure')}</Text>
            <Text style={styles.howToMeasureSub}>
              {t('how_to_measure_sub', 'Clinical step-by-step measurement guide with illustration')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>

        {/* Menu Items Card */}
        <View style={[styles.menuListCard, Shadows.card]}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconCircle, { backgroundColor: item.bgColor }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.menuRight}>
                  {item.badge && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Support Card with Mascot */}
        <View style={[styles.supportCard, Shadows.card]}>
          <BPMascot size={54} mood="celebrating" />
          <View style={styles.supportTextContainer}>
            <Text style={styles.supportTitle}>{t('health_matters_title', 'Your Health Matters')}</Text>
            <Text style={styles.supportSubtitle}>
              {t('health_matters_desc', "Consistency is your strongest ally. We're here to keep your numbers organized.")}
            </Text>
          </View>
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
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  profileTextGroup: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  profileStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.mint,
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.mintDark,
  },
  howToMeasureButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  howToMeasureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.coralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToMeasureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  howToMeasureSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  menuTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  supportTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
