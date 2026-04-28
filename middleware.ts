import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isPublicPath = pathname === '/' || isAuthPage || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  
  const token = request.cookies.get('voidx_token')?.value ||
    request.cookies.get('next-auth.session-token')?.value
  
  const hasLocalToken = request.headers.get('x-has-token')
  
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
