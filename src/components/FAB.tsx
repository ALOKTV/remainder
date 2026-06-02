import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function FAB({ onPress, icon = 'add' }: { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
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
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={32} color="#ffffff" />
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
