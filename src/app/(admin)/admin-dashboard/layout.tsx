'use client';

import { Button } from "@/components/ui/button";
import { X, LayoutDashboard, FileQuestion, FolderKanban, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);

  const handleClose = () => {
    router.push('/dashboard');
  };

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const navigation = [
    { name: 'Overview', href: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Questions', href: '/admin-dashboard/questions', icon: FileQuestion },
    { name: 'Settings', href: '/admin-dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen bg-[var(--game-background)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--game-primary)]"></div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-[var(--game-surface)] border-b border-[rgba(255,255,255,0.1)]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/admin-dashboard" className="text-2xl font-bold text-[var(--game-text)] hover:text-[var(--game-primary)] transition-colors">
                Admin Dashboard
              </Link>
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
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 w-64 bg-[var(--game-surface)] border-r border-[rgba(255,255,255,0.1)]">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--game-primary)] text-white' 
                      : 'text-[var(--game-text-muted)] hover:bg-[var(--game-surface-light)] hover:text-[var(--game-text)]'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-64 pt-16 bg-[var(--game-background)]">
          {children}
        </main>
      </div>
    </div>
  );
}
