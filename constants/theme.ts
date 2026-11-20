import { TextStyle } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  primary: string;
  primarySoft: string;
  primaryMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  income: string;
  incomeBackground: string;
  expense: string;
  expenseBackground: string;
  warning: string;
  warningBackground: string;
  glassSurface: string;
  glassBorder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  categoryColors: string[];
}

export const LightColors: ThemeColors = {
  background: '#F5F7F3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E5EBE6',
  primary: '#168653',
  primarySoft: '#E2F4E9',
  primaryMuted: '#10633D',
  text: '#17231D',
  textSecondary: '#77857C',
  textMuted: '#9BA7A0',
  border: '#E5EBE6',
  income: '#168653',
  incomeBackground: '#E2F4E9',
  expense: '#D96D70',
  expenseBackground: '#FCEBEB',
  warning: '#D9A441',
  warningBackground: '#FEF6E6',
  glassSurface: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(23, 35, 29, 0.08)',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5EBE6',
  categoryColors: [
    '#168653', '#25A267', '#34BE7C', '#10B981', '#059669',
    '#D96D70', '#E58A4E', '#DE689C', '#8B5CF6', '#38BDF8',
    '#D9A441', '#EC4899', '#64748B'
  ],
};

export const DarkColors: ThemeColors = {
  background: '#080F0C',
  surface: '#111D17',
  surfaceElevated: '#182820',
  card: '#111D17',
  cardBorder: '#25352C',
  primary: '#39D98A',
  primarySoft: '#173C2A',
  primaryMuted: '#248652',
  text: '#F2F7F3',
  textSecondary: '#8B9B91',
  textMuted: '#586A60',
  border: '#25352C',
  income: '#39D98A',
  incomeBackground: 'rgba(57, 217, 138, 0.15)',
  expense: '#E87575',
  expenseBackground: 'rgba(232, 117, 117, 0.15)',
  warning: '#F4C76B',
  warningBackground: 'rgba(244, 199, 107, 0.15)',
  glassSurface: 'rgba(17, 29, 23, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  tabBarBackground: '#0B1511',
  tabBarBorder: '#1A2922',
  categoryColors: [
    '#39D98A', '#80E6AC', '#4ADE80', '#22C55E', '#10B981',
    '#E87575', '#FB923C', '#F472B6', '#A78BFA', '#38BDF8',
    '#F4C76B', '#EC4899', '#94A3B8'
  ],
};

// Default backwards-compatible Colors export (Dark theme default)
export const Colors = DarkColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  supporting: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  supportingMedium: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  amountLarge: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  amountMedium: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  amountSmall: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
};
