import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Smile, Timer, BarChart2, ChevronRight } from 'lucide-react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { getGreeting, formatDateLabel, timeRemaining } from '../../lib/helpers';
import BottomSheet from '../../components/BottomSheet';
import AddTaskSheet from '../../components/sheets/AddTaskSheet';
import MoodSheet from '../../components/sheets/MoodSheet';
import FocusSheet from '../../components/sheets/FocusSheet';
import StatsSheet from '../../components/sheets/StatsSheet';
import TaskDetailSheet from '../../components/sheets/TaskDetailSheet';
import { Task } from '../../context/types';

const { height: SH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const {
    mood, todayTasks, completedToday, overdueTasks, upcomingDeadlines, aiMessage,
  } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const remaining = todayTasks.length - completedToday;
  const pct = todayTasks.length > 0 ? completedToday / todayTasks.length : 0;

  const aiSuggestion = overdueTasks.length > 0
    ? `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} overdue. Focus on these first.`
    : remaining === 0 && todayTasks.length > 0
    ? "All done for today! Great work 🎉"
    : aiMessage;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Qairel 👋</Text>
            <Text style={styles.dateText}>{formatDateLabel(new Date())}</Text>
            <Text style={styles.aiText} numberOfLines={2}>{aiMessage}</Text>
          </View>
          {mood && (
            <TouchableOpacity style={styles.moodBadge} onPress={() => setMoodOpen(true)}>
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Today's Overview ── */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>TODAY</Text>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewBig}>{todayTasks.length}</Text>
              <Text style={styles.overviewSub}>Total Tasks</Text>
            </View>
            <View>
              <Text style={styles.overviewBig}>{completedToday}</Text>
              <Text style={styles.overviewSub}>Completed</Text>
            </View>
            <View>
              <Text style={[styles.overviewBig, overdueTasks.length > 0 && styles.overdueText]}>
                {overdueTasks.length}
              </Text>
              <Text style={styles.overviewSub}>Overdue</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{Math.round(pct * 100)}% complete</Text>
            <Text style={styles.progressText}>{remaining} remaining</Text>
          </View>
          <TouchableOpacity style={styles.jumpBtn} onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.jumpText}>Go to Tasks</Text>
            <ChevronRight size={14} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* ── AI Suggestion ── */}
        <View style={[styles.card, styles.aiCard, Shadow.card]}>
          <Text style={styles.cardLabel}>AI SUGGESTION</Text>
          <Text style={styles.aiSuggestion}>{aiSuggestion}</Text>
          {overdueTasks.length > 0 && (
            <TouchableOpacity style={styles.aiActionBtn} onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={styles.aiActionText}>View Tasks</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Upcoming Deadlines ── */}
        {upcomingDeadlines.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>UPCOMING</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {upcomingDeadlines.map(task => (
                  <TouchableOpacity key={task.id}
                    style={[styles.deadlineChip, Shadow.chip, { borderLeftColor: Critical[task.criticalLevel] }]}
                    onPress={() => setDetailTask(task)}>
                    <Text style={styles.chipTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.chipTime}>{timeRemaining(new Date(task.endDate))}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* ── Action Buttons ── */}
        <View style={styles.btnGrid}>
          <ActionBtn icon={<Plus size={20} color={Colors.black} />} label="Add Task" onPress={() => setAddOpen(true)} />
          <ActionBtn
            icon={<Text style={{ fontSize: 20 }}>{mood?.emoji ?? '😊'}</Text>}
            label="Check In"
            onPress={() => setMoodOpen(true)}
          />
          <ActionBtn icon={<Timer size={20} color={Colors.black} />} label="Focus" onPress={() => setFocusOpen(true)} />
          <ActionBtn icon={<BarChart2 size={20} color={Colors.black} />} label="My Stats" onPress={() => setStatsOpen(true)} />
        </View>

      </ScrollView>

      {/* ── Bottom Sheets ── */}
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

function ActionBtn({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, Shadow.card]} onPress={onPress}>
      {icon}
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8, paddingBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  dateText: { fontSize: 14, color: Colors.gray, marginBottom: 4 },
  aiText: { fontSize: 14, color: Colors.gray, fontStyle: 'italic', maxWidth: 260 },
  moodBadge: { backgroundColor: Colors.white, borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', ...Shadow.chip },
  moodEmoji: { fontSize: 22 },

  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  aiCard: { borderLeftWidth: 3, borderLeftColor: Colors.black },
  cardLabel: { fontSize: 12, color: Colors.lightGray, marginBottom: 12, letterSpacing: 0.5 },

  overviewRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  overviewBig: { fontSize: 28, fontWeight: '700', color: Colors.black },
  overviewSub: { fontSize: 12, color: Colors.lightGray, marginTop: 2 },
  overdueText: { color: Colors.overdue },

  progressBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: Colors.black, borderRadius: 2 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressText: { fontSize: 12, color: Colors.lightGray },

  jumpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jumpText: { fontSize: 12, color: Colors.black, textDecorationLine: 'underline' },

  aiSuggestion: { fontSize: 14, fontWeight: '500', color: Colors.black, lineHeight: 20 },
  aiActionBtn: { alignSelf: 'flex-start', backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginTop: 12 },
  aiActionText: { fontSize: 12, color: Colors.black, fontWeight: '500' },

  sectionLabel: { fontSize: 12, color: Colors.lightGray, letterSpacing: 0.5, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  deadlineChip: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, minWidth: 140, borderLeftWidth: 3 },
  chipTitle: { fontSize: 13, fontWeight: '500', color: Colors.black, marginBottom: 4 },
  chipTime: { fontSize: 11, color: Colors.lightGray },

  btnGrid: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 6 },
  actionLabel: { fontSize: 11, color: Colors.gray },
});
