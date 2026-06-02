import { getDb } from '../database/database';
import { Reminder, ReminderRepeatType } from '../types/models';
import { dateKey, nowIso, timeKey } from '../utils/date';
import { createId } from '../utils/id';
import { boolToInt, mapReminder, ReminderRow } from './mappers';

export type ReminderInput = {
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
};

export class ReminderRepository {
  async list(): Promise<Reminder[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ReminderRow>('SELECT * FROM reminders ORDER BY date ASC, time ASC');
    return rows.map(mapReminder);
  }

  async create(input: ReminderInput): Promise<Reminder> {
    const db = await getDb();
    const now = nowIso();
    const reminder: Reminder = {
      id: createId(),
      title: input.title.trim(),
      description: input.description.trim(),
      date: input.date || dateKey(new Date()),
      time: input.time || timeKey(new Date()),
      repeatType: input.repeatType,
      notificationEnabled: input.notificationEnabled,
      soundEnabled: input.soundEnabled,
      vibrationEnabled: input.vibrationEnabled,
      snoozeEnabled: input.snoozeEnabled,
      snoozeMinutes: input.snoozeMinutes,
      createdAt: now,
      updatedAt: now,
    };
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
    return reminder;
  }

  async update(id: string, input: ReminderInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE reminders SET
        title = ?, description = ?, date = ?, time = ?, repeatType = ?, notificationEnabled = ?, soundEnabled = ?,
        vibrationEnabled = ?, snoozeEnabled = ?, snoozeMinutes = ?, updatedAt = ? WHERE id = ?`,
      input.title.trim(),
      input.description.trim(),
      input.date,
      input.time,
      input.repeatType,
      boolToInt(input.notificationEnabled),
      boolToInt(input.soundEnabled),
      boolToInt(input.vibrationEnabled),
      boolToInt(input.snoozeEnabled),
      input.snoozeMinutes,
      nowIso(),
      id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
  }
}

export const reminderRepository = new ReminderRepository();
