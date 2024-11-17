export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionSubject = 
  | 'mathematics' 
  | 'physics' 
  | 'chemistry' 
  | 'geography' 
  | 'biology' 
  | 'history' 
  | 'english' 
  | 'kiswahili' 
  | 'commerce' 
  | 'bookkeeping' 
  | 'civics'

export type QuestionGrade = 'form1' | 'form2' | 'form3' | 'form4'

export type QuestionStatus = 'active' | 'draft' | 'archived'

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  explanation?: string
  subject: QuestionSubject
  grade: QuestionGrade
  difficulty: QuestionDifficulty
  status: QuestionStatus
  createdAt: Date
  updatedAt: Date
  attemptedAt?: Date
  isCorrect?: boolean
}

export interface QuestionBank {
  [subject: string]: {
    [grade: string]: {
      [difficulty: string]: Question[]
    }
  }
}