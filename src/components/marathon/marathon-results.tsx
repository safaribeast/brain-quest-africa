'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award } from 'lucide-react'

interface MarathonResultsProps {
  score: number
  questionsAnswered: number
  onPlayAgain: () => void
}

export function MarathonResults({ score, questionsAnswered, onPlayAgain }: MarathonResultsProps) {
  const percentage = Math.round((score / questionsAnswered) * 100)
  
  const getAchievement = () => {
    if (percentage === 100) return { icon: Trophy, text: 'Perfect Score!', color: 'text-yellow-500' }
    if (percentage >= 80) return { icon: Medal, text: 'Great Job!', color: 'text-blue-500' }
    return { icon: Award, text: 'Keep Practicing!', color: 'text-gray-500' }
  }

  const { icon: Icon, text, color } = getAchievement()

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className={`mx-auto ${color}`}>
          <Icon className="h-12 w-12 mx-auto" />
        </div>
        <CardTitle className="text-2xl mt-4">{text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold">{score}/{questionsAnswered}</div>
          <div className="text-sm text-muted-foreground">
            Questions Answered Correctly
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {percentage}% Success Rate
          </div>
        </div>

        <Button onClick={onPlayAgain} className="w-full">
          Play Again
        </Button>
      </CardContent>
    </Card>
  )
} 