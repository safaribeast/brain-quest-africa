import { QuestionSubject, QuestionGrade, QuestionDifficulty } from './question'

export interface SubjectProgress {
  subject: QuestionSubject
  totalAttempts: number
  correctAnswers: number
  averageScore: number
  lastAttempted: Date
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
  lastActive: Date
  streak: number
  updatedAt: Date
} 