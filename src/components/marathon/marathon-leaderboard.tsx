'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchLeaderboard, LeaderboardEntry } from '@/lib/game'

export function MarathonLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const results = await fetchLeaderboard()
        setLeaderboard(results)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Load initially
    loadLeaderboard()

    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">Top 5 Players</h2>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[68px] bg-muted/50 rounded-lg animate-pulse"
            />
          ))
        ) : leaderboard.length > 0 ? (
          leaderboard.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`font-bold text-lg ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : ''}`}>
                  {index + 1}.
                </div>
                <div>
                  <div className="font-medium">{player.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    Form {player.grade} • {player.subject} • {player.streak}🔥 streak
                  </div>
                </div>
              </div>
              <div className="font-bold text-xl">{player.score}</div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No high scores yet. Be the first to play!
          </div>
        )}
      </div>
    </Card>
  )
}