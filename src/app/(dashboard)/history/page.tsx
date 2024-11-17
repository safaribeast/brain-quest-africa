'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { auth, db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore'
import { Clock, Award, CheckCircle, XCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface QuestionAttempt {
  id: string
  questionId: string
  question: {
    text: string
    options: string[]
    correctAnswer: string
    subject: string
    grade: string
    explanation?: string
  }
  isCorrect: boolean
  answer: string
  attemptedAt: Timestamp
  gameType?: string
}

export default function HistoryPage() {
  const [recentQuestions, setRecentQuestions] = useState<QuestionAttempt[]>([])
  const [needPracticeQuestions, setNeedPracticeQuestions] = useState<QuestionAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!auth.currentUser) {
        toast.error('Please sign in to view your history')
        setLoading(false)
        return
      }

      try {
        const userId = auth.currentUser.uid
        const historyRef = collection(db, `users/${userId}/questionHistory`)

        // Fetch recent questions first
        const recentQ = query(
          historyRef,
          orderBy('attemptedAt', 'desc'),
          limit(10)
        )

        // Temporary workaround while index is being created
        let practiceData: QuestionAttempt[] = []
        try {
          const practiceQ = query(
            historyRef,
            where('isCorrect', '==', false),
            orderBy('attemptedAt', 'desc'),
            limit(20)
          )
          const practiceSnapshot = await getDocs(practiceQ)
          practiceData = practiceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as QuestionAttempt))
        } catch (indexError: any) {
          console.log('Index not ready yet, fetching all questions as fallback')
          // Fallback: fetch all recent questions and filter client-side
          const allQuestionsQ = query(
            historyRef,
            orderBy('attemptedAt', 'desc'),
            limit(50)
          )
          const allSnapshot = await getDocs(allQuestionsQ)
          practiceData = allSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            } as QuestionAttempt))
            .filter(q => !q.isCorrect)
            .slice(0, 20)
        }

        const recentSnapshot = await getDocs(recentQ)
        const recentData = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as QuestionAttempt))

        console.log('Recent questions:', recentData)
        console.log('Practice questions:', practiceData)

        setRecentQuestions(recentData)
        setNeedPracticeQuestions(practiceData)
      } catch (error: any) {
        console.error('Error fetching history:', error)
        
        // If it's an indexing error, show a more helpful message
        if (error.message?.includes('index')) {
          const indexUrl = error.message.match(/https:\/\/.*$/)?.[0]
          if (indexUrl) {
            console.log('Create the index here:', indexUrl)
            toast.error(
              'Database index needs to be created. Please contact the administrator.',
              { duration: 5000 }
            )
          }
        } else {
          toast.error('Failed to load question history. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  function formatDate(timestamp: Timestamp) {
    if (!timestamp || !timestamp.seconds) {
      return 'Unknown date'
    }
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading history...</div>
        </div>
      </div>
    )
  }

  if (!auth.currentUser) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground">
              Sign in to view your question history
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="game-heading text-3xl mb-8">Question History</h1>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger 
            value="recent"
            className="game-button bg-transparent hover:bg-game-surface-light data-[state=active]:bg-game-primary"
          >
            Recent Questions
          </TabsTrigger>
          <TabsTrigger 
            value="practice"
            className="game-button bg-transparent hover:bg-game-surface-light data-[state=active]:bg-game-primary"
          >
            Need Practice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="grid gap-4">
            {recentQuestions.map((attempt) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="game-card"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="game-heading text-xl">{attempt.question.text}</h3>
                    {attempt.isCorrect ? (
                      <div className="flex items-center text-game-success">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-game-error">
                        <XCircle className="w-5 h-5 mr-2" />
                        <span>Incorrect</span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {attempt.question.options.map((option) => (
                      <div
                        key={option}
                        className={`game-option ${
                          option === attempt.question.correctAnswer
                            ? 'correct'
                            : option === attempt.answer && !attempt.isCorrect
                            ? 'wrong'
                            : ''
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>

                  {attempt.question.explanation && (
                    <div className="mt-4 p-4 rounded-lg bg-game-surface-light">
                      <p className="text-game-text-muted">{attempt.question.explanation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="practice">
          <div className="grid gap-4">
            {needPracticeQuestions.map((attempt) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="game-card"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="game-heading text-xl">{attempt.question.text}</h3>
                    <div className="flex items-center text-game-error">
                      <XCircle className="w-5 h-5 mr-2" />
                      <span>Incorrect</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {attempt.question.options.map((option) => (
                      <div
                        key={option}
                        className={`game-option ${
                          option === attempt.question.correctAnswer
                            ? 'correct'
                            : option === attempt.answer && !attempt.isCorrect
                            ? 'wrong'
                            : ''
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>

                  {attempt.question.explanation && (
                    <div className="mt-4 p-4 rounded-lg bg-game-surface-light">
                      <p className="text-game-text-muted">{attempt.question.explanation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}