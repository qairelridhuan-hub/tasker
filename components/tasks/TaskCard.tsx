import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { Task } from '../../context/types';
import { CriticalNames } from '../../constants/theme';
import { subtaskProgress, timeRemaining } from '../../lib/helpers';

interface Props {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
  selected?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#4CAF50',
  'In Progress': '#2196F3',
  'On Hold': '#FF9800',
  'Cancelled': '#9E9E9E',
  'Not Started': '#A0A0A0',
};

export default function TaskCard({ task, onPress, onLongPress, selected }: Props) {
  const criticalColor = Critical[task.criticalLevel];
  const progress = subtaskProgress(task.subtasks);
  const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'Completed' && task.status !== 'Cancelled';

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.card, selected && styles.selected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}>
      <View style={[styles.leftBar, { backgroundColor: criticalColor }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[task.status] }]}>{task.status}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: criticalColor + '15' }]}>
            <Text style={[styles.catText, { color: criticalColor }]}>{task.category}</Text>
          </View>
          {isOverdue && <Text style={styles.overdueTag}>Overdue</Text>}
          <Text style={styles.timeText}>{timeRemaining(new Date(task.endDate))}</Text>
        </View>
        {progress && (
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress.pct * 100}%`, backgroundColor: criticalColor }]} />
            </View>
            <Text style={styles.progressText}>{progress.done}/{progress.total}</Text>
          </View>
        )}
      </View>
      {selected && <View style={styles.checkCircle}><Text style={styles.checkmark}>✓</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  selected: { borderWidth: 2, borderColor: Colors.black },
  leftBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.black, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 11, fontWeight: '500' },
  overdueTag: { fontSize: 11, color: Colors.overdue, fontWeight: '500' },
  timeText: { fontSize: 11, color: Colors.lightGray },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBg: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },
  progressText: { fontSize: 11, color: Colors.lightGray },
  checkCircle: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 12, color: Colors.white },
});
