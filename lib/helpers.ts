import { Critical } from '../constants/theme';

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function timeRemaining(endDate: Date): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Overdue';
  const h = Math.floor(diff / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export function getDuration(start: Date, end: Date): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(diff / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function getCriticalColor(level: number): string {
  return Critical[level] ?? '#A0A0A0';
}

export function subtaskProgress(subtasks: { completed: boolean }[]) {
  if (!subtasks.length) return null;
  const done = subtasks.filter(s => s.completed).length;
  return { done, total: subtasks.length, pct: done / subtasks.length };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
