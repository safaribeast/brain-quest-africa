'use client'

import { useEffect, useState } from 'react'
import { collection, query, getDocs, where, orderBy, limit, getDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Question } from '@/types/question'
import { QuestionCard } from './question-card'

interface UserQuestionListProps {
  type: 'recent' | 'favorites' | 'failed'
}

export function UserQuestionList({ type }: UserQuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadQuestions() {
      try {
        const user = auth.currentUser
        if (!user) return

        let q;
        switch (type) {
          case 'recent':
            // Get questions from user's recent attempts
            q = query(
              collection(db, `users/${user.uid}/questionHistory`),
              orderBy('attemptedAt', 'desc'),
              limit(10)
            )
            break;
          case 'favorites':
            // Get user's favorited questions
            q = query(
              collection(db, `users/${user.uid}/favorites`),
              orderBy('addedAt', 'desc')
            )
            break;
          case 'failed':
            // Get questions user failed
            q = query(
              collection(db, `users/${user.uid}/questionHistory`),
              where('isCorrect', '==', false),
              orderBy('attemptedAt', 'desc')
            )
            break;
        }

        const querySnapshot = await getDocs(q)
        const loadedQuestions = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            // Get the actual question data
            const questionDoc = await getDoc(doc(db, 'questions', doc.data().questionId))
            return {
              id: questionDoc.id,
              ...questionDoc.data(),
              attemptedAt: doc.data().attemptedAt?.toDate(),
              isCorrect: doc.data().isCorrect,
            }
          })
        )
        
        setQuestions(loadedQuestions as Question[])
      } catch (error) {
        console.error('Error loading questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [type])

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading questions...</div>
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {type === 'recent' && "You haven't attempted any questions yet."}
        {type === 'favorites' && "You haven't favorited any questions yet."}
        {type === 'failed' && "No questions need practice yet."}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questions.map((question) => (
        <QuestionCard 
          key={question.id} 
          question={question}
          showFavoriteButton
          showAttemptDate
        />
      ))}
    </div>
  )
} 