import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBSx0H2ThQT7XFWvB9jG4n-flypc58z4lU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "school-quiz-game-5ad8d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "school-quiz-game-5ad8d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "school-quiz-game-5ad8d.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "647837416204",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:647837416204:web:0a710721b43a54466f2729",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://school-quiz-game-5ad8d-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;

try {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    firebaseApp = getApps()[0];
    console.log('Firebase already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { firebaseApp };
export const db = getFirestore(firebaseApp);
