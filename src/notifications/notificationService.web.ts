import { Reminder } from '../types/models';

export function registerNotificationHandlers(): void {
  return undefined;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function scheduleReminderNotification(reminder: Reminder): Promise<void> {
  if (!reminder.notificationEnabled || typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(reminder.title, { body: reminder.description || `${reminder.title} is due.` });
  }
}

export async function cancelReminderNotifications(_reminderId: string): Promise<void> {
  return undefined;
}
