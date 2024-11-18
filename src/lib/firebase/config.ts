import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSx0H2ThQT7XFWvB9jG4n-flypc58z4lU",
  authDomain: "brain-quest-africa.vercel.app",
  projectId: "school-quiz-game-5ad8d",
  storageBucket: "school-quiz-game-5ad8d.appspot.com",
  messagingSenderId: "647837416204",
  appId: "1:647837416204:web:0a710721b43a54466f2729"
};

// Log Firebase config for debugging (without sensitive data)
console.log('Firebase initialization with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

// Initialize Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(firebaseApp);
