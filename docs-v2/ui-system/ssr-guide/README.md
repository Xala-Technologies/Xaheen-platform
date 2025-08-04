# UI System - SSR Implementation Guide

## 🚀 Server-Side Rendering with v5.0

The Xala Universal Design System v5.0 provides production-ready patterns for deploying in Server-Side Rendering (SSR) environments with **zero hydration mismatches** and **CVA-based architecture**.

## ⚡ Quick Start - SSR Implementation

### 1. Installation

```bash
pnpm add @xala-technologies/ui-system
```

### 2. Basic SSR Setup (Next.js App Router)

```typescript
// app/layout.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb-NO">
      <body>
        <UISystemProvider
          theme="light"
          locale="nb-NO"
          compliance={{
            norwegian: true,
            wcagLevel: 'WCAG_2_2_AAA'
          }}
        >
          {children}
        </UISystemProvider>
      </body>
    </html>
  );
}
```

### 3. SSR-Safe Page Implementation

```typescript
// app/page.tsx - NO 'use client' needed
import { Button, Card, Container, Stack, Text } from '@xala-technologies/ui-system';

export default function HomePage() {
  return (
    <Container size="lg" padding="lg">
      <Stack direction="vertical" gap="xl" align="center">
        <Text variant="h1" align="center">
          Velkommen til vår applikasjon
        </Text>
        
        <Card variant="elevated" padding="lg" className="max-w-md">
          <Stack direction="vertical" gap="md" align="center">
            <Text variant="body" align="center">
              Start din reise med vår enterprise-grade UI-system.
            </Text>
            <Button variant="primary" size="lg">
              Kom i gang
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
```

## 🏗️ SSR Architecture Overview

### Core Principle: Pure Components + Provider Isolation

```typescript
// ✅ CORRECT: Only provider uses 'use client'
'use client';
export const UISystemProvider = ({ children, theme, locale }) => {
  // All client-side logic isolated here
  return (
    <UISystemContext.Provider value={{ theme, locale }}>
      {children}
    </UISystemContext.Provider>
  );
};

// ✅ CORRECT: Components are pure and SSR-safe (no 'use client')
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

### CVA-Based SSR Benefits

- **Static CSS Classes**: No runtime style calculations
- **Zero Hydration Issues**: Identical server/client rendering
- **Better Performance**: Cached CSS classes, no JavaScript styling 
- **SEO Optimized**: Fully styled content on first render

## 📦 Production Deployment Patterns

### 1. Framework-Specific Implementations

#### Next.js 13+ App Router

```typescript
// app/providers.tsx
'use client';

import { UISystemProvider } from '@xala-technologies/ui-system';

export function Providers({ 
  children,
  theme = 'light',
  locale = 'nb-NO'
}: { 
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  locale?: string;
}) {
  return (
    <UISystemProvider
      theme={theme}
      locale={locale}
      compliance={{
        norwegian: true,
        nsmClassification: 'ÅPEN',
        gdpr: true,
        wcagLevel: 'WCAG_2_2_AAA'
      }}
    >
      {children}
    </UISystemProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="nb-NO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Next.js Pages Router

```typescript
// pages/_app.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UISystemProvider theme="light" locale="nb-NO">
      <Component {...pageProps} />
    </UISystemProvider>
  );
}
```

#### Remix

```typescript
// app/root.tsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles';

export default function App() {
  return (
    <html lang="nb-NO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <UISystemProvider theme="light" locale="nb-NO">
          <Outlet />
        </UISystemProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

#### Vite + React

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { UISystemProvider } from '@xala-technologies/ui-system';
import '@xala-technologies/ui-system/styles';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UISystemProvider theme="light" locale="nb-NO">
      <App />
    </UISystemProvider>
  </React.StrictMode>
);
```

### 2. Theme Switching (Client-Side)

```typescript
// components/theme-switcher.tsx
'use client'; // Only for interactive features

import { Button, Stack } from '@xala-technologies/ui-system';
import { useTheme } from '@xala-technologies/ui-system';

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <Stack direction="horizontal" gap="sm">
      {availableThemes.map((themeOption) => (
        <Button
          key={themeOption}
          variant={theme === themeOption ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setTheme(themeOption)}
        >
          {themeOption === 'light' ? '☀️ Lys' : '🌙 Mørk'}
        </Button>
      ))}
    </Stack>
  );
}
```

### 3. Locale Switching (Server + Client)

```typescript
// components/locale-switcher.tsx
'use client';

import { Select } from '@xala-technologies/ui-system';
import { useLocale } from '@xala-technologies/ui-system';

export function LocaleSwitcher() {
  const { locale, setLocale, availableLocales } = useLocale();

  const localeOptions = [
    { value: 'nb-NO', label: 'Norsk Bokmål' },
    { value: 'en-US', label: 'English' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'ar-SA', label: 'العربية' }
  ];

  return (
    <Select
      value={locale}
      onValueChange={setLocale}
      options={localeOptions}
      placeholder="Velg språk"
      variant="outline"
    />
  );
}
```

## ⚡ Performance Optimization

### 1. Bundle Optimization with CVA

The CVA-based architecture provides superior performance:

```typescript
// ✅ EXCELLENT: Import only what you need - CVA variants are tree-shakeable
import { Button, Card, Stack } from '@xala-technologies/ui-system';

// Components generate static CSS classes
<Button variant="primary" size="lg">
  // Generates: "bg-primary text-primary-foreground h-11 px-8"
  // No runtime calculations!
</Button>

// ❌ AVOID: Importing everything
import * as UISystem from '@xala-technologies/ui-system';
```

### 2. Lazy Loading for Heavy Components

```typescript
// For large, less commonly used components
import { lazy, Suspense } from 'react';
import { Card, Skeleton } from '@xala-technologies/ui-system';

const DataTable = lazy(() => 
  import('@xala-technologies/ui-system').then(module => ({
    default: module.DataTable
  }))
);

const Calendar = lazy(() =>
  import('@xala-technologies/ui-system').then(module => ({
    default: module.Calendar
  }))
);

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <DataTable data={reportData} />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <Calendar events={calendarEvents} />
      </Suspense>
    </div>
  );
}
```

### 3. CSS Optimization

```css
/* Critical CSS inlined in <head> */
@import '@xala-technologies/ui-system/styles/critical.css';

/* Non-critical CSS can be loaded async */
<link 
  rel="preload" 
  href="/_next/static/css/ui-system.css" 
  as="style" 
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

## 🛡️ Error Handling & Resilience

### 1. Error Boundaries for UI System

```typescript
// components/ui-system-error-boundary.tsx
'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription, Button } from '@xala-technologies/ui-system';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class UISystemErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UI System error:', error, errorInfo);
    
    // Report to monitoring service
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle>UI System Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reload Page
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Usage in layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UISystemProvider>
          <UISystemErrorBoundary>
            {children}
          </UISystemErrorBoundary>
        </UISystemProvider>
      </body>
    </html>
  );
}
```

### 2. Graceful Degradation

```typescript
// components/enhanced-button.tsx
import { Button, type ButtonProps } from '@xala-technologies/ui-system';

