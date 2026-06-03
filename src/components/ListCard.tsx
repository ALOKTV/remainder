import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function ListCard({
  title,
  subtitle,
  meta,
  iconName,
  onPress,
  right,
  completed = false,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  iconName?: string;
  onPress?: () => void;
  right?: ReactNode;
  completed?: boolean;
}) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[
      styles.card, 
      { backgroundColor: theme.surface, borderColor: completed ? theme.border : theme.primary + '33' },
      isDark ? appTheme.shadows.dark : appTheme.shadows.light,
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
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  bodyPressable: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  meta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
    lineHeight: appTheme.typography.title.lineHeight,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
});
