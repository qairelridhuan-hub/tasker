import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Plus, SmilePlus, Timer, BarChart2, TrendingUp, ArrowRight, Flame,
  Moon, Sun, LogOut, Menu, CalendarDays, Smile,
} from 'lucide-react-native';
import { Shadow, Critical } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { getGreeting, formatDateLabel, timeRemaining, localDateKey } from '../../lib/helpers';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import BottomSheet from '../../components/BottomSheet';
import AddTaskSheet from '../../components/sheets/AddTaskSheet';
import MoodSheet from '../../components/sheets/MoodSheet';
import FocusSheet from '../../components/sheets/FocusSheet';
import StatsSheet from '../../components/sheets/StatsSheet';
import TaskDetailSheet from '../../components/sheets/TaskDetailSheet';
import ChatSheet from '../../components/sheets/ChatSheet';
import MoodCalendarSheet from '../../components/sheets/MoodCalendarSheet';
import { Task } from '../../context/types';

const { height: SH } = Dimensions.get('window');

const ACTIONS = [
  { key: 'add',       label: 'Add Task',   Icon: Plus,        size: 16 },
  { key: 'mood',      label: 'Check In',   Icon: SmilePlus,   size: 16 },
  { key: 'focus',     label: 'Focus',      Icon: Timer,       size: 16 },
  { key: 'stats',     label: 'Stats',      Icon: BarChart2,   size: 16 },
  { key: 'analytics', label: 'Analytics',  Icon: TrendingUp,  size: 16 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logOut } = useAuth();
  const { todayTasks, completedToday, overdueTasks, streak, refreshAI, userName, moodHistory, mood, moodAdvice } = useApp();

  useFocusEffect(useCallback(() => {
    refreshAI();
    return () => {
      // Collapse FAB and pill when leaving the tab
      toggle(false);
      togglePill(false);
    };
  }, [refreshAI]));

  const [addOpen, setAddOpen]     = useState(false);
  const [moodOpen, setMoodOpen]   = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [chatOpen, setChatOpen]         = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [expanded, setExpanded]   = useState(false);
  const [pillOpen, setPillOpen]   = useState(false);

  const pillWidth   = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const rotate      = useRef(new Animated.Value(0)).current;
  const itemAnims   = useRef(ACTIONS.map(() => ({
    translateX: new Animated.Value(-10),
    opacity:    new Animated.Value(0),
    scale:      new Animated.Value(0.7),
  }))).current;

  const togglePill = (open: boolean) => {
    setPillOpen(open);
    Animated.parallel([
      Animated.spring(pillWidth,   { toValue: open ? 1 : 0, useNativeDriver: false, damping: 18, stiffness: 200 } as any),
      Animated.timing(pillOpacity, { toValue: open ? 1 : 0, duration: open ? 200 : 120, useNativeDriver: false }),
    ]).start();
  };

  const toggle = (open: boolean) => {
    setExpanded(open);
    Animated.parallel([
      Animated.spring(rotate, { toValue: open ? 1 : 0, useNativeDriver: true, damping: 15, stiffness: 200 }),
      ...itemAnims.map((a, i) =>
        Animated.parallel([
          Animated.spring(a.translateX, { toValue: open ? 0 : -10, useNativeDriver: true, damping: 14, stiffness: 180 } as any),
          Animated.timing(a.opacity,    { toValue: open ? 1 : 0, duration: open ? 160 : 100, delay: open ? i * 45 : (ACTIONS.length - 1 - i) * 25, useNativeDriver: true }),
          Animated.spring(a.scale,      { toValue: open ? 1 : 0.7, useNativeDriver: true, damping: 14, stiffness: 200, delay: open ? i * 45 : 0 } as any),
        ])
      ),
    ]).start();
  };

  const handleAction = (key: string) => {
    if (key === 'add')       setAddOpen(true);
    if (key === 'mood')      setMoodOpen(true);
    if (key === 'focus')     setFocusOpen(true);
    if (key === 'stats')     setStatsOpen(true);
    if (key === 'analytics') router.push('/(tabs)/analytics');
    toggle(false);
  };

  const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const remaining = todayTasks.length - completedToday;
  const pct = todayTasks.length > 0 ? completedToday / todayTasks.length : 0;
  const now = new Date();
  const todayKey = localDateKey(now);
  const hasTodayMood = !!moodHistory[todayKey];
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
          <Text style={s.greeting}>{getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}</Text>
          <Text style={s.date}>{formatDateLabel(new Date())}</Text>

          {/* FAB row */}
          <View style={s.fabContainer}>
            <TouchableOpacity style={s.mainFab} onPress={() => toggle(!expanded)} activeOpacity={0.85}>
              <Animated.View style={{ transform: [{ rotate: rotateInterp }] }}>
                <Plus size={20} color="#fff" strokeWidth={2.5} />
              </Animated.View>
            </TouchableOpacity>
            {ACTIONS.map((action, i) => {
              const anim = itemAnims[i];
              const IconComp = action.Icon;
              return (
                <View key={action.key} pointerEvents={expanded ? 'auto' : 'none'}>
                  <Animated.View style={{ opacity: anim.opacity, transform: [{ translateX: anim.translateX }, { scale: anim.scale }] }}>
                    <TouchableOpacity style={[s.subBtnInner, Shadow.chip]} onPress={() => handleAction(action.key)} activeOpacity={0.75}>
                      <IconComp size={22} color={theme.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
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


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── Mood Card ── */}
        {hasTodayMood && mood ? (
          <TouchableOpacity style={[s.moodCard, Shadow.card]} onPress={() => setChatOpen(true)} activeOpacity={0.85}>
            <View style={s.moodCardIconWrap}>
              <Smile size={22} color={theme.text} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.moodCardName} numberOfLines={1}>Feeling {mood.label}</Text>
              {moodAdvice ? <Text style={s.moodCardSub} numberOfLines={1}>{moodAdvice}</Text> : null}
            </View>
            <View style={s.moodCardActions}>
              <TouchableOpacity style={s.moodCardBtn} onPress={(e) => { e.stopPropagation(); setCalendarOpen(true); }} activeOpacity={0.7}>
                <CalendarDays size={20} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
              <View style={[s.moodCardBtn, s.moodCardBtnLight]}>
                <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.moodCard, Shadow.card]} onPress={() => setMoodOpen(true)} activeOpacity={0.85}>
            <View style={s.moodCardIconWrap}>
              <Smile size={22} color={theme.textMuted} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.moodCardName}>How are you feeling?</Text>
              <Text style={s.moodCardSub} numberOfLines={1}>Tap to log your mood for today</Text>
            </View>
            <ArrowRight size={16} color={theme.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        )}

{/* ── Today's Overview ── */}
        <View style={[s.card, Shadow.card]}>
          {/* Header */}
          <View style={s.cardHeader}>
            <View>
              <Text style={s.cardLabel}>TODAY'S OVERVIEW</Text>
              <Text style={s.cardSubLabel}>
                {todayTasks.length === 0 ? 'No tasks scheduled' : `${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} today`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')} style={s.jumpBtn}>
              <Text style={s.jumpBtnText}>Tasks</Text>
              <ArrowRight size={12} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
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
              <Text style={[s.statNum, overdueTasks.length > 0 && { color: theme.danger }]}>
                {overdueTasks.length}
              </Text>
              <Text style={s.statLbl}>Overdue</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={s.statNum}>{streak}</Text>
                <Flame size={12} color={theme.textMuted} />
              </View>
              <Text style={s.statLbl}>Streak</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={s.progressMeta}>
            <Text style={s.progressPct}>{Math.round(pct * 100)}%</Text>
            <Text style={s.progressSub}>
              {todayTasks.length === 0 ? 'No tasks scheduled' : `${completedToday} of ${todayTasks.length} complete`}
            </Text>
          </View>

          {/* Due in 24h */}
          {(() => {
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const dueSoon = todayTasks.filter(t =>
              new Date(t.endDate) > now &&
              new Date(t.endDate) <= in24h &&
              t.status !== 'Completed' && t.status !== 'Cancelled'
            ).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

            if (dueSoon.length === 0) return null;
            return (
              <View style={s.due24Wrap}>
                <Text style={s.due24Label}>DUE IN 24H</Text>
                {dueSoon.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={s.due24Row}
                    onPress={() => setDetailTask(task)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.due24Dot, { backgroundColor: Critical[task.criticalLevel] }]} />
                    <Text style={s.due24Title} numberOfLines={1}>{task.title}</Text>
                    <Text style={s.due24Time}>{timeRemaining(new Date(task.endDate))}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* Overdue list */}
          {overdueTasks.length > 0 && (
            <View style={s.due24Wrap}>
              <Text style={[s.due24Label, { color: theme.danger }]}>OVERDUE</Text>
              {overdueTasks.slice(0, 3).map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={s.due24Row}
                  onPress={() => setDetailTask(task)}
                  activeOpacity={0.7}
                >
                  <View style={[s.due24Dot, { backgroundColor: theme.danger }]} />
                  <Text style={s.due24Title} numberOfLines={1}>{task.title}</Text>
                  <Text style={[s.due24Time, { color: theme.danger }]}>{timeRemaining(new Date(task.endDate))}</Text>
                </TouchableOpacity>
              ))}
              {overdueTasks.length > 3 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')} activeOpacity={0.7}>
                  <Text style={[s.due24Time, { color: theme.danger, marginTop: 4 }]}>
                    +{overdueTasks.length - 3} more overdue
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

      </ScrollView>



      <BottomSheet visible={addOpen} onClose={() => setAddOpen(false)} snapHeight={SH * 0.92}>
        <AddTaskSheet onClose={() => setAddOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={moodOpen} onClose={() => setMoodOpen(false)} snapHeight={SH * 0.62} hideClose>
        <MoodSheet onClose={() => setMoodOpen(false)} onOpenCalendar={() => { setMoodOpen(false); setCalendarOpen(true); }} />
      </BottomSheet>
      <BottomSheet visible={focusOpen} onClose={() => setFocusOpen(false)} snapHeight={SH * 0.65}>
        <FocusSheet onClose={() => setFocusOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={statsOpen} onClose={() => setStatsOpen(false)} snapHeight={SH * 0.6}>
        <StatsSheet onClose={() => setStatsOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={chatOpen} onClose={() => setChatOpen(false)} snapHeight={SH * 0.88}>
        <ChatSheet onClose={() => setChatOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={calendarOpen} onClose={() => setCalendarOpen(false)} snapHeight={SH * 0.72}>
        <MoodCalendarSheet onClose={() => setCalendarOpen(false)} />
      </BottomSheet>
      <BottomSheet visible={!!detailTask} onClose={() => setDetailTask(null)} snapHeight={SH * 0.85}>
        {detailTask && <TaskDetailSheet task={detailTask} onClose={() => setDetailTask(null)} />}
      </BottomSheet>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: theme.bg },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },

    header: {
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
    },
    greeting: { fontSize: 18, fontWeight: '700', color: theme.text, letterSpacing: -0.3 },
    date:     { fontSize: 12, color: theme.textMuted, marginTop: 2 },

    iconPill: {
      position: 'absolute', top: 12, right: 20,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface, borderRadius: 999,
      borderWidth: 1, borderColor: theme.border,
      paddingHorizontal: 4, paddingVertical: 4,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    iconPillBtn:     { paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
    iconPillDivider: { width: 1, height: 16, backgroundColor: theme.border },

    /* FAB */
    fabContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    mainFab: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: '#000',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 }, elevation: 8,
    },
    subBtnInner: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: theme.surface,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: theme.border,
    },

    card:       { backgroundColor: theme.surface, borderRadius: 20, padding: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardLabel:  { fontSize: 11, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '600' },
    linkRow:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
    linkText:   { fontSize: 12, color: theme.textMuted },

    statsInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    statItem:    { flex: 1, alignItems: 'center' },
    statNum:     { fontSize: 22, fontWeight: '700', color: theme.text },
    statLbl:     { fontSize: 10, color: theme.textMuted, marginTop: 2, fontWeight: '500' },
    statDivider: { width: 1, height: 28, backgroundColor: theme.border },

    progressBg:   { height: 4, backgroundColor: theme.border, borderRadius: 2, marginBottom: 8 },
    progressFill: { height: 4, backgroundColor: theme.accent, borderRadius: 2 },
    progressMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    progressPct:  { fontSize: 13, fontWeight: '700', color: theme.text },
    progressSub:  { fontSize: 12, color: theme.textMuted },

    insightCard:    { backgroundColor: theme.surface, borderRadius: 20, padding: 18, marginBottom: 12 },
    insightHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    insightIconWrap:{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    insightLabel:   { fontSize: 10, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '700', marginBottom: 2 },
    aiMsgText:      { fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 20 },
    refreshIconBtn: { padding: 6 },
    insightText:    { fontSize: 13, color: theme.textMuted, lineHeight: 19, marginTop: 8 },
    insightBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
    insightBtnText: { fontSize: 12, color: theme.danger, fontWeight: '600' },
    refreshBtn:     { fontSize: 18, color: theme.textMuted },


    sectionLabel: { fontSize: 11, color: theme.textMuted, letterSpacing: 0.8, fontWeight: '600', marginBottom: 10 },
    chipRow:      { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    chip:         { backgroundColor: theme.surface, borderRadius: 14, padding: 14, minWidth: 150, borderLeftWidth: 3 },
    chipTitle:    { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 4 },
    chipTime:     { fontSize: 11, color: theme.textMuted },

    moodCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: theme.surface, borderRadius: 999,
      paddingHorizontal: 10, paddingVertical: 10,
      marginBottom: 12,
    },
    moodPillRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    moodPill:            { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
    moodPillReminder:    { borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
    moodPillText:        { fontSize: 13, fontWeight: '600', color: theme.text },
    moodPillAdvice:      { flex: 1, fontSize: 12, color: theme.textMuted },
    moodPillReminderText:{ flex: 1, fontSize: 13, color: theme.textMuted },
    moodPillIcon:        { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
    moodCardTop:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
    moodCardIconWrap:{ width: 46, height: 46, borderRadius: 23, backgroundColor: `${theme.accent}12`, alignItems: 'center', justifyContent: 'center' },
    moodCardTag:     { fontSize: 10, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.8, marginBottom: 1 },
    moodCardName:    { fontSize: 12, fontWeight: '700', color: theme.text },
    moodCardActions: { flexDirection: 'row', gap: 6 },
    moodCardBtn:     { width: 46, height: 46, borderRadius: 23, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
    moodCardBtnLight:{ backgroundColor: '#444' },
    moodCardAdvice:  { fontSize: 13, color: theme.textMuted, lineHeight: 19, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border },
    moodCardSub:     { fontSize: 11, color: theme.textMuted, marginTop: 1 },

    cardSubLabel: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
    jumpBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#111', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    jumpBtnText:  { fontSize: 12, fontWeight: '600', color: '#fff' },

    due24Wrap:  { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.border, gap: 8 },
    due24Label: { fontSize: 10, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.8, marginBottom: 2 },
    due24Row:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
    due24Dot:   { width: 7, height: 7, borderRadius: 4 },
    due24Title: { flex: 1, fontSize: 13, fontWeight: '500', color: theme.text },
    due24Time:  { fontSize: 11, color: theme.textMuted },
  });
}
