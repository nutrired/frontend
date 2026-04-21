import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

// Routes accessible without authentication.
const PUBLIC_PATHS = ['/', '/search', '/for-nutritionists', '/how', '/about', '/privacy', '/terms', '/palette-v2'];
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

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, detect and redirect
  if (!pathnameHasLocale) {
    let locale = defaultLocale;

    // 1. Check NEXT_LOCALE cookie
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale as any)) {
      locale = cookieLocale;
    } else {
      // 2. Check Accept-Language header
      const acceptLanguage = request.headers.get('accept-language');
      if (acceptLanguage) {
        // Simple negotiation: check if 'en' appears before 'es'
        const enIndex = acceptLanguage.indexOf('en');
        const esIndex = acceptLanguage.indexOf('es');

        if (enIndex !== -1 && (esIndex === -1 || enIndex < esIndex)) {
          locale = 'en';
        }
      }
    }

    // Redirect to localized URL
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Extract locale from pathname for auth checks
  const localeMatch = pathname.match(/^\/([^/]+)/);
  const locale = localeMatch ? localeMatch[1] : defaultLocale;
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const loggedIn = hasValidAccessToken(request);

  // Already logged in → redirect away from auth pages and landing page to dashboard.
  if (loggedIn && isAuthPage(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  // Already logged in and on landing page → redirect to dashboard.
  if (loggedIn && pathnameWithoutLocale === '/') {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Not logged in → redirect to login for protected routes.
  if (!loggedIn && !isPublic(pathnameWithoutLocale) && !isAuthPage(pathnameWithoutLocale)) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
