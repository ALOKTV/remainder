import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';

type Option<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label?: string;
  style?: ViewStyle;
};

export function Dropdown<T extends string>({ value, options, onChange, label, style }: Props<T>) {
  const theme = useThemeColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  function select(value: T) {
    onChange(value);
    setOpen(false);
  }

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: theme.primary }]}>{label}</Text> : null}
      <View style={styles.anchor}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen((value) => !value)}
          style={({ pressed }) => [
            styles.trigger,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text numberOfLines={1} style={[styles.value, { color: theme.text }]}>{selected?.label}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.secondaryText} />
        </Pressable>

        {open ? (
          <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => select(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: isSelected ? theme.surfaceMuted : 'transparent', opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>{option.label}</Text>
                  {isSelected ? <Ionicons name="checkmark" size={18} color={theme.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    zIndex: 50,
  },
  container: {
    gap: 8,
    zIndex: 50,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  menu: {
    borderRadius: appTheme.radius.input,
    borderWidth: 1,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 54,
    zIndex: 100,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
  trigger: {
    alignItems: 'center',
    borderRadius: appTheme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  value: {
    flex: 1,
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
});
