import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { STATUSES, CATEGORIES, CRITICAL_LEVELS } from '../../constants/data';
import { TaskStatus, CriticalLevel, Category } from '../../context/types';

interface Props {
  filterStatus: TaskStatus[];
  setFilterStatus: (v: TaskStatus[]) => void;
  filterCategory: Category[];
  setFilterCategory: (v: Category[]) => void;
  filterLevel: CriticalLevel[];
  setFilterLevel: (v: CriticalLevel[]) => void;
  sortBy: string;
  setSortBy: (v: any) => void;
  onClose: () => void;
}

const SORTS = [
  { key: 'criticalLevel', label: 'Critical Level' },
  { key: 'endDate', label: 'Due Date' },
  { key: 'createdAt', label: 'Created Date' },
];

export default function FilterSheet(props: Props) {
  const { filterStatus, setFilterStatus, filterCategory, setFilterCategory,
    filterLevel, setFilterLevel, sortBy, setSortBy, onClose } = props;

  const toggleStatus = (s: TaskStatus) =>
    setFilterStatus(filterStatus.includes(s) ? filterStatus.filter(x => x !== s) : [...filterStatus, s]);
  const toggleCat = (c: Category) =>
    setFilterCategory(filterCategory.includes(c) ? filterCategory.filter(x => x !== c) : [...filterCategory, c]);
  const toggleLevel = (l: CriticalLevel) =>
    setFilterLevel(filterLevel.includes(l) ? filterLevel.filter(x => x !== l) : [...filterLevel, l]);

  const reset = () => { setFilterStatus([]); setFilterCategory([]); setFilterLevel([]); setSortBy('criticalLevel'); };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.handle} />
      <View style={styles.titleRow}>
        <Text style={styles.title}>Filter & Sort</Text>
        <TouchableOpacity onPress={reset}><Text style={styles.reset}>Reset</Text></TouchableOpacity>
      </View>

      <Label>Sort By</Label>
      <View style={styles.pillRow}>
        {SORTS.map(s => (
          <Pill key={s.key} active={sortBy === s.key} onPress={() => setSortBy(s.key)}>{s.label}</Pill>
        ))}
      </View>

      <Label>Status</Label>
      <View style={styles.pillRow}>
        {STATUSES.map(s => (
          <Pill key={s} active={filterStatus.includes(s)} onPress={() => toggleStatus(s)}>{s}</Pill>
        ))}
      </View>

      <Label>Category</Label>
      <View style={styles.pillRow}>
        {CATEGORIES.map(c => (
          <Pill key={c} active={filterCategory.includes(c)} onPress={() => toggleCat(c)}>{c}</Pill>
        ))}
      </View>

      <Label>Critical Level</Label>
      <View style={styles.pillRow}>
        {CRITICAL_LEVELS.map(cl => (
          <Pill key={cl.level} active={filterLevel.includes(cl.level as CriticalLevel)}
            onPress={() => toggleLevel(cl.level as CriticalLevel)}
            color={cl.color}>{cl.name}</Pill>
        ))}
      </View>

      <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}
function Pill({ children, active, onPress, color }: { children: React.ReactNode; active: boolean; onPress: () => void; color?: string }) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && (color ? { backgroundColor: color } : styles.pillActive)]}
      onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginVertical: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.black },
  reset: { fontSize: 14, color: Colors.lightGray, textDecorationLine: 'underline' },
  label: { fontSize: 12, color: Colors.lightGray, marginTop: 16, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  pillActive: { backgroundColor: Colors.black },
  pillText: { fontSize: 13, color: Colors.black },
  pillTextActive: { color: Colors.white },
  applyBtn: { backgroundColor: Colors.black, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  applyText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
