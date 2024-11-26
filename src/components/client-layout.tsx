'use client'

import { useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { seedQuestions } from '@/lib/seed-questions'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedQuestions();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}