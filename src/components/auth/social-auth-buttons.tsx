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
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (!userDoc.exists()) {
        // Create new user profile if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        })
      } else {
        // Update last login
        await setDoc(doc(db, "users", user.uid), {
          lastLoginAt: new Date()
        }, { merge: true })
      }

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      setError(error.message || "Failed to sign in with Google")
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
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}