export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  grade?: string;
  subjects?: string[];
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
} 