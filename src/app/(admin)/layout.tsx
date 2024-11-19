'use client'

import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/auth'
import { isAdminEmail } from '@/lib/admin-config'
import { onAuthStateChanged } from 'firebase/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !isAdminEmail(user.email)) {
        redirect('/dashboard')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
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
