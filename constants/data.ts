import { Category, ReminderOption, RepeatOption, CriticalLevel, TaskStatus } from '../context/types';
import { Mood } from '../context/types';

export const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Social', 'Urgent'];

export const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export const REMINDERS: ReminderOption[] = ['15min', '30min', '1hr', '1 day', 'Custom'];

export const REPEATS: RepeatOption[] = ['None', 'Daily', 'Weekly', 'Monthly', 'Custom'];

export const CRITICAL_LEVELS: { level: CriticalLevel; name: string; color: string }[] = [
  { level: 1, name: 'Low',       color: '#CCCCCC' },
  { level: 2, name: 'Moderate',  color: '#999999' },
  { level: 3, name: 'Important', color: '#666666' },
  { level: 4, name: 'High',      color: '#333333' },
  { level: 5, name: 'Critical',  color: '#000000' },
];

export const MOODS: Mood[] = [
  { key: 'awful',     emoji: '😢', label: 'Awful' },
  { key: 'sad',       emoji: '😕', label: 'Sad' },
  { key: 'okay',      emoji: '😐', label: 'Okay' },
  { key: 'good',      emoji: '🙂', label: 'Good' },
  { key: 'great',     emoji: '😄', label: 'Great' },
];

export const FOCUS_TYPES = ['Pomodoro', 'Deep Work', 'Custom'] as const;
export const SOUNDS = ['Rain', 'Lofi', 'White Noise', 'None'] as const;
