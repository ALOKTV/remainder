import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import { AppIcon } from './AppIcon';
import { useThemeColors } from '../hooks/useThemeColors';
import { styles } from './Dropdown.styles';

type Option<T extends string> = { label: string; value: T };
type TriggerLayout = { x: number; y: number; width: number; height: number };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label?: string;
  style?: ViewStyle;
};

export function Dropdown<T extends string>({ value, options, onChange, label, style }: Props<T>) {
  const theme = useThemeColors();
  const triggerRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  function openMenu() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }
    openMenu();
  }

  function select(value: T) {
    onChange(value);
    setOpen(false);
  }

  const menuPosition = getMenuPosition(triggerLayout, windowHeight);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: theme.primary }]}>{label}</Text> : null}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          onPress={toggleMenu}
          style={({ pressed }) => [
            styles.trigger,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text numberOfLines={1} style={[styles.value, { color: theme.text }]}>{selected?.label}</Text>
          <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.secondaryText} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        {triggerLayout ? (
          <View style={[styles.menu, menuPosition, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              persistentScrollbar={options.length > 5}
              style={styles.optionsScroll}
            >
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
                    {isSelected ? <AppIcon name="checkmark" size={18} color={theme.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

function getMenuPosition(layout: TriggerLayout | null, windowHeight: number) {
  if (!layout) return undefined;

  const gap = 6;
  const margin = 12;
  const belowTop = layout.y + layout.height + gap;
  const belowMaxHeight = windowHeight - belowTop - margin;
  const aboveMaxHeight = layout.y - margin - gap;

  if (belowMaxHeight >= 160 || belowMaxHeight >= aboveMaxHeight) {
    return {
      left: layout.x,
      maxHeight: Math.max(120, Math.min(320, belowMaxHeight)),
      top: belowTop,
      width: layout.width,
    };
  }

  const maxHeight = Math.max(120, Math.min(320, aboveMaxHeight));
  return {
    left: layout.x,
    maxHeight,
    top: Math.max(margin, layout.y - gap - maxHeight),
    width: layout.width,
  };
}
