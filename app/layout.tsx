'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Geist, Geist_Mono } from 'next/font/google'
import { presetGpnDefault, Theme } from '@consta/uikit/Theme'
import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community'

import Header from '@/components/header'
import { ProjectProvider } from '@/app/context/project/ProjectContext'
import ModalProvider from '@/components/ui/modal/ModalProvider'
import SnackbarProvider from '@/components/ui/snackbar/SnackbarProvider'
import { Children } from '@/app/types'

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

const queryClient = new QueryClient()

export default function RootLayout({ children }: Readonly<Children>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <ProjectProvider>
            <Theme preset={presetGpnDefault}>
              <ModalProvider>
                <SnackbarProvider>
                  <Header />
                  {children}
                </SnackbarProvider>
              </ModalProvider>
            </Theme>
          </ProjectProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
