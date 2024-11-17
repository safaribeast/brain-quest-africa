'use client'

import { useEffect, useState } from 'react'
import { collection, query, getDocs, orderBy, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Question, QuestionSubject, QuestionGrade, QuestionDifficulty } from '@/types/question'
import { QuestionCard } from './question-card'
import { toast } from 'sonner'

interface QuestionListProps {
  subject?: QuestionSubject
  grade?: QuestionGrade
  difficulty?: QuestionDifficulty
  showActions?: boolean
}

export function QuestionList({ subject, grade, difficulty, showActions }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadQuestions = async () => {
    try {
      let q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'))
      
      if (subject) {
        q = query(q, where('subject', '==', subject))
      }
      if (grade) {
        q = query(q, where('grade', '==', grade))
      }
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty))
      }

      const querySnapshot = await getDocs(q)
      const loadedQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Question[]
      
      setQuestions(loadedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error("Failed to load questions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [subject, grade, difficulty])

  const handleDelete = async (questionId: string) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId))
      toast.success("Question deleted successfully")
      loadQuestions() // Reload the list
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error("Failed to delete question")
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading questions...</div>
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No questions found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questions.map((question) => (
        <QuestionCard 
          key={question.id} 
          question={question}
          showActions={showActions}
          onDelete={() => handleDelete(question.id)}
        />
      ))}
    </div>
  )
} 