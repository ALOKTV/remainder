export type TaskCategory = 'daily' | 'weekly' | 'monthly';
export type ReminderRepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type SortMode = 'newest' | 'oldest' | 'alphabetical';
export type ThemeMode = 'light' | 'dark' | 'system';
export type NoteColor = 'default' | 'coral' | 'peach' | 'yellow' | 'mint' | 'blue' | 'lavender';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  lastCompletedAt: string | null;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  repeatType: ReminderRepeatType;
  notificationEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  snoozeEnabled: boolean;
  snoozeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  checklist: NoteChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseInfo {
  taskCount: number;
  reminderCount: number;
  noteCount: number;
  migrationVersion: number;
}
