-- Remainder Supabase schema
-- Run this in Supabase Dashboard > SQL Editor.
-- This schema is user-scoped with RLS. The app must sign in a user before sync.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null check (category in ('daily', 'weekly', 'monthly')),
  is_completed boolean not null default false,
  last_completed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  constraint tasks_user_required check (user_id is not null)
);

create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  date text not null,
  time text not null,
  repeat_type text not null default 'none' check (repeat_type in ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
  notification_enabled boolean not null default false,
  sound_enabled boolean not null default true,
  vibration_enabled boolean not null default true,
  snooze_enabled boolean not null default true,
  snooze_minutes integer not null default 10,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  constraint reminders_user_required check (user_id is not null)
);

create table if not exists public.notes (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  color text not null default 'default' check (color in ('default', 'coral', 'peach', 'yellow', 'mint', 'blue', 'lavender')),
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  constraint notes_user_required check (user_id is not null)
);

create index if not exists tasks_user_updated_idx on public.tasks (user_id, updated_at);
create index if not exists tasks_user_deleted_idx on public.tasks (user_id, deleted_at) where deleted_at is not null;
create index if not exists reminders_user_updated_idx on public.reminders (user_id, updated_at);
create index if not exists reminders_user_deleted_idx on public.reminders (user_id, deleted_at) where deleted_at is not null;
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at);
create index if not exists notes_user_deleted_idx on public.notes (user_id, deleted_at) where deleted_at is not null;

alter table public.tasks enable row level security;
alter table public.reminders enable row level security;
alter table public.notes enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

drop policy if exists "reminders_select_own" on public.reminders;
drop policy if exists "reminders_insert_own" on public.reminders;
drop policy if exists "reminders_update_own" on public.reminders;
drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_select_own" on public.reminders for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders for delete using (auth.uid() = user_id);

drop policy if exists "notes_select_own" on public.notes;
drop policy if exists "notes_insert_own" on public.notes;
drop policy if exists "notes_update_own" on public.notes;
drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_select_own" on public.notes for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes for delete using (auth.uid() = user_id);
