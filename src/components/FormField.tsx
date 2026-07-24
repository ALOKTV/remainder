import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './FormField.styles';

export function FormField({ label, ...inputProps }: { label: string } & TextInputProps) {
  const theme = useThemeColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.primary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.secondaryText}
        {...inputProps}
        style={[
          styles.input,
          inputProps.multiline ? styles.multiline : undefined,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          inputProps.style,
        ]}
      />
    </View>
  );
}
