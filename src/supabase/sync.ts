import { getDb } from '../database/database';
import { noteRepository } from '../repositories/NoteRepository';
import { reminderRepository } from '../repositories/ReminderRepository';
import { taskRepository } from '../repositories/TaskRepository';
import { boolToInt } from '../repositories/mappers';
import { Note, NoteChecklistItem, NoteColor, Reminder, ReminderRepeatType, Task, TaskCategory } from '../types/models';
import { getSupabaseClient } from './client';

type RemoteTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  is_completed: boolean;
  last_completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RemoteReminder = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  repeat_type: ReminderRepeatType;
  notification_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  snooze_enabled: boolean;
  snooze_minutes: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RemoteNote = {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  checklist: NoteChecklistItem[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SyncResult = {
  tasks: number;
  reminders: number;
  notes: number;
};

export async function pushLocalToCloud(): Promise<SyncResult> {
  await requireSignedInSession();
  const supabase = getSupabaseClient();
  const [tasks, reminders, notes] = await Promise.all([
    taskRepository.list(),
    reminderRepository.list(),
    noteRepository.list(),
  ]);

  if (tasks.length > 0) {
    const { error } = await supabase.from('tasks').upsert(tasks.map(toRemoteTask), { onConflict: 'id' });
    if (error) throw error;
  }

  if (reminders.length > 0) {
    const { error } = await supabase.from('reminders').upsert(reminders.map(toRemoteReminder), { onConflict: 'id' });
    if (error) throw error;
  }

  if (notes.length > 0) {
    const { error } = await supabase.from('notes').upsert(notes.map(toRemoteNote), { onConflict: 'id' });
    if (error) throw error;
  }

  return { tasks: tasks.length, reminders: reminders.length, notes: notes.length };
}

export async function pullCloudToLocal(): Promise<SyncResult> {
  await requireSignedInSession();
  const supabase = getSupabaseClient();

  const [{ data: tasks, error: taskError }, { data: reminders, error: reminderError }, { data: notes, error: noteError }] = await Promise.all([
    supabase.from('tasks').select('*').is('deleted_at', null),
    supabase.from('reminders').select('*').is('deleted_at', null),
    supabase.from('notes').select('*').is('deleted_at', null),
  ]);

  if (taskError) throw taskError;
  if (reminderError) throw reminderError;
  if (noteError) throw noteError;

  const [localTasks, localReminders, localNotes] = await Promise.all([
    taskRepository.list(),
    reminderRepository.list(),
    noteRepository.list(),
  ]);
  const localTaskMap = new Map(localTasks.map((task) => [task.id, task]));
  const localReminderMap = new Map(localReminders.map((reminder) => [reminder.id, reminder]));
  const localNoteMap = new Map(localNotes.map((note) => [note.id, note]));

  let appliedTasks = 0;
  let appliedReminders = 0;
  let appliedNotes = 0;
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const row of (tasks ?? []) as RemoteTask[]) {
      const task = fromRemoteTask(row);
      const local = localTaskMap.get(task.id);
      if (local && !isRemoteNewer(task.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalTask(task);
      else await insertLocalTask(task);
      appliedTasks += 1;
    }

    for (const row of (reminders ?? []) as RemoteReminder[]) {
      const reminder = fromRemoteReminder(row);
      const local = localReminderMap.get(reminder.id);
      if (local && !isRemoteNewer(reminder.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalReminder(reminder);
      else await insertLocalReminder(reminder);
      appliedReminders += 1;
    }

    for (const row of (notes ?? []) as RemoteNote[]) {
      const note = fromRemoteNote(row);
      const local = localNoteMap.get(note.id);
      if (local && !isRemoteNewer(note.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalNote(note);
      else await insertLocalNote(note);
      appliedNotes += 1;
    }
  });

  return { tasks: appliedTasks, reminders: appliedReminders, notes: appliedNotes };
}

async function requireSignedInSession(): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Sign in before syncing.');
}

function toRemoteTask(task: Task): Omit<RemoteTask, 'deleted_at'> & { deleted_at: null } {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    is_completed: task.isCompleted,
    last_completed_at: task.lastCompletedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: null,
  };
}

function toRemoteReminder(reminder: Reminder): Omit<RemoteReminder, 'deleted_at'> & { deleted_at: null } {
  return {
    id: reminder.id,
    title: reminder.title,
    description: reminder.description,
    date: reminder.date,
    time: reminder.time,
    repeat_type: reminder.repeatType,
    notification_enabled: reminder.notificationEnabled,
    sound_enabled: reminder.soundEnabled,
    vibration_enabled: reminder.vibrationEnabled,
    snooze_enabled: reminder.snoozeEnabled,
    snooze_minutes: reminder.snoozeMinutes,
    created_at: reminder.createdAt,
    updated_at: reminder.updatedAt,
    deleted_at: null,
  };
}

function toRemoteNote(note: Note): Omit<RemoteNote, 'deleted_at'> & { deleted_at: null } {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    checklist: note.checklist,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    deleted_at: null,
  };
}

function fromRemoteTask(row: RemoteTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    isCompleted: row.is_completed,
    lastCompletedAt: row.last_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromRemoteReminder(row: RemoteReminder): Reminder {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    date: row.date,
    time: row.time,
    repeatType: row.repeat_type,
    notificationEnabled: row.notification_enabled,
    soundEnabled: row.sound_enabled,
    vibrationEnabled: row.vibration_enabled,
    snoozeEnabled: row.snooze_enabled,
    snoozeMinutes: row.snooze_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromRemoteNote(row: RemoteNote): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? '',
    color: row.color,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function insertLocalTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO tasks (id, title, description, category, isCompleted, lastCompletedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.title,
    task.description,
    task.category,
    boolToInt(task.isCompleted),
    task.lastCompletedAt,
    task.createdAt,
    task.updatedAt,
  );
}

async function updateLocalTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE tasks SET title = ?, description = ?, category = ?, isCompleted = ?, lastCompletedAt = ?, createdAt = ?, updatedAt = ? WHERE id = ?',
    task.title,
    task.description,
    task.category,
    boolToInt(task.isCompleted),
    task.lastCompletedAt,
    task.createdAt,
    task.updatedAt,
    task.id,
  );
}

async function insertLocalReminder(reminder: Reminder): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO reminders
     (id, title, description, date, time, repeatType, notificationEnabled, soundEnabled, vibrationEnabled, snoozeEnabled, snoozeMinutes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    reminder.id,
    reminder.title,
    reminder.description,
    reminder.date,
    reminder.time,
    reminder.repeatType,
    boolToInt(reminder.notificationEnabled),
    boolToInt(reminder.soundEnabled),
    boolToInt(reminder.vibrationEnabled),
    boolToInt(reminder.snoozeEnabled),
    reminder.snoozeMinutes,
    reminder.createdAt,
    reminder.updatedAt,
  );
}

