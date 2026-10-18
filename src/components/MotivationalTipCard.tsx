import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { BPMascot, MascotMood } from './BPMascot';
import { useResponsive } from '../hooks/use-responsive';
import { useLanguage } from '../context/LanguageContext';

interface MotivationalTipCardProps {
  onPress?: () => void;
  title?: string;
  message?: string;
  mood?: MascotMood;
}

export const MotivationalTipCard: React.FC<MotivationalTipCardProps> = ({
  onPress,
  title,
  message,
  mood = 'encouraging',
}) => {
  const { t } = useLanguage();
  const { isCompact, isTablet } = useResponsive();

  const displayTitle = title || t('keep_going', 'Keep going!');
  const displayMessage = message || t('wellness_sub', 'Small steps every day make a big difference in maintaining healthy circulation.');

  return (
    <TouchableOpacity
      style={[styles.companionCard, Shadows.card]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      <View style={styles.mascotArea}>
        <BPMascot size={isCompact ? 48 : isTablet ? 68 : 58} mood={mood} />
      </View>

      <View style={styles.speechContainer}>
        <View style={styles.tagHeader}>
          <Text style={styles.companionLabel}>
            {t('wellness_companion', 'Wellness Companion')}
          </Text>
          <Ionicons name="sparkles" size={13} color={Colors.amber} />
        </View>

        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.message}>{displayMessage}</Text>

        <View style={styles.actionRow}>
          <Text style={styles.learnMoreText}>
            {t('read_health_tips', 'Read Health Tips')}
          </Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  companionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mascotArea: {
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  speechContainer: {
    flex: 1,
    minWidth: 0,
  },
  tagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  companionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.mintDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
