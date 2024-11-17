import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth'
import { auth } from '../firebase'

describe('Authentication', () => {
  afterEach(async () => {
    // Clean up after each test
    const user = auth.currentUser
    if (user) {
      await signOut(auth)
    }
  })

  it('should not allow invalid email format', async () => {
    try {
      await signInWithEmailAndPassword(auth, 'invalid-email', 'password123')
      expect(true).toBe(false) // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe('auth/invalid-email')
    }
  })

  it('should not allow weak passwords during registration', async () => {
    try {
      await createUserWithEmailAndPassword(auth, 'test@example.com', '123')
      expect(true).toBe(false) // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe('auth/weak-password')
    }
  })
}) 