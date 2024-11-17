export type ActivityType =
  | 'question_added'
  | 'question_edited'
  | 'question_deleted'
  | 'user_login'
  | 'user_logout'
  | 'quiz_started'
  | 'quiz_completed'
  | 'profile_updated'
  | 'settings_updated';

export interface Activity {
  id?: string;
  type: ActivityType;
  description: string;
  userId: string;
  timestamp?: any;
  metadata?: Record<string, any>;
}
