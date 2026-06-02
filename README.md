# Remainder

Offline-first Reminder, Tasks, and Notes app for Android and iOS using Expo, React Native, TypeScript, Zustand, SQLite, and Expo Notifications.

## Run

```sh
npm install
npm run start
```

## Architecture

- UI screens use Zustand stores.
- Stores call repository classes and notification services.
- SQLite access is isolated to repositories and `src/database`.
- This keeps the app ready for a future Supabase sync layer without rewriting screens.

## Implemented MVP

- Bottom tabs: Tasks, Reminders, Notes, Settings
- SQLite migration bootstrap
- Task CRUD with daily/weekly/monthly completion reset logic
- Reminder CRUD with local notification scheduling and snooze actions
- Notes CRUD
- Search, category filters, and sorting
- Light, dark, and system theme options
- Database information screen
- Type-safe domain models


<!-- cd /mnt/data/MY/remainder
npm run apk:release -->