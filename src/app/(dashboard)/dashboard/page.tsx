'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        sessionStorage.setItem('pendingRedirect', '/dashboard')
        router.replace('/auth/login')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading || !auth.currentUser) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {auth.currentUser.displayName || 'Student'}!</h1>
          <p className="text-muted-foreground mt-2">Ready to continue your learning journey?</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Study Marathon</h2>
            <p className="text-muted-foreground mb-4">
              Challenge yourself with a series of questions to test and improve your knowledge.
            </p>
            <Button asChild>
              <Link href="/marathon">Start Marathon</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <p className="text-muted-foreground mb-4">
              Track your learning progress and view your performance statistics.
            </p>
            <Button variant="outline" asChild>
              <Link href="/history">View History</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <p className="text-muted-foreground mb-4">
              Customize your profile and update your preferences.
            </p>
            <Button variant="outline" asChild>
              <Link href="/profile">View Profile</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}