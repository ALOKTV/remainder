import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ConfirmDialog, ConfirmDialogConfig } from '../../components/ConfirmDialog';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FAB } from '../../components/FAB';
import { FormField } from '../../components/FormField';
import { ItemModal } from '../../components/ItemModal';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTaskStore } from '../../store/taskStore';
import { Task, TaskCategory } from '../../types/models';
import { formatCategory, getGreeting } from '../../utils/date';
import { screenStyles } from '../common/screenStyles';
import { theme as appTheme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { AppIcon } from '../../components/AppIcon';
import { format, parseISO } from 'date-fns';

const emptyTask = { title: '', description: '', category: 'daily' as TaskCategory };

export function TasksScreen() {
  const theme = useThemeColors();
  const store = useTaskStore();
  const [editing, setEditing] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [confirm, setConfirm] = useState<ConfirmDialogConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void store.load();
  }, []);

  const tasks = store.filteredTasks();
  const completedCount = store.tasks.filter((task) => task.isCompleted && (store.category === 'all' || task.category === store.category)).length;
  const incompleteVisibleTasks = tasks.filter((task) => !task.isCompleted);
  const categoryOptions = useMemo(() => [
    { label: 'All', value: 'all' as const },
    { label: 'Daily', value: 'daily' as const },
    { label: 'Weekly', value: 'weekly' as const },
    { label: 'Monthly', value: 'monthly' as const },
  ], []);
  const taskCategoryOptions = useMemo(() => [
    { label: 'Daily', value: 'daily' as const },
    { label: 'Weekly', value: 'weekly' as const },
    { label: 'Monthly', value: 'monthly' as const },
  ], []);

  const todayStr = format(new Date(), 'EEEE, MMMM do');

  function openCreate() {
    setEditing(null);
    setForm(emptyTask);
    setSaveError(null);
    setModalVisible(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({ title: task.title, description: task.description, category: task.category });
    setSaveError(null);
    setModalVisible(true);
  }

  async function save() {
    if (saving) return;
    if (!form.title.trim()) {
      setSaveError("Title is required.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      if (editing) await store.updateTask(editing.id, form);
      else await store.createTask(form);
      setModalVisible(false);
      setEditing(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save task.");
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editing) return;
    const taskId = editing.id;
    setConfirm({
      title: 'Delete task',
      message: 'This task will be removed permanently.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        void store.deleteTask(taskId).then(() => setModalVisible(false));
      },
    });
  }

  function confirmToggleTask(task: Task) {
    if (task.isCompleted) {
      setConfirm({
        title: 'Uncheck task?',
        message: `Mark "${task.title}" as not done?`,
        confirmLabel: 'Uncheck',
        destructive: true,
        onConfirm: () => {
          void store.setCompleted(task.id, false);
        },
      });
      return;
    }

    setConfirm({
      title: 'Mark task done?',
      message: `Mark "${task.title}" as completed?`,
      confirmLabel: 'Mark Done',
      onConfirm: () => {
        void store.setCompleted(task.id, true);
      },
    });
  }

  function selectAll() {
    const ids = incompleteVisibleTasks.map((task) => task.id);
    const scope = store.category === 'all' ? 'visible tasks' : `visible ${formatCategory(store.category)} tasks`;
    setConfirm({
      title: 'Select all tasks?',
      message: `This will mark ${ids.length} ${scope} as completed.`,
      confirmLabel: 'Select All',
      onConfirm: () => {
        void store.setManyCompleted(ids, true);
      },
    });
  }

  function clearDone() {
    const scope = store.category === 'all' ? 'all tasks' : `${formatCategory(store.category)} tasks`;
    const category = store.category;
    setConfirm({
      title: 'Clear completed marks?',
      message: `This will uncheck ${completedCount} completed ${scope}.`,
      confirmLabel: 'Clear',
      destructive: true,
      onConfirm: () => {
        void store.clearCompleted(category);
      },
    });
  }

  return (
    <View style={[screenStyles.container, { backgroundColor: theme.background }]}> 
      <View style={screenStyles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextContainer}>
            <Text style={[styles.greetingText, { color: theme.secondaryText }]}>{getGreeting()}</Text>
            <Text style={[styles.dateText, { color: theme.text }]}>{todayStr}</Text>
          </View>
          <View style={styles.actionRow}>
            <Button label="Select All" variant="secondary" onPress={selectAll} disabled={incompleteVisibleTasks.length === 0} style={styles.smallActionBtn} />
            <Button label="Clear Done" variant="secondary" onPress={clearDone} disabled={completedCount === 0} style={styles.smallActionBtn} />
          </View>
        </View>

        <SearchBar value={store.search} onChangeText={store.setSearch} placeholder="Search tasks" />

        <View style={styles.filtersRow}>
          <View style={styles.flex2}>
            <Dropdown value={store.category} options={categoryOptions} onChange={store.setCategory} />
          </View>
          <View style={styles.flex1}>
            <SegmentedControl
              value={store.sort}
              options={[{ label: 'New', value: 'newest' }, { label: 'Old', value: 'oldest' }]}
              onChange={store.setSort}
            />
          </View>
        </View>
      </View>

      <ErrorBanner message={store.error} />
      {store.loading ? <ActivityIndicator color={theme.primary} /> : null}
      <FlatList
        contentContainerStyle={[screenStyles.content, { paddingBottom: 140 }]} // padding for floating tab bar and fab
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState icon="checkmark-done-circle-outline" title="No tasks yet" message="Create recurring daily, weekly, or monthly tasks." />}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onOpen={() => openEdit(item)}
            onToggle={() => confirmToggleTask(item)}
          />
        )}
      />
      <ItemModal
        visible={modalVisible}
        title={editing ? 'Edit Task' : 'New Task'}
        onCancel={() => setModalVisible(false)}
        onSave={() => void save()}
        onDelete={editing ? remove : undefined}
        saveDisabled={!form.title.trim()}
        saving={saving}
        errorMessage={saveError}
      >
        <FormField label="Title" value={form.title} onChangeText={(title) => setForm((value) => ({ ...value, title }))} />
        <FormField label="Description" value={form.description} onChangeText={(description) => setForm((value) => ({ ...value, description }))} multiline />
        <Dropdown
          label="Category"
          value={form.category}
          options={taskCategoryOptions}
          onChange={(category) => setForm((value) => ({ ...value, category }))}
        />
      </ItemModal>
      <ConfirmDialog config={confirm} onCancel={() => setConfirm(null)} />
      <FAB onPress={openCreate} />
    </View>
  );
}

