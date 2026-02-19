import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for admin and teacher-portal routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/teacher-portal')) {
    return NextResponse.next();
  }

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(az|ru|en)/:path*', '/((?!_next|_vercel|api|admin|teacher-portal|.*\\..*).*)',],
};
