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
pnpm add i18next react-i18next i18next-resources-to-backend

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
      import(`../../public/locales/${language}/${namespace}.json`)
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
  UISystemProvider as XalaUISystemProvider
} from '@xala-technologies/ui-system';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  locale?: string;
}

export function UISystemProvider({ 
  children, 
  locale = 'en' 
}: Props): JSX.Element {
  return (
    <XalaUISystemProvider>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Xala Application',
    description: 'Enterprise application built with Xala UI System',
    other: {
      'locale': locale,
      'dir': isRtlLocale(locale) ? 'rtl' : 'ltr',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props): Promise<JSX.Element> {
  const { locale } = await params;

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
import { 
  Container, 
  Stack, 
  Typography, 
  Card, 
  Button,
  DataTable,
  useTokens
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';

export default function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const { colors, spacing } = useTokens();
  
  return (
    <Container size="full" padding="lg">
      {/* Page Header */}
      <Stack direction="vertical" gap="sm" style={{ marginBottom: spacing.xl }}>
        <Typography variant="h1">
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body" style={{ color: colors.text.secondary }}>
          {t('dashboard.subtitle')}
        </Typography>
      </Stack>
      
      {/* Stats Grid */}
      <Stack 
        direction="horizontal" 
        gap="lg" 
        style={{ 
          marginBottom: spacing.xl,
          flexWrap: 'wrap',
          '@media (max-width: 768px)': {
            flexDirection: 'column'
          }
        }}
      >
        {statsData.map((stat) => (
          <Card key={stat.id} padding="lg" style={{ flex: 1, minWidth: '200px' }}>
            <Stack direction="vertical" gap="sm">
              <Typography variant="h3" weight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body" style={{ color: colors.text.secondary }}>
                {stat.label}
              </Typography>
              <Typography 
                variant="caption" 
                style={{ 
                  color: stat.trend > 0 ? colors.semantic.success : colors.semantic.error
                }}
              >
                {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </Typography>
            </Stack>
          </Card>
        ))}
      </Stack>
      
      {/* Main Content */}
      <Stack 
        direction="horizontal" 
        gap="lg"
        style={{
          '@media (max-width: 1024px)': {
            flexDirection: 'column'
          }
        }}
      >
        <Card padding="lg" style={{ flex: 1 }}>
          <Stack direction="vertical" gap="md">
            <Typography variant="h3">
              {t('dashboard.recentActivity')}
            </Typography>
            {/* Activity content */}
          </Stack>
        </Card>
        
        <Card padding="lg" style={{ flex: 1 }}>
          <Stack direction="vertical" gap="md">
            <Typography variant="h3">
              {t('dashboard.analytics')}
            </Typography>
            {/* Analytics content */}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

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

## 🔄 Step 10: Configure Middleware

Create `src/middleware.ts` for automatic locale detection and routing:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supportedLocales, defaultLocale, getBestMatchingLocale } from '@/lib/i18n';

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname already has a locale
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get the best matching locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  const locale = getBestMatchingLocale(acceptLanguage || undefined);
  
  // Redirect to the locale-prefixed URL
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|manifest.json|robots.txt).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};
```

Update your `src/lib/i18n.ts` to include the `getBestMatchingLocale` function:

```typescript
// Add this function to your existing i18n.ts file
export function getBestMatchingLocale(acceptLanguage?: string): SupportedLocale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.toLowerCase(), quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the best match
  for (const { code } of languages) {
    // Exact match
    if (supportedLocales.includes(code as SupportedLocale)) {
      return code as SupportedLocale;
    }
    
    // Language family match (e.g., 'en-US' -> 'en')
    const languageFamily = code.split('-')[0];
    if (supportedLocales.includes(languageFamily as SupportedLocale)) {
      return languageFamily as SupportedLocale;
    }
  }

  return defaultLocale;
}
```

## ⚙️ Step 11: Configure Next.js

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  experimental: {
    reactCompiler: true, // Optional: Enable React Compiler
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

## 🧪 Step 12: Create a Custom Component

Create `src/components/ui/WelcomeCard.tsx`:

```typescript
import { 
  Card, 
  Stack, 
  Typography, 
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
    <Card padding="lg">
      <Stack direction="vertical" gap="md">
        <Typography variant="h2" color="primary">
          {t('welcome.title')}
        </Typography>
        <Typography variant="body" color="muted">
          {t('welcome.description')}
        </Typography>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleGetStarted}
        >
          {t('actions.getStarted')}
        </Button>
      </Stack>
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

## ✅ Step 13: Testing and Verification

### Test Locale Routing

1. Visit `http://localhost:3000` - should redirect to your default locale
2. Test automatic locale detection by changing browser language
3. Verify RTL layout works correctly for Arabic

### Verify Features

✅ **UI System Integration**: All components render with proper styling
✅ **Localization**: Text changes based on locale
✅ **RTL Support**: Arabic displays right-to-left
✅ **SSR**: View page source contains rendered content
✅ **Accessibility**: Components are keyboard navigable

## 🔧 Common Issues and Solutions

### Issue: "UISystemProviderProps not found"
**Solution**: Use the simplified provider shown in this guide - the UI System doesn't export props types.

### Issue: "Module not found: locale files"
**Solution**: Ensure files are in `public/locales/[locale]/common.json` with correct import path.

### Issue: "Params should be awaited" (Next.js 15+)
**Solution**: Always await params:
```typescript
const { locale } = await params;
```

### Issue: "Hydration mismatch"
**Solution**: Use UI System components correctly and avoid inline styles with `useTokens()`.

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

### Custom Styling with Tokens

```typescript
import { useTokens, Card, Typography } from '@xala-technologies/ui-system';

export function CustomThemedComponent(): JSX.Element {
  const { colors, typography, spacing } = useTokens();
  
  return (
    <Card 
      variant="elevated" 
      padding="lg"
      style={{
        backgroundColor: colors.primary[50],
        border: `2px solid ${colors.primary[500]}`
      }}
    >
      <Typography 
        variant="h2"
        style={{
          color: colors.primary[900],
          fontFamily: typography.fontFamily.heading
        }}
      >
        Custom Themed Content
      </Typography>
    </Card>
  );
}
```

## 🏗️ Application Layouts & Architecture

### Enterprise Application Types

### SaaS Application Layout

```typescript
// app/layout.tsx - SaaS Root Layout using WebLayout
import { 
  UISystemProvider, 
  WebLayout, 
  WebNavbar, 
  WebContent, 
  WebFooter,
  GlobalSearch,
  CompactThemeSwitcher,
  Navigation
} from '@xala-technologies/ui-system';
import { useTranslation } from 'react-i18next';

export default async function RootLayout({ 
  children, 
  params 
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  
  return (
    <html lang={locale}>
      <body>
        <UISystemProvider>
          <WebLayout>
            <WebNavbar 
              logo="Your SaaS"
              searchComponent={<GlobalSearch placeholder="Search..." />}
              actions={[
                <CompactThemeSwitcher key="theme" />,
                // Add user menu, notifications, etc.
              ]}
            />
            <WebContent>
              {children}
            </WebContent>
            <WebFooter 
              copyright=" 2024 Your SaaS Company"
              links={[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' }
              ]}
            />
          </WebLayout>
        </UISystemProvider>
      </body>
    </html>
  );
}
```

### Admin Dashboard Layout

```typescript
// app/admin/layout.tsx - Admin Dashboard using AdminLayout
import { 
  AdminLayout, 
  AdminSidebar, 
  AdminTopBar, 
  AdminContent,
  GlobalSearch,
  Navigation,
  NavigationItem,
  CompactThemeSwitcher
} from '@xala-technologies/ui-system';
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  FileText 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin' },
  { key: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { key: 'reports', label: 'Reports', icon: FileText, href: '/admin/reports' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' }
];

export default function AdminLayout({ 
  children 
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { t } = useTranslation();
  
  return (
    <AdminLayout>
      <AdminSidebar 
        title={t('admin.title')}
        navigation={
          <Navigation 
            items={adminNavItems}
            variant="sidebar"
            orientation="vertical"
          />
        }
        footer={
          <CompactThemeSwitcher showLabel />
        }
      />
      <AdminTopBar 
        title={t('admin.dashboard')}
        searchComponent={<GlobalSearch placeholder={t('search.placeholder')} />}
        userMenu={
          // User menu component
        }
      />
      <AdminContent>
        {children}
      </AdminContent>
    </AdminLayout>
  );
}
```

### 🧭 Using Existing UI System Components

**Important**: The Xala UI System already provides comprehensive layout and navigation components. Instead of creating custom components, use the existing ones:

#### Available Layout Components

```typescript
// Import existing layout components
import {
  // Layout Systems
  WebLayout, WebNavbar, WebContent, WebFooter,
  AdminLayout, AdminSidebar, AdminTopBar, AdminContent,
  DesktopLayout, DesktopHeader, DesktopSidebar,
  MobileLayout, MobileHeader, MobileDrawer,
  
  // Navigation Components
  GlobalSearch,
  Navigation, NavigationItem, NavigationGroup,
  CommandPalette,
  
  // Theme & Customization
  ThemeManager, CompactThemeSwitcher,
  
  // Data Display
  DataTable,
  
  // Industry Themes
  // Available: enterprise, finance, healthcare, education, ecommerce, productivity
  // Municipal: oslo, bergen, drammen
} from '@xala-technologies/ui-system';
```

#### Industry Theme Selection

```typescript
// app/layout.tsx - Using industry-specific themes
import { UISystemProvider } from '@xala-technologies/ui-system';

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html>
      <body>
        <UISystemProvider 
          theme="finance" // or 'healthcare', 'education', 'enterprise', etc.
        >
          {children}
        </UISystemProvider>
      </body>
    </html>
  );
}
```

#### Using Navigation Components

```typescript
// Using the built-in Navigation component
import { 
  Navigation, 
  NavigationItem, 
  NavigationGroup 
} from '@xala-technologies/ui-system';
import { Home, Users, Settings } from 'lucide-react';

const navigationItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={16} />,
    href: '/admin',
    group: 'main'
  },
  {
    key: 'users',
    label: 'Users',
    icon: <Users size={16} />,
    href: '/admin/users',
    group: 'main',
    badge: '12'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings size={16} />,
    href: '/admin/settings',
    group: 'config'
  }
];

export function AdminNavigation(): JSX.Element {
  return (
    <Navigation 
      items={navigationItems}
      variant="sidebar"
      orientation="vertical"
      showSeparator
      onItemSelect={(key, item) => {
        // Handle navigation
        window.location.href = item.href;
      }}
    />
  );
}
```

#### Using Global Search Component

```typescript
// Using the built-in GlobalSearch component
import { 
  GlobalSearch, 
  CommandPalette 
} from '@xala-technologies/ui-system';

// Simple Global Search usage
export function HeaderSearch(): JSX.Element {
  return (
    <GlobalSearch 
      placeholder="Search everything..."
      variant="default"
      size="md"
      onSubmit={(query) => {
        // Handle search submission
        console.log('Search:', query);
      }}
      onResultClick={(result) => {
        // Handle result selection
        window.location.href = result.url || '#';
      }}
      results={[
        {
          id: '1',
          title: 'User Management',
          description: 'Manage users and permissions',
          category: 'Admin',
          url: '/admin/users'
        },
        {
          id: '2',
          title: 'Analytics',
          description: 'View performance metrics',
          category: 'Reports',
          url: '/admin/analytics'
        }
      ]}
    />
  );
}

// Advanced Command Palette usage
export function AppCommandPalette(): JSX.Element {
  return (
    <CommandPalette
      searchPlaceholder="Type a command or search..."
      groups={[
        {
          name: 'Navigation',
          items: [
            {
              id: 'dashboard',
              label: 'Go to Dashboard',
              description: 'Navigate to main dashboard',
              shortcut: '⌘D',
              onSelect: () => window.location.href = '/dashboard'
            },
            {
              id: 'users',
              label: 'Manage Users',
              description: 'User management panel',
              shortcut: '⌘U',
              onSelect: () => window.location.href = '/admin/users'
            }
          ]
        },
        {
          name: 'Actions',
          items: [
            {
              id: 'new-user',
              label: 'Create New User',
              description: 'Add a new user to the system',
              shortcut: '⌘N',
              onSelect: () => console.log('Create user')
            }
          ]
        }
      ]}
    />
  );
}
    </Container>
  );
}
```

## 📱 Responsive Design Configuration

**Xala UI System Compliant Responsive Design**

The Xala UI System provides a comprehensive responsive design system that follows Norwegian design patterns and WCAG 2.2 AAA accessibility standards.

### Professional Breakpoint System

```typescript
// lib/responsive.ts - Responsive Configuration
import { useTokens } from '@xala-technologies/ui-system';

/**
 * Professional breakpoint system following Norwegian mobile-first patterns
 * Enhanced 8pt Grid System - all spacing in 8px increments
 */
export const breakpoints = {
  mobile: '320px',    // Mobile phones (Norwegian standard)
  tablet: '768px',    // Tablets and small laptops
  desktop: '1024px',  // Desktop and large screens
  wide: '1440px',     // Ultra-wide displays
  ultra: '1920px'     // 4K and beyond
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Container max-widths for optimal reading experience
 * Based on Norwegian typography standards
 */
export const containerSizes = {
  mobile: '100%',
  tablet: '720px',
  desktop: '960px', 
  wide: '1200px',
  ultra: '1400px'
} as const;

/**
 * Typography scaling per breakpoint
 * WCAG 2.2 AAA compliant font sizes
 */
export const typographyScale = {
  mobile: {
    h1: '24px',
    h2: '20px', 
    h3: '18px',
    body: '16px',
    caption: '14px'
  },
  tablet: {
    h1: '32px',
    h2: '24px',
    h3: '20px', 
    body: '16px',
    caption: '14px'
  },
  desktop: {
    h1: '40px',
    h2: '32px',
    h3: '24px',
    body: '16px',
    caption: '14px'
  }
} as const;
```

### Responsive Hook Implementation

```typescript
// hooks/useResponsive.ts - Responsive utilities
import { useState, useEffect } from 'react';
import { useTokens } from '@xala-technologies/ui-system';
import { breakpoints, type Breakpoint } from '@/lib/responsive';

export interface ResponsiveState {
  readonly currentBreakpoint: Breakpoint;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
  readonly isWide: boolean;
  readonly isUltra: boolean;
}

/**
 * Custom hook for responsive design with Norwegian mobile patterns
 * SSR-safe implementation with proper hydration
 */
export function useResponsive(): ResponsiveState {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop');
  const { spacing } = useTokens();
  
  useEffect((): (() => void) => {
    const updateBreakpoint = (): void => {
      const width = window.innerWidth;
      
      if (width >= parseInt(breakpoints.ultra)) {
        setCurrentBreakpoint('ultra');
      } else if (width >= parseInt(breakpoints.wide)) {
        setCurrentBreakpoint('wide');
      } else if (width >= parseInt(breakpoints.desktop)) {
        setCurrentBreakpoint('desktop');
      } else if (width >= parseInt(breakpoints.tablet)) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('mobile');
      }
    };
    
    // Initial check
    updateBreakpoint();
    
    // Add event listener
    window.addEventListener('resize', updateBreakpoint);
    
    // Cleanup
    return (): void => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);
  
  return {
    currentBreakpoint,
    isMobile: currentBreakpoint === 'mobile',
    isTablet: currentBreakpoint === 'tablet', 
    isDesktop: currentBreakpoint === 'desktop',
    isWide: currentBreakpoint === 'wide',
    isUltra: currentBreakpoint === 'ultra'
  };
}
```

### Responsive Layout Components

```typescript
// components/responsive/ResponsiveContainer.tsx
import { 
  Container, 
  Stack, 
  useTokens 
} from '@xala-technologies/ui-system';
import { useResponsive } from '@/hooks/useResponsive';
import { containerSizes } from '@/lib/responsive';
import { type ReactNode } from 'react';

export interface ResponsiveContainerProps {
  readonly children: ReactNode;
  readonly padding?: boolean;
  readonly centered?: boolean;
}

/**
 * Responsive container with Norwegian design patterns
 * Enhanced 8pt Grid System compliance
 */
export function ResponsiveContainer({ 
  children, 
  padding = true, 
  centered = true 
}: ResponsiveContainerProps): JSX.Element {
  const { currentBreakpoint } = useResponsive();
  const { spacing } = useTokens();
  
  const maxWidth = containerSizes[currentBreakpoint];
  const horizontalPadding = padding ? spacing.lg : spacing.none;
  
  return (
    <Container 
      size="full"
      padding="none"
      style={{
        maxWidth,
        margin: centered ? '0 auto' : '0',
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding
      }}
    >
      {children}
    </Container>
  );
}
```

### Responsive Grid System

```typescript
// components/responsive/ResponsiveGrid.tsx
import { 
  Grid, 
  GridItem, 
  useTokens 
} from '@xala-technologies/ui-system';
import { useResponsive } from '@/hooks/useResponsive';
import { type ReactNode } from 'react';

export interface ResponsiveGridProps {
  readonly children: ReactNode;
  readonly mobileColumns?: number;
  readonly tabletColumns?: number;
  readonly desktopColumns?: number;
  readonly gap?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Responsive grid following enhanced 8pt grid system
 * Norwegian mobile-first approach
 */
export function ResponsiveGrid({ 
  children, 
  mobileColumns = 1,
  tabletColumns = 2, 
  desktopColumns = 3,
  gap = 'lg'
}: ResponsiveGridProps): JSX.Element {
  const { isMobile, isTablet } = useResponsive();
  
  const columns = isMobile 
    ? mobileColumns 
    : isTablet 
    ? tabletColumns 
    : desktopColumns;
  
  return (
    <Grid 
      cols={{ xs: mobileColumns, md: tabletColumns, lg: desktopColumns }}
      gap={gap}
    >
      {children}
    </Grid>
  );
}
```

### Responsive Typography

```typescript
// components/responsive/ResponsiveTypography.tsx
import { 
  Typography, 
  type TypographyVariant,
  useTokens 
} from '@xala-technologies/ui-system';
import { useResponsive } from '@/hooks/useResponsive';
import { typographyScale } from '@/lib/responsive';
import { type ReactNode } from 'react';

export interface ResponsiveTypographyProps {
  readonly children: ReactNode;
  readonly variant: TypographyVariant;
  readonly responsive?: boolean;
  readonly color?: string;
}

/**
 * Typography component with responsive scaling
 * WCAG 2.2 AAA compliant font sizes
 */
export function ResponsiveTypography({ 
  children, 
  variant, 
  responsive = true,
  color 
}: ResponsiveTypographyProps): JSX.Element {
  const { currentBreakpoint } = useResponsive();
  const { colors } = useTokens();
  
  const fontSize = responsive 
    ? typographyScale[currentBreakpoint]?.[variant] || typographyScale.desktop[variant]
    : undefined;
  
  return (
    <Typography 
      variant={variant}
      style={{
        fontSize: fontSize,
        color: color || colors.text.primary
      }}
    >
      {children}
    </Typography>
  );
}
```

### Mobile-First Component Behavior

```typescript
// components/responsive/AdaptiveNavigation.tsx
import { 
  Navigation, 
  MobileDrawer, 
  Button, 
  Stack,
  useTokens 
} from '@xala-technologies/ui-system';
import { useResponsive } from '@/hooks/useResponsive';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AdaptiveNavigationProps {
  readonly items: Array<{
    readonly key: string;
    readonly label: string;
    readonly href: string;
    readonly icon?: React.ReactNode;
  }>;
}

/**
 * Adaptive navigation following Norwegian mobile patterns
 * Desktop: Horizontal navigation
 * Mobile/Tablet: Drawer navigation
 */
export function AdaptiveNavigation({ 
  items 
}: AdaptiveNavigationProps): JSX.Element {
  const { isMobile, isTablet } = useResponsive();
  const { t } = useTranslation();
  const { spacing } = useTokens();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isMobileView = isMobile || isTablet;
  
  if (isMobileView) {
    return (
      <>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(): void => setIsDrawerOpen(true)}
          aria-label={t('navigation.openMenu')}
        >
          <Menu size={20} />
        </Button>
        
        <MobileDrawer 
          isOpen={isDrawerOpen}
          onClose={(): void => setIsDrawerOpen(false)}
          side="left"
        >
          <Stack direction="vertical" gap="sm" style={{ padding: spacing.lg }}>
            <Stack direction="horizontal" justify="between" align="center">
              <ResponsiveTypography variant="h3">
                {t('navigation.menu')}
              </ResponsiveTypography>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(): void => setIsDrawerOpen(false)}
              >
                <X size={20} />
              </Button>
            </Stack>
            
            <Navigation 
              items={items}
              variant="drawer"
              orientation="vertical"
              onItemSelect={(): void => setIsDrawerOpen(false)}
            />
          </Stack>
        </MobileDrawer>
      </>
    );
  }
  
  return (
    <Navigation 
      items={items}
      variant="horizontal"
      orientation="horizontal"
    />
  );
}
```

### Accessibility-First Responsive Design

```typescript
// components/responsive/AccessibleResponsiveCard.tsx
import { 
  Card, 
  Stack, 
  Typography, 
  useTokens 
} from '@xala-technologies/ui-system';
import { useResponsive } from '@/hooks/useResponsive';
import { type ReactNode } from 'react';

export interface AccessibleResponsiveCardProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly compact?: boolean;
}

/**
 * Responsive card with WCAG 2.2 AAA compliance
 * Enhanced touch targets for mobile (minimum 44px)
 */
export function AccessibleResponsiveCard({ 
  children, 
  title, 
  description,
  compact = false 
}: AccessibleResponsiveCardProps): JSX.Element {
  const { isMobile } = useResponsive();
  const { spacing, colors } = useTokens();
  
  const padding = isMobile 
    ? (compact ? spacing.md : spacing.lg)
    : (compact ? spacing.lg : spacing.xl);
    
  const minTouchTarget = isMobile ? '44px' : 'auto';
  
  return (
    <Card 
      variant="elevated"
      padding="none"
      style={{
        padding,
        minHeight: minTouchTarget,
        cursor: 'pointer'
      }}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <Stack direction="vertical" gap="sm">
        {title && (
          <ResponsiveTypography variant="h3">
            {title}
          </ResponsiveTypography>
        )}
        
        {description && (
          <Typography 
            variant="body" 
            style={{ color: colors.text.secondary }}
          >
            {description}
          </Typography>
        )}
        
        {children}
      </Stack>
    </Card>
  );
}
```

### Usage Example: Responsive Dashboard

```typescript
// app/dashboard/page.tsx - Responsive Dashboard Implementation
import { 
  Stack, 
  Typography, 
  useTokens 
} from '@xala-technologies/ui-system';
import { 
  ResponsiveContainer,
  ResponsiveGrid, 
  ResponsiveTypography,
  AccessibleResponsiveCard
} from '@/components/responsive';
import { useTranslation } from 'react-i18next';

export default function ResponsiveDashboard(): JSX.Element {
  const { t } = useTranslation();
  const { spacing } = useTokens();
  
  return (
    <ResponsiveContainer>
      <Stack direction="vertical" gap="xl" style={{ paddingTop: spacing.xl }}>
        {/* Responsive Header */}
        <Stack direction="vertical" gap="sm">
          <ResponsiveTypography variant="h1">
            {t('dashboard.title')}
          </ResponsiveTypography>
          <Typography variant="body">
            {t('dashboard.subtitle')}
          </Typography>
        </Stack>
        
        {/* Responsive Metrics Grid */}
        <ResponsiveGrid 
          mobileColumns={1}
          tabletColumns={2}
          desktopColumns={4}
          gap="lg"
        >
          <AccessibleResponsiveCard 
            title={t('metrics.users')}
            description="+12.5% from last month"
          >
            <ResponsiveTypography variant="h2">
              2,543
            </ResponsiveTypography>
          </AccessibleResponsiveCard>
          
          <AccessibleResponsiveCard 
            title={t('metrics.revenue')}
            description="+8.2% from last month"
          >
            <ResponsiveTypography variant="h2">
              $45,231
            </ResponsiveTypography>
          </AccessibleResponsiveCard>
          
          {/* Additional metric cards */}
        </ResponsiveGrid>
        
        {/* Responsive Content Grid */}
        <ResponsiveGrid 
          mobileColumns={1}
          tabletColumns={1}
          desktopColumns={2}
          gap="xl"
        >
          <AccessibleResponsiveCard title={t('dashboard.activity')}>
            {/* Activity content */}
          </AccessibleResponsiveCard>
          
          <AccessibleResponsiveCard title={t('dashboard.analytics')}>
            {/* Analytics content */}
          </AccessibleResponsiveCard>
        </ResponsiveGrid>
      </Stack>
    </ResponsiveContainer>
  );
}
```

## 📄 Page Layout Patterns

### Dashboard Page Layout

```typescript
// app/admin/page.tsx - Dashboard Page
import { 
  Container, 
  Stack, 
  Typography, 
  Card, 
  Button,
  Grid,
  Badge,
  useTokens
} from '@xala-technologies/ui-system';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ size?: number }>;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps): JSX.Element {
  const { colors } = useTokens();
  
  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="vertical" gap="md">
        <Stack direction="horizontal" justify="between" align="center">
          <Typography variant="body" style={{ color: colors.text.secondary }}>
            {title}
          </Typography>
          <Icon size={20} style={{ color: colors.text.secondary }} />
        </Stack>
        
        <Stack direction="vertical" gap="xs">
          <Typography variant="h2" weight="bold">
            {value}
          </Typography>
          <Stack direction="horizontal" align="center" gap="xs">
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} size="sm">
              {change}
            </Badge>
            <Typography variant="caption" style={{ color: colors.text.secondary }}>
              from last month
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const { colors } = useTokens();
  
  const metrics = [
    {
      title: t('metrics.revenue'),
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up' as const,
      icon: DollarSign
    },
    {
      title: t('metrics.users'),
      value: '+2,350',
      change: '+180.1%',
      trend: 'up' as const,
      icon: Users
    },
    {
      title: t('metrics.sales'),
      value: '+12,234',
      change: '+19%',
      trend: 'up' as const,
      icon: TrendingUp
    },
    {
      title: t('metrics.active'),
      value: '+573',
      change: '+201',
      trend: 'up' as const,
      icon: Activity
    }
  ];
  
  return (
    <Stack direction="vertical" gap="lg">
      {/* Page Header */}
      <Stack direction="horizontal" justify="between" align="center">
        <Stack direction="vertical" gap="xs">
          <Typography variant="h1">
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body" style={{ color: colors.text.secondary }}>
            {t('dashboard.subtitle')}
          </Typography>
        </Stack>
        
        <Stack direction="horizontal" gap="sm">
          <Button variant="outline">
            {t('actions.export')}
          </Button>
          <Button variant="primary">
            {t('actions.addNew')}
          </Button>
        </Stack>
      </Stack>
      
      {/* Metrics Grid */}
      <Grid cols={{ xs: 1, sm: 2, lg: 4 }} gap="lg">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </Grid>
      
      {/* Content Sections */}
      <Grid cols={{ xs: 1, lg: 2 }} gap="lg">
        <Card variant="elevated" padding="lg">
          <Stack direction="vertical" gap="md">
            <Typography variant="h3">
              {t('dashboard.recentActivity')}
            </Typography>
            {/* Activity content */}
          </Stack>
        </Card>
        
        <Card variant="elevated" padding="lg">
          <Stack direction="vertical" gap="md">
            <Typography variant="h3">
              {t('dashboard.quickActions')}
            </Typography>
            {/* Quick actions content */}
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}
```

### Form Layout Patterns

```typescript
// app/admin/users/create/page.tsx - Form Page
import { 
  Stack, 
  Typography, 
  Card, 
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Textarea,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@xala-technologies/ui-system';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'manager']),
  department: z.string().min(1, 'Department is required'),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserPage(): JSX.Element {
  const { t } = useTranslation();
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      department: '',
      bio: '',
      isActive: true,
    },
  });
  
  const onSubmit = async (data: UserFormData) => {
    try {
      // Handle form submission
      console.log('Form data:', data);
      // API call here
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  return (
    <Stack direction="vertical" gap="lg">
      {/* Page Header */}
      <Stack direction="vertical" gap="xs">
        <Typography variant="h1">
          {t('users.create.title')}
        </Typography>
        <Typography variant="body" className="text-muted-foreground">
          {t('users.create.subtitle')}
        </Typography>
      </Stack>
      
      {/* Form Card */}
      <Card variant="elevated" padding="lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack direction="vertical" gap="lg">
              {/* Personal Information Section */}
              <Stack direction="vertical" gap="md">
                <Typography variant="h3">
                  {t('users.sections.personalInfo')}
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.fields.firstName')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('users.placeholders.firstName')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.fields.lastName')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('users.placeholders.lastName')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.fields.email')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder={t('users.placeholders.email')} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Stack>
              
              {/* Role & Department Section */}
              <Stack direction="vertical" gap="md">
                <Typography variant="h3">
                  {t('users.sections.roleInfo')}
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.fields.role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('users.placeholders.role')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">{t('roles.user')}</SelectItem>
                            <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                            <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.fields.department')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('users.placeholders.department')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Stack>
              
              {/* Additional Information */}
              <Stack direction="vertical" gap="md">
                <Typography variant="h3">
                  {t('users.sections.additionalInfo')}
                </Typography>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.fields.bio')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('users.placeholders.bio')}
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('users.fields.isActive')}</FormLabel>
                        <Typography variant="caption" className="text-muted-foreground">
                          {t('users.descriptions.isActive')}
                        </Typography>
                      </div>
                    </FormItem>
                  )}
                />
              </Stack>
              
              {/* Form Actions */}
              <Stack direction="horizontal" gap="sm" justify="end">
                <Button variant="outline" type="button">
                  {t('actions.cancel')}
                </Button>
                <Button variant="primary" type="submit">
                  {t('actions.createUser')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Form>
      </Card>
    </Stack>
  );
}
```

### Data Table Layout

```typescript
// app/admin/users/page.tsx - Data Table Page
import { 
  Stack, 
  Typography, 
  Card, 
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Badge,
  Avatar,
  DataTable,
  DataTableColumn,
  Pagination
} from '@xala-technologies/ui-system';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  department: string;
  isActive: boolean;
  lastLogin: string;
  avatar?: string;
}

export default function UsersPage(): JSX.Element {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Mock data - replace with your API call
  const users: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      department: 'Engineering',
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      avatar: '/avatars/john.jpg'
    },
    // Add more mock users...
  ];
  
  const columns: DataTableColumn<User>[] = [
    {
      accessorKey: 'user',
      header: t('users.columns.user'),
      cell: ({ row }) => (
        <Stack direction="horizontal" align="center" gap="sm">
          <Avatar 
            src={row.original.avatar} 
            alt={`${row.original.firstName} ${row.original.lastName}`}
            size="sm"
          />
          <Stack direction="vertical" gap="xs">
            <Typography variant="body" weight="medium">
              {row.original.firstName} {row.original.lastName}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {row.original.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      accessorKey: 'role',
      header: t('users.columns.role'),
      cell: ({ row }) => {
        const roleColors = {
          admin: 'destructive',
          manager: 'warning',
          user: 'secondary'
        } as const;
        
        return (
          <Badge variant={roleColors[row.original.role]} size="sm">
            {t(`roles.${row.original.role}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'department',
      header: t('users.columns.department'),
      cell: ({ row }) => (
        <Typography variant="body">
          {row.original.department}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: t('users.columns.status'),
      cell: ({ row }) => (
        <Badge 
          variant={row.original.isActive ? 'success' : 'secondary'} 
          size="sm"
        >
          {row.original.isActive ? t('status.active') : t('status.inactive')}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: t('users.columns.lastLogin'),
      cell: ({ row }) => (
        <Typography variant="body" className="text-muted-foreground">
          {new Date(row.original.lastLogin).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Stack direction="horizontal" gap="xs">
          <Button variant="ghost" size="sm">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </Stack>
      ),
    },
  ];
  
  return (
    <Stack direction="vertical" gap="lg">
      {/* Page Header */}
      <Stack direction="horizontal" justify="between" align="center">
        <Stack direction="vertical" gap="xs">
          <Typography variant="h1">
            {t('users.title')}
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            {t('users.subtitle')}
          </Typography>
        </Stack>
        
        <Stack direction="horizontal" gap="sm">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            {t('actions.export')}
          </Button>
          <Link href="/admin/users/create">
            <Button variant="primary">
              <Plus size={16} className="mr-2" />
              {t('actions.addUser')}
            </Button>
          </Link>
        </Stack>
      </Stack>
      
      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <Stack direction="horizontal" gap="md" align="end">
          <div className="flex-1">
            <Typography variant="body" weight="medium" className="mb-2">
              {t('filters.search')}
            </Typography>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder={t('users.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Typography variant="body" weight="medium" className="mb-2">
              {t('filters.role')}
            </Typography>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                <SelectItem value="user">{t('roles.user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            {t('actions.filter')}
          </Button>
        </Stack>
      </Card>
      
      {/* Data Table */}
      <Card variant="elevated" padding="none">
        <DataTable
          columns={columns}
          data={users}
          searchQuery={searchQuery}
          onRowClick={(user) => {
            // Navigate to user detail page
            console.log('Navigate to user:', user.id);
          }}
        />
        
        {/* Pagination */}
        <div className="border-t border-border p-4">
          <Stack direction="horizontal" justify="between" align="center">
            <Typography variant="caption" className="text-muted-foreground">
              {t('pagination.showing', { 
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, users.length),
                total: users.length
              })}
            </Typography>
            
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(users.length / pageSize)}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </Stack>
        </div>
      </Card>
    </Stack>
  );
}
```

## 🎨 Design System Integration Rules

### 🚨 **MANDATORY COMPLIANCE RULES**

When building Next.js applications with the Xala UI System, you **MUST** follow these rules:

#### **1. Component Usage Rules**
```typescript
// ❌ FORBIDDEN - Never use raw HTML elements in pages
<div className="flex flex-col">
  <h1>Title</h1>
  <p>Content</p>
  <button onClick={handleClick}>Action</button>
</div>

// ✅ REQUIRED - Always use UI System components
<Stack direction="vertical" gap="md">
  <Typography variant="h1">Title</Typography>
  <Typography variant="body">Content</Typography>
  <Button variant="primary" onClick={handleClick}>Action</Button>
</Stack>
```

#### **2. Styling Rules**
```typescript
// ❌ FORBIDDEN - Never use inline styles or arbitrary values
<div style={{ padding: '16px', backgroundColor: '#f0f0f0' }}>
<div className="p-4 bg-gray-100 text-blue-600">
<div className="p-[16px] bg-[#f0f0f0]">

// ✅ REQUIRED - Always use design tokens via useTokens
const { colors, spacing } = useTokens();
<Card 
  variant="elevated" 
  padding="md"
  style={{ backgroundColor: colors.background.secondary }}
>
```

#### **3. Localization Rules**
```typescript
// ❌ FORBIDDEN - Never hardcode user-facing text
<Typography variant="h1">Welcome to Dashboard</Typography>
<Button>Create New User</Button>

// ✅ REQUIRED - Always use localization
const { t } = useTranslation();
<Typography variant="h1">{t('dashboard.welcome')}</Typography>
<Button>{t('actions.createUser')}</Button>
```

#### **4. TypeScript Rules**
```typescript
// ❌ FORBIDDEN - Never use 'any' type or missing return types
const MyComponent = ({ data }: any) => {
  return <div>{data}</div>;
};

// ✅ REQUIRED - Always use explicit types and return types
interface MyComponentProps {
  data: string;
}

const MyComponent = ({ data }: MyComponentProps): JSX.Element => {
  return <Typography variant="body">{data}</Typography>;
};
```

#### **5. File Structure Rules**
```typescript
// ✅ REQUIRED - Maximum 200 lines per file, 20 lines per function
// ✅ REQUIRED - SOLID principles and component composition
// ✅ REQUIRED - Single responsibility per component
```

### **Application-Specific Rules**

#### **SaaS Applications**
- Always include global search in header
- Implement user avatar with dropdown menu
- Use theme and locale switchers
- Include breadcrumb navigation for deep pages
- Implement proper loading and error states

#### **Admin Dashboards**
- Always use sidebar navigation with active states
- Include notification badges for pending items
- Implement data tables with pagination
- Use metric cards for KPIs
- Include bulk actions for data management

#### **Marketing Websites**
- Use hero sections with call-to-action buttons
- Implement responsive grid layouts
- Include testimonials and feature sections
- Use proper SEO meta tags
- Implement contact forms with validation

## 📚 Next Steps

1. **Choose Your Layout**: Select the appropriate layout pattern for your application type
2. **Implement Navigation**: Add header, sidebar, or navigation components
3. **Build Pages**: Create pages using the layout patterns and component examples
4. **Add Forms**: Implement forms with proper validation and error handling
5. **Integrate Data**: Connect your pages to APIs and data sources
6. **Test & Deploy**: Add testing and deploy your application

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
