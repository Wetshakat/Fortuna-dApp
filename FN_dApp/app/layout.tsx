// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import PrivyProvider from './privy-provider' 
import AuthModalWrapper from './auth-modal-wrapper' 
import { Toaster } from '@/components/ui/toaster' 
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fortuna - Fair Digital Lottery',
  description: 'Play Fair. Win Big. Anytime. Experience transparent digital lotteries powered by blockchain.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <PrivyProvider>
          <AuthModalWrapper />
          {children}
          <Toaster />
        </PrivyProvider>

        <Analytics />
      </body>
    </html>
  )
}
