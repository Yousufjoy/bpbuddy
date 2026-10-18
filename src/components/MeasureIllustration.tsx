import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { useResponsive } from '../hooks/use-responsive';

export const MeasureIllustration: React.FC = () => {
  const { innerWidth } = useResponsive();
  const width = Math.min(Math.max(innerWidth - 32, 260), 380);
  const height = Math.round(width * (150 / 340));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 340 150">
        {/* Soft Background Pill */}
        <Rect
          x="10"
          y="10"
          width="320"
          height="130"
          rx="24"
          fill="#EAF4FF"
        />

        {/* Arm resting horizontally (stylized medical geometry - no human face/features) */}
        <Path
          d="M 20 82 Q 70 78 120 78 L 220 78 Q 235 78 245 88 Q 250 94 250 102 L 20 102 Z"
          fill="#FDE4D0"
        />

        {/* Hand resting slightly on table */}
        <Path
          d="M 240 88 C 255 88 275 92 285 100 L 230 100 Z"
          fill="#FBD5BC"
        />

        {/* Blood Pressure Cuff wrapped around upper arm */}
        <Rect
          x="55"
          y="58"
          width="50"
          height="44"
          rx="8"
          fill="#2B5C9A"
        />
        {/* Cuff strap accent */}
        <Rect
          x="65"
          y="58"
          width="8"
          height="44"
          fill="#1D4272"
        />

        {/* Tubing from cuff to digital monitor */}
        <Path
          d="M 85 102 C 85 125, 150 125, 175 106"
          stroke="#1E293B"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Digital Blood Pressure Monitor Unit */}
        <G transform="translate(175, 55)">
          {/* Monitor body */}
          <Rect
            x="0"
            y="0"
            width="65"
            height="50"
            rx="12"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* LCD Screen */}
          <Rect
            x="8"
            y="7"
            width="49"
            height="26"
            rx="6"
            fill="#1677F2"
          />
          {/* Screen Reading Text */}
          <SvgText
            x="32"
            y="22"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            120 / 80
          </SvgText>

          {/* Button on monitor */}
          <Circle cx="32" cy="40" r="4.5" fill="#1677F2" />
        </G>

        {/* Pulse / Heart rate accent rays */}
        <Path
          d="M 188 42 L 183 34"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 198 38 L 198 28"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 208 42 L 213 34"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
});
