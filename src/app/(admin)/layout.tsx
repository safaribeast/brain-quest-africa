'use client';

import { Button } from "@/components/ui/button";
import { X, LayoutDashboard, FileQuestion, Users, Settings, Home } from 'lucide-react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  const handleClose = () => {
    router.push('/');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800 border-r border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-blue-500">Admin Dashboard</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-2">
              {[
                { href: "/admin-dashboard", icon: Home, label: "Overview" },
                { href: "/admin-dashboard/questions", icon: FileQuestion, label: "Questions" },
                { href: "/admin-dashboard/users", icon: Users, label: "Users" },
                { href: "/admin-dashboard/settings", icon: Settings, label: "Settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveLink(item.href)
                      ? "bg-gray-900 text-blue-500"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="mr-3 h-5 w-5" />
              Close Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
