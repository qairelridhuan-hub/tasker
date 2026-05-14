import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { Task, TaskStatus } from '../../context/types';
import { STATUSES } from '../../constants/data';
import { timeRemaining } from '../../lib/helpers';

const COLUMN_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

interface Props {
  tasks: Task[];
  onTaskPress: (t: Task) => void;
}

export default function KanbanView({ tasks, onTaskPress }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {COLUMN_STATUSES.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        return (
          <View key={col} style={styles.column}>
            <View style={styles.colHeader}>
              <Text style={styles.colTitle}>{col}</Text>
              <Text style={styles.colCount}>{colTasks.length}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {colTasks.map(task => (
                <TouchableOpacity key={task.id} style={[styles.card, Shadow.chip]} onPress={() => onTaskPress(task)}>
                  <View style={[styles.levelDot, { backgroundColor: Critical[task.criticalLevel] }]} />
                  <Text style={styles.cardTitle} numberOfLines={2}>{task.title}</Text>
                  <Text style={styles.cardCat}>{task.category}</Text>
                  <Text style={styles.cardTime}>{timeRemaining(new Date(task.endDate))}</Text>
                </TouchableOpacity>
              ))}
              {colTasks.length === 0 && (
                <View style={styles.emptyCol}>
                  <Text style={styles.emptyColText}>No tasks</Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingLeft: 20 },
  column: { width: 200, marginRight: 12, marginBottom: 100 },
  colHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  colTitle: { fontSize: 13, fontWeight: '600', color: Colors.black },
  colCount: { fontSize: 12, color: Colors.lightGray, backgroundColor: Colors.ultraLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  levelDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: Colors.black, marginBottom: 6, lineHeight: 18 },
  cardCat: { fontSize: 11, color: Colors.lightGray, marginBottom: 4 },
  cardTime: { fontSize: 11, color: Colors.gray },
  emptyCol: { paddingTop: 20, alignItems: 'center' },
  emptyColText: { fontSize: 13, color: Colors.lightGray },
});
