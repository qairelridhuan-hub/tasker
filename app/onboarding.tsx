import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, Circle, Defs, ClipPath } from 'react-native-svg';
import {
  CheckSquare, Zap, BarChart2, Calendar, Target,
  ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// ── Animated task checklist icon ──────────────────────────────────
function AnimatedChecklist({ animKey }: { animKey: number }) {
  const checks = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const lineWidths = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    checks.forEach(c => c.setValue(0));
    lineWidths.forEach(l => l.setValue(0));
    const seq = checks.flatMap((c, i) => [
      Animated.parallel([
        Animated.spring(c, { toValue: 1, damping: 8, stiffness: 200, useNativeDriver: true }),
        Animated.timing(lineWidths[i], { toValue: 1, duration: 220, useNativeDriver: false }),
      ]),
      Animated.delay(80),
    ]);
    Animated.stagger(160, seq).start();
  }, [animKey]);

  const rows = ['Complete daily review', 'Submit project report', 'Team standup call'];

  return (
    <View style={{ gap: 12, width: 200 }}>
      {rows.map((label, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Animated.View style={{
            width: 22, height: 22, borderRadius: 6,
            backgroundColor: checks[i].interpolate({ inputRange: [0, 1], outputRange: ['#e0e0e0', '#000'] }),
            alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: checks[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] }) }],
          }}>
            <Animated.Text style={{ color: '#fff', fontSize: 13, opacity: checks[i] }}>✓</Animated.Text>
          </Animated.View>
          <Animated.View style={{
            height: 10, backgroundColor: '#000', borderRadius: 5,
            width: lineWidths[i].interpolate({ inputRange: [0, 1], outputRange: [0, label.length * 5.5] }),
            opacity: lineWidths[i],
          }} />
        </View>
      ))}
    </View>
  );
}

// ── Animated focus timer ──────────────────────────────────────────
function AnimatedTimer({ animKey }: { animKey: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [count, setCount] = useState(25);

  useEffect(() => {
    progress.setValue(0); scale.setValue(0.7); opacity.setValue(0); setCount(25);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1200, useNativeDriver: false }),
    ]).start();
    let c = 25;
    const t = setInterval(() => { c--; setCount(c); if (c <= 20) clearInterval(t); }, 150);
    return () => clearInterval(t);
  }, [animKey]);

  const strokeDash = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });

  return (
    <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="52" stroke="#e0e0e0" strokeWidth="8" fill="none" />
        <AnimatedRect
          x="0" y="0" width={strokeDash as any} height="1"
          fill="none"
        />
        <Circle cx="60" cy="60" r="52" stroke="#000" strokeWidth="8" fill="none"
          strokeDasharray="327"
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000' }}>{count}</Text>
        <Text style={{ fontSize: 11, color: '#999' }}>min left</Text>
      </View>
    </Animated.View>
  );
}

