import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { Task, TaskStatus } from '../../context/types';
import { useApp } from '../../context/AppContext';
import { STATUSES } from '../../constants/data';
import { CriticalNames } from '../../constants/theme';
import { formatDateTime, getDuration, timeRemaining, subtaskProgress } from '../../lib/helpers';

interface Props {
  task: Task;
  onClose: () => void;
  onEdit?: () => void;
}

export default function TaskDetailSheet({ task, onClose, onEdit }: Props) {
  const { updateTask, deleteTask, completeTask, toggleSubtask } = useApp();
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const progress = subtaskProgress(task.subtasks);
  const criticalColor = Critical[task.criticalLevel];

  const changeStatus = async (s: TaskStatus) => {
    setStatus(s);
    await updateTask(task.id, { status: s });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTask(task.id); onClose(); } },
    ]);
  };

  const handleComplete = async () => {
    await completeTask(task.id);
    onClose();
  };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.handle} />

      {/* Critical bar */}
      <View style={[styles.criticalBar, { backgroundColor: criticalColor }]} />

      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: criticalColor + '20' }]}>
          <Text style={[styles.badgeText, { color: criticalColor }]}>
            {CriticalNames[task.criticalLevel]}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: Colors.ultraLight }]}>
          <Text style={styles.statusBadgeText}>{task.status}</Text>
        </View>
      </View>

      <Text style={styles.title}>{task.title}</Text>
      {!!task.description && <Text style={styles.desc}>{task.description}</Text>}

      <View style={styles.infoRow}>
        <InfoItem label="Category" value={task.category} />
        <InfoItem label="Duration" value={getDuration(task.startDate, task.endDate)} />
        <InfoItem label="Remaining" value={timeRemaining(task.endDate)} />
      </View>

      <View style={styles.dateRow}>
        <InfoItem label="Start" value={formatDateTime(new Date(task.startDate))} />
        <InfoItem label="End" value={formatDateTime(new Date(task.endDate))} />
      </View>

      {/* Status selector */}
      <Text style={styles.label}>Change Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          {STATUSES.map(s => (
            <TouchableOpacity key={s}
              style={[styles.pill, status === s && styles.pillActive]}
              onPress={() => changeStatus(s)}>
              <Text style={[styles.pillText, status === s && styles.pillTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Subtasks */}
      {task.subtasks.length > 0 && (
        <>
          <Text style={styles.label}>
            Subtasks {progress ? `${progress.done}/${progress.total}` : ''}
          </Text>
          {progress && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.pct * 100}%` }]} />
            </View>
          )}
          {task.subtasks.map(s => (
            <TouchableOpacity key={s.id} style={styles.subtaskRow}
              onPress={() => toggleSubtask(task.id, s.id)}>
              <View style={[styles.checkbox, s.completed && styles.checkboxDone]}>
                {s.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.subtaskText, s.completed && styles.subtaskDone]}>{s.title}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
          <Text style={styles.completeBtnText}>Mark Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginRight: 20 }}>
      <Text style={{ fontSize: 11, color: Colors.lightGray }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.black, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  criticalBar: { height: 3, borderRadius: 2, marginBottom: 16 },
  header: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, color: Colors.gray },
  title: { fontSize: 20, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  desc: { fontSize: 14, color: Colors.gray, lineHeight: 20, marginBottom: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  dateRow: { flexDirection: 'row', marginBottom: 20 },
  label: { fontSize: 12, color: Colors.lightGray, marginTop: 16, marginBottom: 8 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  pillActive: { backgroundColor: Colors.black },
  pillText: { fontSize: 12, color: Colors.black },
  pillTextActive: { color: Colors.white },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: 12 },
  progressFill: { height: 4, backgroundColor: Colors.black, borderRadius: 2 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.black, borderColor: Colors.black },
  checkmark: { fontSize: 12, color: Colors.white },
  subtaskText: { fontSize: 14, color: Colors.black },
  subtaskDone: { color: Colors.lightGray, textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  completeBtn: { flex: 1, backgroundColor: Colors.black, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  completeBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  deleteBtn: { flex: 1, backgroundColor: Colors.ultraLight, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#111111' },
});
