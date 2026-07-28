import type { Metadata } from 'next'
import { Geist, Literata } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteNavbar } from '@/components/SiteNavbar'
import { SiteFooter } from '@/components/SiteFooter'
import { getSession } from '@/lib/auth'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geist = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans'
})

const literata = Literata({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-card'
})

export const metadata: Metadata = {
  title: 'Maturitní kartičky',
  description: 'Uč se maturitní okruhy pomocí karet - online i tisk.'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={cn(geist.variable, literata.variable, 'h-full antialiased')}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteNavbar
            username={session?.username ?? null}
            role={session?.role ?? null}
          />
          {children}
          <SiteFooter />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
