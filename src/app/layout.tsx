import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DrawDash - Premium Lodtrækninger & Gevinster',
  description: 'Deltag i spændende lodtrækninger og vind fantastiske præmier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      {/* suppressHydrationWarning prevents warnings from browser extensions like Grammarly */}
      <body className={inter.className} suppressHydrationWarning={true}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <CookieConsent />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}