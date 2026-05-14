import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, FlatList, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, CriticalLevel, Category } from '../../context/types';
import TaskCard from '../../components/tasks/TaskCard';
import BottomSheet from '../../components/BottomSheet';
import AddTaskSheet from '../../components/sheets/AddTaskSheet';
import TaskDetailSheet from '../../components/sheets/TaskDetailSheet';
import FilterSheet from '../../components/sheets/FilterSheet';
import KanbanView from '../../components/tasks/KanbanView';
import CalendarView from '../../components/tasks/CalendarView';
import { STATUSES, CATEGORIES, CRITICAL_LEVELS } from '../../constants/data';

const { height: SH } = Dimensions.get('window');
type ViewTab = 'List' | 'Kanban' | 'Calendar';

export default function TasksScreen() {
  const { tasks, loading } = useApp();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewTab>('List');
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus[]>([]);
  const [filterCategory, setFilterCategory] = useState<Category[]>([]);
  const [filterLevel, setFilterLevel] = useState<CriticalLevel[]>([]);
  const [sortBy, setSortBy] = useState<'criticalLevel' | 'endDate' | 'createdAt'>('criticalLevel');
  const [prefillDate, setPrefillDate] = useState<Date | undefined>();

  const filtered = useMemo(() => {
    let list = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    if (filterStatus.length) list = list.filter(t => filterStatus.includes(t.status));
    if (filterCategory.length) list = list.filter(t => filterCategory.includes(t.category));
    if (filterLevel.length) list = list.filter(t => filterLevel.includes(t.criticalLevel));
    list = [...list].sort((a, b) => {
      if (sortBy === 'criticalLevel') return b.criticalLevel - a.criticalLevel;
      if (sortBy === 'endDate') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [tasks, search, filterStatus, filterCategory, filterLevel, sortBy]);

  const bulkMode = selectedIds.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const { completeTask, deleteTask } = useApp();

  const bulkComplete = async () => {
    await Promise.all(selectedIds.map(id => completeTask(id)));
    setSelectedIds([]);
  };

  const bulkDelete = async () => {
    await Promise.all(selectedIds.map(id => deleteTask(id)));
    setSelectedIds([]);
  };

  const hasFilters = filterStatus.length + filterCategory.length + filterLevel.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.lightGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks…"
            placeholderTextColor={Colors.lightGray}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={Colors.lightGray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
          onPress={() => setFilterOpen(true)}>
          <SlidersHorizontal size={18} color={hasFilters ? Colors.white : Colors.black} />
        </TouchableOpacity>
      </View>

      {/* View Tabs */}
      <View style={styles.tabRow}>
        {(['List', 'Kanban', 'Calendar'] as ViewTab[]).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, view === tab && styles.tabActive]} onPress={() => setView(tab)}>
            <Text style={[styles.tabText, view === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bulk Actions Bar */}
      {bulkMode && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkCount}>{selectedIds.length} selected</Text>
          <TouchableOpacity style={styles.bulkBtn} onPress={bulkComplete}>
            <Text style={styles.bulkBtnText}>✅ Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bulkBtn, { backgroundColor: '#FEE2E2' }]} onPress={bulkDelete}>
            <Text style={[styles.bulkBtnText, { color: Colors.overdue }]}>🗑 Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedIds([])}>
            <X size={18} color={Colors.black} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.black} />
        </View>
      ) : view === 'List' ? (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => setDetailTask(item)}
              onLongPress={() => toggleSelect(item.id)}
              selected={selectedIds.includes(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState search={search} />}
          showsVerticalScrollIndicator={false}
        />
      ) : view === 'Kanban' ? (
        <KanbanView tasks={filtered} onTaskPress={setDetailTask} />
      ) : (
        <CalendarView
          tasks={filtered}
          onTaskPress={setDetailTask}
          onDatePress={d => { setPrefillDate(d); setAddOpen(true); }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, Shadow.card]} onPress={() => setAddOpen(true)}>
        <Plus size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Sheets */}
      <BottomSheet visible={addOpen} onClose={() => { setAddOpen(false); setPrefillDate(undefined); }} snapHeight={SH * 0.92}>
        <AddTaskSheet onClose={() => { setAddOpen(false); setPrefillDate(undefined); }} prefillDate={prefillDate} />
      </BottomSheet>
      <BottomSheet visible={!!detailTask} onClose={() => setDetailTask(null)} snapHeight={SH * 0.85}>
        {detailTask && <TaskDetailSheet task={detailTask} onClose={() => setDetailTask(null)} />}
      </BottomSheet>
      <BottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)} snapHeight={SH * 0.7}>
        <FilterSheet
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterLevel={filterLevel} setFilterLevel={setFilterLevel}
          sortBy={sortBy} setSortBy={setSortBy}
          onClose={() => setFilterOpen(false)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyText}>{search ? 'No tasks match your search' : 'No tasks yet'}</Text>
      <Text style={styles.emptySubtext}>{search ? 'Try a different keyword' : 'Tap + to create your first task'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, ...Shadow.chip },
  searchInput: { flex: 1, fontSize: 14, color: Colors.black },
  filterBtn: { backgroundColor: Colors.white, borderRadius: 12, padding: 10, ...Shadow.chip },
  filterBtnActive: { backgroundColor: Colors.black },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white },
  tabActive: { backgroundColor: Colors.black },
  tabText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  tabTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: Colors.black, borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.black, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: Colors.lightGray },
  bulkBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  bulkCount: { fontSize: 13, fontWeight: '600', color: Colors.black, flex: 1 },
  bulkBtn: { backgroundColor: Colors.ultraLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  bulkBtnText: { fontSize: 12, color: Colors.black, fontWeight: '500' },
});
