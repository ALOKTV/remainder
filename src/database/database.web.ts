import { DatabaseInfo, GuestUser, Note, Reminder, Task, TodayItem, WeekdayIndex } from '../types/models';

type WebData = {
  tasks: Task[];
  todayItems: TodayItem[];
  reminders: Reminder[];
  notes: Note[];
  users: GuestUser[];
  migrationVersion: number;
};

type WebDatabase = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, ...params: unknown[]) => Promise<void>;
  getAllAsync: <T>(sql: string, ...params: unknown[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, ...params: unknown[]) => Promise<T | null>;
  withTransactionAsync: (callback: () => Promise<void>) => Promise<void>;
};

const STORAGE_KEY = 'remainder.web.db.v1';
let db: WebDatabase | null = null;

export async function getDb(): Promise<WebDatabase> {
  if (!db) db = createWebDatabase();
  return db;
}

export async function initDatabase(): Promise<void> {
  const data = readData();
  if (data.migrationVersion < 2) {
    writeData({ ...data, notes: normalizeNotes(data.notes), migrationVersion: 2 });
  }
  const migrated = readData();
  if (migrated.migrationVersion < 3) {
    writeData({ ...migrated, todayItems: normalizeTodayItems(migrated.todayItems), migrationVersion: 3 });
  }
  const todays = readData();
  if (todays.migrationVersion < 4) {
    writeData({ ...todays, users: Array.isArray(todays.users) ? todays.users : [], migrationVersion: 4 });
  }
}

export async function getMigrationVersion(): Promise<number> {
  return readData().migrationVersion;
}

export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const data = readData();
  return {
    taskCount: data.tasks.length,
    todayItemCount: data.todayItems.length,
    reminderCount: data.reminders.length,
    noteCount: data.notes.length,
    migrationVersion: data.migrationVersion,
  };
}

function createWebDatabase(): WebDatabase {
  return {
    execAsync: async () => undefined,
    runAsync: async (sql, ...params) => runStatement(sql, params),
    getAllAsync: async <T>(sql: string, ...params: unknown[]) => selectAll<T>(sql, params),
    getFirstAsync: async <T>(sql: string, ...params: unknown[]) => selectFirst<T>(sql, params),
    withTransactionAsync: async (callback) => callback(),
  };
}

