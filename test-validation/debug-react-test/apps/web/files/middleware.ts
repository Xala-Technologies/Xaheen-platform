{{!-- Template: middleware.ts.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: file --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/src/middleware.ts.hbs --}}
/*
 * XALA UI SYSTEM v5 COMPLIANCE RULES - MANDATORY
 * 
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style prop, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 */

{{#if (eq ui "xala")}}
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Supported locales configuration
const locales = [{{#each locales}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}];
const defaultLocale = '{{primaryLocale}}';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true,
  alternateLinks: true,
  pathnames: {
    '/': '/',
    '/dashboard': {
      en: '/dashboard',
      nb: '/dashbord',
      fr: '/tableau-de-bord',
      ar: '/لوحة-القيادة'
    },
    '/settings': {
      en: '/settings',
      nb: '/innstillinger',
      fr: '/parametres',
      ar: '/الإعدادات'
    },
    '/profile': {
      en: '/profile',
      nb: '/profil',
      fr: '/profil',
      ar: '/الملف-الشخصي'
    }
  }
});

{{#if (eq compliance "norwegian")}}
// Norwegian compliance headers
function addComplianceHeaders(response: NextResponse): NextResponse {
  // GDPR compliance headers
  response.headers.set('X-GDPR-Compliant', 'true');
  response.headers.set('X-Privacy-Policy', '/privacy');
  response.headers.set('X-Data-Controller', 'Norwegian Entity');
  
  // Norwegian security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Norwegian accessibility compliance
  response.headers.set('X-Accessibility-Standard', 'WCAG-2.2-AAA');
  response.headers.set('X-Norwegian-Compliance', 'NSM-Approved');
  
  return response;
}
{{/if}}

export default function middleware(request: NextRequest): NextResponse {
  // Handle internationalization
  const response = intlMiddleware(request);
  
  {{#if (eq compliance "norwegian")}}
  // Add Norwegian compliance headers
  return addComplianceHeaders(response);
  {{else}}
  return response;
  {{/if}}
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files (_next/static)
  // - Image optimization files (_next/image)
  // - Favicon, robots.txt, etc.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'
  ]
};
{{else}}
// No internationalization middleware needed for default UI
import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)'
  ]
};
{{/if}}
