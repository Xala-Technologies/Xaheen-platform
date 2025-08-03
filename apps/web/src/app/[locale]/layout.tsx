/**
 * Locale Layout - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ RTL support for Arabic
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ✅ SSR-safe implementation
 * ✅ Explicit TypeScript return types
 */

import { ReactNode } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supportedLocales, isRtlLocale, SupportedLocale, localeNames } from '@/lib/i18n';
import { UISystemProvider } from '@/app/providers/UISystemProvider';
import { LocalizationProvider } from '@/app/providers/LocalizationProvider';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { RootProvider } from 'fumadocs-ui/provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from "@/components/ui/sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
});

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: SupportedLocale;
  };
}

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams(): Array<{ locale: SupportedLocale }> {
  return supportedLocales.map((locale) => ({ locale }));
}

/**
 * Generate metadata with proper locale and direction support
 */
export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: {
      template: '%s | Xaheen Builder',
      default: 'Xaheen Builder - Modern TypeScript Project Scaffolding',
    },
    description: 'A modern CLI tool for scaffolding end-to-end type-safe TypeScript projects with best practices and customizable configurations',
    keywords: [
      'TypeScript',
      'project scaffolding',
      'boilerplate',
      'type safety',
      'Xaheen Builder',
      'CLI tool',
      'development tools'
    ],
    authors: [{ name: 'Xaheen Builder Team' }],
    creator: 'Xaheen Builder',
    publisher: 'Xaheen Builder',
    formatDetection: {
      email: false,
      telephone: false,
    },
    other: {
      'locale': locale,
      'dir': isRtlLocale(locale) ? 'rtl' : 'ltr',
    },
    // Open Graph metadata
    openGraph: {
      title: 'Xaheen Builder',
      description: 'Modern TypeScript Project Scaffolding Tool',
      type: 'website',
      locale: locale,
      siteName: 'Xaheen Builder',
    },
    // Twitter metadata
    twitter: {
      card: 'summary_large_image',
      title: 'Xaheen Builder',
      description: 'Modern TypeScript Project Scaffolding Tool',
    },
  };
}

/**
 * Locale-aware layout with full Xala UI System v5.0.0 integration
 * Supports RTL languages and provides proper accessibility features
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  // Validate locale - redirect to 404 if invalid
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const direction = isRtlLocale(locale) ? 'rtl' : 'ltr';
  const localeName = localeNames[locale];

  return (
    <html 
      lang={locale} 
      dir={direction} 
      className={poppins.className} 
      suppressHydrationWarning
    >
      <head>
        <meta name="locale" content={locale} />
        <meta name="locale-name" content={localeName} />
        <meta name="text-direction" content={direction} />
      </head>
      <body className="antialiased">
        <LocalizationProvider locale={locale}>
          <UISystemProvider locale={locale}>
            <RootProvider
              search={{
                options: {
                  type: "static",
                },
              }}
            >
              <NuqsAdapter>
                <NavigationHeader locale={locale} />
                <div style={{ height: '64px' }} />
                {children}
                <Toaster />
              </NuqsAdapter>
            </RootProvider>
          </UISystemProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
