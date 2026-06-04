import { getDb } from "../database/database";
import { noteRepository } from "../repositories/NoteRepository";
import { reminderRepository } from "../repositories/ReminderRepository";
import { taskRepository } from "../repositories/TaskRepository";
import { todayItemRepository } from "../repositories/TodayItemRepository";
import { boolToInt } from "../repositories/mappers";
import { Note, NoteChecklistItem, NoteColor, Reminder, ReminderRepeatType, Task, TaskCategory, TodayItem, WeekdayIndex } from "../types/models";
import { getSupabaseClient } from "./client";

type RemoteTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  is_completed: boolean;
  last_completed_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

type RemoteTodayItem = {
  id: string;
  title: string;
  description: string;
  weekdays: WeekdayIndex[];
  date: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
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
  is_deleted: boolean;
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
  is_deleted: boolean;
  deleted_at: string | null;
};

export type SyncResult = {
  tasks: number;
  todayItems: number;
  reminders: number;
  notes: number;
};

export async function pushLocalToCloud(): Promise<SyncResult> {
  await requireSignedInSession();
  const supabase = getSupabaseClient();
  const [tasks, todayItems, reminders, notes] = await Promise.all([
    taskRepository.list(),
    todayItemRepository.list(),
    reminderRepository.list(),
    noteRepository.list(),
  ]);

  if (tasks.length > 0) {
    const { error } = await supabase.from("tasks").upsert(tasks.map(toRemoteTask), { onConflict: "id" });
    if (error) throw error;
  }

  if (todayItems.length > 0) {
    const { error } = await supabase.from("today_items").upsert(todayItems.map(toRemoteTodayItem), { onConflict: "id" });
    if (error) throw error;
  }

  if (reminders.length > 0) {
    const { error } = await supabase.from("reminders").upsert(reminders.map(toRemoteReminder), { onConflict: "id" });
    if (error) throw error;
  }

  if (notes.length > 0) {
    const { error } = await supabase.from("notes").upsert(notes.map(toRemoteNote), { onConflict: "id" });
    if (error) throw error;
  }

  return { tasks: tasks.length, todayItems: todayItems.length, reminders: reminders.length, notes: notes.length };
}

export async function pullCloudToLocal(): Promise<SyncResult> {
  await requireSignedInSession();
  const supabase = getSupabaseClient();

  const [
    { data: tasks, error: taskError },
    { data: todayItems, error: todayItemError },
    { data: reminders, error: reminderError },
    { data: notes, error: noteError },
  ] = await Promise.all([
    supabase.from("tasks").select("*"),
    supabase.from("today_items").select("*"),
    supabase.from("reminders").select("*"),
    supabase.from("notes").select("*"),
  ]);

  if (taskError) throw taskError;
  if (todayItemError) throw todayItemError;
  if (reminderError) throw reminderError;
  if (noteError) throw noteError;

  const [localTasks, localTodayItems, localReminders, localNotes] = await Promise.all([
    taskRepository.list(),
    todayItemRepository.list(),
    reminderRepository.list(),
    noteRepository.list(),
  ]);
  const localTaskMap = new Map(localTasks.map((task) => [task.id, task]));
  const localTodayItemMap = new Map(localTodayItems.map((item) => [item.id, item]));
  const localReminderMap = new Map(localReminders.map((reminder) => [reminder.id, reminder]));
  const localNoteMap = new Map(localNotes.map((note) => [note.id, note]));

  let appliedTasks = 0;
  let appliedTodayItems = 0;
  let appliedReminders = 0;
  let appliedNotes = 0;
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const row of (tasks ?? []) as RemoteTask[]) {
      const local = localTaskMap.get(row.id);
      if (isRemoteDeleted(row)) {
        if (local && isRemoteNewer(row.updated_at, local.updatedAt)) {
          await deleteLocalTask(row.id);
          appliedTasks += 1;
        }
        continue;
      }

      const task = fromRemoteTask(row);
      if (local && !isRemoteNewer(task.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalTask(task);
      else await insertLocalTask(task);
      appliedTasks += 1;
    }

    for (const row of (todayItems ?? []) as RemoteTodayItem[]) {
      const local = localTodayItemMap.get(row.id);
      if (isRemoteDeleted(row)) {
        if (local && isRemoteNewer(row.updated_at, local.updatedAt)) {
          await deleteLocalTodayItem(row.id);
          appliedTodayItems += 1;
        }
        continue;
      }

      const item = fromRemoteTodayItem(row);
      if (local && !isRemoteNewer(item.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalTodayItem(item);
      else await insertLocalTodayItem(item);
      appliedTodayItems += 1;
    }

    for (const row of (reminders ?? []) as RemoteReminder[]) {
      const local = localReminderMap.get(row.id);
      if (isRemoteDeleted(row)) {
        if (local && isRemoteNewer(row.updated_at, local.updatedAt)) {
          await deleteLocalReminder(row.id);
          appliedReminders += 1;
        }
        continue;
      }

      const reminder = fromRemoteReminder(row);
      if (local && !isRemoteNewer(reminder.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalReminder(reminder);
      else await insertLocalReminder(reminder);
      appliedReminders += 1;
    }

    for (const row of (notes ?? []) as RemoteNote[]) {
      const local = localNoteMap.get(row.id);
      if (isRemoteDeleted(row)) {
        if (local && isRemoteNewer(row.updated_at, local.updatedAt)) {
          await deleteLocalNote(row.id);
          appliedNotes += 1;
        }
        continue;
      }

      const note = fromRemoteNote(row);
      if (local && !isRemoteNewer(note.updatedAt, local.updatedAt)) continue;
      if (local) await updateLocalNote(note);
      else await insertLocalNote(note);
      appliedNotes += 1;
    }
  });

  return { tasks: appliedTasks, todayItems: appliedTodayItems, reminders: appliedReminders, notes: appliedNotes };
}

async function requireSignedInSession(): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("Sign in before syncing.");
}

function toRemoteTask(task: Task): Omit<RemoteTask, "deleted_at"> & { deleted_at: null } {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    is_completed: task.isCompleted,
    last_completed_at: task.lastCompletedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    is_deleted: false,
    deleted_at: null,
  };
}

function toRemoteTodayItem(item: TodayItem): Omit<RemoteTodayItem, "deleted_at"> & { deleted_at: null } {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    weekdays: item.weekdays,
    date: item.date,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    is_deleted: false,
    deleted_at: null,
  };
}

