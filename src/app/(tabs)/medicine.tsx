import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { getTodayDoses, upsertDoseLog, getAllMedicines } from '../../database/database';
import { ScheduledDoseItem, TimeOfDay } from '../../types/medicine';
import { PrimaryButton } from '../../components/PrimaryButton';
import { syncWithCloud } from '../../services/sync';
import { BPMascot } from '../../components/BPMascot';
import { useResponsive } from '../../hooks/use-responsive';
import { useLanguage } from '../../context/LanguageContext';
import { MONTH_NAMES } from '../../utils/bpClassification';

export default function MedicineScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { fs } = useResponsive();
  const [todayDoses, setTodayDoses] = useState<ScheduledDoseItem[]>([]);
  const [upcomingDoses, setUpcomingDoses] = useState<ScheduledDoseItem[]>([]);
  const [hasMedicines, setHasMedicines] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastToggledId, setLastToggledId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const allMeds = await getAllMedicines(true);
      setHasMedicines(allMeds.length > 0);

      const today = await getTodayDoses(new Date());
      setTodayDoses(today);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const upcoming = await getTodayDoses(tomorrow);
      setUpcomingDoses(upcoming);
    } catch (e) {
      console.warn('Failed to load doses:', e);
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

  const handleToggleDose = async (item: ScheduledDoseItem) => {
    const nextStatus = item.status === 'taken' ? 'pending' : 'taken';
    const now = new Date().toISOString();
    const logId = item.logId || `log_${item.medicineId}_${Date.now()}`;

    setLastToggledId(item.id);

    await upsertDoseLog({
      id: logId,
      medicineId: item.medicineId,
      scheduleId: item.scheduleId || null,
      scheduledFor: item.scheduledFor,
      status: nextStatus,
      takenAt: nextStatus === 'taken' ? now : null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    });

    syncWithCloud().catch(() => {});

    setTodayDoses((prev) =>
      prev.map((d) =>
        d.id === item.id
          ? { ...d, status: nextStatus, takenAt: nextStatus === 'taken' ? now : null, logId }
          : d
      )
    );

    setTimeout(() => setLastToggledId(null), 800);
  };

  const handleSkipDose = (item: ScheduledDoseItem) => {
    Alert.alert(
      t('skip_dose_title', 'Skip Dose'),
      t('skip_dose_confirm', `Mark ${item.medicineName} as skipped? You won't need to take a double dose later.`),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('skip', 'Skip Dose'),
          onPress: async () => {
            const now = new Date().toISOString();
            const logId = item.logId || `log_${item.medicineId}_${Date.now()}`;
            await upsertDoseLog({
              id: logId,
              medicineId: item.medicineId,
              scheduleId: item.scheduleId || null,
              scheduledFor: item.scheduledFor,
              status: 'skipped',
              takenAt: null,
              notes: 'Skipped by user',
              createdAt: now,
              updatedAt: now,
              syncStatus: 'pending',
            });
            setTodayDoses((prev) =>
              prev.map((d) => (d.id === item.id ? { ...d, status: 'skipped', logId } : d))
            );
          },
        },
      ]
    );
  };

  const timeOfDayConfig: Record<
    TimeOfDay,
    { label: string; icon: any; color: string; bgColor: string }
  > = {
    morning: { label: t('morning', 'Morning'), icon: 'sunny', color: '#F59E0B', bgColor: Colors.amberLight },
    afternoon: { label: t('afternoon', 'Afternoon'), icon: 'partly-sunny', color: '#3B82F6', bgColor: Colors.primaryLight },
    evening: { label: t('evening', 'Evening'), icon: 'cloudy-night', color: '#8B5CF6', bgColor: Colors.purpleLight },
    night: { label: t('night', 'Night'), icon: 'moon', color: '#6366F1', bgColor: '#EEF2FF' },
  };

  const formatUpcomingDateHeader = () => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const months = (language && MONTH_NAMES[language]) || MONTH_NAMES.en;
    return `${months[tm.getMonth()]} ${tm.getDate()}`;
  };

  const completedCount = todayDoses.filter((d) => d.status === 'taken').length;
  const totalCount = todayDoses.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <ScreenContainer style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.screenTitle, { fontSize: fs(24) }]}>
            {t('med_schedule', 'Medicine Schedule')}
          </Text>
          <Text style={styles.screenSubtitle}>
            {t('daily_doses_sub', 'Daily doses & adherence')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => router.push('/medicines/all')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pill" size={16} color={Colors.primary} />
          <Text style={styles.manageButtonText}>{t('my_meds', 'My Meds')}</Text>
        </TouchableOpacity>
      </View>

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
        {/* Banner Advice Card with Mascot */}
        <View style={[styles.bannerCard, Shadows.card]}>
          <BPMascot size={56} mood={isAllCompleted ? 'celebrating' : 'medicine'} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {isAllCompleted ? t('all_doses_taken', 'All Doses Taken!') : t('take_your_medicine', 'Take Your Medicine')}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {isAllCompleted
                ? t('adherence_good', 'Great job staying consistent! Your adherence protects your blood pressure.')
                : t('adherence_reminder', 'Stay consistent, it helps keep your blood pressure stable.')}
            </Text>

            {totalCount > 0 && (
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round((completedCount / totalCount) * 100)}%`,
                      backgroundColor: isAllCompleted ? Colors.mint : Colors.primary,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        </View>

        {/* Today Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>{t('todays_doses', "Today's Doses")}</Text>
            {totalCount > 0 && (
              <View style={styles.progressPill}>
                <Text style={styles.progressPillText}>
                  {completedCount} of {totalCount} completed
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/medicines/history')}>
            <Text style={styles.historyLinkText}>{t('dose_history', 'Dose History →')}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Checklist */}
        {!hasMedicines || todayDoses.length === 0 ? (
          <View style={[styles.emptyDosesCard, Shadows.card]}>
            <BPMascot size={64} mood="happy" />
            <Text style={styles.emptyTitle}>{t('no_meds_title', 'No medicine schedules yet')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('no_meds_sub', 'Add your prescribed medications to receive on-time reminders and track daily doses.')}
            </Text>
            <PrimaryButton
              title={t('add_first_med', '+ Add First Medicine')}
              onPress={() => router.push('/medicines/add')}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          todayDoses.map((item) => {
            const config = timeOfDayConfig[item.timeOfDay] || timeOfDayConfig.morning;
            const isTaken = item.status === 'taken';
            const isSkipped = item.status === 'skipped';
            const wasJustToggled = lastToggledId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.doseItemCard,
                  Shadows.card,
                  isTaken && styles.doseItemTaken,
                  isSkipped && styles.doseItemSkipped,
                  wasJustToggled && styles.doseItemAnimated,
                ]}
              >
                {/* Time of day icon */}
                <View
                  style={[
                    styles.doseIconCircle,
                    { backgroundColor: config.bgColor },
                  ]}
                >
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>

                {/* Info */}
                <TouchableOpacity
                  style={styles.doseInfoArea}
                  onLongPress={() => handleSkipDose(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.doseNameRow}>
                    <Text
                      style={[
                        styles.doseMedName,
                        isTaken && styles.textStrikethrough,
                      ]}
                      numberOfLines={1}
                    >
                      {item.medicineName}
                    </Text>
                    <View style={styles.doseBadge}>
                      <Text style={styles.doseBadgeText}>{item.dose}</Text>
                    </View>
                  </View>

                  <View style={styles.doseMetaRow}>
                    <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.doseTimeText}>{item.scheduledTime}</Text>
                    <Text style={styles.dotDivider}>•</Text>
                    <Text style={styles.doseInstructionsText}>
                      {item.instructions || '1 tablet'}
                    </Text>
                    {isSkipped && (
                      <View style={styles.skippedTag}>
                        <Text style={styles.skippedTagText}>{t('skipped', 'Skipped')}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Checkbox Button */}
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    isTaken && styles.checkButtonTaken,
                    isSkipped && styles.checkButtonSkipped,
                  ]}
                  onPress={() => handleToggleDose(item)}
                  activeOpacity={0.7}
                >
                  {isTaken ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : isSkipped ? (
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  ) : (
                    <View style={styles.checkCircleInner} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Upcoming Section */}
        {upcomingDoses.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <Text style={styles.sectionTitle}>{t('tomorrows_preview', "Tomorrow's Preview")}</Text>
            {upcomingDoses.map((item) => {
              const config = timeOfDayConfig[item.timeOfDay] || timeOfDayConfig.morning;
              return (
                <View
                  key={`upcoming_${item.id}`}
                  style={[styles.doseItemCard, styles.upcomingCard, Shadows.card]}
                >
                  <View style={styles.upcomingDateColumn}>
                    <Text style={styles.upcomingDateText}>
                      {formatUpcomingDateHeader()}
                    </Text>
                    <Text style={styles.upcomingSubText}>{config.label}</Text>
                  </View>

                  <View style={styles.doseInfoArea}>
                    <Text style={styles.doseMedName}>{item.medicineName}</Text>
                    <Text style={styles.doseTimeText}>
                      {item.scheduledTime} • {item.dose}
                    </Text>
                  </View>

                  <View style={styles.upcomingBadge}>
                    <Text style={styles.upcomingBadgeText}>{t('scheduled', 'Scheduled')}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Add Medicine Button */}
        {hasMedicines && (
          <PrimaryButton
            title={t('add_another_med', '+ Add Another Medicine')}
            variant="outline"
            onPress={() => router.push('/medicines/add')}
            style={styles.addMedButton}
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
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
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
    ...Shadows.sm,
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  progressPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  progressPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  historyLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  doseItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  doseItemTaken: {
    backgroundColor: '#F9FDFB',
    borderColor: Colors.mintBorder,
  },
  doseItemSkipped: {
    backgroundColor: '#FAF5FF',
    borderColor: Colors.purpleBorder,
  },
  doseItemAnimated: {
    transform: [{ scale: 1.02 }],
  },
  doseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doseInfoArea: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  doseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  doseMedName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    flexShrink: 1,
    minWidth: 0,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  doseBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  doseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  doseTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dotDivider: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  doseInstructionsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  skippedTag: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  skippedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amberDark,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    backgroundColor: '#FFFFFF',
  },
  checkButtonTaken: {
    backgroundColor: Colors.mint,
    borderColor: Colors.mint,
  },
  checkButtonSkipped: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  checkCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
  },
  emptyDosesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  upcomingCard: {
    backgroundColor: '#FAFCFF',
  },
  upcomingDateColumn: {
    width: 68,
    marginRight: 6,
    flexShrink: 0,
  },
  upcomingDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  upcomingSubText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  upcomingBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  addMedButton: {
    marginTop: 16,
  },
});
