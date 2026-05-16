import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Task, Mood, FocusSession } from './types';
import {
  subscribeTasks,
  addTask as fbAddTask,
  updateTask as fbUpdateTask,
  deleteTask as fbDeleteTask,
} from '../firebase/tasks';
import {
  subscribeMoods,
  saveMood,
  subscribeStats,
  updateStreak,
  addFocusMinutes,
  subscribeProfile,
  saveFocusSession,
} from '../firebase/userData';
import { useAuth } from './AuthContext';
import { getMotivationalMessage, getAISuggestion, getMoodAdvice, getTimeOfDay } from '../lib/ai';
import { nextRepeatDate, scheduleTaskReminder } from '../lib/notifications';
import { localDateKey } from '../lib/helpers';
import { MOODS } from '../constants/data';
import { seedTasks } from '../lib/seedTasks';

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
  userName: string;
  aiMessage: string;
  aiSuggestion: string;
  aiLoading: boolean;
  refreshAI: () => void;
  moodAdvice: string;
  moodAdviceLoading: boolean;
  moodHistory: Record<string, string>;
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
  const [mood, setMoodState] = useState<Mood | null>(null);

  const setMood = useCallback((m: Mood | null) => {
    setMoodState(m);
    if (m && userId) {
      saveMood(userId, localDateKey(), m.key);
    }
  }, [userId]);
  const [stressLevel, setStressLevel] = useState(0.3);
  const [energyLevel, setEnergyLevel] = useState(0.6);
  const [focusSession, setFocusSessionState] = useState<FocusSession | null>(null);
  const [focusHours, setFocusHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [aiMessage, setAiMessage] = useState(FALLBACK_MESSAGES.default);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [moodAdvice, setMoodAdvice] = useState('');
  const [moodAdviceLoading, setMoodAdviceLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Record<string, string>>({});

  // Subscribe user profile
  useEffect(() => {
    if (!userId) { setUserName(''); return; }
    return subscribeProfile(userId, ({ name }) => {
      if (name) setUserName(name);
    });
  }, [userId]);

  // Subscribe mood history from Firestore — mood state is always driven by Firestore
  useEffect(() => {
    if (!userId) { setMoodHistory({}); setMoodState(null); return; }
    return subscribeMoods(userId, (history) => {
      setMoodHistory(history);
      const todayKey = localDateKey();
      const todayMoodKey = history[todayKey];
      const found = todayMoodKey ? MOODS.find(m => m.key === todayMoodKey) ?? null : null;
      setMoodState(found);
    });
  }, [userId]);

  // Subscribe streak + focusHours from Firestore
  useEffect(() => {
    if (!userId) return;
    return subscribeStats(userId, ({ streak, focusHours }) => {
      setStreak(streak);
      setFocusHours(focusHours);
    });
  }, [userId]);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seededRef = useRef(false);

  useEffect(() => {
    if (!userId) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeTasks(userId, (t) => {
      setTasks(t);
      setLoading(false);
      // Seed once if user has no tasks yet
      if (t.length === 0 && !seededRef.current) {
        seededRef.current = true;
        seedTasks(userId).catch(() => {});
      }
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

  // Fetch mood-specific advice when mood changes
  useEffect(() => {
    if (!mood) { setMoodAdvice(''); return; }
    setMoodAdviceLoading(true);
    setMoodAdvice('');
    const FALLBACKS: Record<string, string> = {
      awful: "It's okay to have rough days. Take it one breath at a time.",
      sad: "Give yourself grace today. Small steps still count.",
      okay: "Steady is good. Keep going at your own pace.",
      good: "Nice! Channel that good energy into your top task today.",
      great: "You're on fire! Great time to tackle something big.",
    };
    getMoodAdvice(mood.label).then(advice => {
      setMoodAdvice(advice || FALLBACKS[mood.key] || "You've got this.");
      setMoodAdviceLoading(false);
    });
  }, [mood?.key]); // eslint-disable-line

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
    await updateStreak(userId!);

    // If task repeats, create next occurrence automatically
    const task = tasks.find(t => t.id === id);
    if (task && task.repeat !== 'None' && task.repeat !== 'Custom') {
      const nextStart = nextRepeatDate(new Date(task.startDate), task.repeat);
      const nextEnd   = nextRepeatDate(new Date(task.endDate),   task.repeat);
      if (nextStart && nextEnd) {
        const { id: _id, createdAt: _c, ...rest } = task as any;
        await fbAddTask(userId!, {
          ...rest,
          startDate: nextStart,
          endDate:   nextEnd,
          status:    'Not Started',
        });
        if (task.reminder !== 'Custom') {
          scheduleTaskReminder({ id, title: task.title, startDate: nextStart, reminder: task.reminder }).catch(() => {});
        }
      }
    }
  }, [userId, tasks]);

  const setFocusSession = useCallback((s: FocusSession | null) => {
    setFocusSessionState(prev => {
      if (prev && !s && prev.duration && userId) {
        addFocusMinutes(userId, prev.duration);
        saveFocusSession(userId, prev).catch(() => {});
      }
      return s;
    });
  }, [userId]);

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
      focusSession, setFocusSession, focusHours, streak, userName,
      aiMessage, aiSuggestion, aiLoading, refreshAI: fetchAI,
      moodAdvice, moodAdviceLoading, moodHistory,
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
