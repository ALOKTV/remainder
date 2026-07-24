import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './SegmentedControl.styles';

type Option<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  const theme = useThemeColors();
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted }]}> 
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.item, { backgroundColor: selected ? theme.primary : 'transparent' }]}
          >
            <Text style={[styles.label, { color: selected ? '#ffffff' : theme.text }]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
