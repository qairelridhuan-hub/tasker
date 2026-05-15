import {
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, onSnapshot, Timestamp, increment,
} from 'firebase/firestore';
import { db } from './config';

// ── User Profile ───────────────────────────────────────────────────

export async function createUserProfile(
  userId: string,
  data: { name: string; email: string }
) {
  await setDoc(doc(db, 'users', userId), {
    name: data.name,
    email: data.email,
    createdAt: Timestamp.now(),
  }, { merge: true });
}

export function subscribeProfile(
  userId: string,
  onChange: (profile: { name: string; email: string }) => void
) {
  const ref = doc(db, 'users', userId);
  return onSnapshot(ref, snap => {
    if (snap.exists()) {
      onChange({ name: snap.data().name ?? '', email: snap.data().email ?? '' });
    }
  });
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{ name: string; email: string }>
) {
  await updateDoc(doc(db, 'users', userId), data);
}

// ── Focus Sessions ─────────────────────────────────────────────────

export async function saveFocusSession(
  userId: string,
  session: { type: string; duration: number; sound: string; startedAt: Date }
) {
  await addDoc(collection(db, 'users', userId, 'focusSessions'), {
    type: session.type,
    duration: session.duration,
    sound: session.sound,
    startedAt: Timestamp.fromDate(session.startedAt),
    completedAt: Timestamp.now(),
  });
}

// ── Moods ──────────────────────────────────────────────────────────

export function subscribeMoods(
  userId: string,
  onChange: (history: Record<string, string>) => void
) {
  const ref = collection(db, 'users', userId, 'moods');
  return onSnapshot(ref, snapshot => {
    const history: Record<string, string> = {};
    snapshot.docs.forEach(d => { history[d.id] = d.data().mood; });
    onChange(history);
  });
}

export async function saveMood(userId: string, date: string, moodKey: string) {
  await setDoc(doc(db, 'users', userId, 'moods', date), {
    mood: moodKey,
    timestamp: Timestamp.now(),
  });
}

// ── Stats (streak, focusHours) ─────────────────────────────────────

export function subscribeStats(
  userId: string,
  onChange: (stats: { streak: number; focusHours: number }) => void
) {
  const ref = doc(db, 'users', userId, 'stats', 'main');
  return onSnapshot(ref, snap => {
    if (snap.exists()) {
      onChange({
        streak: snap.data().streak ?? 0,
        focusHours: snap.data().focusHours ?? 0,
      });
    } else {
      onChange({ streak: 0, focusHours: 0 });
    }
  });
}

export async function updateStreak(userId: string) {
  const ref = doc(db, 'users', userId, 'stats', 'main');
  const snap = await getDoc(ref);
  const today = new Date().toISOString().split('T')[0];

  if (!snap.exists()) {
    await setDoc(ref, { streak: 1, lastActiveDate: today, focusHours: 0 });
    return;
  }

  const { lastActiveDate, streak } = snap.data();
  if (lastActiveDate === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = lastActiveDate === yesterdayStr ? (streak ?? 0) + 1 : 1;
  await updateDoc(ref, { streak: newStreak, lastActiveDate: today });
}

export async function addFocusMinutes(userId: string, minutes: number) {
  const ref = doc(db, 'users', userId, 'stats', 'main');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { streak: 0, lastActiveDate: '', focusHours: minutes / 60 });
  } else {
    await updateDoc(ref, { focusHours: increment(minutes / 60) });
  }
}
