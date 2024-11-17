'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Heart, Trophy, Clock, Star } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'
import {
  AnimatedContainer,
  AnimatedScore,
  AnimatedLives,
  AnimatedTimer,
  AnimatedButton
} from './game-animations'

interface GameResult {
  score: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  userId: string
  timestamp: any
  difficulty: string
}

const saveGameResult = async (result: GameResult) => {
  try {
    const docRef = await addDoc(collection(db, 'leaderboard'), {
      ...result,
      timestamp: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving game result:', error)
    return null
  }
}

interface MarathonGameProps {
  settings: {
    subject: string
    form: string
    difficulty: string
    questionsPerSession: number
  }
  questions: Array<{
    id: string
    text: string
    options: string[]
    correctAnswer: string
    explanation: string
    subject: string
    grade: string
  }>
  onGameComplete: () => void
}

export function MarathonGame({
  settings,
  questions,
  onGameComplete,
}: MarathonGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState<number>(Date.now())
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (questions && questions.length > 0) {
      setLoading(false)
    }
  }, [questions])

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        setTotalTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameOver, startTime])

  useEffect(() => {
    if (!isAnswered && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswerTimeout()
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isAnswered, timeLeft, gameOver])

  useEffect(() => {
    if (isAnswered && !showResults) {
      const timer = setTimeout(() => {
        handleNextQuestion()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAnswered, showResults])

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  function handleAnswerTimeout() {
    setIsAnswered(true)
    setIsCorrect(false)
    setStreak(0)
    handleWrongAnswer()
  }

  function handleWrongAnswer() {
    const newLives = lives - 1
    setLives(newLives)
    if (newLives === 0) {
      handleGameOver()
    }
  }

  async function handleGameOver() {
    setGameOver(true)
    setShowResults(true)

    try {
      const user = auth.currentUser
      if (!user) {
        console.error('No user found')
        toast.error('Please sign in to save your score')
        return
      }

      const result = {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        score,
        streak,
        grade: settings.form,
        subject: settings.subject,
        correctAnswers: score / 10, // Convert score to number of correct answers
        totalQuestions: questions.length,
        timeSpent: totalTimeSpent,
        difficulty: settings.difficulty,
        timestamp: null
      }
      
      const docId = await retryOperation(
        async () => await saveGameResult(result),
        3,
        1000
      )
      
      if (docId) {
        toast.success('Score saved to leaderboard! 🏆')
        console.log('Game result saved successfully with ID:', docId)
      } else {
        throw new Error('Failed to get document ID')
      }
    } catch (error) {
      console.error('Error saving game result:', error)
      toast.error('Failed to save score. Please try again.')
    }
  }

  async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        console.error(`Attempt ${attempt}/${maxAttempts} failed:`, error)
        
        if (attempt === maxAttempts) {
          throw error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
    
    throw lastError
  }

  const handleAnswer = async (selectedAnswer: string) => {
    if (currentQuestion && !isAnswered) {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer
      setIsAnswered(true)
      setSelectedAnswer(selectedAnswer)
      setIsCorrect(isCorrect)

      // Save question attempt to history with retry logic
      if (auth.currentUser) {
        try {
          await retryOperation(async () => {
            const historyRef = collection(db, `users/${auth.currentUser!.uid}/questionHistory`)
            await addDoc(historyRef, {
              questionId: currentQuestion.id || String(currentQuestionIndex),
              question: {
                text: currentQuestion.text,
                options: currentQuestion.options,
                correctAnswer: currentQuestion.correctAnswer,
                subject: currentQuestion.subject || 'Unknown',
                grade: currentQuestion.grade || 'Unknown'
              },
              answer: selectedAnswer,
              isCorrect: isCorrect,
              attemptedAt: serverTimestamp(),
              gameType: 'marathon',
              clientTimestamp: new Date().toISOString() // Use ISO string for better compatibility
            })
          })
        } catch (error) {
          console.error('Error saving question history:', error)
          toast.error('Failed to save question history. Please check your connection.')
        }
      }

      if (isCorrect) {
        setScore(prev => prev + 10)
        setStreak(prev => prev + 1)
        toast.success('Correct answer! +10 points')
      } else {
        setLives(prev => prev - 1)
        setStreak(0)
        toast.error('Wrong answer! -1 life')
      }

      // Auto advance after delay
      setTimeout(() => {
        if (lives > 1 || (lives === 1 && isCorrect)) {
          handleNextQuestion()
        } else {
          handleGameOver()
        }
      }, 1500)
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex === questions.length - 1 || gameOver) {
      handleGameOver()
      return
    }

    setCurrentQuestionIndex((prev) => prev + 1)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setTimeLeft(30)
    setIsCorrect(null)
  }

  if (loading) {
    return (
      <AnimatedContainer animation="fade" className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Star className="w-12 h-12 text-game-accent mx-auto" />
          </motion.div>
          <h3 className="game-heading text-xl">Loading questions...</h3>
          <p className="text-game-text-muted">Get ready to play!</p>
        </div>
      </AnimatedContainer>
    )
  }

  if (!currentQuestion) {
    return (
      <AnimatedContainer animation="bounce" className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-game-error mx-auto mb-4" />
          <h3 className="game-heading text-xl mb-2">No questions available</h3>
          <p className="text-game-text-muted">Please try again later</p>
        </div>
      </AnimatedContainer>
    )
  }

  if (showResults) {
    return (
      <AnimatedContainer animation="bounce" className="max-w-md mx-auto">
        <div className="game-card text-center">
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring" }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-6 text-game-accent" />
          </motion.div>
          
          <AnimatedContainer animation="slide" className="space-y-6 mb-8">
            <h2 className="game-heading text-4xl">Game Over!</h2>
            <div className="game-stats grid gap-4">
              <div className="stat-item">
                <span className="stat-label">Final Score</span>
                <span className="stat-value text-4xl font-bold text-game-accent">{score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Highest Streak</span>
                <span className="stat-value">{streak}🔥</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Questions Completed</span>
                <span className="stat-value">{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Spent</span>
                <span className="stat-value">
                  {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">
                  {Math.round((score / ((currentQuestionIndex + 1) * 10)) * 100)}%
                </span>
              </div>
            </div>
          </AnimatedContainer>

          <button 
            onClick={onGameComplete}
            className="game-button w-full text-lg py-6"
          >
            Play Again
          </button>
        </div>
      </AnimatedContainer>
    )
  }

  return (
    <AnimatedContainer animation="slide" className="max-w-3xl mx-auto">
      <div className="game-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <p className="text-game-text-muted">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <div className="text-game-text-muted flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {Math.floor(totalTimeSpent / 60)}:{(totalTimeSpent % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="game-progress">
                  <motion.div
                    className="game-progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="game-lives">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`game-life ${i >= lives ? 'lost' : ''}`}
                      initial={{ scale: 1 }}
                      animate={i < lives ? { scale: [1, 1.2, 1] } : { scale: 0.8 }}
                    />
                  ))}
                </div>
                <div className="game-score-container">
                  <div className="game-score">{score}</div>
                  {streak > 0 && (
                    <div className="game-streak">
                      <span className="game-streak-icon">{streak}🔥</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="game-heading text-2xl">{currentQuestion.text}</h3>
              <div className="grid gap-4">
                {currentQuestion.options.map((option, index) => {
                  const selected = selectedAnswer === option
                  const correct = isAnswered && option === currentQuestion.correctAnswer
                  const wrong = isAnswered && selected && !correct

                  return (
                    <motion.div
                      key={option}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => !isAnswered && handleAnswer(option)}
                        disabled={isAnswered}
                        className={`game-option w-full ${
                          correct ? 'correct' : wrong ? 'wrong' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {correct && <CheckCircle className="w-6 h-6" />}
                          {wrong && <XCircle className="w-6 h-6" />}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`game-timer ${timeLeft <= 5 ? 'warning' : ''}`}>
                <Clock className="w-5 h-5 inline mr-2" />
                {timeLeft}s
              </div>
            </div>

            {isAnswered && currentQuestion.explanation && (
              <AnimatedContainer animation="slide" className="game-card bg-game-surface-light">
                <div className="font-medium mb-2">Explanation</div>
                <div className="text-game-text-muted">
                  {currentQuestion.explanation}
                </div>
              </AnimatedContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AnimatedContainer>
  )
}