function TaskRow({ task, onOpen, onToggle }: { task: Task; onOpen: () => void; onToggle: () => void }) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <View style={[
      styles.taskCard, 
      { backgroundColor: theme.surface, borderColor: task.isCompleted ? theme.border : theme.primary + '44' },
      isDark ? appTheme.shadows.dark : appTheme.shadows.light,
      task.isCompleted && { opacity: 0.6 }
    ]}> 
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isCompleted }}
        hitSlop={10}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.checkbox,
          {
            borderColor: task.isCompleted ? theme.success : theme.secondaryText,
            backgroundColor: task.isCompleted ? theme.success : 'transparent',
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        {task.isCompleted ? <AppIcon name="checkmark" size={16} color="#ffffff" /> : null}
      </Pressable>
      <Pressable onPress={onOpen} style={({ pressed }) => [styles.taskBody, { opacity: pressed ? 0.75 : 1 }]}> 
        <Text numberOfLines={1} style={[styles.taskTitle, { color: task.isCompleted ? theme.secondaryText : theme.text, textDecorationLine: task.isCompleted ? 'line-through' : 'none' }]}> 
          {task.title}
        </Text>
        {!!task.description && (
          <Text numberOfLines={2} style={[styles.taskDescription, { color: theme.secondaryText }]}> 
            {task.description}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={[styles.taskMeta, { color: task.isCompleted ? theme.success : theme.primary }]}> 
            {formatCategory(task.category)}
          </Text>
        </View>
        <View style={styles.dateMetaGroup}>
          <Text style={[styles.dateMeta, { color: theme.secondaryText }]}>Created {formatTaskTimestamp(task.createdAt)}</Text>
          <Text style={[styles.dateMeta, { color: theme.secondaryText }]}>Updated {formatTaskTimestamp(task.updatedAt)}</Text>
          {task.lastCompletedAt ? (
            <Text style={[styles.dateMeta, { color: theme.success }]}>Done {formatTaskTimestamp(task.lastCompletedAt)}</Text>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.actionsContainer}>
         <Pressable onPress={onOpen} hitSlop={10} style={styles.iconBtn}>
           <AppIcon name="pencil" size={20} color={theme.secondaryText} />
         </Pressable>
      </View>
    </View>
  );
}

function formatTaskTimestamp(value: string): string {
  try {
    return format(parseISO(value), 'MMM d, yyyy h:mm a');
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  greetingText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
  dateText: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  smallActionBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskBody: {
    flex: 1,
    gap: 4,
  },
  taskCard: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    marginBottom: 12,
  },
  taskDescription: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateMetaGroup: {
    gap: 2,
    marginTop: 4,
  },
  dateMeta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  taskMeta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
    lineHeight: appTheme.typography.title.lineHeight,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