// ── Animated bar chart ────────────────────────────────────────────
function AnimatedBarChart({ animKey }: { animKey: number }) {
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1.0];
  const anims = bars.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    anims.forEach(a => a.setValue(0));
    Animated.stagger(60, anims.map((a, i) =>
      Animated.spring(a, { toValue: bars[i], damping: 10, stiffness: 120, useNativeDriver: false })
    )).start();
  }, [animKey]);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {anims.map((a, i) => (
        <View key={i} style={{ alignItems: 'center', gap: 4 }}>
          <Animated.View style={{
            width: 24, borderRadius: 6,
            backgroundColor: i === 6 ? '#000' : '#d0d0d0',
            height: a.interpolate({ inputRange: [0, 1], outputRange: [4, 68] }),
          }} />
          <Text style={{ fontSize: 9, color: '#aaa' }}>{days[i]}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Animated calendar ─────────────────────────────────────────────
function AnimatedCalendar({ animKey }: { animKey: number }) {
  const dots = Array.from({ length: 5 }, (_, i) => useRef(new Animated.Value(0)).current);
  const slideY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dots.forEach(d => d.setValue(0));
    slideY.setValue(24); opacity.setValue(0);
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, damping: 14, stiffness: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      Animated.stagger(100, dots.map(d =>
        Animated.spring(d, { toValue: 1, damping: 8, stiffness: 180, useNativeDriver: true })
      )).start();
    });
  }, [animKey]);

  const positions = [
    { top: 20, left: 10 }, { top: 20, left: 50 }, { top: 20, right: 10 },
    { top: 52, left: 30 }, { top: 52, right: 20 },
  ];
  const colors = ['#F44336', '#FF9800', '#2196F3', '#4CAF50', '#FFC107'];

  return (
    <Animated.View style={{ transform: [{ translateY: slideY }], opacity }}>
      <View style={{ width: 160, height: 110, backgroundColor: '#f4f4f4', borderRadius: 16, padding: 12 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#aaa', marginBottom: 8 }}>JUNE 2025</Text>
        <View style={{ height: 80, position: 'relative' }}>
          {dots.map((d, i) => (
            <Animated.View key={i} style={{
              position: 'absolute', width: 38, height: 18, borderRadius: 9,
              backgroundColor: colors[i],
              transform: [{ scaleX: d }], opacity: d,
              ...positions[i],
            }} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Animated target / goal ────────────────────────────────────────
function AnimatedGoal({ animKey }: { animKey: number }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    [ring1, ring2, ring3, dot].forEach(a => a.setValue(0));
    Animated.stagger(120, [
      Animated.spring(ring3, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }),
      Animated.spring(ring2, { toValue: 1, damping: 8, stiffness: 120, useNativeDriver: true }),
      Animated.spring(ring1, { toValue: 1, damping: 8, stiffness: 140, useNativeDriver: true }),
      Animated.spring(dot,   { toValue: 1, damping: 5, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, [animKey]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
      {[ring3, ring2, ring1].map((r, i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          width: 100 - i * 26, height: 100 - i * 26,
          borderRadius: (100 - i * 26) / 2,
          borderWidth: 2.5,
          borderColor: '#000',
          opacity: r,
          transform: [{ scale: r }],
        }} />
      ))}
      <Animated.View style={{
        width: 14, height: 14, borderRadius: 7, backgroundColor: '#000',
        transform: [{ scale: dot }], opacity: dot,
      }} />
    </View>
  );
}

// ── Animated task card stack ──────────────────────────────────────
function AnimatedTaskStack({ animKey }: { animKey: number }) {
  const cards = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const offsets = [12, 6, 0];
  const colors = ['#f0f0f0', '#e4e4e4', '#000'];

  useEffect(() => {
    cards.forEach(c => c.setValue(0));
    Animated.stagger(120, cards.map(c =>
      Animated.spring(c, { toValue: 1, damping: 12, stiffness: 140, useNativeDriver: true })
    )).start();
  }, [animKey]);

  return (
    <View style={{ width: 180, height: 90, position: 'relative' }}>
      {cards.map((c, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: 0, right: 0,
          top: offsets[i],
          height: 56, borderRadius: 14,
          backgroundColor: colors[i],
          opacity: c,
          transform: [{ scale: c.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        }}>
          {i === 2 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
              <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#fff' }} />
              <View style={{ flex: 1, height: 8, backgroundColor: '#333', borderRadius: 4 }} />
              <View style={{ width: 32, height: 8, backgroundColor: '#555', borderRadius: 4 }} />
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

// ── Splash animated task icon ─────────────────────────────────────
function SplashTaskIcon({ fillAnim }: { fillAnim: Animated.Value }) {
  const INTERIOR_H = 38;
  const fillH = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, INTERIOR_H] });
  const fillY = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 22] });

  return (
    <Svg width={72} height={72} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="cardClip">
          <Path d="M 18 20 Q 18 18 20 18 L 80 18 Q 82 18 82 20 L 82 62 Q 82 64 80 64 L 20 64 Q 18 64 18 62 Z" />
        </ClipPath>
      </Defs>
      {/* card fill */}
      <AnimatedRect x="18" y={fillY as any} width="64" height={fillH as any} fill="#000" clipPath="url(#cardClip)" />
      {/* card outline */}
      <Path d="M 18 20 Q 18 18 20 18 L 80 18 Q 82 18 82 20 L 82 62 Q 82 64 80 64 L 20 64 Q 18 64 18 62 Z"
        stroke="#000" strokeWidth="3" fill="none" />
      {/* check lines */}
      <Path d="M 28 32 L 36 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
      <Path d="M 28 42 L 50 42" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
      <Path d="M 28 52 L 44 52" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
      {/* checkmark */}
      <Path d="M 60 28 L 65 34 L 75 22" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Slide definitions ─────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    tag: 'ORGANIZE',
    statCount: 10, statPrefix: '', statSuffix: 'x',
    statLabel: 'more productive with task lists',
    title: 'Tasks, sorted.\nLife, simplified.',
    sub: 'Everything you need to do in one intelligent place. Create, prioritize, and organize tasks the way your brain works.',
    IconComp: AnimatedChecklist,
  },
  {
    id: '2',
    tag: 'FOCUS',
    statCount: 25, statPrefix: '', statSuffix: 'min',
    statLabel: 'focused sprint = deep work done',
    title: 'Stay in the\nzone longer.',
    sub: 'Built-in focus sessions with Pomodoro and deep work modes. Block out noise and get things done with intention.',
    IconComp: AnimatedTimer,
  },
  {
    id: '3',
    tag: 'INSIGHTS',
    statCount: 7, statPrefix: '', statSuffix: ' days',
    statLabel: 'of productivity tracked',
    title: 'See your\nprogress clearly.',
    sub: 'Analytics that actually tell you something. Track streaks, completion rates, and focus hours to level up every week.',
    IconComp: AnimatedBarChart,
  },
  {
    id: '4',
    tag: 'SCHEDULE',
    statCount: 3, statPrefix: '', statSuffix: ' views',
    statLabel: 'List, Kanban & Calendar',
    title: 'Your day,\nyour way.',
    sub: 'Switch between list, kanban board, and calendar views. See deadlines as colored bars across your week.',
    IconComp: AnimatedCalendar,
  },
  {
    id: '5',
    tag: 'PRIORITIES',
    statCount: 5, statPrefix: '', statSuffix: ' levels',
    statLabel: 'of task criticality',
    title: 'Always know\nwhat\'s next.',
    sub: 'AI-powered suggestions, critical level ranking, and smart scheduling ensure the right tasks get done at the right time.',
    IconComp: AnimatedGoal,
  },
];

type Phase = 'slides' | 'splash' | null;

function CountUpStat({ target, prefix, suffix, animKey, style }: {
  target: number; prefix: string; suffix: string; animKey: number; style?: object;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    setDisplay(0);
    const steps = Math.min(target, 60);
    const interval = 900 / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += Math.ceil(target / steps);
      if (cur >= target) { setDisplay(target); clearInterval(t); }
      else setDisplay(cur);
    }, interval);
    return () => clearInterval(t);
  }, [animKey]);
  return <Text style={style}>{prefix}{display}{suffix}</Text>;
}

export default function Onboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState<Phase>(null);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [iconAnimKey, setIconAnimKey] = useState(0);
  const busy = useRef(false);
  const dirRef = useRef<1 | -1>(1);

  // slide transition anims
  const outX = useRef(new Animated.Value(0)).current;
  const inX  = useRef(new Animated.Value(0)).current;

  // per-element entry anims
  const tagY  = useRef(new Animated.Value(-16)).current;
  const tagO  = useRef(new Animated.Value(0)).current;
  const iconS = useRef(new Animated.Value(0.75)).current;
  const iconO = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const textO = useRef(new Animated.Value(0)).current;

  // splash anims
  const splashO     = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.1)).current;
  const logoO       = useRef(new Animated.Value(0)).current;
  const fillAnim    = useRef(new Animated.Value(0)).current;
  const iconSwapO   = useRef(new Animated.Value(1)).current;
  const checkSwapO  = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(1)).current;
  const ringO       = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(24)).current;
  const titleO      = useRef(new Animated.Value(0)).current;
  const taglineY    = useRef(new Animated.Value(16)).current;
  const taglineO    = useRef(new Animated.Value(0)).current;
  const btnO        = useRef(new Animated.Value(0)).current;
  const btnY        = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (loading) return;
    setPhase(user ? 'splash' : 'slides');
  }, [loading, user]);

  function resetEntry() {
    tagY.setValue(-16); tagO.setValue(0);
    iconS.setValue(0.75); iconO.setValue(0);
    textY.setValue(20); textO.setValue(0);
  }

  function playEntry() {
    setIconAnimKey(k => k + 1);
    Animated.stagger(50, [
      Animated.parallel([
        Animated.timing(tagY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(tagO, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(iconS, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
        Animated.timing(iconO, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textY, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(textO, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]),
    ]).start();
  }

  useEffect(() => {
    inX.setValue(0);
    resetEntry();
    playEntry();
  }, []);

  useEffect(() => {
    if (prevIndex === null) return;
    const DIST = width;
    outX.setValue(0);
    inX.setValue(dirRef.current * DIST);
    resetEntry();
    Animated.parallel([
      Animated.timing(outX, { toValue: dirRef.current * -DIST, duration: 300, useNativeDriver: true }),
      Animated.timing(inX,  { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setPrevIndex(null);
      busy.current = false;
      playEntry();
    });
  }, [prevIndex]);

  function goTo(next: number, dir: 1 | -1) {
    if (busy.current) return;
    busy.current = true;
    dirRef.current = dir;
    setPrevIndex(index);
    setIndex(next);
  }

  function handlePrev() { if (index > 0) goTo(index - 1, -1); }
  function handleNext() {
    if (index < SLIDES.length - 1) goTo(index + 1, 1);
    else setPhase('splash');
  }

  useEffect(() => {
    if (phase !== 'splash') return;
    fillAnim.setValue(0); iconSwapO.setValue(1); checkSwapO.setValue(0);
    ringScale.setValue(1); ringO.setValue(0);
    titleY.setValue(24); titleO.setValue(0);
    taglineY.setValue(16); taglineO.setValue(0);
    btnO.setValue(0); btnY.setValue(20);

    Animated.timing(splashO, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
      Animated.timing(logoO, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(fillAnim, { toValue: 1, duration: 700, delay: 150, useNativeDriver: false }),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(iconSwapO, { toValue: 0, duration: 180, delay: 100, useNativeDriver: true }),
        Animated.timing(checkSwapO, { toValue: 1, duration: 220, delay: 140, useNativeDriver: true }),
      ]),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(ringO, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1.45, damping: 6, stiffness: 120, useNativeDriver: true }),
      ]),
      Animated.timing(ringO, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleO, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, damping: 14, stiffness: 160, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineO, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(taglineY, { toValue: 0, damping: 14, stiffness: 160, useNativeDriver: true }),
      ]),
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(btnO,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(btnY, { toValue: 0, damping: 12, stiffness: 140, useNativeDriver: true }),
      ]),
    ]).start();
  }, [phase]);

  if (!phase) return null;

  const slide = SLIDES[index];

  // ── Slides phase ──────────────────────────────────────────────────
  if (phase === 'slides') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />

        <View style={styles.headerRow}>
          <Text style={styles.stepCount}>{index + 1} / {SLIDES.length}</Text>
          <TouchableOpacity onPress={() => setPhase('splash')} activeOpacity={0.6}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.slideArea}>
          {/* Outgoing slide */}
          {prevIndex !== null && (() => {
            const prev = SLIDES[prevIndex];
            const PrevIcon = prev.IconComp;
            return (
              <Animated.View style={[styles.slideAbs, styles.slideInner, { transform: [{ translateX: outX }] }]}>
                <View style={styles.illustrationCard}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{prev.tag}</Text>
                  </View>
                  <Text style={styles.statNumber}>{prev.statPrefix}{prev.statCount}{prev.statSuffix}</Text>
                  <Text style={styles.statLabel}>{prev.statLabel}</Text>
                  <View style={styles.iconWrap}>
                    <PrevIcon animKey={0} />
                  </View>
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.title}>{prev.title}</Text>
                  <Text style={styles.sub}>{prev.sub}</Text>
                </View>
              </Animated.View>
            );
          })()}

          {/* Incoming slide */}
          <Animated.View style={[styles.slideAbs, styles.slideInner, { transform: [{ translateX: inX }] }]}>
            <View style={styles.illustrationCard}>
              <Animated.View style={[styles.tagPill, { opacity: tagO, transform: [{ translateY: tagY }] }]}>
                <Text style={styles.tagPillText}>{slide.tag}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: textO }}>
                <CountUpStat target={slide.statCount} prefix={slide.statPrefix}
                  suffix={slide.statSuffix} animKey={iconAnimKey} style={styles.statNumber} />
              </Animated.View>
              <Animated.Text style={[styles.statLabel, { opacity: textO }]}>{slide.statLabel}</Animated.Text>
              <Animated.View style={[styles.iconWrap, { opacity: iconO, transform: [{ scale: iconS }] }]}>
                <slide.IconComp animKey={iconAnimKey} />
              </Animated.View>
            </View>
            <Animated.View style={[styles.textBlock, { opacity: textO, transform: [{ translateY: textY }] }]}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.sub}>{slide.sub}</Text>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            onPress={handlePrev} activeOpacity={0.85} disabled={index === 0}>
            <ChevronLeft color={index === 0 ? '#ccc' : '#000'} size={22} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <ChevronRight color="#fff" size={22} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Splash phase ──────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.splash, { opacity: splashO }]}>
      <StatusBar style="dark" />

      {!user && (
        <TouchableOpacity style={styles.splashBack} onPress={() => { setIndex(0); setPhase('slides'); }} activeOpacity={0.7}>
          <ChevronLeft color="#bbb" size={22} strokeWidth={2} />
        </TouchableOpacity>
      )}

      {/* Logo */}
      <View style={styles.logoWrap}>
        <Animated.View style={{ opacity: ringO, transform: [{ scale: ringScale }], ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.ring} />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoO }}>
          <View style={styles.logoCircle}>
            <Animated.View style={{ position: 'absolute', opacity: iconSwapO }}>
              <SplashTaskIcon fillAnim={fillAnim} />
            </Animated.View>
            <Animated.View style={{ position: 'absolute', opacity: checkSwapO }}>
              <CheckSquare color="#000" size={48} strokeWidth={1.5} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.View style={{ alignItems: 'center', opacity: titleO, transform: [{ translateY: titleY }] }}>
        <Text style={styles.splashTitle}>
          task<Text style={styles.splashTitleAccent}>.</Text>er
        </Text>
        <View style={styles.splashDivider} />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ alignItems: 'center', opacity: taglineO, transform: [{ translateY: taglineY }] }}>
        <Text style={styles.splashSub}>Do more. Stress less.</Text>
        <Text style={styles.splashSub2}>Your intelligent daily task companion.</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={{ opacity: btnO, transform: [{ translateY: btnY }], width: '100%', alignItems: 'center', gap: 16, marginTop: 8 }}>
        {user ? (
          <TouchableOpacity style={styles.signUpBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
            <Text style={styles.signUpText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.signUpBtn} onPress={() => router.replace('/(auth)/signup')} activeOpacity={0.85}>
              <Text style={styles.signUpText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.logInText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  stepCount: { fontSize: 13, fontWeight: '600', color: '#bbb', letterSpacing: 0.5 },
  skipText: { fontSize: 14, fontWeight: '500', color: '#999' },

  slideArea: { flex: 1, overflow: 'hidden' },
  slideAbs: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  slideInner: { flex: 1, paddingHorizontal: 24, paddingBottom: 16, gap: 24, justifyContent: 'center' },

  illustrationCard: {
    width: '100%', aspectRatio: 1, backgroundColor: '#f4f4f4',
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  tagPill: { position: 'absolute', top: 18, left: 18, backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagPillText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  statNumber: { fontSize: 52, fontWeight: '800', color: '#000', letterSpacing: -2, marginTop: 8 },
  statLabel: { fontSize: 12, fontWeight: '500', color: '#999', letterSpacing: 0.3, marginBottom: 16 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },

  textBlock: { gap: 10, paddingHorizontal: 4 },
  title: { fontSize: 30, fontWeight: '800', color: '#000', letterSpacing: -0.8, lineHeight: 36 },
  sub: { fontSize: 14, color: '#666', lineHeight: 22 },

  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' },
  dotActive: { width: 22, backgroundColor: '#000', borderRadius: 3 },
  navBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { borderColor: '#f0f0f0' },
  nextBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },

  splash: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 24, paddingBottom: 48 },
  splashBack: { position: 'absolute', top: 56, left: 24, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', justifyContent: 'center', width: 160, height: 160 },
  ring: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)' },
  logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ebebeb', alignItems: 'center', justifyContent: 'center' },
  splashTitle: { fontSize: 42, fontWeight: '800', color: '#111', letterSpacing: -1 },
  splashTitleAccent: { fontSize: 42, fontWeight: '800', color: '#888' },
  splashDivider: { width: 32, height: 2, backgroundColor: '#e0e0e0', borderRadius: 2, marginTop: 10 },
  splashSub: { fontSize: 15, color: '#888', letterSpacing: 0.2, textAlign: 'center' },
  splashSub2: { fontSize: 13, color: '#bbb', marginTop: 4, textAlign: 'center' },
  signUpBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, backgroundColor: '#111', alignItems: 'center', alignSelf: 'center' },
  signUpText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  logInText: { fontSize: 14, fontWeight: '500', color: '#aaa' },
});
