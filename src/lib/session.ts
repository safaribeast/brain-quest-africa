import { auth } from '@/lib/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdminEmail } from './admin-config';

export interface User {
  email: string;
  isAdmin: boolean;
}

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
        isAdmin: isAdminEmail(user.email),
      });
    });
  });
}
