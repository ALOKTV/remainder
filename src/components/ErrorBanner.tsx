import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export function ErrorBanner({ message }: { message: string | null }) {
  const theme = useThemeColors();
  if (!message) return null;
  return <Text style={[styles.banner, { backgroundColor: theme.danger, color: '#ffffff' }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
    padding: 10,
  },
});
