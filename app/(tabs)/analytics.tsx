import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Critical, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { STATUSES } from '../../constants/data';
import { CriticalNames } from '../../constants/theme';

export default function AnalyticsScreen() {
  const { tasks, completedToday, todayTasks, focusHours, streak } = useApp();

  const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
  const productivityScore = todayTasks.length > 0
    ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const byStatus = STATUSES.map(s => ({
    label: s,
    count: tasks.filter(t => t.status === s).length,
  }));

  const byLevel = [1, 2, 3, 4, 5].map(l => ({
    label: CriticalNames[l],
    color: Critical[l],
    count: tasks.filter(t => t.criticalLevel === l).length,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Analytics</Text>

        {/* Overview cards */}
        <View style={styles.grid}>
          {[
            { label: 'Total Tasks', value: tasks.length },
            { label: 'Completed', value: totalCompleted },
            { label: 'Focus Hours', value: focusHours.toFixed(1) },
            { label: 'Day Streak 🔥', value: streak },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, Shadow.card]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>TODAY'S SCORE</Text>
          <Text style={styles.bigScore}>{productivityScore}%</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${productivityScore}%` }]} />
          </View>
          <Text style={styles.scoreSubtext}>{completedToday} of {todayTasks.length} tasks completed today</Text>
        </View>

        {/* By Status */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>BY STATUS</Text>
          {byStatus.map(s => (
            <View key={s.label} style={styles.barRow}>
              <Text style={styles.barLabel}>{s.label}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: tasks.length ? `${(s.count / tasks.length) * 100}%` : '0%' }]} />
              </View>
              <Text style={styles.barCount}>{s.count}</Text>
            </View>
          ))}
        </View>

        {/* By Critical Level */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>BY CRITICAL LEVEL</Text>
          {byLevel.map(l => (
            <View key={l.label} style={styles.barRow}>
              <View style={[styles.levelDot, { backgroundColor: l.color }]} />
              <Text style={styles.barLabel}>{l.label}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: tasks.length ? `${(l.count / tasks.length) * 100}%` : '0%', backgroundColor: l.color }]} />
              </View>
              <Text style={styles.barCount}>{l.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', color: Colors.black, paddingTop: 16, paddingBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  statCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, width: '47%' },
  statValue: { fontSize: 28, fontWeight: '700', color: Colors.black },
  statLabel: { fontSize: 12, color: Colors.lightGray, marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 12, color: Colors.lightGray, marginBottom: 12, letterSpacing: 0.5 },
  bigScore: { fontSize: 48, fontWeight: '800', color: Colors.black, marginBottom: 12 },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: Colors.black, borderRadius: 3 },
  scoreSubtext: { fontSize: 13, color: Colors.gray },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { fontSize: 13, color: Colors.black, width: 90 },
  barBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  barFill: { height: 6, backgroundColor: Colors.black, borderRadius: 3 },
  barCount: { fontSize: 13, color: Colors.gray, width: 24, textAlign: 'right' },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
});
