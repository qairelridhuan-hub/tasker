import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { FOCUS_TYPES, SOUNDS } from '../../constants/data';
import { useApp } from '../../context/AppContext';
import { FocusSession } from '../../context/types';

const DURATIONS = [15, 25, 45, 60, 90];

export default function FocusSheet({ onClose }: { onClose: () => void }) {
  const { setFocusSession } = useApp();
  const [type, setType] = useState<'Pomodoro' | 'Deep Work' | 'Custom'>('Pomodoro');
  const [duration, setDuration] = useState(25);
  const [sound, setSound] = useState<'Rain' | 'Lofi' | 'White Noise' | 'None'>('None');

  const start = () => {
    setFocusSession({ type, duration, sound, startedAt: new Date() });
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.title}>Start Focus Session</Text>

      <Text style={styles.label}>Session Type</Text>
      <View style={styles.pillRow}>
        {FOCUS_TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.pill, type === t && styles.pillActive]} onPress={() => setType(t)}>
            <Text style={[styles.pillText, type === t && styles.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Duration (minutes)</Text>
      <View style={styles.pillRow}>
        {DURATIONS.map(d => (
          <TouchableOpacity key={d} style={[styles.pill, duration === d && styles.pillActive]} onPress={() => setDuration(d)}>
            <Text style={[styles.pillText, duration === d && styles.pillTextActive]}>{d}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ambient Sound</Text>
      <View style={styles.pillRow}>
        {SOUNDS.map(s => (
          <TouchableOpacity key={s} style={[styles.pill, sound === s && styles.pillActive]} onPress={() => setSound(s)}>
            <Text style={[styles.pillText, sound === s && styles.pillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.durationDisplay}>
        <Text style={styles.durationBig}>{duration}</Text>
        <Text style={styles.durationUnit}>min</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={start}>
        <Text style={styles.btnText}>Start Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: 20 },
  label: { fontSize: 12, color: Colors.lightGray, marginBottom: 10, marginTop: 16 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  pillActive: { backgroundColor: Colors.black },
  pillText: { fontSize: 13, color: Colors.black },
  pillTextActive: { color: Colors.white },
  durationDisplay: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 24, gap: 4 },
  durationBig: { fontSize: 64, fontWeight: '700', color: Colors.black, lineHeight: 72 },
  durationUnit: { fontSize: 20, color: Colors.lightGray, marginBottom: 10 },
  btn: { backgroundColor: Colors.black, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
