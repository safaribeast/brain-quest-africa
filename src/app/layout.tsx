import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/styles/globals.css'
import '@/styles/game-theme.css'
import { Toaster } from 'sonner'
import ClientLayout from "@/components/client-layout";
import { ThemeProvider } from '@/contexts/theme-context';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brain Quest Africa - Epic Knowledge Adventure",
  description: "Embark on an epic quest through African knowledge! Challenge yourself, earn rewards, and become a champion of wisdom.",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
