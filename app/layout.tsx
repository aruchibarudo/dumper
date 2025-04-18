import { headers } from 'next/headers'
import ClientLayout from '@/layouts/ClientLayout'
import { Children } from '@/app/types'
import { AuthData } from '@/app/context/auth/types'
import { initialAuthData } from '@/app/context/auth/utils'

export default async function RootLayout({ children }: Children) {
  const headersData = await headers()
  const authHeaders = headersData.get('x-auth-data')
  let authData: AuthData = initialAuthData

  // читаем заголовок x-auth-data для защищенных роутов
  if (authHeaders) {
    try {
      authData = JSON.parse(authHeaders)
    } catch (error) {
      console.error('Failed to parse x-auth-data:', error)
    }
  } else {
    // для незащищенных роутов (напр, /) делаем запрос к /auth/validate
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/auth/validate`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        authData = {
          isAuthenticated: data.isAuthenticated,
          user: data.user || null,
        }
      }
    } catch (error) {
      console.error('Auth validation error in layout:', error)
    }
  }

  return (
    <html lang="ru">
      <body className="antialiased">
        <ClientLayout authData={authData}>{children}</ClientLayout>
      </body>
    </html>
  )
}
