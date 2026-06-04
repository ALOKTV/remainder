import { format, isBefore, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { Task, TaskCategory, TodayItem, WeekdayIndex } from '../types/models';

const TASK_RESET_HOUR = 2;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

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

export function isTodayItemDue(item: TodayItem, current = new Date()): boolean {
  if (item.date) return item.date === dateKey(current);
  if (item.weekdays.length === 0) return true;
  return item.weekdays.includes(current.getDay() as WeekdayIndex);
}

export function formatTodayItemSchedule(item: TodayItem): string {
  if (item.date) return 'On ' + displayDate(item.date);
  if (item.weekdays.length === 0) return 'Every day';
  return item.weekdays.map((day) => WEEKDAY_LABELS[day]).join(', ');
}

export function displayDate(date: string): string {
  return format(parseISO(date), 'PP');
}

export function shouldResetTask(task: Task, current = new Date()): boolean {
  if (!task.isCompleted || !task.lastCompletedAt) return false;
  const completed = parseISO(task.lastCompletedAt);
  return isBefore(completed, getTaskResetBoundary(task.category, current));
}

export function getTaskResetBoundary(category: TaskCategory, current = new Date()): Date {
  switch (category) {
    case 'daily':
      return latestBoundary(startOfDay(current), current, 'day');
    case 'weekly':
      return latestBoundary(startOfWeek(current, { weekStartsOn: 1 }), current, 'week');
    case 'monthly':
      return latestBoundary(startOfMonth(current), current, 'month');
    default:
      return current;
  }
}

export function getNextTaskResetAt(current = new Date()): Date {
  const nextReset = startOfDay(current);
  nextReset.setHours(TASK_RESET_HOUR, 0, 0, 0);
  if (!isBefore(current, nextReset)) nextReset.setDate(nextReset.getDate() + 1);
  return nextReset;
}

function latestBoundary(periodStart: Date, current: Date, period: 'day' | 'week' | 'month'): Date {
  const boundary = new Date(periodStart);
  boundary.setHours(TASK_RESET_HOUR, 0, 0, 0);
  if (!isBefore(current, boundary)) return boundary;

  const previous = new Date(boundary);
  if (period === 'day') previous.setDate(previous.getDate() - 1);
  if (period === 'week') previous.setDate(previous.getDate() - 7);
  if (period === 'month') previous.setMonth(previous.getMonth() - 1);
  return previous;
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
