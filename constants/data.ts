import { Category, ReminderOption, RepeatOption, CriticalLevel, TaskStatus } from '../context/types';
import { Mood } from '../context/types';

export const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Social', 'Urgent'];

export const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export const REMINDERS: ReminderOption[] = ['15min', '30min', '1hr', '1 day', 'Custom'];

export const REPEATS: RepeatOption[] = ['None', 'Daily', 'Weekly', 'Monthly', 'Custom'];

export const CRITICAL_LEVELS: { level: CriticalLevel; name: string; color: string }[] = [
  { level: 1, name: 'Low', color: '#4CAF50' },
  { level: 2, name: 'Moderate', color: '#2196F3' },
  { level: 3, name: 'Important', color: '#FFC107' },
  { level: 4, name: 'High', color: '#FF9800' },
  { level: 5, name: 'Critical', color: '#F44336' },
];

export const MOODS: Mood[] = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'stressed', emoji: '😟', label: 'Stressed' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'motivated', emoji: '💪', label: 'Motivated' },
];

export const FOCUS_TYPES = ['Pomodoro', 'Deep Work', 'Custom'] as const;
export const SOUNDS = ['Rain', 'Lofi', 'White Noise', 'None'] as const;
