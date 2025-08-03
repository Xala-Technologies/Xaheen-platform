/**
 * Responsive Design Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Professional breakpoint system
 * - Container max-widths
 * - Typography scaling
 * - Spacing adjustments
 * - Component behavior per device
 * - Norwegian mobile patterns
 * - Accessibility-first responsive design
 */

# Next.js Integration Guide

This guide provides step-by-step instructions for integrating the Xala UI System into your Next.js application with proper SSR support, localization, and theming.

## 📋 Prerequisites

- Next.js 13+ with App Router
- TypeScript 4.9+
- Node.js 18+
- pnpm (recommended package manager)

## 🚀 Step 1: Installation

```bash
# Install the UI system
pnpm add @xala-technologies/ui-system

# Install required peer dependencies
pnpm add react@^18.0.0 react-dom@^18.0.0

# Install localization dependencies
pnpm add next-i18next i18next react-i18next

# Install additional utilities (optional but recommended)
pnpm add clsx class-variance-authority
```

## 🏗️ Step 2: Project Structure

Create the following directory structure in your Next.js project:

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── providers/
│   │   ├── UISystemProvider.tsx
│   │   └── LocalizationProvider.tsx
│   └── components/
│       ├── ui/           # Custom UI components
│       └── layouts/      # Layout components
├── lib/
│   ├── i18n.ts
│   └── utils.ts
├── styles/
│   └── globals.css
└── types/
    └── i18n.ts
```

## 🎨 Step 3: Configure TypeScript

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🌍 Step 4: Configure Internationalization

Create `src/lib/i18n.ts`:

```typescript
import { createInstance, Resource } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

export const supportedLocales = ['en', 'no', 'fr', 'ar'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const defaultLocale: SupportedLocale = 'en';

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  no: 'Norsk',
  fr: 'Français',
  ar: 'العربية'
};

export const rtlLocales: SupportedLocale[] = ['ar'];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as SupportedLocale);
}

export async function getI18nInstance(locale: SupportedLocale = defaultLocale) {
  const i18nInstance = createInstance();
  
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`../locales/${language}/${namespace}.json`)
    ))
    .init({
      lng: locale,
      fallbackLng: defaultLocale,
      supportedLngs: supportedLocales,
      defaultNS: 'common',
      fallbackNS: 'common',
      ns: ['common', 'ui', 'navigation', 'forms'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18nInstance;
}
```

Create `src/types/i18n.ts`:

```typescript
import { SupportedLocale } from '@/lib/i18n';

export interface LocaleParams {
  locale: SupportedLocale;
}

export interface PageProps {
  params: LocaleParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}
```

## 🎯 Step 5: Create Providers

Create `src/app/providers/UISystemProvider.tsx`:

```typescript
'use client';

import { 
  UISystemProvider as XalaUISystemProvider,
  type UISystemProviderProps 
} from '@xala-technologies/ui-system';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  theme?: UISystemProviderProps['theme'];
  locale?: string;
}

export function UISystemProvider({ 
  children, 
  theme = 'light',
  locale = 'en' 
}: Props): JSX.Element {
  return (
    <XalaUISystemProvider
      theme={theme}
      locale={locale}
      enableSSR={true}
      enableAccessibility={true}
      enableResponsive={true}
    >
      {children}
    </XalaUISystemProvider>
  );
}
```

Create `src/app/providers/LocalizationProvider.tsx`:

```typescript
'use client';

import { I18nextProvider } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';
import { createInstance, i18n } from 'i18next';
import { getI18nInstance, SupportedLocale } from '@/lib/i18n';

interface Props {
  children: ReactNode;
  locale: SupportedLocale;
}

export function LocalizationProvider({ children, locale }: Props): JSX.Element {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  useEffect(() => {
    let mounted = true;
    
    getI18nInstance(locale).then((instance) => {
      if (mounted) {
        setI18nInstance(instance);
      }
    });

    return () => {
      mounted = false;
    };
  }, [locale]);

  if (!i18nInstance) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}
```

## 📱 Step 6: Configure App Layout

Create `src/app/[locale]/layout.tsx`:

```typescript
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supportedLocales, isRtlLocale, SupportedLocale } from '@/lib/i18n';
import { UISystemProvider } from '@/app/providers/UISystemProvider';
import { LocalizationProvider } from '@/app/providers/LocalizationProvider';
import '@/styles/globals.css';

interface Props {
  children: ReactNode;
  params: {
    locale: SupportedLocale;
  };
}

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: Props): Metadata {
  const { locale } = params;
  
  return {
    title: 'Xala Application',
    description: 'Enterprise application built with Xala UI System',
    other: {
      'locale': locale,
      'dir': isRtlLocale(locale) ? 'rtl' : 'ltr',
    },
  };
}

