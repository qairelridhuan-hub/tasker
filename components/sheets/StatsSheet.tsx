import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'expo-router';

export default function StatsSheet({ onClose }: { onClose: () => void }) {
  const { completedToday, todayTasks, focusHours, streak } = useApp();
  const router = useRouter();
  const productivityScore = todayTasks.length > 0
    ? Math.round((completedToday / todayTasks.length) * 100)
    : 0;

  const stats = [
    { label: 'Tasks Completed', value: completedToday },
    { label: 'Focus Hours', value: focusHours.toFixed(1) },
    { label: 'Productivity Score', value: `${productivityScore}%` },
    { label: 'Day Streak 🔥', value: streak },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.title}>Today's Stats</Text>

      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.label} style={[styles.statCard, Shadow.card]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => { onClose(); router.push('/(tabs)/analytics'); }}>
        <Text style={styles.link}>See Full Analytics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, width: '47%', alignItems: 'flex-start' },
  statValue: { fontSize: 28, fontWeight: '700', color: Colors.black },
  statLabel: { fontSize: 12, color: Colors.lightGray, marginTop: 4 },
  link: { fontSize: 14, color: Colors.black, textDecorationLine: 'underline', textAlign: 'center', marginTop: 24 },
});
