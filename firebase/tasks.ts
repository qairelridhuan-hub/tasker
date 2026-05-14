import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Task } from '../context/types';

const COLLECTION = 'tasks';

export function subscribeTasks(userId: string, onChange: (tasks: Task[]) => void) {
  const q = query(
    collection(db, 'users', userId, COLLECTION),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snapshot => {
    const tasks: Task[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      startDate: d.data().startDate?.toDate() ?? new Date(),
      endDate: d.data().endDate?.toDate() ?? new Date(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    } as Task));
    onChange(tasks);
  });
}

export async function addTask(userId: string, task: Omit<Task, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'users', userId, COLLECTION), {
    ...task,
    startDate: Timestamp.fromDate(new Date(task.startDate)),
    endDate: Timestamp.fromDate(new Date(task.endDate)),
    createdAt: Timestamp.now(),
  });
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>) {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.startDate) payload.startDate = Timestamp.fromDate(new Date(updates.startDate));
  if (updates.endDate) payload.endDate = Timestamp.fromDate(new Date(updates.endDate));
  return updateDoc(doc(db, 'users', userId, COLLECTION, taskId), payload);
}

export async function deleteTask(userId: string, taskId: string) {
  return deleteDoc(doc(db, 'users', userId, COLLECTION, taskId));
}
