import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { ScheduledDoseItem } from '../types/medicine';
import { BPMascot } from './BPMascot';
import { useResponsive } from '../hooks/use-responsive';
import { useLanguage } from '../context/LanguageContext';

interface NextMedicineCardProps {
  dose: ScheduledDoseItem | null;
  onPress: () => void;
  onAddMedicine?: () => void;
}

export const NextMedicineCard: React.FC<NextMedicineCardProps> = ({
  dose,
  onPress,
  onAddMedicine,
}) => {
  const { t } = useLanguage();
  const { isCompact } = useResponsive();

  if (!dose) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.emptyCard, Shadows.card]}
        onPress={onAddMedicine || onPress}
        activeOpacity={0.88}
      >
        <BPMascot size={isCompact ? 44 : 52} mood="medicine" />
        <View style={styles.textContainer}>
          <Text style={styles.headerLabel}>{t('next_medicine', 'Next Medicine')}</Text>
          <Text style={styles.medicineName}>{t('all_caught_up', 'All Caught Up')}</Text>
          <Text style={styles.emptySub}>
            {t('no_pending_doses', 'No scheduled doses pending. Tap to manage medications.')}
          </Text>
        </View>
        <View style={styles.chevronCircle}>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.card]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="pill" size={24} color={Colors.amberDark} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.tagRow}>
          <Text style={[styles.headerLabel, styles.tagLabel]} numberOfLines={1}>
            {t('next_medicine', 'Next Medicine')}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{t('pending', 'Pending')}</Text>
          </View>
        </View>

        <Text style={styles.medicineName} numberOfLines={1}>
          {dose.medicineName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <MaterialCommunityIcons name="tag-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{dose.dose}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{dose.scheduledTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chevronCircle}>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyCard: {
    paddingVertical: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.amberBorder,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  tagLabel: {
    flexShrink: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    paddingRight: 6,
  },
  headerLabel: {
    fontSize: 11,
    color: Colors.amberDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amberDark,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
    maxWidth: '100%',
    flexShrink: 1,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    flexShrink: 0,
  },
});
