import { auth, realtimeDb } from './firebase'
import { ref, push, onValue, remove, get, set, DatabaseReference, off, onDisconnect, update } from 'firebase/database'
import { QuestionSubject, QuestionGrade, QuestionDifficulty } from '@/types/question'
import { Match as GameMatch, MatchStatus, MatchmakingSettings } from '@/types/match'
import { checkQuestionsExist } from './seed-questions'
import { toast } from 'sonner'

interface OnlinePlayer {
  userId: string
  displayName: string
  status: 'online' | 'searching' | 'in_game'
  currentSettings?: MatchmakingSettings
  lastActive: number
}

interface Match extends GameMatch {
  countdownStartedAt?: number
}

export class MatchmakingService {
  private userId: string
  private onlinePlayersRef: DatabaseReference = ref(realtimeDb, 'online_players')
  private matchesRef: DatabaseReference = ref(realtimeDb, 'matches')
  private userStatusRef: DatabaseReference | null = null
  private matchListener: (() => void) | null = null
  private isSearching: boolean = false
  private queueRef: DatabaseReference | null = null
  private searchTimeout: NodeJS.Timeout | null = null
  private retryAttempts = 0
  private readonly MAX_RETRY_ATTEMPTS = 3
  private readonly SEARCH_TIMEOUT = 30000 // 30 seconds

  constructor(userId: string) {
    this.userId = userId
    this.queueRef = ref(realtimeDb, 'matchmaking/queue')
  }

  async cleanup() {
    const user = auth.currentUser
    if (user) {
      try {
        // Remove user from online players
        const userRef = ref(realtimeDb, `online_players/${user.uid}`)
        await remove(userRef)

        // Clean up any matches containing this user
        const matchesSnapshot = await get(this.matchesRef)
        if (matchesSnapshot.exists()) {
          const matches = matchesSnapshot.val()
          const userMatches = Object.entries(matches).filter(([_, match]: [string, any]) => 
            match.players && match.players[user.uid]
          )

          // Remove all matches this user was part of
          await Promise.all(
            userMatches.map(([matchId]) => 
              remove(ref(realtimeDb, `matches/${matchId}`))
            )
          )
        }
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    }
  }

  async setUserOnline(): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      console.error('Authentication required')
      throw new Error('Must be authenticated')
    }

    this.userStatusRef = ref(realtimeDb, `online_players/${user.uid}`)

    try {
      const onlineStatus: OnlinePlayer = {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        status: 'online',
        lastActive: Date.now()
      }

      await set(this.userStatusRef, onlineStatus)
      
      // Set up disconnect handler
      const connectedRef = ref(realtimeDb, '.info/connected')
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true && this.userStatusRef) {
          onDisconnect(this.userStatusRef).remove()
        }
      })
    } catch (error) {
      console.error('Failed to set user online:', error)
      throw error
    }
  }

  async findOpponent(settings: MatchmakingSettings): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('Must be authenticated')

    try {
      // First check if questions exist for these settings
      const questionsExist = await checkQuestionsExist(settings)
      if (!questionsExist) {
        throw new Error(`No questions available for ${settings.subject} (${settings.grade}, ${settings.difficulty})`)
      }

      // Clear any existing search
      this.cancelSearch()

      // Add to queue
      const userQueueRef = push(this.queueRef!)
      const queueEntry = {
        userId: user.uid,
        settings,
        timestamp: Date.now(),
        status: 'searching'
      }

      await set(userQueueRef, queueEntry)

      // Set up search timeout
      this.searchTimeout = setTimeout(() => {
        this.cancelSearch()
        toast.error('No opponent found. Please try again.')
      }, this.SEARCH_TIMEOUT)

      // Listen for matches
      this.startMatchmaking(userQueueRef, settings)

    } catch (error: any) {
      console.error('Matchmaking error:', error)
      toast.error(error.message || 'Failed to start matchmaking')
      throw error
    }
  }

  private async startMatchmaking(userQueueRef: any, settings: MatchmakingSettings) {
    const user = auth.currentUser
    if (!user) return

    try {
      // Check for existing opponent
      const snapshot = await get(this.queueRef!)
      const queue = snapshot.val() || {}

      // Find opponent with matching settings
      const opponent = Object.entries(queue).find(([key, entry]: [string, any]) => 
        entry.userId !== user.uid &&
        entry.settings.subject === settings.subject &&
        entry.settings.grade === settings.grade &&
        entry.settings.difficulty === settings.difficulty &&
        entry.status === 'searching'
      )

      if (opponent) {
        const [opponentKey, opponentData] = opponent

        // Create match
        const matchRef = push(ref(realtimeDb, 'matches'))
        const match: Match = {
          id: matchRef.key!,
          status: 'countdown',
          players: {
            [user.uid]: {
              id: user.uid,
              displayName: user.displayName || 'Anonymous',
              ready: false,
              score: 0
            },
            [opponentData.userId]: {
              id: opponentData.userId,
              displayName: opponentData.displayName || 'Anonymous',
              ready: false,
              score: 0
            }
          },
          settings,
          countdownStartedAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Update match in database
        await set(matchRef, match)

        // Remove both players from queue
        await remove(userQueueRef)
        await remove(ref(realtimeDb, `matchmaking/queue/${opponentKey}`))

        // Update player statuses
        await update(ref(realtimeDb, `online_players/${user.uid}`), { status: 'in_game' })
        await update(ref(realtimeDb, `online_players/${opponentData.userId}`), { status: 'in_game' })

        // Notify callback
        if (this.onMatchCreatedCallback) {
          this.onMatchCreatedCallback(match)
        }

        // Set up match listener
        this.setupMatchListener(match.id)
      }
    } catch (error) {
      console.error('Error in startMatchmaking:', error)
      throw error
    }
  }

  private setupMatchListener(matchId: string) {
    const matchRef = ref(realtimeDb, `matches/${matchId}`)
    this.matchListener = onValue(matchRef, (snapshot) => {
      const match = snapshot.val()
      if (match) {
        // Notify match created
        this.onMatchCreatedCallback?.(match)
      }
    })
  }

  cancelSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = null
    }

    if (this.matchListener) {
      this.matchListener()
      this.matchListener = null
    }

    // Remove from queue
    get(this.queueRef!).then(snapshot => {
      const queue = snapshot.val() || {}
      const userEntry = Object.entries(queue).find(([_, entry]: [string, any]) => 
        entry.userId === auth.currentUser?.uid
      )

      if (userEntry) {
        const [key] = userEntry
        update(ref(realtimeDb), {
          [`matchmaking/queue/${key}`]: null
        }).catch(console.error)
      }
    })
  }

  private onMatchCreatedCallback: ((match: Match) => void) | null = null

  onMatchCreated(callback: (match: Match) => void) {
    this.onMatchCreatedCallback = callback
    return () => {
      this.onMatchCreatedCallback = null
    }
  }

  async setUserOnlineStatus() {
    const userStatusRef = ref(realtimeDb, `status/${auth.currentUser?.uid}`)
    const connectedRef = ref(realtimeDb, '.info/connected')

    onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === true) {
        await update(userStatusRef, {
          status: 'online',
          lastSeen: Date.now()
        })

        // When user disconnects, update the last seen time
        await set(userStatusRef, {
          status: 'offline',
          lastSeen: Date.now()
        })
      }
    })
  }
}