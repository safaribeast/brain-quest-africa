'use client'

import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { useEffect } from 'react'
import { auth } from '@/lib/firebase/auth'
import { isAdminEmail } from '@/lib/admin-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const user = auth.currentUser
    if (!user || !isAdminEmail(user.email)) {
      redirect('/dashboard')
    }
  }, [])

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto py-8">{children}</div>
      </main>
    </div>
  )
}
