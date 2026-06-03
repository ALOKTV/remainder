# Supabase Sync Setup

This app currently stores data offline in SQLite. Use this setup to add cloud backup/sync so data can come back after reinstalling the app.

## 1. Create Supabase Project

1. Go to Supabase and create a project.
2. Open `SQL Editor`.
3. Paste and run: `supabase/schema.sql`.
4. Open `Authentication > Providers` and enable the sign-in method you want.

Important: the SQL uses Row Level Security with `auth.uid()`. That means the app must sign in a user before sync. Without auth, the app cannot know which deleted/reinstalled device should receive which old records.

## 2. Install Client Packages

Run this from the project root:

```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

## 3. Add Env Keys

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill these values from Supabase `Project Settings > API`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never put the Supabase service role key in the mobile app.

## 4. Connection File

After installing packages, create `src/supabase/client.ts`:

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env values. Check .env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

You will also need:

```bash
npx expo install @react-native-async-storage/async-storage
```

## 5. Data Mapping

Local app uses camelCase. Supabase schema uses snake_case.

Task mapping:

```ts
const toRemoteTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  category: task.category,
  is_completed: task.isCompleted,
  last_completed_at: task.lastCompletedAt,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  deleted_at: null,
});
```

Reminder mapping:

```ts
const toRemoteReminder = (reminder) => ({
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
});
```

Note mapping:

```ts
const toRemoteNote = (note) => ({
  id: note.id,
  title: note.title,
  content: note.content,
  color: note.color,
  checklist: note.checklist,
  created_at: note.createdAt,
  updated_at: note.updatedAt,
  deleted_at: null,
});
```

## 6. Push Local Data

Use `upsert` for create/update. Supabase fills `user_id` from the signed-in session.

```ts
await supabase.from('tasks').upsert(localTasks.map(toRemoteTask), { onConflict: 'id' });
await supabase.from('reminders').upsert(localReminders.map(toRemoteReminder), { onConflict: 'id' });
await supabase.from('notes').upsert(localNotes.map(toRemoteNote), { onConflict: 'id' });
```

For deletes, do not hard delete remotely during sync. Mark a tombstone:

```ts
await supabase
  .from('tasks')
  .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  .eq('id', taskId);
```

Do the same for `reminders` and `notes`.

## 7. Pull Cloud Data

Pull everything for first sync:

```ts
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .order('updated_at', { ascending: false });
```

Pull only changes after last sync:

```ts
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .gt('updated_at', lastSyncedAt)
  .order('updated_at', { ascending: true });
```

If `deleted_at` is set, delete that local row. Otherwise upsert it into SQLite.

## 8. Conflict Rule

Use `updatedAt` / `updated_at` as last-write-wins:

- If remote `updated_at` is newer than local `updatedAt`, apply remote.
- If local `updatedAt` is newer than remote `updated_at`, push local.
- If equal, do nothing.

## 9. Sync Order

Recommended sync flow:

1. User signs in.
2. Push local rows that changed since last sync.
3. Pull remote rows changed since last sync.
4. Apply remote deletes first.
5. Apply remote upserts.
6. Save `lastSyncedAt = new Date().toISOString()` locally.

## 10. Important Local Change Needed For Deletes

Right now local delete methods hard-delete rows from SQLite. For reliable cloud delete sync, add local tombstones or a small `sync_deletions` table before deleting locally:

```sql
CREATE TABLE IF NOT EXISTS sync_deletions (
  id TEXT PRIMARY KEY NOT NULL,
  tableName TEXT NOT NULL,
  deletedAt TEXT NOT NULL
);
```

When deleting a task/reminder/note locally, insert a row into `sync_deletions`, then delete the item. During push, send those tombstones to Supabase by setting `deleted_at`.
