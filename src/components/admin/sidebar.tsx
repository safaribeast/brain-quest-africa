'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase/auth';
import {
  BookOpen,
  Users,
  Settings,
  FileText,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from 'firebase/auth';

export function Sidebar() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        <div className="px-3 py-4">
          <Link href="/admin-dashboard" className="flex items-center gap-2 px-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Brain Quest
            </span>
          </Link>
        </div>
        
        <nav className="space-y-1 px-3">
          <Link
            href="/admin-dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/50",
              isActive('/admin-dashboard') && !isActive('/admin-dashboard/') && 'bg-accent/50 text-accent-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin-dashboard/questions"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/50",
              isActive('/admin-dashboard/questions') && 'bg-accent/50 text-accent-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            Questions
          </Link>
          <Link
            href="/admin-dashboard/users"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/50",
              isActive('/admin-dashboard/users') && 'bg-accent/50 text-accent-foreground'
            )}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/admin-dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/50",
              isActive('/admin-dashboard/settings') && 'bg-accent/50 text-accent-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto px-3 py-4">
          <div className="mb-4 px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  {user?.displayName || 'Admin User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
