import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('voidx_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/projects') || 
      pathname.startsWith('/database') || 
      pathname.startsWith('/storage') || 
      pathname.startsWith('/auth-users') || 
      pathname.startsWith('/settings')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/projects/:path*', '/database/:path*', '/storage/:path*', '/auth-users/:path*', '/settings/:path*'],
};
