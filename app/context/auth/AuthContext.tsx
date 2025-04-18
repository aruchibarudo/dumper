import { createContext, useContext } from 'react'
import { AuthData, AuthProviderProps } from '@/app/context/auth/types'
import { initialAuthData } from '@/app/context/auth/utils'

const AuthContext = createContext<AuthData>(initialAuthData)

export const AuthProvider = ({ children, initialAuth }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={initialAuth}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
