import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityType = 'question_added' | 'question_edited' | 'question_deleted' | 'user_registered' | 'bulk_upload';

export interface Activity {
  type: ActivityType;
  description: string;
  userId: string;
  timestamp: any; // FirebaseFirestore.Timestamp
  metadata?: Record<string, any>;
}

export async function logActivity(activity: Omit<Activity, 'timestamp'>) {
  try {
    const activityRef = collection(db, 'activity');
    await addDoc(activityRef, {
      ...activity,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
