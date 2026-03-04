import { TextStyle } from 'react-native';

export const colors = {
  // 배경
  backgroundDark: '#0F0F14',
  backgroundLight: '#F8F9FA',
  surfaceDark: '#1A1A24',
  surfaceLight: '#FFFFFF',

  // 액센트 (그라데이션)
  accentStart: '#667EEA',
  accentEnd: '#764BA2',

  // 피드백
  keepGreen: '#4ADE80',
  keepGreenBg: 'rgba(74, 222, 128, 0.15)',
  deleteRed: '#F87171',
  deleteRedBg: 'rgba(248, 113, 113, 0.15)',

  // 텍스트 (다크 테마)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.4)',

  // 텍스트 (라이트 테마)
  textDarkPrimary: '#1A1A2E',
  textDarkSecondary: '#6B7280',

  // 시스템
  overlay: 'rgba(0,0,0,0.5)',
  divider: 'rgba(255,255,255,0.1)',
} as const;

export const typography: Record<string, TextStyle> = {
  displayLg: { fontSize: 48, fontWeight: '700', lineHeight: 56 },
  displaySm: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  headingLg: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  headingSm: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  bodyLg: { fontSize: 17, fontWeight: '400', lineHeight: 24 },
  bodySm: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 16 },
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
