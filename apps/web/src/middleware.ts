// apps/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register'];
const PORTAL_PATHS = ['/portal'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'));
  const isPortal = PORTAL_PATHS.some((p) => pathname.startsWith(p));

  // Not authenticated
  if (!isPublic && !token) {
    const loginUrl = isPortal
      ? new URL('/portal/login', request.url)
      : new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Client users must use the portal, not the staff dashboard
  if (token && userRole === 'client' && !isPortal && !isPublic) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
