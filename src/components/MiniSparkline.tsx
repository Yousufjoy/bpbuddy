import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, BorderRadius } from '../constants/theme';
import { BloodPressureReading } from '../types/reading';
import { useResponsive } from '../hooks/use-responsive';
import { useLanguage } from '../context/LanguageContext';

interface MiniSparklineProps {
  readings: BloodPressureReading[];
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({ readings }) => {
  const { t } = useLanguage();
  const { innerWidth: fallbackWidth } = useResponsive();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  if (readings.length < 2) return null;

  // Container has 8px horizontal padding + 1px border on each side.
  const available = containerWidth ?? fallbackWidth;
  const width = Math.max(Math.floor(available - 18), 120);
  const height = 54;
  const paddingH = 16;
  const paddingV = 8;

  // Take up to 7 recent readings, chronological
  const displayPoints = [...readings]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .slice(-7);

  const innerW = width - paddingH * 2;
  const innerH = height - paddingV * 2;

  const yMin = 50;
  const yMax = 170;

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return paddingV + innerH - ratio * innerH;
  };

  const getX = (i: number) => {
    if (displayPoints.length <= 1) return paddingH + innerW / 2;
    return paddingH + (i / (displayPoints.length - 1)) * innerW;
  };

  const sysCoords = displayPoints.map((r, i) => ({ x: getX(i), y: getY(r.systolic) }));
  const diaCoords = displayPoints.map((r, i) => ({ x: getX(i), y: getY(r.diastolic) }));

  const buildPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce(
      (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ''
    );
  };

  const sysPath = buildPath(sysCoords);
  const diaPath = buildPath(diaCoords);

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== containerWidth) setContainerWidth(w);
      }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('recent_7_day_trend', 'Recent 7-Day Trend')}</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Colors.systolicRed }]} />
            <Text style={styles.legendText}>{t('systolic', 'SYS')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Colors.diastolicBlue }]} />
            <Text style={styles.legendText}>{t('diastolic', 'DIA')}</Text>
          </View>
        </View>
      </View>

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sysFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={Colors.systolicRed} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={Colors.systolicRed} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Systolic Line */}
        <Path
          d={sysPath}
          stroke={Colors.systolicRed}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Diastolic Line */}
        <Path
          d={diaPath}
          stroke={Colors.diastolicBlue}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last Dots with halo */}
        {sysCoords.length > 0 && (
          <Circle
            cx={sysCoords[sysCoords.length - 1].x}
            cy={sysCoords[sysCoords.length - 1].y}
            r="4"
            fill={Colors.systolicRed}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        )}
        {diaCoords.length > 0 && (
          <Circle
            cx={diaCoords[diaCoords.length - 1].x}
            cy={diaCoords[diaCoords.length - 1].y}
            r="4"
            fill={Colors.diastolicBlue}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
