'use client';

import { ReactNode } from "react";
import { auth } from "@/lib/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user] = useAuthState(auth);

  if (!user) return null;

  return (
    <div className="h-full">
      {children}
    </div>
  );
}
