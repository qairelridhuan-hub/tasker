import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { X, Check, CalendarDays } from 'lucide-react-native';
import { AwfulFace, SadFace, NeutralFace, GoodFace, GreatFace } from '../MoodFaces';
import { useApp } from '../../context/AppContext';
import { MOODS } from '../../constants/data';

const { width: SW } = Dimensions.get('window');

const FACES   = [AwfulFace, SadFace, NeutralFace, GoodFace, GreatFace];
const CIRCLE  = 124;
const ICON_SZ = 80;
const SLOT_W  = 100;  // horizontal slot per icon
const STEP_PX = 80;   // drag px to advance one step

const targetScale   = (dist: number) => dist === 0 ? 1 : dist === 1 ? 0.58 : 0.40;
const targetOpacity = (dist: number) => dist === 0 ? 1 : dist === 1 ? 0.55 : 0.28;

const IDX_RANGE = MOODS.map((_, j) => j);

export default function MoodSheet({ onClose, onOpenCalendar }: { onClose: () => void; onOpenCalendar?: () => void }) {
  const { mood, setMood } = useApp();
  const defaultIdx = mood ? Math.max(0, MOODS.findIndex(m => m.key === mood.key)) : 2;
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const idxRef = useRef(defaultIdx);

  // Single value drives both row position and icon scales
  const position = useRef(new Animated.Value(defaultIdx)).current;

  // Shift the whole row so the selected icon is always at screen center
  const rowTranslateX = position.interpolate({
    inputRange: IDX_RANGE,
    outputRange: IDX_RANGE.map(i => SW / 2 - (i + 0.5) * SLOT_W),
    extrapolate: 'clamp',
  });

  const getScale = (i: number) => position.interpolate({
    inputRange: IDX_RANGE,
    outputRange: IDX_RANGE.map(j => targetScale(Math.abs(j - i))),
    extrapolate: 'clamp',
  });

  const getOpacity = (i: number) => position.interpolate({
    inputRange: IDX_RANGE,
    outputRange: IDX_RANGE.map(j => targetOpacity(Math.abs(j - i))),
    extrapolate: 'clamp',
  });

  const snapTo = (idx: number) => {
    idxRef.current = idx;
    setSelectedIdx(idx);
    Animated.spring(position, {
      toValue: idx, useNativeDriver: true, damping: 16, stiffness: 200,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: (_, g) => {
        const raw = idxRef.current - g.dx / STEP_PX;
        position.setValue(Math.max(0, Math.min(MOODS.length - 1, raw)));
      },
      onPanResponderRelease: (_, g) => {
        const cur = idxRef.current;
        let next = cur;
        if (g.dx < -25 && cur < MOODS.length - 1) next = cur + 1;
        else if (g.dx > 25 && cur > 0) next = cur - 1;
        snapTo(next);
      },
    })
  ).current;

  const confirm = () => {
    setMood(MOODS[selectedIdx]);
    onClose();
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity style={s.headerBtn} onPress={onClose} activeOpacity={0.7}>
          <X size={18} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity style={s.headerBtn} onPress={onOpenCalendar} activeOpacity={0.7}>
          <CalendarDays size={18} color="#111" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.headerBtn, s.headerBtnDark]} onPress={confirm} activeOpacity={0.8}>
          <Check size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <Text style={s.subtitle}>Mood</Text>
      <Text style={s.title}>Choose how you're{'\n'}feeling right now</Text>

      {/* Carousel — full width, no horizontal padding */}
      <View style={s.carousel} {...panResponder.panHandlers}>
        <Animated.View style={[s.iconRow, { transform: [{ translateX: rowTranslateX }] }]}>
          {MOODS.map((m, i) => {
            const Face = FACES[i];
            return (
              <TouchableOpacity key={m.key} onPress={() => snapTo(i)} activeOpacity={0.8} style={s.iconSlot}>
                <Animated.View style={[s.circle, {
                  opacity: getOpacity(i),
                  transform: [{ scale: getScale(i) }],
                }]}>
                  <Face size={ICON_SZ} color="#111" />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      <Text style={s.moodLabel}>{MOODS[selectedIdx].label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 16, marginBottom: 32,
    paddingHorizontal: 20,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: '#DDD',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnDark: { backgroundColor: '#111', borderColor: '#111' },
  subtitle: {
    fontSize: 12, color: '#999', fontWeight: '500',
    textAlign: 'center', marginBottom: 6, letterSpacing: 0.5,
  },
  title: {
    fontSize: 22, fontWeight: '600', color: '#111',
    textAlign: 'center', lineHeight: 30, marginBottom: 48,
    paddingHorizontal: 20,
  },
  carousel: {
    height: CIRCLE + 24,
    // overflow visible so shadows aren't clipped
  },
  iconRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    height: CIRCLE + 24,
    width: SLOT_W * MOODS.length,
  },
  iconSlot: {
    width: SLOT_W,
    height: CIRCLE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  moodLabel: {
    fontSize: 16, fontWeight: '500', color: '#111',
    textAlign: 'center', marginTop: 28,
    paddingHorizontal: 20,
  },
});
