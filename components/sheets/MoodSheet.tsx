import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../../constants/theme';
import { MOODS } from '../../constants/data';
import { useApp } from '../../context/AppContext';
import { Mood } from '../../context/types';

export default function MoodSheet({ onClose }: { onClose: () => void }) {
  const { mood, setMood, stressLevel, setStressLevel, energyLevel, setEnergyLevel } = useApp();
  const [selected, setSelected] = useState<string | null>(mood?.key ?? null);
  const [stress, setStress] = useState(stressLevel);
  const [energy, setEnergy] = useState(energyLevel);
  const [note, setNote] = useState('');

  const confirm = () => {
    const m = MOODS.find(m => m.key === selected) ?? null;
    setMood(m);
    setStressLevel(stress);
    setEnergyLevel(energy);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={styles.title}>How are you feeling?</Text>

      <View style={styles.moodRow}>
        {MOODS.map(m => (
          <TouchableOpacity key={m.key}
            style={[styles.moodPill, selected === m.key && styles.moodPillActive]}
            onPress={() => setSelected(m.key)}>
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, selected === m.key && styles.moodLabelActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sliderLabel}>Stress Level</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.edge}>Low</Text>
        <Slider style={styles.slider} value={stress} onValueChange={setStress}
          minimumTrackTintColor={Colors.black} maximumTrackTintColor={Colors.border}
          thumbTintColor={Colors.black} />
        <Text style={styles.edge}>High</Text>
      </View>

      <Text style={styles.sliderLabel}>Energy Level</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.edge}>Low</Text>
        <Slider style={styles.slider} value={energy} onValueChange={setEnergy}
          minimumTrackTintColor={Colors.black} maximumTrackTintColor={Colors.border}
          thumbTintColor={Colors.black} />
        <Text style={styles.edge}>High</Text>
      </View>

      <Text style={styles.sliderLabel}>Quick Note (optional)</Text>
      <TextInput style={styles.noteInput} placeholder="What's on your mind?"
        placeholderTextColor={Colors.lightGray} value={note} onChangeText={setNote} multiline />

      <TouchableOpacity style={styles.btn} onPress={confirm}>
        <Text style={styles.btnText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: 20 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  moodPill: { backgroundColor: Colors.ultraLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  moodPillActive: { backgroundColor: Colors.black },
  emoji: { fontSize: 18 },
  moodLabel: { fontSize: 13, color: Colors.black },
  moodLabelActive: { color: Colors.white },
  sliderLabel: { fontSize: 12, color: Colors.lightGray, marginBottom: 8 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  slider: { flex: 1, marginHorizontal: 8 },
  edge: { fontSize: 11, color: Colors.lightGray, width: 28 },
  noteInput: { backgroundColor: Colors.ultraLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.black, height: 72, textAlignVertical: 'top', marginBottom: 20 },
  btn: { backgroundColor: Colors.black, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
