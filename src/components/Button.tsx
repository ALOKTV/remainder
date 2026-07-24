import React from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './Button.styles';

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
