import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function isSafeRedirectPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')  && !path.includes('://')
}

export function middleware(request: NextRequest) {
  const tokenValue = request.cookies.get('token')?.value

  if (!tokenValue || isTokenExpired(tokenValue)) {
    const loginUrl = new URL('/login', request.url)
    const from = request.nextUrl.pathname
    if (isSafeRedirectPath(from)) {
      loginUrl.searchParams.set('from', from)
    }
    const response = NextResponse.redirect(loginUrl)
    if (tokenValue) {
      response.cookies.delete('token')
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
