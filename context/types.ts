export type CriticalLevel = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'Social' | 'Urgent';
export type RepeatOption = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
export type ReminderOption = '15min' | '30min' | '1hr' | '1 day' | 'Custom';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  reminder: ReminderOption;
  repeat: RepeatOption;
  criticalLevel: CriticalLevel;
  status: TaskStatus;
  subtasks: Subtask[];
  attachments: string[];
  createdAt: Date;
}

export interface Mood {
  key: 'happy' | 'stressed' | 'tired' | 'anxious' | 'motivated';
  emoji: string;
  label: string;
}

export interface FocusSession {
  type: 'Pomodoro' | 'Deep Work' | 'Custom';
  duration: number;
  sound: 'Rain' | 'Lofi' | 'White Noise' | 'None';
  startedAt: Date;
}
