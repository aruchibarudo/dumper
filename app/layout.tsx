'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import { presetGpnDefault, Theme } from '@consta/uikit/Theme'
import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community'
import './globals.css'

provideGlobalGridOptions({
  theme: 'legacy',
})

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Theme preset={presetGpnDefault}>
          <main className="p-4">{children}</main>
        </Theme>
      </body>
    </html>
  )
}
