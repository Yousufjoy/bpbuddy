import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Line,
  Circle,
  Path,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '../constants/theme';
import { BloodPressureReading } from '../types/reading';
import { BPMascot } from './BPMascot';
import { classifyBloodPressure, MONTH_NAMES } from '../utils/bpClassification';
import { useResponsive } from '../hooks/use-responsive';

import { useLanguage } from '../context/LanguageContext';

interface TrendChartProps {
  readings: BloodPressureReading[];
  height?: number;
  compact?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  readings,
  height = 190,
  compact = false,
}) => {
  const { language, t } = useLanguage();
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    reading: BloodPressureReading;
  } | null>(null);

  const { innerWidth: fallbackWidth } = useResponsive();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Container has 12px horizontal padding on each side.
  const available = containerWidth ?? fallbackWidth - (compact ? 16 : 0);
  const chartWidth = Math.max(Math.floor(available - 24), 200);

  const yMin = 40;
  const yMax = 180;
  const ySteps = [40, 80, 120, 160];

  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 22;
  const paddingBottom = 26;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  // Chronological sort
  const sorted = [...readings].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  const displayPoints = sorted.slice(-8);

  const getYCoord = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const getXCoord = (index: number, count: number) => {
    if (count <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (count - 1)) * innerWidth;
  };

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce(
      (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ''
    );
  };

  const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const linePath = buildPath(points);
    const bottomY = paddingTop + innerHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const systolicCoords = displayPoints.map((r, i) => ({
    x: getXCoord(i, displayPoints.length),
    y: getYCoord(r.systolic),
    reading: r,
  }));

  const diastolicCoords = displayPoints.map((r, i) => ({
    x: getXCoord(i, displayPoints.length),
    y: getYCoord(r.diastolic),
    reading: r,
  }));

  const systolicPath = buildPath(systolicCoords);
  const diastolicPath = buildPath(diastolicCoords);
  const systolicArea = buildAreaPath(systolicCoords);
  const diastolicArea = buildAreaPath(diastolicCoords);

  const formatShortDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const months = (language && MONTH_NAMES[language]) || MONTH_NAMES.en;
      return `${months[d.getMonth()]} ${d.getDate()}`;
    } catch {
      return '';
    }
  };

  // Skip alternate x-axis labels when points are too close together to stay legible.
  const pointSpacing =
    displayPoints.length > 1 ? innerWidth / (displayPoints.length - 1) : innerWidth;
  const labelStep = pointSpacing < 36 ? 2 : 1;

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== containerWidth) setContainerWidth(w);
      }}
    >
      {!compact && (
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.chartTitle}>{t('trend_title', 'Blood Pressure Trend')}</Text>
            <Text style={styles.chartSubtitle}>{t('trend_sub', 'Systolic & Diastolic curve')}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: Colors.systolicRed }]} />
              <Text style={styles.legendText}>{t('systolic', 'Systolic')}</Text>
            </View>
            <View style={styles.legendPill}>
              <View style={[styles.legendDot, { backgroundColor: Colors.diastolicBlue }]} />
              <Text style={styles.legendText}>{t('diastolic', 'Diastolic')}</Text>
            </View>
          </View>
        </View>
      )}

      {displayPoints.length === 0 ? (
        <View style={[styles.emptyChart, { height: height - 20 }]}>
          <BPMascot size={54} mood="curious" />
          <Text style={styles.emptyText}>{t('chart_empty', 'Add readings to see your blood pressure trend')}</Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Svg width={chartWidth} height={height}>
            <Defs>
              <LinearGradient id="sysAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={Colors.systolicRed} stopOpacity="0.16" />
                <Stop offset="100%" stopColor={Colors.systolicRed} stopOpacity="0.01" />
              </LinearGradient>
              <LinearGradient id="diaAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={Colors.diastolicBlue} stopOpacity="0.14" />
                <Stop offset="100%" stopColor={Colors.diastolicBlue} stopOpacity="0.01" />
              </LinearGradient>
            </Defs>

            {/* Horizontal Grid lines and Y labels */}
            {ySteps.map((val) => {
              const y = getYCoord(val);
              return (
                <G key={`grid-${val}`}>
                  <Line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke={Colors.chartGrid}
                    strokeWidth="1"
                    strokeDasharray="3, 3"
                  />
                  <SvgText
                    x={paddingLeft - 8}
                    y={y + 4}
                    fontSize="10"
                    fill={Colors.textMuted}
                    textAnchor="end"
                    fontWeight="600"
                  >
                    {val}
                  </SvgText>
                </G>
              );
            })}

            {/* Subtle Gradient Area fills */}
            {systolicArea ? <Path d={systolicArea} fill="url(#sysAreaGrad)" /> : null}
            {diastolicArea ? <Path d={diastolicArea} fill="url(#diaAreaGrad)" /> : null}

            {/* Systolic Line */}
            {systolicPath ? (
              <Path
                d={systolicPath}
                stroke={Colors.systolicRed}
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Diastolic Line */}
            {diastolicPath ? (
              <Path
                d={diastolicPath}
                stroke={Colors.diastolicBlue}
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Systolic Dots */}
            {systolicCoords.map((pt, i) => (
              <G key={`sys-${i}`}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill={Colors.systolicRed}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  {...(Platform.OS !== 'web' ? { onPress: () => setSelectedPoint(pt) } : {})}
                />
              </G>
            ))}

            {/* Diastolic Dots */}
            {diastolicCoords.map((pt, i) => (
              <G key={`dia-${i}`}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill={Colors.diastolicBlue}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  {...(Platform.OS !== 'web' ? { onPress: () => setSelectedPoint(pt) } : {})}
                />
              </G>
            ))}

            {/* X-axis date labels */}
            {displayPoints.map((r, i) => {
              if ((displayPoints.length - 1 - i) % labelStep !== 0) return null;
              const x = getXCoord(i, displayPoints.length);
              const label = formatShortDate(r.measuredAt);
              return (
                <SvgText
                  key={`xlabel-${i}`}
                  x={x}
                  y={height - 6}
                  fontSize="9.5"
                  fill={Colors.textSecondary}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {label}
                </SvgText>
              );
            })}
          </Svg>

          {/* Interactive Selected Point Tooltip */}
          {selectedPoint && (
            <TouchableOpacity
              style={[styles.tooltip, Shadows.card]}
              onPress={() => setSelectedPoint(null)}
              activeOpacity={0.8}
            >
              <View style={styles.tooltipContent}>
                <Text style={styles.tooltipReading}>
                  {selectedPoint.reading.systolic} / {selectedPoint.reading.diastolic} mmHg
                </Text>
                {selectedPoint.reading.pulse ? (
                  <Text style={styles.tooltipPulse}>
                    • {selectedPoint.reading.pulse} bpm
                  </Text>
                ) : null}
                <View
                  style={[
                    styles.tooltipBadge,
                    {
                      backgroundColor: classifyBloodPressure(
                        selectedPoint.reading.systolic,
                        selectedPoint.reading.diastolic,
                        t
                      ).bgColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tooltipBadgeText,
                      {
                        color: classifyBloodPressure(
                          selectedPoint.reading.systolic,
                          selectedPoint.reading.diastolic,
                          t
                        ).color,
                      },
                    ]}
                  >
                    {
                      classifyBloodPressure(
                        selectedPoint.reading.systolic,
                        selectedPoint.reading.diastolic,
                        t
                      ).badgeLabel
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  titleGroup: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tooltip: {
    marginTop: 8,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tooltipReading: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  tooltipPulse: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  tooltipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  tooltipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
