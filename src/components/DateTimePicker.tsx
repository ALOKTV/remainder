import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { format, parseISO } from 'date-fns';
import { useThemeColors } from '../hooks/useThemeColors';
import { displayTime12 } from '../utils/date';
import { styles } from './DateTimePicker.styles';

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
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

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
  
  const currentMonthDate = new Date(year, month - 1, 1);
  const startDayOfWeek = currentMonthDate.getDay();
  const numDays = daysInMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  function handlePrevMonth() {
    if (month === 1) {
      onChange({ month: 12, year: year - 1 });
    } else {
      onChange({ month: month - 1 });
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      onChange({ month: 1, year: year + 1 });
    } else {
      onChange({ month: month + 1 });
    }
  }

  return (
    <View style={styles.menuContent}>
      <View style={styles.calendarHeader}>
        <Pressable onPress={handlePrevMonth} style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1, backgroundColor: theme.surfaceMuted }]}>
          <AppIcon name="chevron-up" size={16} color={theme.text} style={styles.chevronLeft} />
        </Pressable>
        <Text style={[styles.calendarMonthText, { color: theme.text }]}>
          {format(currentMonthDate, 'MMMM, yyyy')}
        </Text>
        <Pressable onPress={handleNextMonth} style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1, backgroundColor: theme.surfaceMuted }]}>
          <AppIcon name="chevron-up" size={16} color={theme.text} style={styles.chevronRight} />
        </Pressable>
      </View>
      
      <View style={styles.calendarDaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <View key={d} style={styles.calendarDayHeaderCell}>
            <Text style={[styles.calendarDayHeaderText, { color: theme.secondaryText }]}>{d}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {days.map((d, index) => {
          if (d === null) {
            return <View key={`empty-${index}`} style={styles.calendarCellContainer} />;
          }
          const selected = d === day;
          return (
            <View key={`day-${d}`} style={styles.calendarCellContainer}>
              <Pressable
                onPress={() => onChange({ day: d })}
                style={({ pressed }) => [
                  styles.calendarCell,
                  selected && { backgroundColor: theme.primary },
                  !selected && pressed && { backgroundColor: theme.surfaceMuted }
                ]}
              >
                <Text style={[styles.calendarCellText, { color: selected ? '#ffffff' : theme.text }]}>{d}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TimeMenu({ hour12, minute, period, onChange }: { hour12: number; minute: string; period: 'AM' | 'PM'; onChange: (patch: Partial<{ hour12: number; minute: string; period: 'AM' | 'PM' }>) => void }) {
  const theme = useThemeColors();
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  
  const currentAngle = mode === 'hour' ? (hour12 % 12) * 30 : Number(minute) * 6;
  const isDark = theme.surface === '#1E293B'; // basic dark mode check for UI contrast

  function renderClockNumbers() {
    const items = mode === 'hour' 
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] 
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
      
    return items.map((val, index) => {
      const angle = index * 30;
      const rad = (angle - 90) * (Math.PI / 180);
      const radius = 72;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;
      const displayVal = mode === 'minute' ? String(val).padStart(2, '0') : String(val === 0 ? 12 : val);
      const isSelected = mode === 'hour' ? (hour12 % 12 === val % 12) : (Number(minute) === val);
      
      return (
        <Pressable
          key={val}
          onPress={() => {
            if (mode === 'hour') {
              onChange({ hour12: val === 0 ? 12 : val });
              setMode('minute'); // auto advance
            } else {
              onChange({ minute: String(val).padStart(2, '0') });
            }
          }}
          style={[styles.clockNumber, { transform: [{ translateX: x }, { translateY: y }] }]}
        >
          <Text style={[styles.clockNumberText, { color: isSelected ? '#ffffff' : theme.text }]}>{displayVal}</Text>
        </Pressable>
      );
    });
  }

  return (
    <View style={[styles.menuContent, styles.timeMenuContent]}>
      
      <View style={styles.timeInputColumn}>
        <View style={styles.timeInputRow}>
          <Pressable onPress={() => setMode('hour')} style={[styles.timeBox, mode === 'hour' && { backgroundColor: theme.primary + '33', borderColor: theme.primary }]}>
            <Text style={[styles.timeBoxText, { color: mode === 'hour' ? theme.primary : theme.text }]}>{String(hour12).padStart(2, '0')}</Text>
          </Pressable>
          <Text style={[styles.timeSeparatorText, { color: theme.text }]}>:</Text>
          <Pressable onPress={() => setMode('minute')} style={[styles.timeBox, mode === 'minute' && { backgroundColor: theme.primary + '33', borderColor: theme.primary }]}>
            <Text style={[styles.timeBoxText, { color: mode === 'minute' ? theme.primary : theme.text }]}>{minute}</Text>
          </Pressable>
        </View>
        <View style={styles.periodToggleRow}>
          <Pressable onPress={() => onChange({ period: 'AM' })} style={[styles.periodToggleBtn, period === 'AM' && { backgroundColor: theme.surfaceMuted }]}>
            <Text style={[styles.periodToggleText, { color: period === 'AM' ? theme.primary : theme.text }]}>AM</Text>
          </Pressable>
          <View style={[styles.periodSeparator, { backgroundColor: theme.border }]} />
          <Pressable onPress={() => onChange({ period: 'PM' })} style={[styles.periodToggleBtn, period === 'PM' && { backgroundColor: theme.surfaceMuted }]}>
            <Text style={[styles.periodToggleText, { color: period === 'PM' ? theme.primary : theme.text }]}>PM</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.clockContainer}>
        <View style={[styles.clockFace, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <View style={[styles.clockCenter, { backgroundColor: theme.primary }]} />
          <View style={[styles.handContainer, { transform: [{ rotate: `${currentAngle}deg` }] }]}>
            <View style={[styles.handLine, { backgroundColor: theme.primary }]} />
            <View style={[styles.handKnob, { backgroundColor: theme.primary }]} />
          </View>
          {renderClockNumbers()}
        </View>
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
  const minute = Math.min(59, Math.max(0, Number(rawMinute) || 0));
  return { hour12: hour24 % 12 || 12, minute: String(minute).padStart(2, '0'), period: hour24 >= 12 ? 'PM' : 'AM' };
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
