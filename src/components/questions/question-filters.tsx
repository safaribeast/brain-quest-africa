'use client'

import { useState } from "react"
import { QuestionDifficulty, QuestionGrade, QuestionSubject } from "@/types/question"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface QuestionFiltersProps {
  onFilterChange: (filters: {
    subject?: QuestionSubject;
    grade?: QuestionGrade;
    difficulty?: QuestionDifficulty;
  }) => void;
}

export function QuestionFilters({ onFilterChange }: QuestionFiltersProps) {
  const [subject, setSubject] = useState<QuestionSubject>()
  const [grade, setGrade] = useState<QuestionGrade>()
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>()

  const handleFilterChange = (
    type: 'subject' | 'grade' | 'difficulty',
    value: string | undefined
  ) => {
    const newFilters = {
      subject: type === 'subject' ? value as QuestionSubject : subject,
      grade: type === 'grade' ? value as QuestionGrade : grade,
      difficulty: type === 'difficulty' ? value as QuestionDifficulty : difficulty,
    }

    if (type === 'subject') setSubject(value as QuestionSubject)
    if (type === 'grade') setGrade(value as QuestionGrade)
    if (type === 'difficulty') setDifficulty(value as QuestionDifficulty)

    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setSubject(undefined)
    setGrade(undefined)
    setDifficulty(undefined)
    onFilterChange({})
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Select value={subject} onValueChange={(value) => handleFilterChange('subject', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
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

        <Select value={grade} onValueChange={(value) => handleFilterChange('grade', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="form1">Form 1</SelectItem>
            <SelectItem value="form2">Form 2</SelectItem>
            <SelectItem value="form3">Form 3</SelectItem>
            <SelectItem value="form4">Form 4</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        {(subject || grade || difficulty) && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
} 