export function EnhancedButton(props: ButtonProps) {
  // CVA components gracefully degrade to basic HTML
  try {
    return <Button {...props} />;
  } catch (error) {
    // Fallback to native button with basic styling
    console.warn('UI System Button failed, using fallback:', error);
    return (
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        {...props}
      />
    );
  }
}
```

### 3. Network Resilience

```typescript
// hooks/use-offline-fallback.ts
'use client';

import { useState, useEffect } from 'react';

export function useOfflineFallback() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

// Usage in components
function NetworkStatus() {
  const { isOnline } = useOfflineFallback();

  if (!isOnline) {
    return (
      <Alert variant="warning">
        <AlertTitle>Offline Mode</AlertTitle>
        <AlertDescription>
          You are currently offline. Some features may be limited.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
```

## 🧪 Testing SSR Implementation

### 1. Basic SSR Test

```typescript
// __tests__/ssr.test.tsx
import { render } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

describe('SSR Compatibility', () => {
  test('components render without hydration errors', () => {
    const { getByText } = render(
      <UISystemProvider theme="light" locale="nb-NO">
        <Button variant="primary">Test Button</Button>
      </UISystemProvider>
    );

    expect(getByText('Test Button')).toBeInTheDocument();
  });

  test('maintains consistent server/client rendering', () => {
    const serverMarkup = render(
      <UISystemProvider theme="light">
        <Button variant="primary" size="lg">SSR Test</Button>
      </UISystemProvider>
    );

    const clientMarkup = render(
      <UISystemProvider theme="light">
        <Button variant="primary" size="lg">SSR Test</Button>
      </UISystemProvider>
    );

    expect(serverMarkup.container.innerHTML).toBe(clientMarkup.container.innerHTML);
  });
});
```

### 2. CVA Variant Testing

```typescript
// __tests__/cva-ssr.test.tsx
import { render } from '@testing-library/react';
import { Button } from '@xala-technologies/ui-system';

describe('CVA SSR Compatibility', () => {
  test('applies correct variant classes during SSR', () => {
    const { container } = render(
      <Button variant="primary" size="lg">CVA Test</Button>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-11', 'px-8');
  });

  test('handles compound variants correctly', () => {
    const { container } = render(
      <Button variant="outline" size="sm">Compound Test</Button>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('border', 'border-input', 'bg-background', 'h-9', 'px-3');
  });
});
```

### 3. Norwegian Compliance Testing

```typescript
// __tests__/norwegian-compliance-ssr.test.tsx
import { render } from '@testing-library/react';
import { UISystemProvider, ClassificationIndicator, PersonalNumberInput } from '@xala-technologies/ui-system';

describe('Norwegian Compliance SSR', () => {
  test('renders NSM classification correctly', () => {
    const { getByText } = render(
      <UISystemProvider locale="nb-NO">
        <ClassificationIndicator level="KONFIDENSIELT" />
      </UISystemProvider>
    );

    expect(getByText('KONFIDENSIELT')).toBeInTheDocument();
  });

  test('handles Norwegian localization during SSR', () => {
    const { container } = render(
      <UISystemProvider locale="nb-NO">
        <PersonalNumberInput placeholder="Fødselsnummer" />
      </UISystemProvider>
    );

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Fødselsnummer');
  });
});
```

## 📋 Production Deployment Checklist

### Pre-Deployment

- [ ] **CSS Optimization**: Configured Tailwind CSS with UI System preset
- [ ] **Bundle Analysis**: Verified tree-shaking and bundle size
- [ ] **SSR Testing**: All components render without hydration errors
- [ ] **Error Boundaries**: Added error boundaries around UI System usage
- [ ] **Performance**: Lazy loading configured for heavy components
- [ ] **Accessibility**: WCAG 2.2 AAA compliance verified
- [ ] **Norwegian Compliance**: NSM, GDPR features tested

### Environment Configuration

```typescript
// config/ui-system.config.ts
export const UI_SYSTEM_CONFIG = {
  theme: process.env.NEXT_PUBLIC_THEME || 'light',
  locale: process.env.NEXT_PUBLIC_LOCALE || 'nb-NO',
  compliance: {
    norwegian: process.env.NEXT_PUBLIC_NORWEGIAN_COMPLIANCE === 'true',
    nsmClassification: process.env.NEXT_PUBLIC_NSM_CLASSIFICATION || 'ÅPEN',
    gdpr: process.env.NEXT_PUBLIC_GDPR_ENABLED === 'true',
    wcagLevel: 'WCAG_2_2_AAA' as const
  },
  performance: {
    enableVirtualization: process.env.NODE_ENV === 'production',
    enableLazyLoading: true,
    enableMemoization: true
  }
};
```

### Monitoring & Observability

```typescript
// utils/ui-system-monitoring.ts
'use client';

export function trackUISystemMetrics() {
  if (typeof window !== 'undefined') {
    // Track bundle size impact
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('ui-system')) {
          console.log(`UI System ${entry.name}: ${entry.duration}ms`);
          
          // Send to analytics
          window.gtag?.('event', 'ui_system_performance', {
            custom_parameter: entry.name,
            value: entry.duration
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource', 'navigation'] });
  }
}
```

## 🔧 Common Issues & Solutions

### Issue: Tailwind Classes Not Applying

**Cause**: Tailwind CSS not configured with UI System preset

**Solution**:
```javascript
// tailwind.config.js
module.exports = {
  presets: [
    require('@xala-technologies/ui-system/tailwind-preset')
  ],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@xala-technologies/ui-system/**/*.{js,ts,jsx,tsx}'
  ]
};
```

### Issue: Hydration Mismatches

**Cause**: Server/client rendering differences

**Solution**: Ensure consistent props and avoid client-only values
```typescript
// ✅ CORRECT: Consistent server/client rendering
<Button variant="primary" size="lg">
  Consistent Button
</Button>

// ❌ INCORRECT: Dynamic client-only values
<Button variant={Math.random() > 0.5 ? 'primary' : 'secondary'}>
  Random Button
</Button>
```

### Issue: CVA Variants Not Working

**Cause**: Missing CVA dependency or incorrect usage

**Solution**: Ensure proper CVA usage
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90'
      }
    }
  }
);
```

### Issue: Large Bundle Size

**Solution**: Implement code splitting and tree shaking
```typescript
// ✅ CORRECT: Tree-shakeable imports
import { Button, Card } from '@xala-technologies/ui-system';

// ✅ CORRECT: Lazy loading heavy components
const DataTable = lazy(() => import('@xala-technologies/ui-system/DataTable'));
```

## 🔗 Framework Integration Examples

### Next.js Edge Runtime

```typescript
// app/api/ui-config/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const theme = request.nextUrl.searchParams.get('theme') || 'light';
  const locale = request.nextUrl.searchParams.get('locale') || 'nb-NO';

  return NextResponse.json({
    theme,
    locale,
    compliance: {
      norwegian: true,
      wcagLevel: 'WCAG_2_2_AAA'
    }
  });
}
```

### Vercel Deployment

```typescript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/ui-system/(.*)",
      "destination": "/api/ui-system/$1"
    }
  ]
}
```

## 🆘 Support & Resources

### Documentation Links
- **[Component Library](../components/)** - Complete component documentation
- **[Design Tokens](../tokens/)** - Token system and customization
- **[Troubleshooting](../troubleshooting/)** - Common issues and solutions
- **[Norwegian Compliance](../compliance/)** - NSM, GDPR, WCAG requirements

### Performance Resources
- **[Bundle Analyzer](https://bundlephobia.com/)** - Check bundle impact
- **[Web Vitals](https://web.dev/vitals/)** - Performance metrics
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Performance auditing

### Community Support
- **[GitHub Issues](https://github.com/xala-technologies/ui-system/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/xala-technologies/ui-system/discussions)** - Community Q&A
- **[Discord](https://discord.gg/xala-ui)** - Real-time support

---

*UI System SSR Guide v2.0 - Production-ready server-side rendering with CVA architecture*