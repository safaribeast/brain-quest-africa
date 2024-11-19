import { auth } from '@/lib/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export interface User {
  email: string;
  isAdmin: boolean;
}

// List of admin email addresses
const ADMIN_EMAILS = [
  'safaribeast01@gmail.com',
  'muhsinadam38@gmail.com',
  'charlesnyerere17@gmail.com',
  'rahimmnaro@gmail.com'
];

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user

      if (!user) {
        resolve(null);
        return;
      }

      resolve({
        email: user.email || '',
        isAdmin: user.email ? ADMIN_EMAILS.includes(user.email) : false,
      });
    });
  });
}
