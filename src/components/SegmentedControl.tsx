import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

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

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  item: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
