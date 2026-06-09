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

function extractRole(token: string): string | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>
    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    return null
  }
}

function isSafeRedirectPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tokenValue = request.cookies.get('token')?.value

  // No token or expired → redirect to login
  if (!tokenValue || isTokenExpired(tokenValue)) {
    const loginUrl = new URL('/login', request.url)
    if (isSafeRedirectPath(pathname)) {
      loginUrl.searchParams.set('from', pathname)
    }
    const response = NextResponse.redirect(loginUrl)
    if (tokenValue) {
      response.cookies.delete('token')
    }
    return response
  }

  const role = extractRole(tokenValue)

  // Block aluno from admin area → redirect to student dashboard
  if (pathname.startsWith('/admin') && role === 'aluno') {
    return NextResponse.redirect(new URL('/aluno', request.url))
  }

  // Block admin/professor from student area → redirect to admin dashboard
  if (pathname.startsWith('/aluno') && role !== 'aluno') {
    return NextResponse.redirect(new URL(role ? '/admin' : '/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/aluno/:path*'],
}
