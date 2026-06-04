import { getDb } from '../database/database';
import { TodayItem, WeekdayIndex } from '../types/models';
import { nowIso } from '../utils/date';
import { createId } from '../utils/id';
import { mapTodayItem, TodayItemRow } from './mappers';

export type TodayItemInput = {
  title: string;
  description: string;
  weekdays: WeekdayIndex[];
  date: string | null;
};

export class TodayItemRepository {
  async list(): Promise<TodayItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TodayItemRow>('SELECT * FROM todayItems ORDER BY createdAt DESC');
    return rows.map(mapTodayItem);
  }

  async create(input: TodayItemInput): Promise<TodayItem> {
    const db = await getDb();
    const now = nowIso();
    const item: TodayItem = {
      id: createId(),
      title: input.title.trim(),
      description: input.description.trim(),
      weekdays: cleanWeekdays(input.weekdays),
      date: input.date?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO todayItems (id, title, description, weekdays, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      item.id,
      item.title,
      item.description,
      JSON.stringify(item.weekdays),
      item.date,
      item.createdAt,
      item.updatedAt,
    );
    return item;
  }

  async update(id: string, input: TodayItemInput): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE todayItems SET title = ?, description = ?, weekdays = ?, date = ?, updatedAt = ? WHERE id = ?',
      input.title.trim(),
      input.description.trim(),
      JSON.stringify(cleanWeekdays(input.weekdays)),
      input.date?.trim() || null,
      nowIso(),
      id,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM todayItems WHERE id = ?', id);
  }
}

function cleanWeekdays(weekdays: WeekdayIndex[]): WeekdayIndex[] {
  return Array.from(new Set(weekdays)).filter((day) => day >= 0 && day <= 6).sort((a, b) => a - b) as WeekdayIndex[];
}

export const todayItemRepository = new TodayItemRepository();
