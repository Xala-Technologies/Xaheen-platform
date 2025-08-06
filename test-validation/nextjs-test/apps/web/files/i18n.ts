{{!-- Template: i18n.ts.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: file --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/src/i18n.ts.hbs --}}
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
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = [{{#each locales}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}] as const;
export const defaultLocale = '{{primaryLocale}}' as const;

export type Locale = typeof locales[number];

// Validate locale function
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return defaultLocale;
}

// Request configuration for next-intl
export default getRequestConfig(async ({ locale }): Promise<{
  messages: Record<string, any>;
  timeZone: string;
  now: Date;
}> => {
  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    // Load messages for the locale
    const messages = (await import(`./messages/${locale}.json`)).default;
    
    // Configure timezone based on locale
    let timeZone = 'UTC';
    if (locale === 'nb') {
      timeZone = 'Europe/Oslo';
    } else if (locale === 'fr') {
      timeZone = 'Europe/Paris';
    } else if (locale === 'ar') {
      timeZone = 'Asia/Dubai';
    } else {
      timeZone = 'UTC';
    }

    return {
      messages,
      timeZone,
      now: new Date()
    };
  } catch (error) {
    // Fallback to default locale if messages can't be loaded
    console.error(`Failed to load messages for locale: ${locale}`, error);
    
    const fallbackMessages = (await import(`./messages/${defaultLocale}.json`)).default;
    
    return {
      messages: fallbackMessages,
      timeZone: 'UTC',
      now: new Date()
    };
  }
});

// Locale configuration for different regions
export const localeConfig = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: 'en-US'
  },
  nb: {
    name: 'Norsk bokmål',
    flag: '🇳🇴',
    dir: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
    currency: 'NOK',
    numberFormat: 'nb-NO'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'fr-FR'
  },
  ar: {
    name: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: 'ar-SA'
  }
} as const;

// Helper function to get locale configuration
export function getLocaleConfig(locale: Locale): typeof localeConfig[Locale] {
  return localeConfig[locale];
}

// Helper function to format currency
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency?: string
): string {
  const config = getLocaleConfig(locale);
  const currencyCode = currency || config.currency;
  
  return new Intl.NumberFormat(config.numberFormat, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

// Helper function to format date
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const config = getLocaleConfig(locale);
  
  return new Intl.DateTimeFormat(config.numberFormat, {
    ...options,
    timeZone: locale === 'nb' ? 'Europe/Oslo' : 'UTC'
  }).format(date);
}
{{else}}
// No internationalization configuration needed for default UI
export const locales = ['en'] as const;
export const defaultLocale = 'en' as const;
export type Locale = typeof locales[number];

export function isValidLocale(locale: string): locale is Locale {
  return locale === 'en';
}

export function getLocaleFromPathname(pathname: string): Locale {
  return defaultLocale;
}
{{/if}}
