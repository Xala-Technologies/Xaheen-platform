/**
 * Middleware for Locale Detection - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Proper locale detection and routing
 * ✅ SSR-safe implementation
 * ✅ Explicit TypeScript return types
 */

import { NextRequest, NextResponse } from 'next/server';
import { supportedLocales, defaultLocale, getBestMatchingLocale, isValidLocale } from '@/lib/i18n';

/**
 * Middleware for automatic locale detection and routing
 * Handles locale-based URL routing and fallbacks
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  
  // Check if pathname already has a locale
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If pathname already has a valid locale, continue
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Skip middleware for API routes, static files, and special Next.js routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  const detectedLocale = getBestMatchingLocale(acceptLanguage || undefined);

  // Redirect to the detected locale
  const redirectUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  
  return NextResponse.redirect(redirectUrl);
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
