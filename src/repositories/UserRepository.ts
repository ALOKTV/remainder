import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from '../database/database';
import { GuestUser } from '../types/models';
import { nowIso } from '../utils/date';
import { createId } from '../utils/id';

const ACTIVE_GUEST_KEY = 'remainder:activeGuest';

type UserRow = {
  id: string;
  name: string;
  isGuest: number;
  createdAt: string;
  updatedAt: string;
};

function mapUser(row: UserRow): GuestUser {
  return {
    id: row.id,
    name: row.name,
    isGuest: row.isGuest === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  async createGuest(): Promise<GuestUser> {
    const db = await getDb();
    const now = nowIso();
    const guest: GuestUser = {
      id: createId(),
      name: await this.nextGuestName(),
      isGuest: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      'INSERT INTO users (id, name, isGuest, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      guest.id,
      guest.name,
      guest.isGuest ? 1 : 0,
      guest.createdAt,
      guest.updatedAt,
    );
    return guest;
  }

  async getById(id: string): Promise<GuestUser | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', id);
    return row ? mapUser(row) : null;
  }

  async getActiveGuest(): Promise<GuestUser | null> {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_GUEST_KEY);
      if (!raw) return null;
      return await this.getById(raw);
    } catch (error) {
      console.warn('Unable to read the active guest session.', error);
      return null;
    }
  }

  async setActiveGuest(id: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_GUEST_KEY, id);
  }

  async clearActiveGuest(): Promise<void> {
    await AsyncStorage.removeItem(ACTIVE_GUEST_KEY);
  }

  private async nextGuestName(): Promise<string> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM users WHERE name LIKE 'Guest\\_%' ESCAPE '\\'",
    );
    const used = new Set(rows.map((row) => row.name));
    let index = 0;
    while (used.has(`Guest_${String(index).padStart(2, '0')}`)) {
      index += 1;
    }
    return `Guest_${String(index).padStart(2, '0')}`;
  }
}

export const userRepository = new UserRepository();
