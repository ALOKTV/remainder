import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { styles } from './ListCard.styles';

export function ListCard({
  title,
  subtitle,
  meta,
  iconName,
  onPress,
  onEdit,
  right,
  completed = false,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  iconName?: string;
  onPress?: () => void;
  onEdit?: () => void;
  right?: ReactNode;
  completed?: boolean;
}) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.surface + 'DD', borderColor: completed ? theme.border : theme.primary + '66' },
      isDark ? { ...appTheme.shadows.dark, shadowOpacity: 0.3, shadowRadius: 16 } : { ...appTheme.shadows.light, shadowOpacity: 0.1, shadowRadius: 16 },
      completed && { opacity: 0.6 }
    ]}>
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.bodyPressable, { opacity: pressed && onPress ? 0.75 : 1 }]}
      >
        <View style={styles.body}>
          {iconName ? (
            <View style={[styles.iconContainer, { backgroundColor: completed ? theme.success + '22' : theme.surfaceMuted }]}> 
              <AppIcon name={iconName} size={24} color={completed ? theme.success : theme.primary} />
            </View>
          ) : null}
          <View style={styles.textContainer}>
            <Text numberOfLines={1} style={[styles.title, { color: completed ? theme.secondaryText : theme.text }, completed && styles.completedText]}> 
              {title}
            </Text>
            {!!subtitle && (
              <Text numberOfLines={2} style={[styles.subtitle, { color: theme.secondaryText }]}> 
                {subtitle}
              </Text>
            )}
            {!!meta && <Text style={[styles.meta, { color: theme.primary }]}>{meta}</Text>}
          </View>
        </View>
      </Pressable>
      {!!right && <View style={styles.right}>{right}</View>}
      {onEdit ? (
        <Pressable
          accessibilityLabel="Edit item"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onEdit}
          style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <AppIcon name="pencil" size={20} color={theme.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

