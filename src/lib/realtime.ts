import { getDatabase, ref, onValue, set, push, off } from 'firebase/database'
import { app } from './firebase'

// Initialize Realtime Database
const realtimeDb = getDatabase(app)

export interface GameRoom {
  id: string
  status: 'waiting' | 'playing' | 'finished'
  players: {
    [userId: string]: {
      id: string
      displayName: string
      ready: boolean
      score: number
    }
  }
  settings: {
    subject: string
    grade: string
    difficulty: string
  }
  currentQuestion?: string
  startTime?: number
  endTime?: number
}

export const gameRooms = {
  // Create a new game room
  create: async (hostId: string, hostName: string, settings: GameRoom['settings']) => {
    const roomRef = push(ref(realtimeDb, 'gameRooms'))
    const room: GameRoom = {
      id: roomRef.key!,
      status: 'waiting',
      players: {
        [hostId]: {
          id: hostId,
          displayName: hostName,
          ready: false,
          score: 0
        }
      },
      settings
    }
    await set(roomRef, room)
    return room
  },

  // Join an existing game room
  join: async (roomId: string, playerId: string, playerName: string) => {
    const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}`)
    await set(playerRef, {
      id: playerId,
      displayName: playerName,
      ready: false,
      score: 0
    })
  },

  // Listen to room changes
  subscribe: (roomId: string, callback: (room: GameRoom) => void) => {
    const roomRef = ref(realtimeDb, `gameRooms/${roomId}`)
    onValue(roomRef, (snapshot) => {
      const room = snapshot.val() as GameRoom
      callback(room)
    })

    // Return unsubscribe function
    return () => off(roomRef)
  },

  // Update player status
  setReady: async (roomId: string, playerId: string, ready: boolean) => {
    const readyRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}/ready`)
    await set(readyRef, ready)
  },

  // Update room status
  setStatus: async (roomId: string, status: GameRoom['status']) => {
    const statusRef = ref(realtimeDb, `gameRooms/${roomId}/status`)
    await set(statusRef, status)
  },

  // Update player score
  updateScore: async (roomId: string, playerId: string, score: number) => {
    const scoreRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}/score`)
    await set(scoreRef, score)
  }
} 