function toRemoteReminder(reminder: Reminder): Omit<RemoteReminder, "deleted_at"> & { deleted_at: null } {
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
    is_deleted: false,
    deleted_at: null,
  };
}

function toRemoteNote(note: Note): Omit<RemoteNote, "deleted_at"> & { deleted_at: null } {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    checklist: note.checklist,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    is_deleted: false,
    deleted_at: null,
  };
}

function fromRemoteTask(row: RemoteTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    isCompleted: row.is_completed,
    lastCompletedAt: row.last_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromRemoteTodayItem(row: RemoteTodayItem): TodayItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    weekdays: Array.isArray(row.weekdays) ? row.weekdays.filter(isWeekdayIndex) : [],
    date: row.date ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromRemoteReminder(row: RemoteReminder): Reminder {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
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
    content: row.content ?? "",
    color: row.color,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function insertLocalTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO tasks (id, title, description, category, isCompleted, lastCompletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
    "UPDATE tasks SET title = ?, description = ?, category = ?, isCompleted = ?, lastCompletedAt = ?, createdAt = ?, updatedAt = ? WHERE id = ?",
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

async function deleteLocalTask(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
}

async function insertLocalTodayItem(item: TodayItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO todayItems (id, title, description, weekdays, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    item.id,
    item.title,
    item.description,
    JSON.stringify(item.weekdays),
    item.date,
    item.createdAt,
    item.updatedAt,
  );
}

async function updateLocalTodayItem(item: TodayItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE todayItems SET title = ?, description = ?, weekdays = ?, date = ?, createdAt = ?, updatedAt = ? WHERE id = ?",
    item.title,
    item.description,
    JSON.stringify(item.weekdays),
    item.date,
    item.createdAt,
    item.updatedAt,
    item.id,
  );
}

async function deleteLocalTodayItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM todayItems WHERE id = ?", id);
}

async function insertLocalReminder(reminder: Reminder): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO reminders (id, title, description, date, time, repeatType, notificationEnabled, soundEnabled, vibrationEnabled, snoozeEnabled, snoozeMinutes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    "UPDATE reminders SET title = ?, description = ?, date = ?, time = ?, repeatType = ?, notificationEnabled = ?, soundEnabled = ?, vibrationEnabled = ?, snoozeEnabled = ?, snoozeMinutes = ?, createdAt = ?, updatedAt = ? WHERE id = ?",
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

async function deleteLocalReminder(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM reminders WHERE id = ?", id);
}

async function insertLocalNote(note: Note): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO notes (id, title, content, color, checklist, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
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
    "UPDATE notes SET title = ?, content = ?, color = ?, checklist = ?, createdAt = ?, updatedAt = ? WHERE id = ?",
    note.title,
    note.content,
    note.color,
    JSON.stringify(note.checklist),
    note.createdAt,
    note.updatedAt,
    note.id,
  );
}

async function deleteLocalNote(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM notes WHERE id = ?", id);
}

function isWeekdayIndex(value: unknown): value is WeekdayIndex {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 6;
}

function isRemoteDeleted(row: { is_deleted?: boolean; deleted_at?: string | null }): boolean {
  return row.is_deleted === true || !!row.deleted_at;
}

function isRemoteNewer(remoteUpdatedAt: string, localUpdatedAt: string): boolean {
  return Date.parse(remoteUpdatedAt) > Date.parse(localUpdatedAt);
}
