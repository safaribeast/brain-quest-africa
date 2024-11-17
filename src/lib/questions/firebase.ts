import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { QuestionInput } from './excel-parser';

export interface Question {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function createQuestion(questionData: Omit<Question, 'id'>) {
  const questionsRef = collection(db, 'questions');
  const docRef = await addDoc(questionsRef, questionData);
  return docRef.id;
}

export async function bulkCreateQuestions(questions: QuestionInput[]) {
  const batch = writeBatch(db);
  const questionsRef = collection(db, 'questions');

  questions.forEach((question) => {
    const docRef = doc(questionsRef);
    const formattedQuestion = {
      subject: question.subject,
      topic: question.topic,
      subtopic: question.subtopic || '',
      difficulty: question.difficulty,
      question: question.question,
      options: [
        question.option1,
        question.option2,
        question.option3,
        question.option4,
      ],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      tags: question.tags ? question.tags.split(',').map((tag) => tag.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(docRef, formattedQuestion);
  });

  await batch.commit();
}

export async function getQuestionsBySubject(subject: string): Promise<Question[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, where('subject', '==', subject));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function getQuestionsByTopic(
  subject: string,
  topic: string
): Promise<Question[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(
    questionsRef,
    where('subject', '==', subject),
    where('topic', '==', topic)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function searchQuestions(searchTerm: string): Promise<Question[]> {
  // Note: This is a basic implementation. For better search functionality,
  // consider using Algolia or a similar search service
  const questionsRef = collection(db, 'questions');
  const querySnapshot = await getDocs(questionsRef);

  const searchTermLower = searchTerm.toLowerCase();
  return querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((question: Question) => {
      return (
        question.question.toLowerCase().includes(searchTermLower) ||
        question.subject.toLowerCase().includes(searchTermLower) ||
        question.topic.toLowerCase().includes(searchTermLower) ||
        question.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
      );
    }) as Question[];
}
