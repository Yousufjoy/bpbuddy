import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
  Rect,
} from 'react-native-svg';

export type MascotMood =
  | 'happy'
  | 'waving'
  | 'encouraging'
  | 'resting'
  | 'curious'
  | 'celebrating'
  | 'medicine';

interface BPMascotProps {
  size?: number;
  mood?: MascotMood;
}

/**
 * BPMascot: A friendly, faceless heart-shaped wellness companion.
 * Has expressive friendly dot/arc eyes and soft blush cheeks,
 * with strictly NO human facial features, mouth, or human portrait elements.
 */
export const BPMascot: React.FC<BPMascotProps> = ({
  size = 64,
  mood = 'happy',
}) => {
  const width = size;
  const height = size;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 100 100">
        <Defs>
          {/* Main Heart Gradient */}
          <LinearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7A8A" />
            <Stop offset="100%" stopColor="#E63956" />
          </LinearGradient>

          {/* Soft Shadow Gradient */}
          <LinearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>

          {/* Leaf Sprout Gradient */}
          <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>

          {/* Night Cap Gradient */}
          <LinearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#818CF8" />
            <Stop offset="100%" stopColor="#4F46E5" />
          </LinearGradient>
        </Defs>

        {/* Drop Shadow Base */}
        <Path
          d="M 22 88 C 38 94, 62 94, 78 88 C 65 91, 35 91, 22 88 Z"
          fill="rgba(16, 38, 77, 0.08)"
        />

        {/* Soft Wellness Sprout on Top (Head Accessory) */}
        {mood !== 'resting' ? (
          <G transform="translate(48, 12)">
            <Path
              d="M 2 12 Q 2 2, 9 0 Q 14 6, 2 12 Z"
              fill="url(#leafGrad)"
            />
            <Path
              d="M 2 12 Q -2 4, -8 4 Q -9 11, 2 12 Z"
              fill="#10B981"
            />
          </G>
        ) : (
          /* Sleeping Night Cap for Resting mood */
          <G transform="translate(28, 6)">
            <Path
              d="M 12 18 Q 24 2, 44 14 Q 48 30, 24 24 Z"
              fill="url(#capGrad)"
            />
            <Circle cx="44" cy="14" r="5" fill="#FCD34D" />
          </G>
        )}

        {/* Heart Companion Body */}
        <Path
          d="M 50 82 
             C 42 75, 14 56, 14 36 
             C 14 20, 28 14, 40 20 
             C 45 22, 48 27, 50 31 
             C 52 27, 55 22, 60 20 
             C 72 14, 86 20, 86 36 
             C 86 56, 58 75, 50 82 Z"
          fill="url(#heartGrad)"
        />

        {/* Soft 3D Highlight Curve */}
        <Path
          d="M 22 34 C 22 25, 30 20, 38 22 C 32 24, 25 28, 25 36 Z"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Soft Blush Cheeks */}
        <Circle cx="28" cy="46" r="5" fill="#FFA4B2" opacity="0.8" />
        <Circle cx="72" cy="46" r="5" fill="#FFA4B2" opacity="0.8" />

        {/* Expressive Eyes (Dot / Happy Arc - strictly no human mouth) */}
        {mood === 'resting' ? (
          /* Sleepy soft happy closed arcs `^ ^` */
          <G stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <Path d="M 33 42 Q 38 38, 43 42" />
            <Path d="M 57 42 Q 62 38, 67 42" />
          </G>
        ) : mood === 'encouraging' || mood === 'celebrating' ? (
          /* Joyful sparkling happy closed curved eyes `^ ^` */
          <G stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none">
            <Path d="M 32 43 Q 38 36, 44 43" />
            <Path d="M 56 43 Q 62 36, 68 43" />
          </G>
        ) : (
          /* Friendly Shiny Round Eyes with tiny gleam */
          <G fill="#FFFFFF">
            {/* Left Eye */}
            <Circle cx="38" cy="41" r="4.2" />
            <Circle cx="39.5" cy="39.5" r="1.6" fill="#1E293B" />
            {/* Right Eye */}
            <Circle cx="62" cy="41" r="4.2" />
            <Circle cx="63.5" cy="39.5" r="1.6" fill="#1E293B" />
          </G>
        )}

        {/* Mood-Specific Little Arms / Accessories */}
        {mood === 'waving' && (
          /* Tiny cute arm waving on the right */
          <G transform="translate(76, 32)">
            <Path
              d="M 0 16 Q 14 10, 12 0 Q 6 -2, 0 8 Z"
              fill="#FF7A8A"
            />
            {/* Motion sparkles */}
            <Circle cx="16" cy="-2" r="1.5" fill="#F59E0B" />
            <Circle cx="19" cy="8" r="1.2" fill="#F59E0B" />
          </G>
        )}

        {mood === 'medicine' && (
          /* Holding a mini capsule */
          <G transform="translate(40, 56)">
            {/* Capsule Left (Blue) */}
            <Path
              d="M 2 4 C -2 4, -4 7, -4 10 L 10 10 L 10 4 Z"
              fill="#1677F2"
            />
            {/* Capsule Right (Amber) */}
            <Path
              d="M 10 4 L 20 4 C 24 4, 24 10, 20 10 L 10 10 Z"
              fill="#F59E0B"
            />
          </G>
        )}

        {mood === 'celebrating' && (
          /* Confetti stars */
          <G>
            <Circle cx="18" cy="18" r="2" fill="#F59E0B" />
            <Circle cx="82" cy="18" r="2.2" fill="#10B981" />
            <Circle cx="12" cy="44" r="1.5" fill="#3B82F6" />
            <Circle cx="88" cy="42" r="1.8" fill="#EC4899" />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
