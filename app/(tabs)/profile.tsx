import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { Colors, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { tasks, streak, focusHours } = useApp();
  const completed = tasks.filter(t => t.status === 'Completed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={[styles.avatar, Shadow.card]}>
          <User size={40} color={Colors.black} />
        </View>
        <Text style={styles.name}>Qairel</Text>
        <Text style={styles.email}>qayyumqairel1811@gmail.com</Text>

        <View style={styles.statsRow}>
          {[
            { label: 'Tasks', value: tasks.length },
            { label: 'Done', value: completed },
            { label: 'Streak', value: `${streak}🔥` },
          ].map(s => (
            <View key={s.label} style={[styles.statBox, Shadow.chip]}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>ABOUT TASKER</Text>
          <Text style={styles.cardText}>Your intelligent task manager powered by AI. Stay focused, track progress, and build great habits.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 32, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.lightGray, marginBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '700', color: Colors.black },
  statLbl: { fontSize: 12, color: Colors.lightGray, marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, width: '100%' },
  cardLabel: { fontSize: 12, color: Colors.lightGray, marginBottom: 8, letterSpacing: 0.5 },
  cardText: { fontSize: 14, color: Colors.gray, lineHeight: 20 },
});
