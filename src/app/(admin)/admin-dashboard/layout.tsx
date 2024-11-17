'use client';

import { Button } from "@/components/ui/button";
import { X, LayoutDashboard, FileQuestion, FolderKanban, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClose = () => {
    router.push('/');
  };

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Questions', href: '/admin-dashboard/questions', icon: FileQuestion },
    { name: 'Settings', href: '/admin-dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--game-background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-[var(--game-surface)] border-b border-[rgba(255,255,255,0.1)]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[var(--game-text)]">Admin Dashboard</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-[var(--game-surface-light)] text-[var(--game-text)]"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar & Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="fixed left-0 top-16 h-full w-64 bg-[var(--game-surface)] border-r border-[rgba(255,255,255,0.1)]">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                >
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--game-primary)] text-white' 
                      : 'text-[var(--game-text-muted)] hover:bg-[var(--game-surface-light)] hover:text-[var(--game-text)]'}
                  `}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="p-8">
            <div className="game-card">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
