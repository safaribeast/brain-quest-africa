import { ref, push, set, onValue, off, get } from 'firebase/database'
import { realtimeDb } from './firebase'
import { Match, MatchStatus } from '@/types/match'

export const matchmaking = {
  // Join matchmaking queue
  joinQueue: async (playerId: string, playerName: string, settings: Match['settings']) => {
    const queueRef = ref(realtimeDb, 'matchmaking/queue')
    const playerRef = push(queueRef)
    await set(playerRef, {
      playerId,
      playerName,
      settings,
      joinedAt: Date.now()
    })
    return playerRef.key
  },

  // Leave matchmaking queue
  leaveQueue: async (queueEntryId: string) => {
    const entryRef = ref(realtimeDb, `matchmaking/queue/${queueEntryId}`)
    await set(entryRef, null)
  },

  // Listen for match found
  onMatchFound: (playerId: string, callback: (match: Match) => void) => {
    const matchesRef = ref(realtimeDb, 'matches')
    const unsubscribe = onValue(matchesRef, async (snapshot) => {
      const matches = snapshot.val()
      if (!matches) return

      // Find match where player is participant and status is 'waiting'
      const match = Object.entries(matches).find(([_, match]: [string, any]) => 
        match.players[playerId] && match.status === 'waiting'
      )

      if (match) {
        callback(match[1] as Match)
      }
    })

    return () => off(matchesRef)
  },

  // Check for available opponents
  findOpponent: async (settings: Match['settings']) => {
    const queueRef = ref(realtimeDb, 'matchmaking/queue')
    const snapshot = await get(queueRef)
    const queue = snapshot.val()

    if (!queue) return null

    // Find first player in queue with matching settings
    const opponent = Object.entries(queue).find(([_, entry]: [string, any]) => 
      entry.settings.subject === settings.subject &&
      entry.settings.grade === settings.grade &&
      entry.settings.difficulty === settings.difficulty
    )

    return opponent ? opponent[1] : null
  }
} 