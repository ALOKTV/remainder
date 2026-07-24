import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { FAB } from '../../components/FAB';
import { ConfirmDialog, ConfirmDialogConfig } from '../../components/ConfirmDialog';
import { DateTimePicker } from '../../components/DateTimePicker';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FormField } from '../../components/FormField';
import { ItemModal } from '../../components/ItemModal';
import { InfoModal } from '../../components/InfoModal';
import { ListCard } from '../../components/ListCard';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useReminderStore } from '../../store/reminderStore';
import { Reminder, ReminderRepeatType } from '../../types/models';
import { dateKey, displayDateTime, timeKey } from '../../utils/date';
import { format, parseISO } from 'date-fns';
import { screenStyles } from '../common/screenStyles';
import { WaveBackground } from '../../components/WaveBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { theme as appTheme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { styles } from './RemindersScreen.styles';

const blankReminder = {
  title: '',
  description: '',
  date: dateKey(new Date()),
  time: timeKey(new Date()),
  repeatType: 'none' as ReminderRepeatType,
  notificationEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  snoozeEnabled: true,
  snoozeMinutes: 10,
};

export function RemindersScreen() {
  const theme = useThemeColors();
  const store = useReminderStore();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [viewing, setViewing] = useState<Reminder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(blankReminder);
  const [confirm, setConfirm] = useState<ConfirmDialogConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void store.load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(blankReminder);
    setSaveError(null);
    setModalVisible(true);
  }

  function openEdit(reminder: Reminder) {
    setEditing(reminder);
    setForm({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      time: reminder.time,
      repeatType: reminder.repeatType,
      notificationEnabled: reminder.notificationEnabled,
      soundEnabled: reminder.soundEnabled,
      vibrationEnabled: reminder.vibrationEnabled,
      snoozeEnabled: reminder.snoozeEnabled,
      snoozeMinutes: reminder.snoozeMinutes,
    });
    setSaveError(null);
    setModalVisible(true);
  }

  async function save() {
    if (saving) return;
    if (!form.title.trim()) {
      setSaveError("Title is required.");
      return;
    }
    if (!form.date.trim() || !form.time.trim()) {
      setSaveError("Date and time are required.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await store.updateReminder(editing.id, form);
      else await store.createReminder(form);
      setModalVisible(false);
      setEditing(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save reminder.");
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editing) return;
    const reminderId = editing.id;
    setConfirm({
      title: 'Delete reminder',
      message: 'This reminder will be removed permanently.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        void store.deleteReminder(reminderId).then(() => setModalVisible(false));
      },
    });
  }

  const upcoming = store.upcoming();
  const past = store.past();
  const data = [...upcoming.map((item) => ({ item, section: 'Upcoming' })), ...past.map((item) => ({ item, section: 'Past' }))];

  return (
    <View style={[screenStyles.container, { backgroundColor: theme.background }]}>
      <WaveBackground />
      <View style={screenStyles.header}>
        <Text style={[screenStyles.title, { color: theme.text }]}>Reminders</Text>

        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, isDark ? appTheme.shadows.dark : appTheme.shadows.light]}
        >
          <Text style={styles.summaryTitle}>{upcoming.length} Upcoming</Text>
          <Text style={styles.summarySubtitle}>Reminders scheduled</Text>
        </LinearGradient>

        <SearchBar value={store.search} onChangeText={store.setSearch} placeholder="Search reminders" />
        <View style={styles.sortControlWrap}>
          <SegmentedControl
            value={store.sort}
            options={[{ label: 'Newest', value: 'newest' }, { label: 'Oldest', value: 'oldest' }, { label: 'A-Z', value: 'alphabetical' }]}
            onChange={store.setSort}
          />
        </View>
      </View>
      
      <ErrorBanner message={store.error} />
      {store.loading ? <ActivityIndicator color={theme.primary} /> : null}
      
      <FlatList
        contentContainerStyle={[screenStyles.content, { paddingBottom: 140 }]}
        data={data}
        keyExtractor={({ item }) => item.id}
        ListEmptyComponent={<EmptyState icon="calendar" title="No reminders" message="Create dated reminders with local notifications." />}
        renderItem={({ item, index }) => {
          const showHeader = index === 0 || data[index - 1].section !== item.section;
          return (
            <View style={styles.sectionGroup}>
              {showHeader ? <Text style={[styles.sectionTitle, { color: theme.text }]}>{item.section}</Text> : null}
              <ListCard
                title={item.item.title}
                subtitle={item.item.description}
                meta={`${displayDateTime(item.item.date, item.item.time)} - ${item.item.repeatType}`}
                iconName={item.item.notificationEnabled ? "notifications" : "notifications-off-outline"}
                onPress={() => setViewing(item.item)}
                onEdit={() => openEdit(item.item)}
              />
            </View>
          );
        }}
      />
      <InfoModal
        visible={!!viewing}
        title={viewing?.title ?? ''}
        description={viewing?.description}
        rows={[
          { label: 'When', value: viewing ? displayDateTime(viewing.date, viewing.time) : null },
          { label: 'Repeat', value: viewing?.repeatType },
          { label: 'Notifications', value: viewing ? formatEnabled(viewing.notificationEnabled) : null },
          { label: 'Sound', value: viewing ? formatEnabled(viewing.soundEnabled) : null },
          { label: 'Vibration', value: viewing ? formatEnabled(viewing.vibrationEnabled) : null },
          { label: 'Snooze', value: viewing?.snoozeEnabled ? `${viewing.snoozeMinutes} minutes` : viewing ? 'Off' : null },
          { label: 'Created', value: viewing ? formatReminderTimestamp(viewing.createdAt) : null },
          { label: 'Updated', value: viewing ? formatReminderTimestamp(viewing.updatedAt) : null },
        ]}
        onClose={() => setViewing(null)}
      />
      <ItemModal
        visible={modalVisible}
        title={editing ? 'Edit Reminder' : 'New Reminder'}
        onCancel={() => setModalVisible(false)}
        onSave={() => void save()}
        onDelete={editing ? remove : undefined}
        saveDisabled={!form.title.trim() || !form.date.trim() || !form.time.trim()}
        saving={saving}
        errorMessage={saveError}
      >
        <FormField label="Title" value={form.title} onChangeText={(title) => setForm((value) => ({ ...value, title }))} />
        <FormField label="Description" value={form.description} onChangeText={(description) => setForm((value) => ({ ...value, description }))} multiline />
        <DateTimePicker label="Date" value={form.date} mode="date" onChange={(date) => setForm((value) => ({ ...value, date }))} />
        <DateTimePicker label="Time" value={form.time} mode="time" onChange={(time) => setForm((value) => ({ ...value, time }))} />
        <SegmentedControl
          value={form.repeatType}
          options={[{ label: 'None', value: 'none' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }]}
          onChange={(repeatType) => setForm((value) => ({ ...value, repeatType }))}
        />
        <SegmentedControl
          value={form.repeatType}
          options={[{ label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }, { label: 'Custom', value: 'custom' }]}
          onChange={(repeatType) => setForm((value) => ({ ...value, repeatType }))}
        />
        <SettingSwitch label="Notifications" value={form.notificationEnabled} onValueChange={(notificationEnabled) => setForm((value) => ({ ...value, notificationEnabled }))} />
        <SettingSwitch label="Sound" value={form.soundEnabled} onValueChange={(soundEnabled) => setForm((value) => ({ ...value, soundEnabled }))} />
        <SettingSwitch label="Vibration" value={form.vibrationEnabled} onValueChange={(vibrationEnabled) => setForm((value) => ({ ...value, vibrationEnabled }))} />
        <SettingSwitch label="Snooze" value={form.snoozeEnabled} onValueChange={(snoozeEnabled) => setForm((value) => ({ ...value, snoozeEnabled }))} />
        <FormField
          label="Snooze Minutes"
          value={String(form.snoozeMinutes)}
          keyboardType="number-pad"
          onChangeText={(snoozeMinutes) => setForm((value) => ({ ...value, snoozeMinutes: Number(snoozeMinutes) || 10 }))}
        />
      </ItemModal>
      <ConfirmDialog config={confirm} onCancel={() => setConfirm(null)} />
      <FAB onPress={openCreate} icon="calendar" />
    </View>
  );
}

function formatEnabled(value: boolean): string {
  return value ? 'On' : 'Off';
}

function formatReminderTimestamp(value: string): string {
  try {
    return format(parseISO(value), 'MMM d, yyyy h:mm a');
  } catch {
    return value;
  }
}

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const theme = useThemeColors();
  return (
    <View style={styles.settingSwitchRow}>
      <Text style={[styles.settingSwitchLabel, { color: theme.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.primary }} />
    </View>
  );
}
