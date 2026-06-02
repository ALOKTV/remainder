import { format, isBefore, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { Task, TaskCategory } from '../types/models';

export function nowIso(): string {
  return new Date().toISOString();
}

export function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function timeKey(date: Date): string {
  return format(date, 'HH:mm');
}

export function displayDateTime(date: string, time?: string): string {
  const parsed = parseReminderDate(date, time ?? '00:00');
  return format(parsed, time ? 'PP p' : 'PP');
}

export function displayTime12(time: string): string {
  const [hour = '0', minute = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0);
  return format(date, 'p');
}

export function parseReminderDate(date: string, time: string): Date {
  return parseISO(`${date}T${time || '00:00'}:00`);
}

export function isReminderPast(date: string, time: string): boolean {
  return isBefore(parseReminderDate(date, time), new Date());
}

export function shouldResetTask(task: Task, today = new Date()): boolean {
  if (!task.isCompleted || !task.lastCompletedAt) return false;
  const completed = parseISO(task.lastCompletedAt);
  switch (task.category) {
    case 'daily':
      return isBefore(completed, startOfDay(today));
    case 'weekly':
      return isBefore(completed, startOfWeek(today, { weekStartsOn: 1 }));
    case 'monthly':
      return isBefore(completed, startOfMonth(today));
    default:
      return false;
  }
}

export function formatCategory(category: TaskCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}
