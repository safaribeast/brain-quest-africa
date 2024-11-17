import { QuestionSubject, QuestionGrade, QuestionDifficulty } from './question'

export type MatchStatus = 'waiting' | 'countdown' | 'playing' | 'finished'

export interface MatchmakingSettings {
  subject: QuestionSubject
  grade: QuestionGrade
  difficulty: QuestionDifficulty
}

export interface MatchPlayer {
  id: string
  displayName: string
  ready: boolean
  score: number
  currentAnswer?: string
  answeredAt?: Date
}

export interface Match {
  id: string
  status: MatchStatus
  players: Record<string, MatchPlayer>
  settings: MatchmakingSettings
  currentQuestionId?: string
  currentQuestion?: Question
  roundStartTime?: number
  roundNumber?: number
  startedAt?: number
  createdAt: Date
  updatedAt: Date
}

export interface MatchResult {
  matchId: string
  winnerId: string
  players: Record<string, {
    score: number
    correctAnswers: number
    averageTime: number
  }>
  createdAt: Date
}