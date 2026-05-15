import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Angry, Frown, Meh, Smile, Laugh } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const MOOD_ICONS: Record<string, React.ComponentType<any>> = {
  awful: Angry, sad: Frown, okay: Meh, good: Smile, great: Laugh,
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun,1=Mon... convert to Mon=0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MoodCalendarSheet({ onClose }: { onClose: () => void }) {
  const { moodHistory } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  return (
    <View style={s.container}>
      <View style={s.handle} />

      {/* Month nav */}
      <View style={s.navRow}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
          <ChevronLeft size={20} color="#111" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
          <ChevronRight size={20} color="#111" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={s.dayHeaders}>
        {DAYS.map(d => (
          <Text key={d} style={s.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={s.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={s.cell} />;
          const key = toKey(year, month, day);
          const moodKey = moodHistory[key];
          const Icon = moodKey ? MOOD_ICONS[moodKey] : null;
          const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate();

          return (
            <View key={i} style={s.cell}>
              <View style={[s.dayCircle, Icon && s.dayCircleFilled, isToday && !Icon && s.dayCircleToday]}>
                {Icon
                  ? <Icon size={18} color="#fff" strokeWidth={1.8} />
                  : <Text style={[s.dayNum, Icon && { color: '#fff' }, isToday && s.dayNumToday]}>{day}</Text>
                }
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 32 },
  handle: {
    width: 40, height: 4, backgroundColor: '#E0E0E0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  navBtn: { padding: 6 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#999' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', alignItems: 'center', marginBottom: 8 },
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  dayCircleFilled: { backgroundColor: '#111' },
  dayCircleToday: { backgroundColor: '#E8E8E8', borderWidth: 1.5, borderColor: '#111' },
  dayNum: { fontSize: 12, fontWeight: '500', color: '#555' },
  dayNumToday: { color: '#111', fontWeight: '700' },
});
