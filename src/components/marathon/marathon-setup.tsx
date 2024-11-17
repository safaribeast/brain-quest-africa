'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionSubject, QuestionGrade, QuestionDifficulty } from '@/types/question'

interface MarathonSetupProps {
  onStart: (settings: {
    subject: QuestionSubject
    grade: QuestionGrade
    difficulty: QuestionDifficulty
  }) => void
  onStartGame: () => void
}

export function MarathonSetup({ onStart, onStartGame }: MarathonSetupProps) {
  const [subject, setSubject] = useState<QuestionSubject>('mathematics')
  const [grade, setGrade] = useState<QuestionGrade>('form1')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('easy')

  const handleStart = () => {
    onStart({ subject, grade, difficulty })
    onStartGame()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="space-y-1 px-6">
        <CardTitle className="text-2xl">Marathon Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your subject and difficulty level
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Select value={subject} onValueChange={(v) => setSubject(v as QuestionSubject)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="kiswahili">Kiswahili</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="bookkeeping">Bookkeeping</SelectItem>
                <SelectItem value="civics">Civics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Form</label>
            <Select value={grade} onValueChange={(v) => setGrade(v as QuestionGrade)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form1">Form 1</SelectItem>
                <SelectItem value="form2">Form 2</SelectItem>
                <SelectItem value="form3">Form 3</SelectItem>
                <SelectItem value="form4">Form 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuestionDifficulty)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <Button 
            onClick={handleStart}
            size="lg"
            className="w-full sm:w-auto"
          >
            Start Marathon
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 