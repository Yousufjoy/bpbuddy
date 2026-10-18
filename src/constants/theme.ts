export const Colors = {
  // Brand Blues
  primary: '#1677F2',
  primaryDark: '#0D5ECC',
  primaryLight: '#EBF4FF',
  primarySurface: '#F0F6FF',
  primaryBorder: '#D3E4FE',
  primaryGradientStart: '#2581F7',
  primaryGradientEnd: '#0E63D8',

  // Accent & Companion Coral
  coral: '#FF6B6B',
  coralLight: '#FFF0F0',
  coralBorder: '#FFD3D3',
  coralDark: '#E64949',

  // Mint Green (In-range, Taken, Success)
  mint: '#10B981',
  mintLight: '#ECFDF5',
  mintSurface: '#E6F8F0',
  mintBorder: '#A7F3D0',
  mintDark: '#059669',

  // Warm Amber (Reminders, Caution, Upcoming)
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberSurface: '#FFFBEB',
  amberBorder: '#FDE68A',
  amberDark: '#D97706',

  // Soft Indigo/Purple (Night/Evening doses)
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  purpleSurface: '#EDE9FE',
  purpleBorder: '#DDD6FE',

  // Red (High alert, Systolic trend)
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
  dangerDark: '#DC2626',

  // Typography
  textPrimary: '#0F1E36',     // Deep slate navy for headings & key numbers
  textSecondary: '#4A5B75',   // Balanced readable slate for subtitles
  textMuted: '#8C9EB5',       // Subtle labels & hints
  textWhite: '#FFFFFF',
  textLink: '#1677F2',

  // Surfaces & Backgrounds
  background: '#F6F9FD',      // Clean, premium tinted soft canvas
  card: '#FFFFFF',            // Crisp card surface
  cardElevated: '#FFFFFF',
  cardSubtle: '#F8FAFD',
  cardBorder: '#E6EDF5',      // Soft, refined border
  borderLight: '#EDF3F9',
  divider: '#EEF3F8',

  // Charts
  systolicRed: '#FF5C5C',
  diastolicBlue: '#1677F2',
  chartGrid: '#E4ECF5',

  // Semantic mappings
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#1677F2',
  infoLight: '#EBF4FF',
  heartPulseRed: '#FF4D6D',

  // Icon circles
  iconBgBlue: '#EBF4FF',
  iconBgOrange: '#FEF3C7',
  iconBgGreen: '#ECFDF5',
  iconBgPurple: '#F5F3FF',
  iconBgRed: '#FEF2F2',
};

export const Shadows = {
  sm: {
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#1677F2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  hero: {
    shadowColor: '#1677F2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    shadowColor: '#1677F2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  badge: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
