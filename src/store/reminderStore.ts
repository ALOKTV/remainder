import { create } from 'zustand';
import { cancelReminderNotifications, scheduleReminderNotification } from '../notifications/notificationService';
import { reminderRepository, ReminderInput } from '../repositories/ReminderRepository';
import { Reminder, SortMode } from '../types/models';
import { isReminderPast } from '../utils/date';
import { matchesSearch, sortByMode } from '../utils/filter';

type ReminderState = {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  search: string;
  sort: SortMode;
  load: () => Promise<void>;
  setSearch: (search: string) => void;
  setSort: (sort: SortMode) => void;
  createReminder: (input: ReminderInput) => Promise<void>;
  updateReminder: (id: string, input: ReminderInput) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  filteredReminders: () => Reminder[];
  upcoming: () => Reminder[];
  past: () => Reminder[];
};

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  loading: false,
  error: null,
  search: '',
  sort: 'newest',
  load: async () => {
    set({ loading: true, error: null });
    try {
      set({ reminders: await reminderRepository.list(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to load reminders', loading: false });
    }
  },
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  createReminder: async (input) => {
    const reminder = await reminderRepository.create(input);
    try {
      await scheduleReminderNotification(reminder);
    } catch (error) {
      console.warn("Reminder saved, but notification scheduling failed.", error);
    }
    await get().load();
  },
  updateReminder: async (id, input) => {
    await reminderRepository.update(id, input);
    try {
      await cancelReminderNotifications(id);
      const updated = (await reminderRepository.list()).find((reminder) => reminder.id === id);
      if (updated) await scheduleReminderNotification(updated);
    } catch (error) {
      console.warn("Reminder saved, but notification scheduling failed.", error);
    }
    await get().load();
  },
  deleteReminder: async (id) => {
    await reminderRepository.delete(id);
    try {
      await cancelReminderNotifications(id);
    } catch (error) {
      console.warn("Reminder deleted, but notification cleanup failed.", error);
    }
    await get().load();
  },
  filteredReminders: () => {
    const { reminders, search, sort } = get();
    return sortByMode(reminders.filter((reminder) => matchesSearch([reminder.title, reminder.description], search)), sort);
  },
  upcoming: () => get().filteredReminders().filter((reminder) => !isReminderPast(reminder.date, reminder.time)),
  past: () => get().filteredReminders().filter((reminder) => isReminderPast(reminder.date, reminder.time)),
}));
