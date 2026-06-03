import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { Button } from '../../components/Button';
import { FAB } from '../../components/FAB';
import { ConfirmDialog, ConfirmDialogConfig } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FormField } from '../../components/FormField';
import { ItemModal } from '../../components/ItemModal';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useNoteStore } from '../../store/noteStore';
import { Note, NoteChecklistItem, NoteColor } from '../../types/models';
import { displayDateTime } from '../../utils/date';
import { format, parseISO } from 'date-fns';
import { createId } from '../../utils/id';
import { screenStyles } from '../common/screenStyles';
import { theme as appTheme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

const blankNote = { title: '', content: '', color: 'default' as NoteColor, checklist: [] as NoteChecklistItem[] };

const noteColorOptions: Array<{ value: NoteColor; label: string; light: string; dark: string; border: string }> = [
  { value: 'default', label: 'Default', light: '#FFFFFF', dark: '#1F2937', border: '#D1D5DB' },
  { value: 'coral', label: 'Coral', light: '#FDE2E2', dark: '#4A1F24', border: '#FCA5A5' },
  { value: 'peach', label: 'Peach', light: '#FFE8CC', dark: '#4A2A16', border: '#FDBA74' },
  { value: 'yellow', label: 'Yellow', light: '#FEF3C7', dark: '#42350F', border: '#FCD34D' },
  { value: 'mint', label: 'Mint', light: '#DDFCE7', dark: '#123524', border: '#86EFAC' },
  { value: 'blue', label: 'Blue', light: '#DBEAFE', dark: '#172554', border: '#93C5FD' },
  { value: 'lavender', label: 'Lavender', light: '#EDE9FE', dark: '#2E1F52', border: '#C4B5FD' },
];

export function NotesScreen() {
  const theme = useThemeColors();
  const store = useNoteStore();
  const [editing, setEditing] = useState<Note | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(blankNote);
  const [confirm, setConfirm] = useState<ConfirmDialogConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [formType, setFormType] = useState<'note' | 'checklist'>('note');

  useEffect(() => {
    void store.load();
  }, []);

  function openCreate(type: 'note' | 'checklist' = 'note') {
    setEditing(null);
    setForm(type === 'checklist' ? { ...blankNote, checklist: [{ id: createId(), text: '', checked: false }] } : blankNote);
    setFormType(type);
    setSaveError(null);
    setCreateMenuOpen(false);
    setModalVisible(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setForm({ title: note.title, content: note.content, color: note.color, checklist: note.checklist });
    setFormType(note.checklist.length > 0 && !note.content.trim() ? 'checklist' : 'note');
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
      const payload = formType === 'checklist' ? { ...form, content: '' } : form;
      if (editing) await store.updateNote(editing.id, payload);
      else await store.createNote(payload);
      setModalVisible(false);
      setEditing(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save note.');
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editing) return;
    const noteId = editing.id;
    setConfirm({
      title: 'Delete note',
      message: 'This note will be removed permanently.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        void store.deleteNote(noteId).then(() => setModalVisible(false));
      },
    });
  }

  function addChecklistItem() {
    setForm((value) => ({
      ...value,
      checklist: [...value.checklist, { id: createId(), text: '', checked: false }],
    }));
  }

  function updateChecklistItem(id: string, patch: Partial<NoteChecklistItem>) {
    setForm((value) => ({
      ...value,
      checklist: value.checklist.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function removeChecklistItem(id: string) {
    setForm((value) => ({ ...value, checklist: value.checklist.filter((item) => item.id !== id) }));
  }

  function toggleChecklistItem(note: Note, itemId: string) {
    void store.updateNote(note.id, {
      title: note.title,
      content: note.content,
      color: note.color,
      checklist: note.checklist.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
    });
  }

  const notes = store.filteredNotes();

  return (
    <View style={[screenStyles.container, { backgroundColor: theme.background }]}> 
      <View style={screenStyles.header}>
        <Text style={[screenStyles.title, { color: theme.text }]}>Notes</Text>
        <SearchBar value={store.search} onChangeText={store.setSearch} placeholder="Search notes" />
        <View style={{ marginTop: 8 }}>
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
        columnWrapperStyle={styles.row}
        numColumns={2}
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState icon="book" title="No notes" message="Create your first note for quick reference." />}
        renderItem={({ item }) => (
          <NoteCard 
            note={item}
            onPress={() => openEdit(item)}
            onToggleChecklistItem={(itemId) => toggleChecklistItem(item, itemId)}
          />
        )}
      />
      
      <ItemModal
        visible={modalVisible}
        title={editing ? 'Edit Note' : 'New Note'}
        onCancel={() => setModalVisible(false)}
        onSave={() => void save()}
        onDelete={editing ? remove : undefined}
        saveDisabled={!form.title.trim()}
        saving={saving}
        errorMessage={saveError}
      >
        <FormField label="Title" value={form.title} onChangeText={(title) => setForm((value) => ({ ...value, title }))} />
        {formType === 'note' ? (
          <FormField label="Content" value={form.content} onChangeText={(content) => setForm((value) => ({ ...value, content }))} multiline />
        ) : null}
        <ColorPicker value={form.color} onChange={(color) => setForm((value) => ({ ...value, color }))} />
        <ChecklistEditor
          items={form.checklist}
          onAdd={addChecklistItem}
          onChange={updateChecklistItem}
          onRemove={removeChecklistItem}
        />
      </ItemModal>
      <ConfirmDialog config={confirm} onCancel={() => setConfirm(null)} />
      {createMenuOpen ? (
        <View style={styles.createMenu}>
          <Pressable onPress={() => openCreate('note')} style={[styles.createOption, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="document-text-outline" size={20} color={theme.primary} />
            <Text style={[styles.createOptionText, { color: theme.text }]}>Note</Text>
          </Pressable>
          <Pressable onPress={() => openCreate('checklist')} style={[styles.createOption, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="checkbox-outline" size={20} color={theme.primary} />
            <Text style={[styles.createOptionText, { color: theme.text }]}>Checklist</Text>
          </Pressable>
        </View>
      ) : null}
      <FAB onPress={() => setCreateMenuOpen((open) => !open)} icon={createMenuOpen ? 'close' : 'create'} />
    </View>
  );
}

function NoteCard({ note, onPress, onToggleChecklistItem }: { note: Note; onPress: () => void; onToggleChecklistItem: (itemId: string) => void }) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  const colors = getNoteCardColors(note.color, isDark, theme.surface, theme.border);
  const previewItems = note.checklist.filter((item) => item.text.trim().length > 0).slice(0, 4);

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
        isDark ? appTheme.shadows.dark : appTheme.shadows.light,
        pressed && { opacity: 0.8 }
      ]}
    >
      <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.text }]}>{note.title}</Text>
      {!!note.content && (
        <Text numberOfLines={4} style={[styles.cardContent, { color: theme.secondaryText }]}>{note.content}</Text>
      )}
      {previewItems.length > 0 ? (
        <View style={styles.checklistPreview}>
          {previewItems.map((item) => (
            <View key={item.id} style={styles.previewRow}>
              <Pressable hitSlop={8} onPress={(event: any) => { event?.stopPropagation?.(); onToggleChecklistItem(item.id); }}>
                <AppIcon name={item.checked ? 'checkbox' : 'square-outline'} size={18} color={item.checked ? theme.primary : theme.secondaryText} />
              </Pressable>
              <Text
                numberOfLines={1}
                style={[
                  styles.previewText,
                  { color: theme.secondaryText, textDecorationLine: item.checked ? 'line-through' : 'none' },
                ]}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      <Text style={[styles.cardDate, { color: theme.primary }]}>Updated {formatNoteUpdatedAt(note.updatedAt)}</Text>
    </Pressable>
  );
}

function ColorPicker({ value, onChange }: { value: NoteColor; onChange: (value: NoteColor) => void }) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: theme.primary }]}>Color</Text>
      <View style={styles.colorRow}>
        {noteColorOptions.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: isDark ? option.dark : option.light,
                  borderColor: selected ? theme.primary : option.border,
                },
              ]}
            >
              {selected ? <AppIcon name="checkmark" size={18} color={theme.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ChecklistEditor({
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  items: NoteChecklistItem[];
  onAdd: () => void;
  onChange: (id: string, patch: Partial<NoteChecklistItem>) => void;
  onRemove: (id: string) => void;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.fieldBlock}>
      <View style={styles.checklistHeader}>
        <Text style={[styles.fieldLabel, { color: theme.primary }]}>Checklist</Text>
        <Button label="Add Item" variant="secondary" onPress={onAdd} style={styles.addItemButton} />
      </View>
      {items.length === 0 ? (
        <Text style={[styles.emptyChecklistText, { color: theme.secondaryText }]}>No checklist items</Text>
      ) : null}
      <View style={styles.checklistRows}>
        {items.map((item) => (
          <View key={item.id} style={styles.checklistRow}>
            <Pressable hitSlop={8} onPress={() => onChange(item.id, { checked: !item.checked })}>
              <AppIcon name={item.checked ? 'checkbox' : 'square-outline'} size={24} color={item.checked ? theme.primary : theme.secondaryText} />
            </Pressable>
            <TextInput
              value={item.text}
              onChangeText={(text) => onChange(item.id, { text })}
              placeholder="List item"
              placeholderTextColor={theme.secondaryText}
              style={[
                styles.checklistInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  textDecorationLine: item.checked ? 'line-through' : 'none',
                },
              ]}
            />
            <Pressable hitSlop={8} onPress={() => onRemove(item.id)}>
              <AppIcon name="close" size={22} color={theme.secondaryText} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function getNoteCardColors(color: NoteColor, isDark: boolean, fallbackSurface: string, fallbackBorder: string) {
  const option = noteColorOptions.find((item) => item.value === color);
  if (!option || color === 'default') return { background: fallbackSurface, border: fallbackBorder };
  return { background: isDark ? option.dark : option.light, border: option.border };
}

function formatNoteUpdatedAt(value: string): string {
  try {
    return format(parseISO(value), 'MMM d, h:mm a');
  } catch {
    return displayDateTime(value.slice(0, 10));
  }
}

const styles = StyleSheet.create({
  addItemButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  card: {
    flex: 1,
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    padding: 16,
    minHeight: 160,
  },
  cardContent: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDate: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  checklistHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checklistInput: {
    borderBottomWidth: 1,
    flex: 1,
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    minHeight: 40,
    paddingVertical: 6,
  },
  checklistPreview: {
    gap: 6,
    marginBottom: 12,
  },
  checklistRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  checklistRows: {
    gap: 8,
  },
  createMenu: {
    bottom: 182,
    gap: 10,
    position: 'absolute',
    right: 24,
    zIndex: 101,
  },
  createOption: {
    alignItems: 'center',
    borderRadius: appTheme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createOptionText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  emptyChecklistText: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
  },
  fieldBlock: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  previewText: {
    flex: 1,
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
});
