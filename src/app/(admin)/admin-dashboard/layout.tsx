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

export default function AdminDashboardLayout({
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
    <div className="flex-1">
      {children}
    </div>
  );
}
