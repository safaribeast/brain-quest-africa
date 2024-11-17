'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Award, Clock, Target, Trophy } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { UserProgress } from '@/types/progress'

export function ProgressDashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      if (!auth.currentUser) return

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          setProgress(userDoc.data() as UserProgress)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-muted-foreground">No progress data available</p>
        </div>
      </div>
    )
  }

  const accuracy = progress.totalQuestionsAnswered > 0
    ? (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium">Total Score</p>
            <h3 className="text-2xl font-bold">{progress.totalCorrectAnswers}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium">Accuracy</p>
            <h3 className="text-2xl font-bold">{Math.round(accuracy)}%</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium">Questions Answered</p>
            <h3 className="text-2xl font-bold">{progress.totalQuestionsAnswered}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium">Streak Days</p>
            <h3 className="text-2xl font-bold">{progress.streakDays || 0}</h3>
          </div>
        </div>
      </Card>

      {progress.lastPlayedAt && (
        <Card className="p-4 md:col-span-2 lg:col-span-4">
          <p className="text-sm text-muted-foreground">
            Last played on {formatDate(progress.lastPlayedAt.toDate())}
          </p>
        </Card>
      )}
    </div>
  )
}