import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, style }: Props) {
  const theme = useThemeColors();
  const backgroundColor = variant === 'primary' ? theme.primary : variant === 'danger' ? theme.danger : theme.surfaceMuted;
  const textColor = variant === 'secondary' ? theme.text : '#ffffff';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text numberOfLines={1} style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
});
