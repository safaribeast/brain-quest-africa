'use client'

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ProfileMenu } from "@/components/profile/profile-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAdminShortcut } from '@/hooks/use-admin-shortcut'
import { AdminPortal } from '@/components/admin/admin-portal'
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Marathon',
    href: '/marathon',
    icon: '🏃'
  },
  {
    name: 'History',
    href: '/history',
    icon: '📚'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: '👤'
  },
]

export default function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onClose } = useAdminShortcut()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const adminEmails = ['safaribeast01@gmail.com']
    
    // Check if there's a pending redirect
    const pendingRedirect = sessionStorage.getItem('pendingRedirect')
    if (pendingRedirect) {
      sessionStorage.removeItem('pendingRedirect')
      router.replace(pendingRedirect)
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true)
      if (!user && !pathname.includes('/auth/')) {
        sessionStorage.setItem('pendingRedirect', pathname)
        router.replace("/auth/login")
      } else if (user) {
        setIsAdmin(adminEmails.includes(user.email || ''))
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router, pathname])

  if (!mounted || isLoading) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/marathon" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Brain Quest Africa</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <span className="flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>

      {/* Admin Portal */}
      {isAdmin && isOpen && (
        <AdminPortal onClose={onClose} />
      )}
    </div>
  )
}