async function updateLocalReminder(reminder: Reminder): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE reminders SET
      title = ?, description = ?, date = ?, time = ?, repeatType = ?, notificationEnabled = ?, soundEnabled = ?,
      vibrationEnabled = ?, snoozeEnabled = ?, snoozeMinutes = ?, createdAt = ?, updatedAt = ? WHERE id = ?`,
    reminder.title,
    reminder.description,
    reminder.date,
    reminder.time,
    reminder.repeatType,
    boolToInt(reminder.notificationEnabled),
    boolToInt(reminder.soundEnabled),
    boolToInt(reminder.vibrationEnabled),
    boolToInt(reminder.snoozeEnabled),
    reminder.snoozeMinutes,
    reminder.createdAt,
    reminder.updatedAt,
    reminder.id,
  );
}

async function insertLocalNote(note: Note): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO notes (id, title, content, color, checklist, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    note.id,
    note.title,
    note.content,
    note.color,
    JSON.stringify(note.checklist),
    note.createdAt,
    note.updatedAt,
  );
}

async function updateLocalNote(note: Note): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE notes SET title = ?, content = ?, color = ?, checklist = ?, createdAt = ?, updatedAt = ? WHERE id = ?',
    note.title,
    note.content,
    note.color,
    JSON.stringify(note.checklist),
    note.createdAt,
    note.updatedAt,
    note.id,
  );
}

function isRemoteNewer(remoteUpdatedAt: string, localUpdatedAt: string): boolean {
  return Date.parse(remoteUpdatedAt) > Date.parse(localUpdatedAt);
}
