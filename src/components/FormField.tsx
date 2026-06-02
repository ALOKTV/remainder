import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

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

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
