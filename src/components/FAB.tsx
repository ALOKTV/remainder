import React from 'react';
import { Pressable } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './FAB.styles';

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
        { opacity: pressed ? 0.85 : 1 },
        isDark ? { ...appTheme.shadows.dark, shadowOpacity: 0.5, shadowRadius: 16 } : { ...appTheme.shadows.light, shadowOpacity: 0.3, shadowRadius: 16, shadowColor: theme.primary }
      ]}
    >
      <LinearGradient
        colors={[theme.secondary, theme.primary]}
        style={styles.gradientFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <AppIcon 
        name={icon} 
        size={32} 
        color="#ffffff" 
      />
    </Pressable>
  );
}
