export const accentColors = {
  green: '#10B981',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  orange: '#F97316',
  rose: '#F43F5E',
  cyan: '#06B6D4',
};

export type AccentColor = keyof typeof accentColors;

export const colors = {
  primary: '#10B981', // Emerald Green
  secondary: '#34D399', // Light Emerald
  accent: '#059669', // Dark Emerald
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#64748B',
  gradients: {
    primary: ['#10B981', '#34D399'] as const,
    secondary: ['#34D399', '#059669'] as const,
    danger: ['#EF4444', '#f43f5e'] as const,
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
