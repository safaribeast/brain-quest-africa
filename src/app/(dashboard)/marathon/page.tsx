'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarathonGame } from '@/components/marathon/marathon-game'
import { MarathonLeaderboard } from '@/components/marathon/marathon-leaderboard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { fetchQuestions, Question } from '@/lib/game'
import { Loader2 } from 'lucide-react'

const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'geography', label: 'Geography' },
  { value: 'history', label: 'History' },
  { value: 'civics', label: 'Civics' },
  { value: 'kiswahili', label: 'Kiswahili' },
  { value: 'english', label: 'English' }
]

const FORMS = [
  { value: 'form1', label: 'Form One' },
  { value: 'form2', label: 'Form Two' },
  { value: 'form3', label: 'Form Three' },
  { value: 'form4', label: 'Form Four' }
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
]

export default function MarathonPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [settings, setSettings] = useState({
    subject: 'mathematics',
    form: 'form1',
    difficulty: 'medium',
    questionsPerSession: 10
  })

  async function startGame() {
    try {
      setIsLoading(true)
      const fetchedQuestions = await fetchQuestions(
        settings.subject,
        settings.form,
        settings.difficulty,
        settings.questionsPerSession
      )

      if (fetchedQuestions.length === 0) {
        toast.error('No questions found for the selected criteria. Try different settings.')
        return
      }

      if (fetchedQuestions.length < settings.questionsPerSession) {
        toast.warning(`Only ${fetchedQuestions.length} questions available for the selected criteria.`)
      }

      setQuestions(fetchedQuestions)
      setGameStarted(true)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to fetch questions. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGameComplete() {
    setGameStarted(false)
    setQuestions([])
    toast.success('Quiz completed! 🎉')
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Study Marathon</h1>
          <p className="text-muted-foreground mt-2">
            Test your knowledge and improve your learning streak
          </p>
        </div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8 md:grid-cols-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Game Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    value={settings.subject}
                    onValueChange={(value) =>
                      setSettings({ ...settings, subject: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Form</label>
                  <Select
                    value={settings.form}
                    onValueChange={(value) =>
                      setSettings({ ...settings, form: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMS.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value) =>
                      setSettings({ ...settings, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((difficulty) => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startGame} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Start Game'
                  )}
                </Button>
              </div>
            </Card>

            <MarathonLeaderboard />
          </motion.div>
        ) : (
          <MarathonGame
            settings={settings}
            questions={questions}
            onGameComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  )
}