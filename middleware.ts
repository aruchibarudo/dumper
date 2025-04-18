import { NextRequest, NextResponse } from 'next/server'
import { ApiService } from '@/app/utils/api'
import { initialAuthData } from '@/app/context/auth/utils'
import { AuthData } from '@/app/context/auth/types'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  const { pathname } = request.nextUrl

  // если токена нет и это не главная страница, редиректим на /
  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // проверяем авторизацию
  try {
    const response = await ApiService.get<AuthData>('/auth/validate', {
      baseUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
      headers: token
        ? { Cookie: `access_token=${token};refresh_token=${refreshToken}` }
        : {},
    })

    const nextResponse = NextResponse.next()
    nextResponse.headers.set(
      'x-auth-data',
      JSON.stringify({
        isAuthenticated: response.isAuthenticated,
        user: response.user ?? null,
      }),
    )

    return nextResponse
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[middleware]: Token validation error for ${pathname}:`, {
        message: error.message,
      })
    }

    // если это не главная страница, редиректим на /
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // для главной страницы устанавливаем x-auth-data с isAuthenticated: false
    const nextResponse = NextResponse.next()
    nextResponse.headers.set('x-auth-data', JSON.stringify(initialAuthData))

    return nextResponse
  }
}

export const config = {
  matcher: ['/', '/projects/:path*', '/api/:path*'],
}
