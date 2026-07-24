export const accentColors = {
  blue: '#39A5F5',
  lightBlue: '#61B2F6',
  purple: '#8A7DF2',
  green: '#10B981',
  orange: '#F97316',
  rose: '#F43F5E',
};

export type AccentColor = keyof typeof accentColors;

export const colors = {
  primary: '#39A5F5', // Bright Blue
  secondary: '#61B2F6', // Light Blue
  accent: '#8A7DF2', // Purple
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#FF3B30',
  muted: '#A0A0A0',
  gradients: {
    primary: ['#39A5F5', '#61B2F6'] as const,
    secondary: ['#61B2F6', '#8A7DF2'] as const,
    danger: ['#FF3B30', '#f43f5e'] as const,
    surface: ['#FFFFFF', '#F9FAFB'] as const,
    backgroundLight: ['#FFFFFF', '#F8FAFC'] as const,
    backgroundDark: ['#0F172A', '#1E293B'] as const,
  },
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceMuted: '#F1F5F9',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceMuted: '#334155',
    text: '#F8FAFC',
    secondaryText: '#94A3B8',
    border: '#334155',
  },
};
