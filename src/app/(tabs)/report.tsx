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
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { getAllReadings } from '../../database/database';
import { BloodPressureReading } from '../../types/reading';
import { classifyBloodPressure } from '../../utils/bpClassification';
import { calculateReportStats, generateAndSharePdfReport, downloadPdfReport, sharePdfReport } from '../../services/reports';
import { TrendChart } from '../../components/TrendChart';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportScreen() {
  const { t } = useLanguage();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getAllReadings();
      setReadings(data);
    } catch (e) {
      console.warn('Failed to load readings for report:', e);
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

  const now = new Date().getTime();
  const filteredReadings = readings.filter((r) => {
    if (periodDays === 0) return true;
    const diff = (now - new Date(r.measuredAt).getTime()) / (1000 * 3600 * 24);
    return diff <= periodDays;
  });

  const periodOptions = [
    { label: t('period_last_7', 'Last 7 days'), days: 7 },
    { label: t('period_last_30', 'Last 30 days'), days: 30 },
    { label: t('period_last_90', 'Last 90 days'), days: 90 },
    { label: t('period_this_year', 'This year'), days: 365 },
    { label: t('period_all_time', 'All time'), days: 0 },
  ];

  const activePeriod = periodOptions.find((opt) => opt.days === periodDays) || periodOptions[1];
  const periodLabel = activePeriod.label;

  const stats = calculateReportStats(filteredReadings, periodLabel);
  const avgClassification =
    stats.totalReadings > 0
      ? classifyBloodPressure(stats.avgSystolic, stats.avgDiastolic, t)
      : null;

  const handleDownloadPdf = async () => {
    if (filteredReadings.length === 0) {
      Alert.alert(t('clinical_report'), t('no_readings_recorded', 'Please add blood pressure readings before downloading a report.'));
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await downloadPdfReport(filteredReadings, stats);
    } catch (error: any) {
      Alert.alert(t('error', 'Download Failed'), error?.message || 'Could not download report.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    if (filteredReadings.length === 0) {
      Alert.alert(t('clinical_report'), t('no_readings_recorded', 'Please add blood pressure readings before sharing a report.'));
      return;
    }

    setIsSharingPdf(true);
    try {
      await sharePdfReport(filteredReadings, stats);
    } catch (error: any) {
      Alert.alert(t('error', 'Share Failed'), error?.message || 'Could not share report.');
    } finally {
      setIsSharingPdf(false);
    }
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.screenTitle}>{t('clinical_report', 'Clinical Report')}</Text>
          <Text style={styles.screenSubtitle}>{t('report_sub', 'Statistical summary & PDF export')}</Text>
        </View>

        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownTriggerText}>{periodLabel}</Text>
          <Ionicons
            name={showDropdown ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.primary}
          />
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
        {/* Dropdown Menu Modal / Overlay */}
        {showDropdown && (
          <View style={[styles.dropdownMenu, Shadows.card]}>
            {periodOptions.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.dropdownOption,
                  periodDays === opt.days && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setPeriodDays(opt.days);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    periodDays === opt.days && styles.dropdownOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {periodDays === opt.days && (
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Average Reading Card */}
        <View style={[styles.avgHeroCard, Shadows.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>{t('period_average', 'Period Average')}</Text>
            <View style={styles.periodPill}>
              <Text style={styles.periodPillText}>{periodLabel}</Text>
            </View>
          </View>

          <View style={styles.avgRow}>
            <View style={styles.avgLeft}>
              <View style={styles.avgValuesRow}>
                <Text style={styles.avgNumber} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {stats.totalReadings > 0
                    ? `${stats.avgSystolic} / ${stats.avgDiastolic}`
                    : '— / —'}
                </Text>
                <Text style={styles.avgUnit}>mmHg</Text>
              </View>

              {avgClassification ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: avgClassification.bgColor,
                      borderColor: avgClassification.color + '40',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: avgClassification.color },
                    ]}
                  >
                    {avgClassification.badgeLabel}
                  </Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={[styles.badgeText, { color: '#64748B' }]}>
                    {t('no_readings_recorded', 'No readings recorded')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.avgPulseContainer}>
              <Ionicons name="heart" size={24} color={Colors.heartPulseRed} />
              <Text style={styles.avgPulseNum}>
                {stats.avgPulse ? stats.avgPulse : '—'}
              </Text>
              <Text style={styles.avgPulseUnit}>{t('bpm_avg', 'bpm avg')}</Text>
            </View>
          </View>
        </View>

        {/* Mini Trend Chart */}
        <View style={[styles.trendCard, Shadows.card]}>
          <Text style={styles.cardHeaderTitle}>{t('reading_trend', 'Reading Trend')}</Text>
          <TrendChart readings={filteredReadings} height={170} compact />
        </View>

        {/* Summary Card with Highest & Lowest Metrics */}
        <View style={[styles.summaryCard, Shadows.card]}>
          <Text style={styles.cardHeaderTitle}>{t('key_metrics', 'Key Metrics')}</Text>

          <View style={styles.metricGrid}>
            {/* Total Readings */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconCircle, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="documents-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.metricLabel}>{t('total_readings', 'Total Readings')}</Text>
              <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{stats.totalReadings}</Text>
            </View>

            {/* Highest Reading */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconCircle, { backgroundColor: Colors.coralLight }]}>
                <Ionicons name="arrow-up" size={18} color={Colors.coral} />
              </View>
              <Text style={styles.metricLabel}>{t('highest', 'Highest')}</Text>
              <Text style={[styles.metricValue, { color: Colors.coralDark }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {stats.highestReading
                  ? `${stats.highestReading.systolic}/${stats.highestReading.diastolic}`
                  : '—'}
              </Text>
            </View>

            {/* Lowest Reading */}
            <View style={styles.metricTile}>
              <View style={[styles.metricIconCircle, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="arrow-down" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.metricLabel}>{t('lowest', 'Lowest')}</Text>
              <Text style={[styles.metricValue, { color: Colors.primary }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {stats.lowestReading
                  ? `${stats.lowestReading.systolic}/${stats.lowestReading.diastolic}`
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Action Card with Mascot Callout */}
        <View style={[styles.exportCard, Shadows.card]}>
          <View style={styles.exportHeader}>
            <BPMascot size={52} mood="celebrating" />
            <View style={styles.exportHeaderText}>
              <Text style={styles.exportCardTitle}>{t('doctor_ready_pdf', 'Doctor-Ready PDF')}</Text>
              <Text style={styles.exportCardSub}>
                {t('export_card_sub', 'Export a formatted medical summary to save or share with your physician.')}
              </Text>
            </View>
          </View>

          <View style={styles.exportButtonsContainer}>
            <PrimaryButton
              title={t('download_pdf', 'Download PDF')}
              icon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
              onPress={handleDownloadPdf}
              loading={isDownloadingPdf}
              style={styles.downloadButton}
            />

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePdf}
              activeOpacity={0.85}
              disabled={isSharingPdf}
            >
              <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
              <Text style={styles.shareButtonText}>{t('share_pdf', 'Share PDF')}</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
    flexShrink: 0,
    ...Shadows.sm,
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  dropdownOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dropdownOptionTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  avgHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  periodPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  periodPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avgLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  avgValuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  avgNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  avgUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  avgPulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 72,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  avgPulseNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  avgPulseUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  metricTile: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  exportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportHeaderText: {
    flex: 1,
  },
  exportCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exportCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  exportButtonsContainer: {
    marginTop: 14,
    gap: 10,
  },
  downloadButton: {
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
