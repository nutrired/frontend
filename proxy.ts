import { NextRequest, NextResponse } from 'next/server';

// Routes accessible without authentication.
const PUBLIC_PATHS = ['/', '/search', '/for-nutritionists', '/how', '/about', '/privacy', '/terms'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
// /verify-email is always accessible.
const ALWAYS_ACCESSIBLE = ['/verify-email'];

function isPublic(pathname: string): boolean {
  if (ALWAYS_ACCESSIBLE.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true;
  // Both /nutritionists (listing) and /nutritionists/slug (profile) are public.
  if (pathname.startsWith('/nutritionists')) return true;
  return false;
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

function hasValidAccessToken(request: NextRequest): boolean {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return false;

  try {
    const [, payloadB64] = token.split('.');
    // Node.js runtime (Next.js 16 default): atob() is available as a global Web API.
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const exp: number = payload.exp ?? 0;
    return Date.now() / 1000 < exp;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasValidAccessToken(request);

  // Already logged in → redirect away from auth pages.
  if (loggedIn && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Not logged in → redirect to login for protected routes.
  if (!loggedIn && !isPublic(pathname) && !isAuthPage(pathname)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
