import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plus, SmilePlus, Timer, BarChart2, ArrowRight, Flame,
  Moon, Sun, LogOut, Menu,
} from 'lucide-react-native';
import { Animated, useRef } from 'react';
import { Shadow, Critical } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { getGreeting, formatDateLabel, timeRemaining } from '../../lib/helpers';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import BottomSheet from '../../components/BottomSheet';
import AddTaskSheet from '../../components/sheets/AddTaskSheet';
import MoodSheet from '../../components/sheets/MoodSheet';
import FocusSheet from '../../components/sheets/FocusSheet';
import StatsSheet from '../../components/sheets/StatsSheet';
import TaskDetailSheet from '../../components/sheets/TaskDetailSheet';
import { Task } from '../../context/types';

const { height: SH } = Dimensions.get('window');

const ACTIONS = [
  { key: 'add',   label: 'Add Task',  Icon: Plus,      size: 15 },
  { key: 'mood',  label: 'Check In',  Icon: SmilePlus, size: 15 },
  { key: 'focus', label: 'Focus',     Icon: Timer,     size: 15 },
  { key: 'stats', label: 'Stats',     Icon: BarChart2, size: 15 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logOut } = useAuth();
  const { mood, todayTasks, completedToday, overdueTasks, upcomingDeadlines, aiMessage, aiSuggestion, aiLoading, refreshAI, streak } = useApp();

  const [addOpen, setAddOpen]     = useState(false);
  const [moodOpen, setMoodOpen]   = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [pillOpen, setPillOpen]   = useState(false);
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

  const togglePill = (open: boolean) => {
    setPillOpen(open);
    Animated.parallel([
      Animated.spring(pillWidth, { toValue: open ? 1 : 0, useNativeDriver: false, damping: 18, stiffness: 200 } as any),
      Animated.timing(pillOpacity, { toValue: open ? 1 : 0, duration: open ? 200 : 120, useNativeDriver: false }),
    ]).start();
  };

  const handleAction = (key: string) => {
    if (key === 'add')   setAddOpen(true);
    if (key === 'mood')  setMoodOpen(true);
    if (key === 'focus') setFocusOpen(true);
    if (key === 'stats') setStatsOpen(true);
  };

  const remaining = todayTasks.length - completedToday;
  const pct = todayTasks.length > 0 ? completedToday / todayTasks.length : 0;

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{getGreeting()}, Qairel</Text>
            <Text style={s.date}>{formatDateLabel(new Date())}</Text>
          </View>
          <View style={s.iconPill}>
            <Animated.View style={{
              flexDirection: 'row', alignItems: 'center',
              opacity: pillOpacity,
              maxWidth: pillWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }),
              overflow: 'hidden',
            }}>
              <TouchableOpacity style={s.iconPillBtn} onPress={toggleTheme}>
                {isDark ? <Moon size={18} color={theme.text} /> : <Sun size={18} color={theme.text} />}
              </TouchableOpacity>
              <View style={s.iconPillDivider} />
              <TouchableOpacity style={s.iconPillBtn} onPress={logOut}>
                <LogOut size={18} color={theme.text} />
              </TouchableOpacity>
              <View style={s.iconPillDivider} />
            </Animated.View>
            <TouchableOpacity style={s.iconPillBtn} onPress={() => togglePill(!pillOpen)}>
              <Menu size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={s.actionsRow}>
          {ACTIONS.map(({ key, label, Icon, size }) => (
            <TouchableOpacity
              key={key}
              style={[s.actionChip, Shadow.chip]}
              onPress={() => handleAction(key)}
              activeOpacity={0.75}
            >
              <View style={s.actionIcon}>
                <Icon size={size} color={theme.accent} strokeWidth={2} />
              </View>
              <Text style={s.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Progress Card ── */}
        <View style={[s.card, Shadow.card]}>
          <View style={s.cardHeader}>
            <Text style={s.cardLabel}>TODAY</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')} style={s.linkRow}>
              <Text style={s.linkText}>All tasks</Text>
              <ArrowRight size={12} color={theme.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={s.statsInline}>
            <View style={s.statItem}>
              <Text style={s.statNum}>{completedToday}</Text>
              <Text style={s.statLbl}>Done</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statNum}>{remaining}</Text>
              <Text style={s.statLbl}>Left</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statNum, overdueTasks.length > 0 && { color: theme.danger }]}>{overdueTasks.length}</Text>
              <Text style={s.statLbl}>Overdue</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={s.statNum}>{streak}</Text>
                <Flame size={12} color={theme.warning} />
              </View>
              <Text style={s.statLbl}>Streak</Text>
            </View>
          </View>

          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={s.progressMeta}>
            <Text style={s.progressPct}>{Math.round(pct * 100)}%</Text>
            <Text style={s.progressSub}>
              {todayTasks.length === 0 ? 'No tasks scheduled' : `${completedToday} of ${todayTasks.length} complete`}
            </Text>
          </View>
        </View>

        {/* ── AI Insight ── */}
        <View style={[s.insightCard, Shadow.card]}>
          <View style={s.insightHeader}>
            <Text style={s.insightLabel}>AI INSIGHT</Text>
            <TouchableOpacity onPress={refreshAI} disabled={aiLoading}>
              <Text style={[s.refreshBtn, aiLoading && { opacity: 0.4 }]}>↻</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.aiMsgText} numberOfLines={2}>{aiMessage}</Text>
          {aiSuggestion ? (
            <Text style={s.insightText}>{aiSuggestion}</Text>
          ) : aiLoading ? (
            <Text style={s.insightText}>Thinking...</Text>
          ) : null}
          {overdueTasks.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')} style={s.insightBtn}>
              <Text style={s.insightBtnText}>View overdue</Text>
              <ArrowRight size={11} color={theme.danger} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Upcoming ── */}
        {upcomingDeadlines.length > 0 && (
          <View>
            <Text style={s.sectionLabel}>UPCOMING</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chipRow}>
                {upcomingDeadlines.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={[s.chip, Shadow.chip, { borderLeftColor: Critical[task.criticalLevel] }]}
                    onPress={() => setDetailTask(task)}
                  >
                    <Text style={s.chipTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={s.chipTime}>{timeRemaining(new Date(task.endDate))}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

      </ScrollView>

      <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} snapHeight={SH * 0.92}>
        <AddTaskSheet onClose={() => setAddOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={moodOpen} onClose={() => setMoodOpen(false)} snapHeight={SH * 0.72}>
        <MoodSheet onClose={() => setMoodOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={focusOpen} onClose={() => setFocusOpen(false)} snapHeight={SH * 0.65}>
        <FocusSheet onClose={() => setFocusOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={statsOpen} onClose={() => setStatsOpen(false)} snapHeight={SH * 0.6}>
        <StatsSheet onClose={() => setStatsOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={!!detailTask} onClose={() => setDetailTask(null)} snapHeight={SH * 0.85}>
        {detailTask && <TaskDetailSheet task={detailTask} onClose={() => setDetailTask(null)} />}
      </BottomSheet>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },
    content: { paddingHorizontal: 20, paddingBottom: 120 },

    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 16 },
    greeting: { fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
    date: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
    iconPill: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: 999,
      borderWidth: 1, borderColor: theme.border,
      paddingHorizontal: 4, paddingVertical: 4,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    iconPillBtn: { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
    iconPillDivider: { width: 1, height: 16, backgroundColor: theme.border },

    actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    actionChip: {
      flex: 1, alignItems: 'center', gap: 6,
      backgroundColor: theme.surface, borderRadius: 16,
      paddingVertical: 12, paddingHorizontal: 4,
    },
    actionIcon: {
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: `${theme.accent}15`,
      alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: { fontSize: 10, fontWeight: '600', color: theme.text },

    card: { backgroundColor: theme.surface, borderRadius: 20, padding: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardLabel: { fontSize: 11, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '600' },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    linkText: { fontSize: 12, color: theme.textMuted },

    statsInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 22, fontWeight: '700', color: theme.text },
    statLbl: { fontSize: 10, color: theme.textMuted, marginTop: 2, fontWeight: '500' },
    statDivider: { width: 1, height: 28, backgroundColor: theme.border },

    progressBg: { height: 4, backgroundColor: theme.border, borderRadius: 2, marginBottom: 8 },
    progressFill: { height: 4, backgroundColor: theme.accent, borderRadius: 2 },
    progressMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    progressPct: { fontSize: 13, fontWeight: '700', color: theme.text },
    progressSub: { fontSize: 12, color: theme.textMuted },

    insightCard: { backgroundColor: theme.surface, borderRadius: 20, padding: 18, marginBottom: 20 },
    insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    insightLabel: { fontSize: 11, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '600' },
    refreshBtn: { fontSize: 18, color: theme.textMuted },
    aiMsgText: { fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 20, marginBottom: 6 },
    insightText: { fontSize: 13, color: theme.textMuted, lineHeight: 19 },
    insightBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
    insightBtnText: { fontSize: 12, color: theme.danger, fontWeight: '600' },

    sectionLabel: { fontSize: 11, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '600', marginBottom: 10 },
    chipRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    chip: { backgroundColor: theme.surface, borderRadius: 14, padding: 14, minWidth: 150, borderLeftWidth: 3 },
    chipTitle: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 4 },
    chipTime: { fontSize: 11, color: theme.textMuted },
  });
}
