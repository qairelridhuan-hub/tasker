import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { Task } from '../../context/types';

interface Props {
  tasks: Task[];
  onTaskPress: (t: Task) => void;
  onDatePress: (d: Date) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ tasks, onTaskPress, onDatePress }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getTasksForDay = (day: number) => {
    const d = new Date(year, month, day);
    return tasks.filter(t => {
      const s = new Date(t.startDate);
      const e = new Date(t.endDate);
      return d >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
        d <= new Date(e.getFullYear(), e.getMonth(), e.getDate());
    });
  };

  const selectedDayTasks = selectedDate
    ? getTasksForDay(selectedDate.getDate())
    : [];

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.container}>
      {/* Month nav */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <ChevronLeft size={20} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <ChevronRight size={20} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAYS.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`empty-${i}`} style={styles.cell} />;
          const dayTasks = getTasksForDay(day);
          const highestLevel = dayTasks.reduce((max, t) => Math.max(max, t.criticalLevel), 0);
          return (
            <TouchableOpacity key={day} style={[styles.cell,
              isSelected(day) && styles.cellSelected,
              isToday(day) && !isSelected(day) && styles.cellToday]}
              onPress={() => {
                const d = new Date(year, month, day);
                setSelectedDate(d);
              }}
              onLongPress={() => onDatePress(new Date(year, month, day))}>
              <Text style={[styles.dayNum,
                isSelected(day) && styles.dayNumSelected,
                isToday(day) && !isSelected(day) && styles.dayNumToday]}>
                {day}
              </Text>
              {dayTasks.length > 0 && (
                <View style={[styles.dot, { backgroundColor: Critical[highestLevel] ?? Colors.black }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day tasks */}
      <ScrollView style={styles.dayList} showsVerticalScrollIndicator={false}>
        {selectedDate && (
          <Text style={styles.dayListTitle}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        )}
        {selectedDayTasks.length === 0 ? (
          <TouchableOpacity style={styles.emptyDay} onPress={() => selectedDate && onDatePress(selectedDate)}>
            <Text style={styles.emptyDayText}>No tasks · Tap to add</Text>
          </TouchableOpacity>
        ) : (
          selectedDayTasks.map(task => (
            <TouchableOpacity key={task.id} style={[styles.taskBar, Shadow.chip, { borderLeftColor: Critical[task.criticalLevel] }]}
              onPress={() => onTaskPress(task)}>
              <Text style={styles.taskBarTitle} numberOfLines={1}>{task.title}</Text>
              <Text style={styles.taskBarStatus}>{task.status}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 4 },
  monthTitle: { fontSize: 16, fontWeight: '600', color: Colors.black },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, color: Colors.lightGray, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  cellSelected: { backgroundColor: Colors.black, borderRadius: 10 },
  cellToday: { backgroundColor: Colors.ultraLight, borderRadius: 10 },
  dayNum: { fontSize: 13, color: Colors.black, fontWeight: '400' },
  dayNumSelected: { color: Colors.white, fontWeight: '600' },
  dayNumToday: { color: Colors.black, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dayList: { flex: 1, marginTop: 16 },
  dayListTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray, marginBottom: 10 },
  taskBar: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3 },
  taskBarTitle: { fontSize: 13, fontWeight: '500', color: Colors.black, marginBottom: 3 },
  taskBarStatus: { fontSize: 11, color: Colors.lightGray },
  emptyDay: { paddingVertical: 20, alignItems: 'center' },
  emptyDayText: { fontSize: 13, color: Colors.lightGray },
});
