import { QuestionSubject, QuestionGrade, QuestionDifficulty } from './question'

export interface LeaderboardEntry {
  id: string
  userId: string
  userDisplayName: string
  score: number
  questionsAnswered: number
  subject: QuestionSubject
  grade: QuestionGrade
  difficulty: QuestionDifficulty
  createdAt: Date
} 