function runStatement(sql: string, params: unknown[]): void {
  const normalized = normalizeSql(sql);
  const data = readData();

  if (normalized.startsWith('insert into tasks')) {
    data.tasks.unshift({
      id: stringParam(params[0]),
      title: stringParam(params[1]),
      description: stringParam(params[2]),
      category: stringParam(params[3]) as Task['category'],
      isCompleted: boolParam(params[4]),
      lastCompletedAt: nullableStringParam(params[5]),
      createdAt: stringParam(params[6]),
      updatedAt: stringParam(params[7]),
    });
    writeData(data);
    return;
  }

  if (normalized.startsWith('update tasks set iscompleted = 0')) {
    const [updatedAt, id] = params;
    data.tasks = data.tasks.map((task) =>
      task.id === id ? { ...task, isCompleted: false, lastCompletedAt: null, updatedAt: stringParam(updatedAt) } : task,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('update tasks set title')) {
    const [title, description, category, updatedAt, id] = params;
    data.tasks = data.tasks.map((task) =>
      task.id === id
        ? { ...task, title: stringParam(title), description: stringParam(description), category: stringParam(category) as Task['category'], updatedAt: stringParam(updatedAt) }
        : task,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('update tasks set iscompleted')) {
    const [isCompleted, lastCompletedAt, updatedAt, id] = params;
    data.tasks = data.tasks.map((task) =>
      task.id === id
        ? { ...task, isCompleted: boolParam(isCompleted), lastCompletedAt: nullableStringParam(lastCompletedAt), updatedAt: stringParam(updatedAt) }
        : task,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('delete from tasks')) {
    data.tasks = data.tasks.filter((task) => task.id !== params[0]);
    writeData(data);
    return;
  }

  if (normalized.startsWith('insert into todayitems')) {
    data.todayItems.unshift({
      id: stringParam(params[0]),
      title: stringParam(params[1]),
      description: stringParam(params[2]),
      weekdays: weekdaysParam(params[3]),
      date: nullableStringParam(params[4]),
      createdAt: stringParam(params[5]),
      updatedAt: stringParam(params[6]),
    });
    writeData(data);
    return;
  }

  if (normalized.startsWith('update todayitems set')) {
    const [title, description, weekdays, date, updatedAt, id] = params;
    data.todayItems = data.todayItems.map((item) =>
      item.id === id
        ? {
            ...item,
            title: stringParam(title),
            description: stringParam(description),
            weekdays: weekdaysParam(weekdays),
            date: nullableStringParam(date),
            updatedAt: stringParam(updatedAt),
          }
        : item,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('delete from todayitems')) {
    data.todayItems = data.todayItems.filter((item) => item.id !== params[0]);
    writeData(data);
    return;
  }

  if (normalized.startsWith('insert into reminders')) {
    data.reminders.unshift({
      id: stringParam(params[0]),
      title: stringParam(params[1]),
      description: stringParam(params[2]),
      date: stringParam(params[3]),
      time: stringParam(params[4]),
      repeatType: stringParam(params[5]) as Reminder['repeatType'],
      notificationEnabled: boolParam(params[6]),
      soundEnabled: boolParam(params[7]),
      vibrationEnabled: boolParam(params[8]),
      snoozeEnabled: boolParam(params[9]),
      snoozeMinutes: numberParam(params[10]),
      createdAt: stringParam(params[11]),
      updatedAt: stringParam(params[12]),
    });
    writeData(data);
    return;
  }

  if (normalized.startsWith('update reminders set')) {
    const [title, description, date, time, repeatType, notificationEnabled, soundEnabled, vibrationEnabled, snoozeEnabled, snoozeMinutes, updatedAt, id] = params;
    data.reminders = data.reminders.map((reminder) =>
      reminder.id === id
        ? {
            ...reminder,
            title: stringParam(title),
            description: stringParam(description),
            date: stringParam(date),
            time: stringParam(time),
            repeatType: stringParam(repeatType) as Reminder['repeatType'],
            notificationEnabled: boolParam(notificationEnabled),
            soundEnabled: boolParam(soundEnabled),
            vibrationEnabled: boolParam(vibrationEnabled),
            snoozeEnabled: boolParam(snoozeEnabled),
            snoozeMinutes: numberParam(snoozeMinutes),
            updatedAt: stringParam(updatedAt),
          }
        : reminder,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('delete from reminders')) {
    data.reminders = data.reminders.filter((reminder) => reminder.id !== params[0]);
    writeData(data);
    return;
  }

  if (normalized.startsWith('insert into notes')) {
    data.notes.unshift({
      id: stringParam(params[0]),
      title: stringParam(params[1]),
      content: stringParam(params[2]),
      color: noteColorParam(params[3]),
      checklist: checklistParam(params[4]),
      createdAt: stringParam(params[5]),
      updatedAt: stringParam(params[6]),
    });
    writeData(data);
    return;
  }

  if (normalized.startsWith('update notes set')) {
    const [title, content, color, checklist, updatedAt, id] = params;
    data.notes = data.notes.map((note) =>
      note.id === id
        ? {
            ...note,
            title: stringParam(title),
            content: stringParam(content),
            color: noteColorParam(color),
            checklist: checklistParam(checklist),
            updatedAt: stringParam(updatedAt),
          }
        : note,
    );
    writeData(data);
    return;
  }

  if (normalized.startsWith('delete from notes')) {
    data.notes = data.notes.filter((note) => note.id !== params[0]);
    writeData(data);
  }

  if (normalized.startsWith('insert into users')) {
    data.users.unshift({
      id: stringParam(params[0]),
      name: stringParam(params[1]),
      isGuest: boolParam(params[2]),
      createdAt: stringParam(params[3]),
      updatedAt: stringParam(params[4]),
    });
    writeData(data);
  }
}

function selectAll<T>(sql: string, params?: unknown[]): T[] {
  const normalized = normalizeSql(sql);
  const data = readData();
  if (normalized.includes('from tasks')) return sortRows(data.tasks, 'createdAt', 'desc') as T[];
  if (normalized.includes('from todayitems')) return sortRows(data.todayItems, 'createdAt', 'desc') as T[];
  if (normalized.includes('from reminders')) return [...data.reminders].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)) as T[];
  if (normalized.includes('from notes')) return sortRows(data.notes, 'updatedAt', 'desc') as T[];
  if (normalized.includes('from users')) return [...data.users].sort((a, b) => a.name.localeCompare(b.name)) as T[];
  return [];
}

function selectFirst<T>(sql: string, params?: unknown[]): T | null {
  const normalized = normalizeSql(sql);
  const data = readData();
  if (normalized.includes('from schema_migrations')) return { version: data.migrationVersion } as T;
  if (normalized.includes('from users')) {
    const id = params?.[0];
    const user = id ? data.users.find((item) => item.id === id) : data.users[0];
    return (user ?? null) as T;
  }
  if (normalized.includes('count(*)') && normalized.includes('from tasks')) return { count: data.tasks.length } as T;
  if (normalized.includes('count(*)') && normalized.includes('from todayitems')) return { count: data.todayItems.length } as T;
  if (normalized.includes('count(*)') && normalized.includes('from reminders')) return { count: data.reminders.length } as T;
  if (normalized.includes('count(*)') && normalized.includes('from notes')) return { count: data.notes.length } as T;
  return null;
}

function readData(): WebData {
  if (typeof localStorage === 'undefined') return emptyData();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyData();
  try {
    const parsed = { ...emptyData(), ...JSON.parse(raw) } as WebData;
    return { ...parsed, todayItems: normalizeTodayItems(parsed.todayItems), notes: normalizeNotes(parsed.notes) };
  } catch {
    return emptyData();
  }
}

function writeData(data: WebData): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function emptyData(): WebData {
  return { tasks: [], todayItems: [], reminders: [], notes: [], users: [], migrationVersion: 0 };
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase();
}

function sortRows<T>(rows: T[], key: keyof T, direction: 'asc' | 'desc'): T[] {
  return [...rows].sort((a, b) => {
    const left = String(a[key] ?? '');
    const right = String(b[key] ?? '');
    return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
  });
}

function stringParam(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function nullableStringParam(value: unknown): string | null {
  return value == null ? null : stringParam(value);
}

function boolParam(value: unknown): boolean {
  return value === true || value === 1;
}

function numberParam(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeTodayItems(items: TodayItem[]): TodayItem[] {
  return Array.isArray(items) ? items.map((item) => ({ ...item, weekdays: weekdaysParam(item.weekdays), date: item.date ?? null })) : [];
}

function weekdaysParam(value: unknown): WeekdayIndex[] {
  if (Array.isArray(value)) return value.filter(isWeekdayIndex);
  if (typeof value !== 'string' || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isWeekdayIndex) : [];
  } catch {
    return [];
  }
}

function isWeekdayIndex(value: unknown): value is WeekdayIndex {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 6;
}

function normalizeNotes(notes: Note[]): Note[] {
  return notes.map((note) => ({
    ...note,
    color: noteColorParam(note.color),
    checklist: Array.isArray(note.checklist) ? note.checklist : checklistParam(note.checklist),
  }));
}

function noteColorParam(value: unknown): Note['color'] {
  const color = stringParam(value);
  return ['default', 'coral', 'peach', 'yellow', 'mint', 'blue', 'lavender'].includes(color) ? (color as Note['color']) : 'default';
}

function checklistParam(value: unknown): Note['checklist'] {
  if (Array.isArray(value)) return value.filter(isChecklistItem);
  if (typeof value !== 'string' || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isChecklistItem) : [];
  } catch {
    return [];
  }
}

function isChecklistItem(value: unknown): value is Note['checklist'][number] {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Note['checklist'][number]>;
  return typeof item.id === 'string' && typeof item.text === 'string' && typeof item.checked === 'boolean';
}
