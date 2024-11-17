'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useAdminShortcut() {
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminEmails = ['safaribeast01@gmail.com'] // Your admin email

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminEmails.includes(user.email || '')) {
        console.log('Admin access enabled for:', user.email)
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        setIsAdminPortalOpen(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'Ctrl:', event.ctrlKey, 'Alt:', event.altKey)
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'a') {
        console.log('Admin shortcut triggered!')
        setIsAdminPortalOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin])

  return {
    isOpen: isAdminPortalOpen,
    onClose: () => setIsAdminPortalOpen(false)
  }
} 