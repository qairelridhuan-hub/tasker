import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAYligBUNty_d6lGYabmzMX7Jrsoaedves',
  authDomain: 'tasker-5373a.firebaseapp.com',
  projectId: 'tasker-5373a',
  storageBucket: 'tasker-5373a.firebasestorage.app',
  messagingSenderId: '78264698784',
  appId: '1:78264698784:web:efe0a10363d95dec7b06c5',
  measurementId: 'G-1XJ7LCR9XH',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
