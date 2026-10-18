import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';
import { BPMascot } from '../components/BPMascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { setSetting } from '../database/database';
import { useResponsive } from '../hooks/use-responsive';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromSettings = from === 'settings';
  const { language, setLanguage, languagesList, t } = useLanguage();
  const { fs, isCompact } = useResponsive();
  const [saving, setSaving] = useState(false);

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    await setLanguage(code);
  };

  const handleProceed = async () => {
    setSaving(true);
    try {
      await setSetting('has_selected_language', 'true');
    } catch (e) {
      console.warn('Failed to persist language selection flag:', e);
    } finally {
      setSaving(false);
    }

    if (isFromSettings) {
      router.back();
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header Bar (back button if opened from Settings) */}
      <View style={styles.topBar}>
        {isFromSettings ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BP BUDDY</Text>
          </View>
        )}

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot & Welcoming Header Card */}
        <View style={[styles.welcomeCard, Shadows.card]}>
          <View style={styles.mascotWrapper}>
            <BPMascot size={isCompact ? 68 : 84} mood="waving" />
          </View>
          <Text style={[styles.title, { fontSize: fs(24) }]}>
            {t('choose_language_title', 'Choose Your Language')}
          </Text>
          <Text style={[styles.subtitle, { fontSize: fs(13) }]}>
            {t('choose_language_sub', 'Select your preferred language to begin with BP Buddy.')}
          </Text>
        </View>

        {/* Language Options List */}
        <View style={styles.optionsContainer}>
          {languagesList.map((item) => {
            const isSelected = item.code === language;
            return (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.optionCard,
                  Shadows.sm,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleSelectLanguage(item.code)}
                activeOpacity={0.75}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.flagEmoji}>{item.flag}</Text>
                  <View style={styles.namesColumn}>
                    <Text
                      style={[
                        styles.nativeName,
                        isSelected && styles.nativeNameSelected,
                      ]}
                    >
                      {item.nativeName}
                    </Text>
                    <Text style={styles.englishName}>{item.name}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={isFromSettings ? t('save', 'Save') : t('continue', 'Continue')}
          icon={
            !isFromSettings ? (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            ) : undefined
          }
          onPress={handleProceed}
          loading={saving}
          style={styles.continueButton}
        />
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mascotWrapper: {
    marginBottom: 14,
  },
  title: {
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagEmoji: {
    fontSize: 32,
  },
  namesColumn: {
    justifyContent: 'center',
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  nativeNameSelected: {
    color: Colors.primary,
  },
  englishName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  continueButton: {
    width: '100%',
    height: 52,
  },
});
