/**
 * Internationalization Types - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ Strict mode compliance
 * ✅ Proper type definitions for all i18n interfaces
 */

import { SupportedLocale } from '@/lib/i18n';

export interface LocaleParams {
  locale: SupportedLocale;
}

export interface PageProps {
  params: LocaleParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface LocalePageProps {
  params: LocaleParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps {
  children: React.ReactNode;
  params: LocaleParams;
}

export interface LocalizationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isRtl: boolean;
  t: (key: string, options?: any) => string;
}

export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

export interface LocaleConfig {
  locale: SupportedLocale;
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}
