import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';

export function SearchBar({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  const theme = useThemeColors();
  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
      <AppIcon name="search" size={20} color={theme.secondaryText} style={styles.icon} />
      <TextInput
        autoCapitalize="none"
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryText}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { color: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 48,
  },
});
