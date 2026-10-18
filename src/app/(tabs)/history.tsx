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
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { getAllReadings } from '../../database/database';
import { BloodPressureReading, TimeFilterPeriod } from '../../types/reading';
import { classifyBloodPressure, formatShortDateTime } from '../../utils/bpClassification';
import { TrendChart } from '../../components/TrendChart';
import { BPMascot } from '../../components/BPMascot';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useResponsive } from '../../hooks/use-responsive';
import { useLanguage } from '../../context/LanguageContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { fs } = useResponsive();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [activeFilter, setActiveFilter] = useState<TimeFilterPeriod>('week');
  const [viewAll, setViewAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadReadings = async () => {
    try {
      const data = await getAllReadings();
      setReadings(data);
    } catch (e) {
      console.warn('Failed to load history readings:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  const getFilteredReadings = () => {
    const now = new Date().getTime();
    return readings.filter((r) => {
      const readingTime = new Date(r.measuredAt).getTime();
      const diffDays = (now - readingTime) / (1000 * 3600 * 24);
      switch (activeFilter) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case '3months':
          return diffDays <= 90;
        case 'year':
          return diffDays <= 365;
        default:
          return true;
      }
    });
  };

  const filtered = getFilteredReadings();
  const displayedReadings = viewAll ? filtered : filtered.slice(0, 6);

  const filterLabels: Record<TimeFilterPeriod, string> = {
    week: t('filter_week', 'Week'),
    month: t('filter_month', 'Month'),
    '3months': t('filter_3months', '3 Months'),
    year: t('filter_year', 'Year'),
    all: t('filter_all', 'All'),
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.screenTitle, { fontSize: fs(24) }]}>
            {t('history_title', 'Measurement History')}
          </Text>
          <Text style={styles.screenSubtitle}>
            {readings.length} {t('history_sub', 'total recorded readings')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButtonMini}
          onPress={() => router.push('/readings/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonMiniText}>{t('new_reading_btn', 'New')}</Text>
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
        {/* Filter Pills Bar */}
        <View style={styles.filterPillsRow}>
          {(['week', 'month', '3months', 'year'] as TimeFilterPeriod[]).map((period) => {
            const isActive = activeFilter === period;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(period)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {filterLabels[period]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Blood Pressure Trend Chart */}
        <View style={[styles.chartWrapper, Shadows.card]}>
          <TrendChart readings={filtered.length > 0 ? filtered : readings} height={190} />
        </View>

        {/* Recent Readings Section Header */}
        <View style={styles.recentSectionHeader}>
          <View style={styles.recentTitleGroup}>
            <Text style={styles.recentTitle}>{t('readings_log', 'Readings Log')}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filtered.length}</Text>
            </View>
          </View>

          {filtered.length > 6 && (
            <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
              <Text style={styles.viewAllText}>
                {viewAll ? t('show_less', 'Show less') : t('view_all', 'View all')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Readings List */}
        {displayedReadings.length === 0 ? (
          <View style={[styles.emptyListCard, Shadows.card]}>
            <BPMascot size={60} mood="curious" />
            <Text style={styles.emptyListTitle}>
              {t('no_readings_period', 'No readings for this period')}
            </Text>
            <PrimaryButton
              title={t('add_reading', 'Add Reading')}
              onPress={() => router.push('/readings/add')}
              style={{ marginTop: 12, paddingHorizontal: 28 }}
            />
          </View>
        ) : (
          displayedReadings.map((item) => {
            const classification = classifyBloodPressure(item.systolic, item.diastolic, t);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.readingItemCard, Shadows.card]}
                onPress={() => router.push(`/readings/${item.id}` as any)}
                activeOpacity={0.75}
              >
                {/* Left Category Stripe Indicator */}
                <View
                  style={[
                    styles.itemStripe,
                    { backgroundColor: classification.color },
                  ]}
                />

                <View style={styles.itemMainContent}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemDate}>
                      {formatShortDateTime(item.measuredAt, language)}
                    </Text>
                    <View style={styles.itemValuesRow}>
                      <Text style={styles.itemSysVal}>{item.systolic}</Text>
                      <Text style={styles.itemSlash}>/</Text>
                      <Text style={styles.itemDiaVal}>{item.diastolic}</Text>
                      <Text style={styles.itemUnit}>mmHg</Text>
                    </View>
                    {item.notes ? (
                      <Text style={styles.itemNoteText} numberOfLines={1}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.itemRight}>
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: classification.bgColor,
                          borderColor: classification.color + '40',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryBadgeText,
                          { color: classification.color },
                        ]}
                      >
                        {classification.badgeLabel}
                      </Text>
                    </View>

                    <View style={styles.pulsePill}>
                      <Ionicons name="heart" size={12} color={Colors.heartPulseRed} />
                      <Text style={styles.itemPulse}>
                        {item.pulse ? `${item.pulse} bpm` : '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
  addButtonMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
    flexShrink: 0,
    ...Shadows.button,
  },
  addButtonMiniText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  filterPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterPill: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 18,
    overflow: 'hidden',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  readingItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  itemStripe: {
    width: 5,
  },
  itemMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  itemValuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  itemSysVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  itemSlash: {
    fontSize: 18,
    color: Colors.textMuted,
    marginHorizontal: 3,
  },
  itemDiaVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  itemNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  itemPulse: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  emptyListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: 10,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyListSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
