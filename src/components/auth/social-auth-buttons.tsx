'use client'

import { Button } from "@/components/ui/button"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export function GoogleSignInButton() {
  const router = useRouter()
  const provider = new GoogleAuthProvider()

  const signInWithGoogle = async () => {
    try {
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
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  return (
    <Button 
      variant="outline" 
      type="button" 
      onClick={signInWithGoogle}
      className="w-full h-11 border border-[#D1D5DB] hover:bg-gray-50"
    >
      Continue with Google
    </Button>
  )
} 