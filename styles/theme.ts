import { TextStyle } from 'react-native';

export const colors = {
  // 배경
  backgroundDark: '#131118',
  backgroundLight: '#FAF9F7',
  surfaceDark: '#1E1B26',
  surfaceLight: '#FFFFFF',

  // 액센트 (그라데이션)
  accentStart: '#E8845C',
  accentEnd: '#D4648C',
  accent: '#E8845C',
  accentSoft: 'rgba(232, 132, 92, 0.15)',

  // 피드백
  keepGreen: '#6BCB97',
  keepGreenBg: 'rgba(107, 203, 151, 0.15)',
  deleteRed: '#E07070',
  deleteRedBg: 'rgba(224, 112, 112, 0.15)',

  // 텍스트 (다크 테마)
  textPrimary: '#F5F2EE',
  textSecondary: 'rgba(245,242,238,0.7)',
  textTertiary: 'rgba(245,242,238,0.4)',

  // 텍스트 (라이트 테마)
  textDarkPrimary: '#2A2438',
  textDarkSecondary: '#6B7280',

  // 시스템
  overlay: 'rgba(0,0,0,0.5)',
  divider: 'rgba(245,242,238,0.1)',
} as const;

export const typography: Record<string, TextStyle> = {
  displayLg: { fontSize: 44, fontFamily: 'Pretendard-Bold', lineHeight: 52 },
  displaySm: { fontSize: 30, fontFamily: 'Pretendard-Bold', lineHeight: 38 },
  headingLg: { fontSize: 22, fontFamily: 'Pretendard-SemiBold', lineHeight: 30 },
  headingSm: { fontSize: 18, fontFamily: 'Pretendard-SemiBold', lineHeight: 26 },
  bodyLg: { fontSize: 16, fontFamily: 'Pretendard-Regular', lineHeight: 24 },
  bodySm: { fontSize: 14, fontFamily: 'Pretendard-Regular', lineHeight: 20 },
  caption: { fontSize: 12, fontFamily: 'Pretendard-Regular', lineHeight: 16 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 32,
    shadowOpacity: 0.25,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;
