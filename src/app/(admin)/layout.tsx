'use client'

import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/auth'
import { checkAdminAccess } from '@/lib/session'
import { onAuthStateChanged } from 'firebase/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Current user:', user?.email) // Debug log
      const hasAdminAccess = checkAdminAccess(user?.email)
      console.log('Has admin access:', hasAdminAccess) // Debug log
      setIsAdmin(hasAdminAccess)
      setIsLoading(false)
      
      if (!hasAdminAccess) {
        redirect('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto py-8">{children}</div>
      </main>
    </div>
  )
}
