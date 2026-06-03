import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { format, parseISO } from 'date-fns';
import { useThemeColors } from '../hooks/useThemeColors';
import { displayTime12 } from '../utils/date';
import { theme as appTheme } from '../constants/theme';

type Props = {
  label: string;
  value: string;
  mode: 'date' | 'time';
  onChange: (value: string) => void;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: format(new Date(2026, index, 1), 'MMM'),
  value: index + 1,
}));
const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));

export function DateTimePicker({ label, value, mode, onChange }: Props) {
  const theme = useThemeColors();
  const [open, setOpen] = useState(false);
  const dateParts = useMemo(() => parseDateParts(value), [value]);
  const timeParts = useMemo(() => parseTimeParts(value), [value]);
  const displayValue = mode === 'time' ? displayTime12(value) : displayDate(value);

  function updateDate(patch: Partial<typeof dateParts>) {
    const next = { ...dateParts, ...patch };
    const days = daysInMonth(next.year, next.month);
    const day = Math.min(next.day, days);
    onChange(next.year + '-' + String(next.month).padStart(2, '0') + '-' + String(day).padStart(2, '0'));
  }

  function updateTime(patch: Partial<typeof timeParts>) {
    const next = { ...timeParts, ...patch };
    let hour24 = next.hour12 % 12;
    if (next.period === 'PM') hour24 += 12;
    onChange(String(hour24).padStart(2, '0') + ':' + next.minute);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.primary }]}>{label}</Text>
      <View style={styles.anchor}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen((value) => !value)}
          style={({ pressed }) => [
            styles.trigger,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text numberOfLines={1} style={[styles.valueText, { color: theme.text }]}>{displayValue}</Text>
          <AppIcon name={open ? 'chevron-up' : mode === 'date' ? 'calendar-outline' : 'time-outline'} size={20} color={theme.secondaryText} />
        </Pressable>

        {open ? (
          <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              persistentScrollbar
              style={styles.menuScroll}
            >
              {mode === 'date' ? (
                <DateMenu day={dateParts.day} month={dateParts.month} year={dateParts.year} onChange={updateDate} />
              ) : (
                <TimeMenu hour12={timeParts.hour12} minute={timeParts.minute} period={timeParts.period} onChange={updateTime} />
              )}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function DateMenu({ day, month, year, onChange }: { day: number; month: number; year: number; onChange: (patch: Partial<{ day: number; month: number; year: number }>) => void }) {
  const theme = useThemeColors();
  const dayOptions = Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1);
  const yearOptions = Array.from({ length: 11 }, (_, index) => new Date().getFullYear() - 2 + index);

  return (
    <View style={styles.menuContent}>
      <OptionGrid values={monthOptions} selectedValue={month} renderLabel={(item) => item.label} getValue={(item) => item.value} onSelect={(value) => onChange({ month: value })} />
      <Text style={[styles.menuSectionLabel, { color: theme.secondaryText }]}>Day</Text>
      <OptionGrid values={dayOptions} selectedValue={day} renderLabel={(item) => String(item)} getValue={(item) => item} onSelect={(value) => onChange({ day: value })} compact />
      <Text style={[styles.menuSectionLabel, { color: theme.secondaryText }]}>Year</Text>
      <OptionGrid values={yearOptions} selectedValue={year} renderLabel={(item) => String(item)} getValue={(item) => item} onSelect={(value) => onChange({ year: value })} />
    </View>
  );
}

function TimeMenu({ hour12, minute, period, onChange }: { hour12: number; minute: string; period: 'AM' | 'PM'; onChange: (patch: Partial<{ hour12: number; minute: string; period: 'AM' | 'PM' }>) => void }) {
  const theme = useThemeColors();
  return (
    <View style={styles.menuContent}>
      <Text style={[styles.menuSectionLabel, { color: theme.secondaryText }]}>Hour</Text>
      <OptionGrid values={hourOptions} selectedValue={hour12} renderLabel={(item) => String(item)} getValue={(item) => item} onSelect={(value) => onChange({ hour12: value })} compact />
      <Text style={[styles.menuSectionLabel, { color: theme.secondaryText }]}>Minute</Text>
      <OptionGrid values={minuteOptions} selectedValue={minute} renderLabel={(item) => item} getValue={(item) => item} onSelect={(value) => onChange({ minute: value })} compact />
      <View style={styles.periodRow}>
        {(['AM', 'PM'] as const).map((value) => (
          <PickerOption key={value} selected={period === value} label={value} onPress={() => onChange({ period: value })} />
        ))}
      </View>
    </View>
  );
}

function OptionGrid<T, V extends string | number>({ values, selectedValue, renderLabel, getValue, onSelect, compact = false }: { values: T[]; selectedValue: V; renderLabel: (item: T) => string; getValue: (item: T) => V; onSelect: (value: V) => void; compact?: boolean }) {
  return (
    <View style={compact ? styles.compactGrid : styles.optionGrid}>
      {values.map((item) => {
        const value = getValue(item);
        return <PickerOption key={String(value)} selected={value === selectedValue} label={renderLabel(item)} onPress={() => onSelect(value)} compact={compact} />;
      })}
    </View>
  );
}

function PickerOption({ label, selected, onPress, compact = false }: { label: string; selected: boolean; onPress: () => void; compact?: boolean }) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [compact ? styles.compactOption : styles.option, { backgroundColor: selected ? theme.primary : theme.surfaceMuted, opacity: pressed ? 0.75 : 1 }]}
    >
      <Text style={[styles.optionText, { color: selected ? '#ffffff' : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function parseDateParts(value: string): { year: number; month: number; day: number } {
  const now = new Date();
  const [rawYear, rawMonth, rawDay] = value.split('-');
  const year = Number(rawYear) || now.getFullYear();
  const month = Number(rawMonth) || now.getMonth() + 1;
  const day = Math.min(Number(rawDay) || now.getDate(), daysInMonth(year, month));
  return { year, month, day };
}

function parseTimeParts(value: string): { hour12: number; minute: string; period: 'AM' | 'PM' } {
  const [rawHour = '0', rawMinute = '00'] = value.split(':');
  const hour24 = Number(rawHour) || 0;
  const roundedMinute = Math.min(55, Math.round((Number(rawMinute) || 0) / 5) * 5);
  return { hour12: hour24 % 12 || 12, minute: String(roundedMinute).padStart(2, '0'), period: hour24 >= 12 ? 'PM' : 'AM' };
}

function displayDate(value: string): string {
  try {
    return format(parseISO(value), 'PP');
  } catch {
    return 'Select date';
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const styles = StyleSheet.create({
  anchor: { position: 'relative', zIndex: 60 },
  compactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  compactOption: { alignItems: 'center', borderRadius: 8, justifyContent: 'center', minHeight: 34, minWidth: 42, paddingHorizontal: 8, paddingVertical: 6 },
  container: { gap: 8, zIndex: 60 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  menu: { borderRadius: appTheme.radius.input, borderWidth: 1, left: 0, maxHeight: 360, overflow: 'hidden', position: 'absolute', right: 0, top: 54, zIndex: 120 },
  menuContent: { gap: 10, padding: 12 },
  menuScroll: { flexGrow: 0 },
  menuSectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  option: { alignItems: 'center', borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 36, minWidth: 64, paddingHorizontal: 10, paddingVertical: 8 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionText: { fontFamily: appTheme.typography.body.fontFamily, fontSize: appTheme.typography.body.fontSize, lineHeight: appTheme.typography.body.lineHeight },
  periodRow: { flexDirection: 'row', gap: 8 },
  trigger: { alignItems: 'center', borderRadius: appTheme.radius.input, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  valueText: { flex: 1, fontSize: 16 },
});
