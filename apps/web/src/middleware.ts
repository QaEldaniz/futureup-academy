import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Decode JWT payload without verifying signature (for routing only — API verifies fully)
function decodeJwtPayload(token: string): { type?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // === Auth guard for protected routes ===
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isLmsRoute = pathname.startsWith('/lms');
  const isTeacherPortal = pathname.startsWith('/teacher-portal') && !pathname.startsWith('/teacher-portal/login');

  if (isAdminRoute || isLmsRoute || isTeacherPortal) {
    const token = request.cookies.get('futureup_token')?.value;

    if (!token) {
      // No cookie — redirect to login
      const loginUrl = isAdminRoute
        ? new URL('/admin/login', request.url)
        : new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.type) {
      // Invalid/expired token — redirect to login
      const loginUrl = isAdminRoute
        ? new URL('/admin/login', request.url)
        : new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid cookie
      response.cookies.delete('futureup_token');
      return response;
    }

    // Role-based access check
    if (isAdminRoute && payload.type !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLmsRoute) {
      const isTeacherPath = pathname.startsWith('/lms/teacher');
      const isStudentPath = pathname.startsWith('/lms/student');
      const isParentPath = pathname.startsWith('/lms/parent');

      // Teachers and admins can access teacher pages
      if (isTeacherPath && payload.type !== 'teacher' && payload.type !== 'admin') {
        return NextResponse.redirect(new URL(`/lms/${payload.type}`, request.url));
      }
      if (isStudentPath && payload.type !== 'student') {
        return NextResponse.redirect(new URL(`/lms/${payload.type === 'admin' ? 'teacher' : payload.type}`, request.url));
      }
      if (isParentPath && payload.type !== 'parent') {
        return NextResponse.redirect(new URL(`/lms/${payload.type === 'admin' ? 'teacher' : payload.type}`, request.url));
      }
    }

    return NextResponse.next();
  }

  // Skip i18n for remaining non-public routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/teacher-portal') || pathname.startsWith('/embed')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(az|ru|en)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)',],
};