export default function LocaleLayout({ children, params }: Props): JSX.Element {
  const { locale } = params;

  // Validate locale
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  const direction = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className="antialiased">
        <LocalizationProvider locale={locale}>
          <UISystemProvider locale={locale}>
            {children}
          </UISystemProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
```

## 🏠 Step 7: Create Your First Page

Create `src/app/[locale]/page.tsx`:

```typescript
import { 
  Container, 
  VStack, 
  Text, 
  Button, 
  Card, 
  CardHeader, 
  CardContent 
} from '@xala-technologies/ui-system';
import { PageProps } from '@/types/i18n';
import { getI18nInstance } from '@/lib/i18n';

export default async function HomePage({ params }: PageProps): Promise<JSX.Element> {
  const { locale } = params;
  const i18n = await getI18nInstance(locale);
  const t = i18n.getFixedT(locale, 'common');

  return (
    <Container maxWidth="lg" className="py-8">
      <VStack spacing="6" align="center">
        <Text variant="h1" color="primary">
          {t('welcome.title')}
        </Text>
        
        <Text variant="body1" color="secondary" textAlign="center">
          {t('welcome.description')}
        </Text>

        <Card maxWidth="md">
          <CardHeader>
            <Text variant="h3">{t('features.title')}</Text>
          </CardHeader>
          <CardContent>
            <VStack spacing="4">
              <Text variant="body2">
                ✅ {t('features.ssr')}
              </Text>
              <Text variant="body2">
                ✅ {t('features.accessibility')}
              </Text>
              <Text variant="body2">
                ✅ {t('features.responsive')}
              </Text>
              <Text variant="body2">
                ✅ {t('features.localization')}
              </Text>
            </VStack>
          </CardContent>
        </Card>

        <Button variant="primary" size="lg">
          {t('actions.getStarted')}
        </Button>
      </VStack>
    </Container>
  );
}
```

## 🌐 Step 8: Create Locale Files

Create the following locale files:

`public/locales/en/common.json`:
```json
{
  "welcome": {
    "title": "Welcome to Xala UI System",
    "description": "A production-ready, accessible, and localized design system"
  },
  "features": {
    "title": "Key Features",
    "ssr": "Server-Side Rendering Support",
    "accessibility": "WCAG 2.2 AAA Compliance",
    "responsive": "Mobile-First Responsive Design",
    "localization": "Multi-Language Support"
  },
  "actions": {
    "getStarted": "Get Started"
  }
}
```

`public/locales/no/common.json`:
```json
{
  "welcome": {
    "title": "Velkommen til Xala UI System",
    "description": "Et produksjonsklart, tilgjengelig og lokalisert designsystem"
  },
  "features": {
    "title": "Hovedfunksjoner",
    "ssr": "Server-Side Rendering Støtte",
    "accessibility": "WCAG 2.2 AAA Samsvar",
    "responsive": "Mobil-Først Responsiv Design",
    "localization": "Flerspråklig Støtte"
  },
  "actions": {
    "getStarted": "Kom i gang"
  }
}
```

## 🎨 Step 9: Configure Global Styles

Create `src/styles/globals.css`:

```css
@import '@xala-technologies/ui-system/dist/styles.css';

/* Custom CSS variables for your application */
:root {
  --app-max-width: 1200px;
  --app-header-height: 64px;
  --app-sidebar-width: 280px;
}

/* Base styles */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  font-family: var(--font-family-body);
  line-height: var(--line-height-body);
  color: var(--color-text-primary);
  background-color: var(--color-background-primary);
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* RTL support */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .ltr-content {
  text-align: left;
}
```

## ⚙️ Step 10: Configure Next.js

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  i18n: {
    locales: ['en', 'no', 'fr', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    // Optimize bundle for UI system
    config.resolve.alias = {
      ...config.resolve.alias,
      '@xala-technologies/ui-system': '@xala-technologies/ui-system/dist',
    };
    
    return config;
  },
};

module.exports = nextConfig;
```

## 🧪 Step 11: Create a Custom Component

Create `src/components/ui/WelcomeCard.tsx`:

```typescript
import { 
  Card, 
  CardHeader, 
  CardContent, 
  VStack, 
  Text, 
  Button 
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';

interface WelcomeCardProps {
  onGetStarted?: () => void;
}

export function WelcomeCard({ onGetStarted }: WelcomeCardProps): JSX.Element {
  const { t } = useTranslation('common');

  const handleGetStarted = (): void => {
    onGetStarted?.();
  };

  return (
    <Card maxWidth="md" elevation="medium">
      <CardHeader>
        <Text variant="h2" color="primary">
          {t('welcome.title')}
        </Text>
      </CardHeader>
      <CardContent>
        <VStack spacing="4">
          <Text variant="body1" color="secondary">
            {t('welcome.description')}
          </Text>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleGetStarted}
            fullWidth
          >
            {t('actions.getStarted')}
          </Button>
        </VStack>
      </CardContent>
    </Card>
  );
}
```

## 🚀 Step 12: Run Your Application

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Your application will be available at:
- English: `http://localhost:3000/en`
- Norwegian: `http://localhost:3000/no`
- French: `http://localhost:3000/fr`
- Arabic: `http://localhost:3000/ar`

## 🔧 Advanced Configuration

### Theme Switching

```typescript
'use client';

import { useState } from 'react';
import { Button, useTheme } from '@xala-technologies/ui-system';

export function ThemeSwitcher(): JSX.Element {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
```

### Custom Theme

```typescript
import { createTheme } from '@xala-technologies/ui-system';

export const customTheme = createTheme({
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
  },
  typography: {
    fontFamily: {
      body: ['Inter', 'sans-serif'],
      heading: ['Poppins', 'sans-serif'],
    },
  },
});
```

## 📚 Next Steps

1. **Explore Components**: Check out the [component documentation](./components/) for detailed usage examples
2. **Customize Themes**: Learn about [theming](./themes.md) and white-labeling
3. **Add Testing**: Set up [testing](./testing/) for your components
4. **Performance**: Review [best practices](./best-practices.md) for optimization

## 🆘 Troubleshooting

Common issues and solutions:

### SSR Hydration Mismatch
```typescript
// Use dynamic imports for client-only components
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

### Locale Detection Issues
```typescript
// Force locale in middleware
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add custom locale detection logic
  return NextResponse.next();
}
```

### Bundle Size Optimization
```typescript
// Use selective imports
import { Button } from '@xala-technologies/ui-system/components/ui/button';
import { Text } from '@xala-technologies/ui-system/components/ui/typography';
```

For more troubleshooting tips, see our [troubleshooting guide](./troubleshooting.md).
