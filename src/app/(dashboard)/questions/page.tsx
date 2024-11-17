'use client'

import { useState } from 'react'
import { QuestionList } from "@/components/questions/question-list"
import { QuestionFilters } from "@/components/questions/question-filters"
import { QuestionSubject, QuestionGrade, QuestionDifficulty } from "@/types/question"

export default function QuestionsPage() {
  const [filters, setFilters] = useState<{
    subject?: QuestionSubject;
    grade?: QuestionGrade;
    difficulty?: QuestionDifficulty;
  }>({})

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Question Bank</h2>
        <p className="text-muted-foreground">
          Browse and study questions from various subjects.
        </p>
      </div>
      
      <QuestionFilters onFilterChange={setFilters} />
      <QuestionList {...filters} />
    </div>
  )
} 