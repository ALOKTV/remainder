import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types/models';
import { parseReminderDate } from '../utils/date';

const SNOOZE_10 = 'SNOOZE_10';
const SNOOZE_30 = 'SNOOZE_30';
const MARK_DONE = 'MARK_DONE';
const DISMISS = 'DISMISS';
const REMINDER_CATEGORY = 'REMINDER_ACTIONS';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function registerNotificationHandlers(): void {
  void Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
    { identifier: SNOOZE_10, buttonTitle: 'Snooze 10 Minutes' },
    { identifier: SNOOZE_30, buttonTitle: 'Snooze 30 Minutes' },
    { identifier: MARK_DONE, buttonTitle: 'Mark Done' },
    { identifier: DISMISS, buttonTitle: 'Dismiss', options: { isDestructive: true } },
  ]);

  Notifications.addNotificationResponseReceivedListener((response) => {
    const reminderId = response.notification.request.content.data?.reminderId;
    if (!reminderId || typeof reminderId !== 'string') return;
    if (response.actionIdentifier === SNOOZE_10) void snoozeNotification(reminderId, 10, response.notification.request.content.title ?? 'Reminder');
    if (response.actionIdentifier === SNOOZE_30) void snoozeNotification(reminderId, 30, response.notification.request.content.title ?? 'Reminder');
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function scheduleReminderNotification(reminder: Reminder): Promise<void> {
  await cancelReminderNotifications(reminder.id);
  if (!reminder.notificationEnabled) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const date = parseReminderDate(reminder.date, reminder.time);
  if (date.getTime() <= Date.now() && reminder.repeatType === 'none') return;

  await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${reminder.id}`,
    content: {
      title: reminder.title,
      body: reminder.description || `${reminder.title} is due.`,
      sound: reminder.soundEnabled ? 'default' : undefined,
      data: { reminderId: reminder.id },
      categoryIdentifier: REMINDER_CATEGORY,
    },
    trigger: buildTrigger(reminder, date),
  });
}

export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => notification.content.data?.reminderId === reminderId)
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
}

async function snoozeNotification(reminderId: string, minutes: number, title: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: `Snoozed for ${minutes} minutes.`,
      data: { reminderId },
      categoryIdentifier: REMINDER_CATEGORY,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: minutes * 60, repeats: false },
  });
}

function buildTrigger(reminder: Reminder, date: Date): Notifications.NotificationTriggerInput {
  if (reminder.repeatType === 'daily') {
    return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: date.getHours(), minute: date.getMinutes() };
  }
  if (reminder.repeatType === 'weekly') {
    return { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: date.getDay() + 1, hour: date.getHours(), minute: date.getMinutes() };
  }
  if (reminder.repeatType === 'monthly') {
    return { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: date.getDate(), hour: date.getHours(), minute: date.getMinutes() };
  }
  if (reminder.repeatType === 'yearly') {
    return { type: Notifications.SchedulableTriggerInputTypes.YEARLY, month: date.getMonth(), day: date.getDate(), hour: date.getHours(), minute: date.getMinutes() };
  }
  if (reminder.repeatType === 'custom' && Platform.OS === 'android') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000)),
      repeats: false,
    };
  }
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date };
}
