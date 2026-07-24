import React from 'react';
import { Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './EmptyState.styles';

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
