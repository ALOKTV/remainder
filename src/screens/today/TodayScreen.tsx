import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ConfirmDialog, ConfirmDialogConfig } from '../../components/ConfirmDialog';
import { DateTimePicker } from '../../components/DateTimePicker';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FAB } from '../../components/FAB';
import { FormField } from '../../components/FormField';
import { ItemModal } from '../../components/ItemModal';
import { InfoModal } from '../../components/InfoModal';
import { ListCard } from '../../components/ListCard';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useThemeColors } from '../../hooks/useThemeColors';
import { TodayItemInput } from '../../repositories/TodayItemRepository';
import { useTodayItemStore } from '../../store/todayItemStore';
import { TodayItem, WeekdayIndex } from '../../types/models';
import { dateKey, displayDate, formatTodayItemSchedule } from '../../utils/date';
import { format, parseISO } from 'date-fns';
import { screenStyles } from '../common/screenStyles';
import { WaveBackground } from '../../components/WaveBackground';
import { styles } from './TodayScreen.styles';

const weekdayOptions: Array<{ label: string; value: WeekdayIndex }> = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const blankItem: TodayItemInput = {
  title: '',
  description: '',
  weekdays: [],
  date: null,
};

export function TodayScreen() {
  const theme = useThemeColors();
  const store = useTodayItemStore();
  const [editing, setEditing] = useState<TodayItem | null>(null);
  const [viewing, setViewing] = useState<TodayItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<TodayItemInput>(blankItem);
  const [confirm, setConfirm] = useState<ConfirmDialogConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [todayKey, setTodayKey] = useState(() => dateKey(new Date()));

  useEffect(() => {
    void store.load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTodayKey(dateKey(new Date())), 60_000);
    return () => clearInterval(interval);
  }, []);

  const todayItems = store.dueToday();
  const allItems = store.filteredItems();
  const data = viewMode === 'today' ? todayItems : allItems;
  const todayLabel = useMemo(() => displayDate(todayKey), [todayKey]);

  function openCreate() {
    setEditing(null);
    setForm(blankItem);
    setSaveError(null);
    setModalVisible(true);
  }

  function openEdit(item: TodayItem) {
    setEditing(item);
    setForm({ title: item.title, description: item.description, weekdays: item.weekdays, date: item.date });
    setSaveError(null);
    setModalVisible(true);
  }

  async function save() {
    if (saving) return;
    if (!form.title.trim()) {
      setSaveError('Title is required.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await store.updateItem(editing.id, form);
      else await store.createItem(form);
      setModalVisible(false);
      setEditing(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save item.');
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editing) return;
    const itemId = editing.id;
    setConfirm({
      title: 'Delete item',
      message: 'This Today item will be removed permanently.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        void store.deleteItem(itemId).then(() => setModalVisible(false));
      },
    });
  }

  function toggleWeekday(day: WeekdayIndex) {
    setForm((value) => {
      const weekdays = value.weekdays.includes(day)
        ? value.weekdays.filter((item) => item !== day)
        : [...value.weekdays, day].sort((a, b) => a - b);
      return { ...value, weekdays: weekdays as WeekdayIndex[], date: null };
    });
  }

  return (
    <View style={[screenStyles.container, { backgroundColor: theme.background }]}> 
      <WaveBackground />
      <View style={screenStyles.header}>
        <Text style={[screenStyles.title, { color: theme.text }]}>Today</Text>
        <View style={[styles.summaryBand, { backgroundColor: theme.primary }]}> 
          <Text style={styles.summaryCount}>{todayItems.length}</Text>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Due Today</Text>
            <Text style={styles.summaryDate}>{todayLabel}</Text>
          </View>
        </View>
        <SearchBar value={store.search} onChangeText={store.setSearch} placeholder="Search today items" />
        <SegmentedControl
          value={viewMode}
          options={[{ label: 'Today', value: 'today' }, { label: 'All', value: 'all' }]}
          onChange={setViewMode}
        />
      </View>

      <ErrorBanner message={store.error} />
      {store.loading ? <ActivityIndicator color={theme.primary} /> : null}
      <FlatList
        contentContainerStyle={[screenStyles.content, { paddingBottom: 140 }]}
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title={viewMode === 'today' ? 'Nothing due today' : 'No today items'} message="Create weekday or date-based items." />}
        renderItem={({ item }) => (
          <ListCard
            title={item.title}
            subtitle={item.description}
            meta={formatTodayItemSchedule(item)}
            iconName="calendar-outline"
            onPress={() => setViewing(item)}
            onEdit={() => openEdit(item)}
          />
        )}
      />
      <InfoModal
        visible={!!viewing}
        title={viewing?.title ?? ''}
        description={viewing?.description}
        rows={[
          { label: 'Schedule', value: viewing ? formatTodayItemSchedule(viewing) : null },
          { label: 'Created', value: viewing ? formatItemTimestamp(viewing.createdAt) : null },
          { label: 'Updated', value: viewing ? formatItemTimestamp(viewing.updatedAt) : null },
        ]}
        onClose={() => setViewing(null)}
      />

      <ItemModal
        visible={modalVisible}
        title={editing ? 'Edit Today Item' : 'New Today Item'}
        onCancel={() => setModalVisible(false)}
        onSave={() => void save()}
        onDelete={editing ? remove : undefined}
        saveDisabled={!form.title.trim()}
        saving={saving}
        errorMessage={saveError}
      >
        <FormField label="Title" value={form.title} onChangeText={(title) => setForm((value) => ({ ...value, title }))} />
        <FormField label="Description" value={form.description} onChangeText={(description) => setForm((value) => ({ ...value, description }))} multiline />
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: theme.primary }]}>Weekdays</Text>
          <View style={styles.weekdayRow}>
            {weekdayOptions.map((day) => {
              const selected = !form.date && form.weekdays.includes(day.value);
              return (
                <Pressable
                  key={day.value}
                  accessibilityRole="button"
                  onPress={() => toggleWeekday(day.value)}
                  style={({ pressed }) => [
                    styles.weekdayChip,
                    { backgroundColor: selected ? theme.primary : theme.surfaceMuted, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={[styles.weekdayText, { color: selected ? '#ffffff' : theme.text }]}>{day.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button label="Every Day" variant={form.date || form.weekdays.length > 0 ? 'secondary' : 'primary'} onPress={() => setForm((value) => ({ ...value, weekdays: [], date: null }))} />
        </View>
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: theme.primary }]}>Exact Date</Text>
          {form.date ? (
            <>
              <DateTimePicker label="Date" value={form.date} mode="date" onChange={(date) => setForm((value) => ({ ...value, date, weekdays: [] }))} />
              <Button label="Clear Date" variant="secondary" onPress={() => setForm((value) => ({ ...value, date: null }))} />
            </>
          ) : (
            <Button label="Set Date" variant="secondary" onPress={() => setForm((value) => ({ ...value, date: dateKey(new Date()), weekdays: [] }))} />
          )}
        </View>
      </ItemModal>
      <ConfirmDialog config={confirm} onCancel={() => setConfirm(null)} />
      <FAB onPress={openCreate} icon="calendar" />
    </View>
  );
}

function formatItemTimestamp(value: string): string {
  try {
    return format(parseISO(value), 'MMM d, yyyy h:mm a');
  } catch {
    return value;
  }
}
