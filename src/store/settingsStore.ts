import { Appearance } from 'react-native';
import { create } from 'zustand';
import { ThemeMode } from '../types/models';
import { AccentColor } from '../constants/colors';
type SettingsState = {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  notificationsEnabled: boolean;
  accentColor: AccentColor | string;
  backgroundColorOverride?: string;
  hydrate: () => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAccentColor: (color: AccentColor | string) => void;
  setBackgroundColorOverride: (color?: string) => void;
};

function resolveTheme(themeMode: ThemeMode): 'light' | 'dark' {
  if (themeMode === 'system') return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  return themeMode;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'light',
  resolvedTheme: resolveTheme('light'),
  notificationsEnabled: true,
  accentColor: 'green',
  hydrate: async () => {
    set((state) => ({ resolvedTheme: resolveTheme(state.themeMode) }));
  },
  setThemeMode: (themeMode) => set({ themeMode, resolvedTheme: resolveTheme(themeMode) }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setAccentColor: (accentColor) => set({ accentColor }),
  setBackgroundColorOverride: (backgroundColorOverride) => set({ backgroundColorOverride }),
}));
