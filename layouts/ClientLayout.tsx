'use client'

import { ReactNode } from 'react'
import { Theme } from '@consta/uikit/Theme'
import { presetGpnDefault } from '@consta/uikit/Theme'
import { AuthProvider } from '@/app/context/auth/AuthContext'
import { ProjectProvider } from '@/app/context/project/ProjectContext'
import ModalProvider from '@/components/ui/modal/ModalProvider'
import SnackbarProvider from '@/components/ui/snackbar/SnackbarProvider'
import Header from '@/components/header'
import ContentWrapper from '@/components/content/ContentWrapper'
import { Informer } from '@consta/uikit/Informer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  AllCommunityModule,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-community'
import { AuthData } from '@/app/context/auth/types'

import '../app/globals.css'

interface ClientLayoutProps {
  authData: AuthData
  children: ReactNode
}

provideGlobalGridOptions({
  theme: 'legacy',
})

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

const queryClient = new QueryClient()

export default function ClientLayout({
  authData,
  children,
}: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialAuth={authData}>
        <ProjectProvider>
          <Theme preset={presetGpnDefault}>
            <ModalProvider>
              <SnackbarProvider>
                <Header />
                {authData.isAuthenticated ? (
                  children
                ) : (
                  <ContentWrapper>
                    <Informer
                      status="alert"
                      view="filled"
                      label="Пожалуйста, авторизуйтесь для просмотра проектов"
                    />
                  </ContentWrapper>
                )}
              </SnackbarProvider>
            </ModalProvider>
          </Theme>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
