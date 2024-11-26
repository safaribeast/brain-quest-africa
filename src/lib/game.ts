import { collection, query, where, getDocs, orderBy, limit, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  subject: string
  grade: string
  difficulty: string
}

export interface GameResult {
  userId: string
  displayName: string
  score: number
  streak: number
  grade: string
  subject: string
  timestamp?: Date
}

export interface LeaderboardEntry extends GameResult {
  id: string
}

export async function fetchQuestions(subject: string, grade: string, difficulty: string, limit: number = 10): Promise<Question[]> {
  const questionsRef = collection(db, 'questions')
  const q = query(
    questionsRef,
    where('subject', '==', subject),
    where('grade', '==', grade),
    where('difficulty', '==', difficulty)
  )

  const querySnapshot = await getDocs(q)
  const questions = querySnapshot.docs.map(doc => ({
    id: doc.id,
    text: doc.data().text,
    options: doc.data().options,
    correctAnswer: doc.data().correctAnswer,
    explanation: doc.data().explanation,
    subject: doc.data().subject,
    grade: doc.data().grade,
    difficulty: doc.data().difficulty
  }))

  // Shuffle and limit questions
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
}

export async function saveGameResult(result: GameResult) {
  try {
    if (!result.userId || !result.displayName) {
      throw new Error('Missing user information')
    }

    const gameResultsRef = collection(db, 'gameResults')
    
    // Add timestamp and ensure all required fields
    const resultToSave = {
      userId: result.userId,
      displayName: result.displayName,
      score: result.score || 0,
      streak: result.streak || 0,
      grade: result.grade || 'Unknown',
      subject: result.subject || 'Unknown',
      timestamp: serverTimestamp()
    }

    // Save to Firestore
    const docRef = await addDoc(gameResultsRef, resultToSave)
    console.log('Game result saved with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error saving game result:', error)
    throw error
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const gameResultsRef = collection(db, 'gameResults')
    const q = query(
      gameResultsRef, 
      orderBy('score', 'desc'), 
      limit(5)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName,
        score: data.score,
        streak: data.streak,
        grade: data.grade,
        subject: data.subject,
        timestamp: data.timestamp?.toDate()
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}
