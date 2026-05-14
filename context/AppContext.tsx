import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Task, Mood, FocusSession } from './types';
import {
  subscribeTasks,
  addTask as fbAddTask,
  updateTask as fbUpdateTask,
  deleteTask as fbDeleteTask,
} from '../firebase/tasks';
import { useAuth } from './AuthContext';
import { getMotivationalMessage, getAISuggestion, getTimeOfDay } from '../lib/ai';

interface AppContextValue {
  tasks: Task[];
  loading: boolean;
  todayTasks: Task[];
  completedToday: number;
  overdueTasks: Task[];
  upcomingDeadlines: Task[];
  mood: Mood | null;
  setMood: (m: Mood | null) => void;
  stressLevel: number;
  setStressLevel: (v: number) => void;
  energyLevel: number;
  setEnergyLevel: (v: number) => void;
  focusSession: FocusSession | null;
  setFocusSession: (s: FocusSession | null) => void;
  focusHours: number;
  streak: number;
  aiMessage: string;
  aiSuggestion: string;
  aiLoading: boolean;
  refreshAI: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const FALLBACK_MESSAGES: Record<string, string> = {
  focused: "You seem focused today. Let's tackle critical tasks first.",
  tired: "You look tired. Keep it light and simple today.",
  motivated: "Great energy! Want to push into deep work mode?",
  anxious: "Take it one step at a time. You've got this.",
  stressed: "Let's simplify today. Focus on what truly matters.",
  happy: "Loving the energy! Let's make today count.",
  default: "Ready to make today count? Let's get started.",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood | null>(null);
  const [stressLevel, setStressLevel] = useState(0.3);
  const [energyLevel, setEnergyLevel] = useState(0.6);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [focusHours] = useState(2.5);
  const [streak] = useState(7);
  const [aiMessage, setAiMessage] = useState(FALLBACK_MESSAGES.default);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeTasks(userId, (t) => {
      setTasks(t);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const now = new Date();
  const todayStr = now.toDateString();

  const todayTasks = tasks.filter(t => {
    const s = new Date(t.startDate).toDateString();
    const e = new Date(t.endDate).toDateString();
    return s === todayStr || e === todayStr;
  });

  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;

  const overdueTasks = tasks.filter(t => {
    const end = new Date(t.endDate);
    return end < now && t.status !== 'Completed' && t.status !== 'Cancelled';
  });

  const upcomingDeadlines = tasks
    .filter(t => {
      const end = new Date(t.endDate);
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return end > now && end <= threeDays && t.status !== 'Completed' && t.status !== 'Cancelled';
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const criticalPending = tasks.filter(t =>
    t.criticalLevel >= 4 && t.status !== 'Completed' && t.status !== 'Cancelled'
  ).length;

  const fetchAI = useCallback(async () => {
    setAiLoading(true);
    const timeOfDay = getTimeOfDay();
    const params = {
      mood: mood?.key ?? null,
      stressLevel,
      energyLevel,
      completedToday: completedToday,
      totalToday: todayTasks.length,
      overdue: overdueTasks.length,
      upcomingCount: upcomingDeadlines.length,
      criticalPending,
      timeOfDay,
    };
    const [msg, suggestion] = await Promise.all([
      getMotivationalMessage(params),
      getAISuggestion(params),
    ]);
    if (msg) setAiMessage(msg);
    else setAiMessage(FALLBACK_MESSAGES[mood?.key ?? 'default'] ?? FALLBACK_MESSAGES.default);
    if (suggestion) setAiSuggestion(suggestion);
    setAiLoading(false);
  }, [mood, stressLevel, energyLevel, todayTasks.length, overdueTasks.length, upcomingDeadlines.length, criticalPending, completedToday]);

  // Refresh AI when mood/tasks change, debounced
  useEffect(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(fetchAI, 800);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [mood, stressLevel, energyLevel, tasks.length]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchAI, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAI]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    await fbAddTask(userId!, task);
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await fbUpdateTask(userId!, id, updates);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await fbDeleteTask(userId!, id);
  }, []);

  const completeTask = useCallback(async (id: string) => {
    await fbUpdateTask(userId!, id, { status: 'Completed' });
  }, []);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    await fbUpdateTask(userId!, taskId, { subtasks });
  }, [tasks]);

  return (
    <AppContext.Provider value={{
      tasks, loading, todayTasks, completedToday, overdueTasks, upcomingDeadlines,
      mood, setMood, stressLevel, setStressLevel, energyLevel, setEnergyLevel,
      focusSession, setFocusSession, focusHours, streak,
      aiMessage, aiSuggestion, aiLoading, refreshAI: fetchAI,
      addTask, updateTask, deleteTask, completeTask, toggleSubtask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
