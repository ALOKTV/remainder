import React from 'react';
import { Text } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './ErrorBanner.styles';

export function ErrorBanner({ message }: { message: string | null }) {
  const theme = useThemeColors();
  if (!message) return null;
  return <Text style={[styles.banner, { backgroundColor: theme.danger, color: '#ffffff' }]}>{message}</Text>;
}
