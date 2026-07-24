import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ThemeMode } from '../types/models';
import { AccentColor } from '../constants/colors';

const SETTINGS_STORAGE_KEY = 'remainder:settings';

type PersistedSettings = {
  themeMode?: ThemeMode;
  notificationsEnabled?: boolean;
  accentColor?: AccentColor | string;
  backgroundColorOverride?: string;
};

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

function toPersistedSettings(state: SettingsState): PersistedSettings {
  return {
    themeMode: state.themeMode,
    notificationsEnabled: state.notificationsEnabled,
    accentColor: state.accentColor,
    backgroundColorOverride: state.backgroundColorOverride,
  };
}

function persistSettings(settings: PersistedSettings) {
  void AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch((error) => {
    console.warn('Unable to save settings.', error);
  });
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'light',
  resolvedTheme: resolveTheme('light'),
  notificationsEnabled: true,
  accentColor: 'blue',
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const persisted = raw ? JSON.parse(raw) as PersistedSettings : {};
      const themeMode = persisted.themeMode ?? 'light';
      set((state) => ({
        ...state,
        ...persisted,
        themeMode,
        resolvedTheme: resolveTheme(themeMode),
      }));
    } catch (error) {
      console.warn('Unable to load settings.', error);
      set((state) => ({ resolvedTheme: resolveTheme(state.themeMode) }));
    }
  },
  setThemeMode: (themeMode) => set((state) => {
    const next = { ...state, themeMode, resolvedTheme: resolveTheme(themeMode) };
    persistSettings(toPersistedSettings(next));
    return next;
  }),
  setNotificationsEnabled: (notificationsEnabled) => set((state) => {
    const next = { ...state, notificationsEnabled };
    persistSettings(toPersistedSettings(next));
    return next;
  }),
  setAccentColor: (accentColor) => set((state) => {
    const next = { ...state, accentColor };
    persistSettings(toPersistedSettings(next));
    return next;
  }),
  setBackgroundColorOverride: (backgroundColorOverride) => set((state) => {
    const next = { ...state, backgroundColorOverride };
    persistSettings(toPersistedSettings(next));
    return next;
  }),
}));

Appearance.addChangeListener(() => {
  const { themeMode } = useSettingsStore.getState();
  if (themeMode === 'system') {
    useSettingsStore.setState({ resolvedTheme: resolveTheme(themeMode) });
  }
});
