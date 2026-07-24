import React from 'react';
import { TextInput, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './SearchBar.styles';

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
