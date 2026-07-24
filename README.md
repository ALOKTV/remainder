# Remainder

Offline-first Reminder, Tasks, and Notes app for Android and iOS using Expo, React Native, TypeScript, Zustand, SQLite, and Expo Notifications.

## Run

```sh
npm install
npm run start
```

## Build APK

`npm run apk:debug` now builds a bundled APK for manual testing, so it behaves much closer to release. `npm run apk:release` is still the production-style build.

```sh
npm run apk:debug
npm run apk:release
```

## Supabase Setup

Copy `.env.example` to `.env` and replace the Supabase URL and anon key with values from your own project. The placeholder values in this repo will fail with a network/DNS error if you try to authenticate against them.

## Architecture

- UI screens use Zustand stores.
- Stores call repository classes and notification services.
- SQLite access is isolated to repositories and `src/database`.
- This keeps the app ready for a future Supabase sync layer without rewriting screens.
alok

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
