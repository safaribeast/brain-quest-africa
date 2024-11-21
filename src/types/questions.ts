import { Timestamp } from 'firebase/firestore';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'draft' | 'archived';
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
  updatedBy?: string;
}

export interface QuestionInput {
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status?: 'active' | 'draft' | 'archived';
  points?: number;
  timeLimit?: number;
  tags?: string[];
}
