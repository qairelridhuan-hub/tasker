import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ReminderOption, RepeatOption, Task } from '../context/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  return status === 'granted';
}

function reminderOffsetMs(reminder: ReminderOption): number {
  switch (reminder) {
    case '15min': return 15 * 60 * 1000;
    case '30min': return 30 * 60 * 1000;
    case '1hr':   return 60 * 60 * 1000;
    case '1 day': return 24 * 60 * 60 * 1000;
    default:      return 15 * 60 * 1000;
  }
}

export async function scheduleTaskReminder(task: {
  id: string;
  title: string;
  startDate: Date;
  reminder: ReminderOption;
}): Promise<string | null> {
  const fireAt = new Date(task.startDate.getTime() - reminderOffsetMs(task.reminder));
  if (fireAt <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Task Reminder',
      body: task.title,
      data: { taskId: task.id },
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
  return id;
}

export async function cancelTaskReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Returns the next occurrence date based on repeat setting
export function nextRepeatDate(date: Date, repeat: RepeatOption): Date | null {
  const next = new Date(date);
  switch (repeat) {
    case 'Daily':   next.setDate(next.getDate() + 1); return next;
    case 'Weekly':  next.setDate(next.getDate() + 7); return next;
    case 'Monthly': next.setMonth(next.getMonth() + 1); return next;
    default: return null;
  }
}
