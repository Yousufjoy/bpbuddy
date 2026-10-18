import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { BloodPressureReading } from '../types/reading';
import { classifyBloodPressure, formatReadingDateTime } from '../utils/bpClassification';
import { BPMascot } from './BPMascot';
import { useResponsive } from '../hooks/use-responsive';
import { useLanguage } from '../context/LanguageContext';

interface BloodPressureCardProps {
  reading: BloodPressureReading | null;
  onPress?: () => void;
  onAddPress?: () => void;
}

export const BloodPressureCard: React.FC<BloodPressureCardProps> = ({
  reading,
  onPress,
  onAddPress,
}) => {
  const { language, t } = useLanguage();
  const { isCompact, isTablet, fs } = useResponsive();
  const cardPadding = isCompact ? 16 : isTablet ? 24 : 20;
  const bigNumber = isCompact ? 34 : fs(40);
  const slashSize = isCompact ? 26 : fs(32);

  if (!reading) {
    return (
      <View style={[styles.heroCard, styles.emptyHeroCard, { padding: cardPadding + 4 }, Shadows.card]}>
        <View style={styles.emptyContent}>
          <BPMascot size={isCompact ? 60 : isTablet ? 88 : 72} mood="waving" />
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>
              {t('welcome_bp_card', 'Welcome to BP Buddy!')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('welcome_bp_card_sub', 'Log your first measurement to start tracking your heart health and daily trends.')}
            </Text>
          </View>
        </View>

        {onAddPress && (
          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={onAddPress}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>
              {t('record_first_reading', 'Record First Reading')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const classification = classifyBloodPressure(reading.systolic, reading.diastolic, t);
  const formattedDate = formatReadingDateTime(reading.measuredAt, language);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.92 : 1}
      onPress={onPress}
      style={[styles.heroCard, { padding: cardPadding }, Shadows.card]}
    >
      {/* Top Header Row with Measured Time and Status */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.pulseDot} />
          <Text style={styles.headerLabel} numberOfLines={1}>
            {t('latest_bp', 'Latest Blood Pressure')}
          </Text>
        </View>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.timeBadgeText} numberOfLines={1}>{formattedDate}</Text>
        </View>
      </View>

      {/* Main Measurement Display Row */}
      <View style={styles.contentRow}>
        <View style={styles.numbersLeft}>
          <View style={styles.readingDisplay}>
            <Text style={[styles.systolicValue, { fontSize: bigNumber }]}>{reading.systolic}</Text>
            <Text style={[styles.slashDivider, { fontSize: slashSize }]}>/</Text>
            <Text style={[styles.diastolicValue, { fontSize: bigNumber }]}>{reading.diastolic}</Text>
            <Text style={styles.unitText}>{t('mmhg', 'mmHg')}</Text>
          </View>

          {/* Classification Pill Badge */}
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: classification.bgColor,
                borderColor: classification.color + '40',
              },
            ]}
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: classification.color },
              ]}
            />
            <Text
              style={[
                styles.categoryBadgeText,
                { color: classification.color },
              ]}
            >
              {classification.badgeLabel}
            </Text>
          </View>
        </View>

        {/* Pulse / Heart Rate Capsule */}
        <View style={[styles.pulseContainer, isCompact && styles.pulseContainerCompact]}>
          <View style={styles.pulseIconBubble}>
            <Ionicons name="heart" size={24} color={Colors.heartPulseRed} />
          </View>
          <View style={styles.pulseTextGroup}>
            <Text style={styles.pulseValue}>{reading.pulse || '—'}</Text>
            <Text style={styles.pulseUnit}>{t('pulse_bpm', 'bpm')}</Text>
          </View>
        </View>
      </View>

      {/* High Alert Banner if measurement is concerning */}
      {classification.isConcerning && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={16} color={Colors.dangerDark} />
          <Text style={styles.alertText}>
            {t('concerning_banner', 'Measurement is high. Rest quietly for 5 minutes and recheck.')}
          </Text>
        </View>
      )}

      {/* Subtle Bottom Accent Indicator */}
      <View
        style={[
          styles.cardBottomBar,
          { backgroundColor: classification.color },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mint,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
    flexShrink: 1,
    minWidth: 0,
  },
  timeBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  numbersLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  readingDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  systolicValue: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  slashDivider: {
    fontSize: 32,
    fontWeight: '400',
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  diastolicValue: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    minWidth: 84,
    flexShrink: 0,
  },
  pulseContainerCompact: {
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pulseIconBubble: {
    marginBottom: 4,
  },
  pulseTextGroup: {
    alignItems: 'center',
  },
  pulseValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pulseUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: 10,
    borderRadius: BorderRadius.md,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  alertText: {
    fontSize: 12,
    color: Colors.dangerDark,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  cardBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  emptyHeroCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTextContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    gap: 8,
    maxWidth: '100%',
    ...Shadows.button,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
});
