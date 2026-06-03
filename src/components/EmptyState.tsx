import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';

export function EmptyState({ title, message, icon = 'planet-outline' }: { title: string; message: string; icon?: string }) {
  const theme = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '11' }]}>
        <AppIcon name={icon} size={64} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.secondaryText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    marginTop: 40,
    padding: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
    textAlign: 'center',
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
});
