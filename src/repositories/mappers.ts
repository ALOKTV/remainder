import { Note, NoteChecklistItem, NoteColor, Reminder, Task } from '../types/models';

type PersistedBoolean = number | boolean;

export type TaskRow = Omit<Task, 'isCompleted'> & { isCompleted: PersistedBoolean };
export type ReminderRow = Omit<Reminder, 'notificationEnabled' | 'soundEnabled' | 'vibrationEnabled' | 'snoozeEnabled'> & {
  notificationEnabled: PersistedBoolean;
  soundEnabled: PersistedBoolean;
  vibrationEnabled: PersistedBoolean;
  snoozeEnabled: PersistedBoolean;
};
export type NoteRow = Omit<Note, 'checklist' | 'color'> & { color?: string | null; checklist?: string | NoteChecklistItem[] | null };

const NOTE_COLORS: NoteColor[] = ['default', 'coral', 'peach', 'yellow', 'mint', 'blue', 'lavender'];

export function mapTask(row: TaskRow): Task {
  return { ...row, isCompleted: persistedBool(row.isCompleted) };
}

export function mapReminder(row: ReminderRow): Reminder {
  return {
    ...row,
    notificationEnabled: persistedBool(row.notificationEnabled),
    soundEnabled: persistedBool(row.soundEnabled),
    vibrationEnabled: persistedBool(row.vibrationEnabled),
    snoozeEnabled: persistedBool(row.snoozeEnabled),
  };
}

export function mapNote(row: NoteRow): Note {
  return {
    ...row,
    color: normalizeNoteColor(row.color),
    checklist: parseChecklist(row.checklist),
  };
}

function normalizeNoteColor(value: unknown): NoteColor {
  return typeof value === 'string' && NOTE_COLORS.includes(value as NoteColor) ? (value as NoteColor) : 'default';
}

function parseChecklist(value: unknown): NoteChecklistItem[] {
  if (Array.isArray(value)) return value.filter(isChecklistItem);
  if (typeof value !== 'string' || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isChecklistItem) : [];
  } catch {
    return [];
  }
}

function isChecklistItem(value: unknown): value is NoteChecklistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<NoteChecklistItem>;
  return typeof item.id === 'string' && typeof item.text === 'string' && typeof item.checked === 'boolean';
}

function persistedBool(value: PersistedBoolean): boolean {
  return value === true || value === 1;
}

export function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}
