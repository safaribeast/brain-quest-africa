import { QuestionSubject, QuestionGrade, QuestionDifficulty } from './question'
import { Timestamp } from 'firebase/firestore'

export interface SubjectProgress {
  subject: QuestionSubject
  totalAttempts: number
  correctAnswers: number
  averageScore: number
  lastAttempted: Timestamp
  byDifficulty: {
    [K in QuestionDifficulty]: number
  }
}

export interface UserProgress {
  userId: string
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  overallAccuracy: number
  subjectProgress: Partial<Record<QuestionSubject, SubjectProgress>>
  lastActive: Timestamp
  streak: number
  streakDays: number
  lastPlayedAt: Timestamp
  updatedAt: Timestamp
}