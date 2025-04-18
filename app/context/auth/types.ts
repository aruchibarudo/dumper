import { Children } from '@/app/types'

export type AuthUser = {
  sub: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  preferred_username: string
  email: string
}

export type AuthData = {
  isAuthenticated: boolean
  user: AuthUser | null
}

export type AuthProviderProps = Children & { initialAuth: AuthData }
