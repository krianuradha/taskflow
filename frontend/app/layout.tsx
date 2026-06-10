import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'

const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Project Camp',
  description: 'Project Camp is a production-ready project management workspace.',
  metadataBase: new URL(metadataBaseUrl),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
