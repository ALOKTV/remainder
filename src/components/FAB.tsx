import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function FAB({ onPress, icon = 'add' }: { onPress: () => void; icon?: string }) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
        isDark ? appTheme.shadows.dark : appTheme.shadows.light
      ]}
    >
      <AppIcon name={icon} size={32} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: appTheme.radius.pill,
    bottom: 110, // above the floating tab bar
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    width: 64,
    zIndex: 100,
  },
});
