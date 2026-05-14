import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAYligBUNty_d6lGYabmzMX7Jrsoaedves',
  authDomain: 'tasker-5373a.firebaseapp.com',
  projectId: 'tasker-5373a',
  storageBucket: 'tasker-5373a.firebasestorage.app',
  messagingSenderId: '78264698784',
  appId: '1:78264698784:web:efe0a10363d95dec7b06c5',
  measurementId: 'G-1XJ7LCR9XH',
};

const isNew = getApps().length === 0;
const app = isNew ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = isNew
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export default app;
