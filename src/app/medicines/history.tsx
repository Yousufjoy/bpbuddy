import React, { useCallback, useState } from 'react';
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
import { useResponsive } from '../../hooks/use-responsive';
import { getDoseLogs } from '../../database/database';
import { MedicineDoseLog } from '../../types/dose';
import { formatReadingDateTime } from '../../utils/bpClassification';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function MedicineHistoryScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<MedicineDoseLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const data = await getDoseLogs();
      setLogs(data);
    } catch (e) {
      console.warn('Failed to load dose logs:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const skippedCount = logs.filter((l) => l.status === 'skipped').length;
  const adherenceRate = logs.length > 0 ? Math.round((takenCount / logs.length) * 100) : 0;
  const mascotMood = logs.length === 0 ? 'resting' : adherenceRate >= 80 ? 'celebrating' : 'encouraging';

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(17) }]} numberOfLines={1}>
          {t('dose_adherence_log', 'Dose Adherence Log')}
        </Text>
        <View style={styles.mascotChip}>
          <BPMascot size={32} mood={mascotMood} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Adherence Hero Card */}
        <View style={[styles.adherenceHero, Shadows.card]}>
          <View style={styles.adherenceTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgePill}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
                <Text style={styles.badgeText}>{t('adherence_overview', 'Adherence Overview')}</Text>
              </View>
              <Text style={styles.adherenceHeaderTitle}>
                {logs.length === 0
                  ? t('no_doses_logged', 'No Doses Logged')
                  : adherenceRate >= 80
                  ? t('outstanding_habit', 'Outstanding Habit!')
                  : t('keep_striving', 'Keep Striving!')}
              </Text>
              <Text style={styles.adherenceSub}>
                {logs.length === 0
                  ? t('adherence_sub_empty', 'Log your scheduled doses daily to keep your blood pressure stable.')
                  : adherenceRate >= 80
                  ? t('adherence_sub_high', 'You are taking medications on schedule consistently. Great discipline!')
                  : t('adherence_sub_low', 'Taking medications at consistent times maximizes cardiovascular efficacy.')}
              </Text>
            </View>
            <View style={styles.rateRing}>
              <Text style={styles.ratePercent}>{logs.length > 0 ? `${adherenceRate}%` : '—'}</Text>
              <Text style={styles.rateLabel}>%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {logs.length > 0 && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(adherenceRate, 100)}%` }]} />
            </View>
          )}

          {/* 3 Metric Pills */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricTile, { backgroundColor: '#F0FDF4' }]}>
              <View style={[styles.miniDot, { backgroundColor: Colors.success }]} />
              <Text style={[styles.metricNumber, { color: Colors.success }]}>{takenCount}</Text>
              <Text style={styles.metricLabel}>{t('taken', 'Taken')}</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: '#FFFBEB' }]}>
              <View style={[styles.miniDot, { backgroundColor: Colors.warning }]} />
              <Text style={[styles.metricNumber, { color: Colors.warning }]}>{skippedCount}</Text>
              <Text style={styles.metricLabel}>{t('skipped', 'Skipped')}</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: Colors.primaryLight }]}>
              <View style={[styles.miniDot, { backgroundColor: Colors.primary }]} />
              <Text style={[styles.metricNumber, { color: Colors.primary }]}>{logs.length}</Text>
              <Text style={styles.metricLabel}>{t('total_readings', 'Total Tracked')}</Text>
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('logged_dose_history', 'Recorded Activity')}</Text>
          <Text style={styles.sectionCount}>{logs.length}</Text>
        </View>

        {/* Logs List or Mascot Empty State */}
        {logs.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <BPMascot size={90} mood="resting" />
            <Text style={styles.emptyTitle}>{t('no_history_yet', 'No Dose Records Yet')}</Text>
            <Text style={styles.emptyDesc}>
              {t('no_meds_sub', 'As you mark medicines taken or skipped on the Medicine tab, your adherence timeline will build up right here.')}
            </Text>
            <TouchableOpacity
              style={styles.goToMedicineBtn}
              onPress={() => router.push('/(tabs)/medicine')}
              activeOpacity={0.8}
            >
              <Ionicons name="checkbox-outline" size={17} color="#FFFFFF" />
              <Text style={styles.goToMedicineText}>{t('tab_medicine', 'Open Medicine Checklist')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          logs.map((log) => {
            const isTaken = log.status === 'taken';
            const isSkipped = log.status === 'skipped';
            const accentColor = isTaken ? Colors.success : isSkipped ? Colors.warning : '#64748B';
            const accentBg = isTaken ? '#ECFDF5' : isSkipped ? '#FFFBEB' : '#F1F5F9';

            return (
              <View key={log.id} style={[styles.logCard, Shadows.card]}>
                <View style={[styles.statusStrip, { backgroundColor: accentColor }]} />
                <View style={[styles.statusIconCircle, { backgroundColor: accentBg }]}>
                  <Ionicons
                    name={isTaken ? 'checkmark' : isSkipped ? 'close' : 'time'}
                    size={20}
                    color={accentColor}
                  />
                </View>

                <View style={styles.logInfoArea}>
                  <View style={styles.medTitleRow}>
                    <Text style={styles.logMedName} numberOfLines={1}>
                      {log.medicineName || t('tab_medicine', 'Medicine')}
                    </Text>
                    {log.dose ? <Text style={styles.logDoseChip}>{log.dose}</Text> : null}
                  </View>
                  <Text style={styles.logScheduledTime}>
                    {t('scheduled', 'Scheduled')}: {formatReadingDateTime(log.scheduledFor, language)}
                  </Text>
                  {log.takenAt && (
                    <Text style={styles.logTakenTime}>
                      {t('taken', 'Marked')}: {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>

                <View style={[styles.statusTag, { backgroundColor: accentBg }]}>
                  <Text style={[styles.statusTagText, { color: accentColor }]}>
                    {isTaken ? t('taken', 'TAKEN') : isSkipped ? t('skipped', 'SKIPPED') : t('pending', 'PENDING')}
                  </Text>
                </View>
              </View>
            );
          })
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  mascotChip: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  adherenceHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  adherenceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  adherenceHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  adherenceSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  rateRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratePercent: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  rateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EEF2F6',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metricTile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  goToMedicineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  goToMedicineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    position: 'relative',
    overflow: 'hidden',
  },
  statusStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  statusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginRight: 12,
  },
  logInfoArea: {
    flex: 1,
  },
  medTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  logMedName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  logDoseChip: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logScheduledTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logTakenTime: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
