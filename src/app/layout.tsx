import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/styles/globals.css'
import '@/styles/game-theme.css'
import { Toaster } from 'sonner'
import ClientLayout from "@/components/client-layout";
import { ThemeProvider } from '@/contexts/theme-context';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brain Quest Africa",
  description: "An engaging educational quiz platform designed for African students, featuring diverse topics and interactive learning experiences.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} game-container`}>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
