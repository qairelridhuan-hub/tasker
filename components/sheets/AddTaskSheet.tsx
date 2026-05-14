import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { CATEGORIES, STATUSES, CRITICAL_LEVELS, REMINDERS, REPEATS } from '../../constants/data';
import { useApp } from '../../context/AppContext';
import { Task, Category, TaskStatus, CriticalLevel, ReminderOption, RepeatOption } from '../../context/types';
import { generateId } from '../../lib/helpers';

interface Props {
  onClose: () => void;
  prefillDate?: Date;
}

export default function AddTaskSheet({ onClose, prefillDate }: Props) {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const base = prefillDate ?? new Date();
  const [startDate, setStartDate] = useState(base);
  const [endDate, setEndDate] = useState(new Date(base.getTime() + 3600000));
  const [allDay, setAllDay] = useState(false);
  const [reminder, setReminder] = useState<ReminderOption>('15min');
  const [repeat, setRepeat] = useState<RepeatOption>('None');
  const [criticalLevel, setCriticalLevel] = useState<CriticalLevel>(2);
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    await addTask({
      title: title.trim(), description, category,
      startDate, endDate, allDay, reminder, repeat,
      criticalLevel, status, subtasks, attachments: [],
    });
    onClose();
  };

  const addSub = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks(p => [...p, { id: generateId(), title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput('');
  };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.handle} />
      <Text style={styles.heading}>New Task</Text>

      <Label>Task Title</Label>
      <TextInput style={styles.input} placeholder="Enter task title" placeholderTextColor={Colors.lightGray}
        value={title} onChangeText={setTitle} />

      <Label>Description</Label>
      <TextInput style={[styles.input, styles.multiline]} placeholder="Optional" placeholderTextColor={Colors.lightGray}
        value={description} onChangeText={setDescription} multiline numberOfLines={3} />

      <Label>Category</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          {CATEGORIES.map(c => (
            <Pill key={c} active={category === c} onPress={() => setCategory(c)}>{c}</Pill>
          ))}
        </View>
      </ScrollView>

      <View style={styles.row}>
        <Label>All Day</Label>
        <Switch value={allDay} onValueChange={setAllDay}
          trackColor={{ true: Colors.black, false: Colors.border }}
          thumbColor={Colors.white} />
      </View>

      <Label>Start</Label>
      <TouchableOpacity style={styles.input} onPress={() => setShowStart(true)}>
        <Text style={styles.inputText}>{startDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker value={startDate} mode={allDay ? 'date' : 'datetime'}
          onChange={(_, d) => { setShowStart(false); if (d) setStartDate(d); }} />
      )}

      <Label>End</Label>
      <TouchableOpacity style={styles.input} onPress={() => setShowEnd(true)}>
        <Text style={styles.inputText}>{endDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker value={endDate} mode={allDay ? 'date' : 'datetime'}
          onChange={(_, d) => { setShowEnd(false); if (d) setEndDate(d); }} />
      )}

      <Label>Reminder</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          {REMINDERS.map(r => (
            <Pill key={r} active={reminder === r} onPress={() => setReminder(r)}>{r}</Pill>
          ))}
        </View>
      </ScrollView>

      <Label>Repeat</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          {REPEATS.map(r => (
            <Pill key={r} active={repeat === r} onPress={() => setRepeat(r)}>{r}</Pill>
          ))}
        </View>
      </ScrollView>

      <Label>Critical Level</Label>
      <View style={styles.levelRow}>
        {CRITICAL_LEVELS.map(cl => (
          <TouchableOpacity key={cl.level}
            style={[styles.levelBtn, { borderColor: cl.color },
              criticalLevel === cl.level && { backgroundColor: cl.color }]}
            onPress={() => setCriticalLevel(cl.level as CriticalLevel)}>
            <Text style={[styles.levelNum, criticalLevel === cl.level && { color: Colors.white }]}>{cl.level}</Text>
            <Text style={[styles.levelName, criticalLevel === cl.level && { color: Colors.white }]}>{cl.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label>Status</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          {STATUSES.map(s => (
            <Pill key={s} active={status === s} onPress={() => setStatus(s)}>{s}</Pill>
          ))}
        </View>
      </ScrollView>

      <Label>Subtasks</Label>
      {subtasks.map((s, i) => (
        <View key={s.id} style={styles.subRow}>
          <Text style={styles.subText}>☐ {s.title}</Text>
          <TouchableOpacity onPress={() => setSubtasks(p => p.filter((_, j) => j !== i))}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={styles.subInputRow}>
        <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Add subtask" placeholderTextColor={Colors.lightGray}
          value={subtaskInput} onChangeText={setSubtaskInput} onSubmitEditing={addSub} />
        <TouchableOpacity style={styles.addSubBtn} onPress={addSub}>
          <Text style={styles.addSubText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Task'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Pill({ children, active, onPress }: { children: React.ReactNode; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.pill, active && styles.pillActive]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: 16 },
  label: { fontSize: 12, color: Colors.lightGray, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: Colors.ultraLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.black },
  inputText: { fontSize: 14, color: Colors.black },
  multiline: { height: 72, textAlignVertical: 'top' },
  pillRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  pill: { backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  pillActive: { backgroundColor: Colors.black },
  pillText: { fontSize: 13, color: Colors.black },
  pillTextActive: { color: Colors.white },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  levelRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 58 },
  levelNum: { fontSize: 14, fontWeight: '700', color: Colors.black },
  levelName: { fontSize: 10, color: Colors.black, marginTop: 2 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subText: { fontSize: 14, color: Colors.black },
  removeText: { fontSize: 14, color: Colors.lightGray },
  subInputRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  addSubBtn: { backgroundColor: Colors.black, borderRadius: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addSubText: { fontSize: 22, color: Colors.white },
  saveBtn: { backgroundColor: Colors.black, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
