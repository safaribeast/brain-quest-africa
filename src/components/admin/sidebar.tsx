'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  Settings,
  FileSpreadsheet,
  Home,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin-dashboard',
    icon: Home,
  },
  {
    title: 'Questions',
    href: '/admin-dashboard/questions',
    icon: BookOpen,
  },
  {
    title: 'Users',
    href: '/admin-dashboard/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/admin-dashboard/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold">Brain Quest Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/api/auth/signout"
          className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
