import { ReminderRepeatType, SortMode, TaskCategory } from '../types/models';

export const taskCategories: TaskCategory[] = ['daily', 'weekly', 'monthly'];
export const reminderRepeatTypes: ReminderRepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'];
export const sortModes: SortMode[] = ['newest', 'oldest', 'alphabetical'];
