import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD5Iu86fWDXzjkgCHEG-0HznL-48mhhJPY",
  authDomain: "parking-app-49359.firebaseapp.com",
  projectId: "parking-app-49359",
  storageBucket: "parking-app-49359.firebasestorage.app",
  messagingSenderId: "995917821276",
  appId: "1:995917821276:web:3426c072d8c4fa9e9d3d99",
  measurementId: "G-YQLF7CLTZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only initialize analytics in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 