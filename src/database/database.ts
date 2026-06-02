import * as SQLite from 'expo-sqlite';
import { DatabaseInfo } from '../types/models';

let db: SQLite.SQLiteDatabase | null = null;

const migrations: Array<{ version: number; sql: string }> = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL,
        isCompleted INTEGER NOT NULL DEFAULT 0,
        lastCompletedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        repeatType TEXT NOT NULL DEFAULT 'none',
        notificationEnabled INTEGER NOT NULL DEFAULT 0,
        soundEnabled INTEGER NOT NULL DEFAULT 1,
        vibrationEnabled INTEGER NOT NULL DEFAULT 1,
        snoozeEnabled INTEGER NOT NULL DEFAULT 1,
        snoozeMinutes INTEGER NOT NULL DEFAULT 10,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: 
      "ALTER TABLE notes ADD COLUMN color TEXT NOT NULL DEFAULT 'default';" +
      "ALTER TABLE notes ADD COLUMN checklist TEXT NOT NULL DEFAULT '[]';",
  },
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('remainder.db');
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt TEXT NOT NULL
    );
  `);

  const current = await getMigrationVersion();
  for (const migration of migrations) {
    if (migration.version > current) {
      await database.withTransactionAsync(async () => {
        await database.execAsync(migration.sql);
        await database.runAsync(
          'INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)',
          migration.version,
          new Date().toISOString(),
        );
      });
    }
  }
}

export async function getMigrationVersion(): Promise<number> {
  const database = await getDb();
  const result = await database.getFirstAsync<{ version: number }>(
    'SELECT COALESCE(MAX(version), 0) as version FROM schema_migrations',
  );
  return result?.version ?? 0;
}

export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const database = await getDb();
  const [taskCount, reminderCount, noteCount, migrationVersion] = await Promise.all([
    database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks'),
    database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM reminders'),
    database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notes'),
    getMigrationVersion(),
  ]);

  return {
    taskCount: taskCount?.count ?? 0,
    reminderCount: reminderCount?.count ?? 0,
    noteCount: noteCount?.count ?? 0,
    migrationVersion,
  };
}
