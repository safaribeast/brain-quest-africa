'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase/auth"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export function GoogleSignInButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const provider = new GoogleAuthProvider()

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      setError("")
      console.log("Attempting Google sign-in...")
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("Google sign-in successful")

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (!userDoc.exists()) {
        console.log("Creating new user profile...")
        // Create new user profile if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        })
      } else {
        console.log("Updating existing user profile...")
        // Update last login
        await setDoc(doc(db, "users", user.uid), {
          lastLoginAt: new Date()
        }, { merge: true })
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else if (error.code === 'auth/api-key-not-valid') {
        setError('Authentication service is temporarily unavailable')
        console.error('Firebase API Key error. Please check Firebase configuration.')
      } else if (error.code === 'auth/invalid-api-key') {
        setError('Authentication service configuration error')
        console.error('Invalid Firebase API Key. Please check Firebase configuration.')
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked by browser. Please allow pop-ups for this site.')
      } else {
        setError(error.message || 'Failed to sign in with Google')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button 
        variant="outline" 
        type="button" 
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="w-full h-11 border border-[#D1D5DB] hover:bg-gray-50"
      >
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="github"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}