# SSR Best Practices Guide - UI System v4.0.0

## Overview

This guide provides production-ready patterns for deploying the UI System in Server-Side Rendering (SSR) environments, specifically targeting Next.js applications and other React frameworks.

## Quick Start - SSR Implementation

### 1. Installation

```bash
npm install @xala-technologies/ui-system@^4.0.0
# or
pnpm add @xala-technologies/ui-system@^4.0.0
```

### 2. Basic SSR Setup (Next.js App Router)

```typescript
// app/layout.tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DesignSystemProvider
          templateId="base-light"
          autoDetectDarkMode={true}
          enableSSRFallback={true}
        >
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

### 3. SSR-Safe Page Implementation

```typescript
// app/page.tsx - NO 'use client' needed
import { Button, Card, CardContent, Container } from '@xala-technologies/ui-system';

export default function HomePage() {
  return (
    <Container maxWidth="lg" padding="md">
      <Card variant="default">
        <CardContent>
          <h1>Welcome to My Application</h1>
          <Button variant="primary">Get Started</Button>
        </CardContent>
      </Card>
    </Container>
  );
}
```

## SSR Architecture Overview

### Core Principle: Provider Isolation

```typescript
// ✅ CORRECT: Only provider uses 'use client'
'use client';
export const DesignSystemProvider = ({ children }) => {
  // Context logic here
  return <DesignSystemContext.Provider>{children}</DesignSystemContext.Provider>;
};

// ✅ CORRECT: Components work in SSR (no 'use client')
export const Button = ({ children, ...props }) => {
  const { colors } = useTokens(); // SSR-safe hook
  return <button style={{ color: colors.primary[500] }}>{children}</button>;
};
```

### Template Loading Strategy

The UI System uses a **3-tier fallback system** for maximum reliability:

1. **Primary Template**: Load from API/database
2. **Base Template**: Fallback to base-light.json or base-dark.json
3. **Emergency Fallback**: Hardcoded minimal styling

## Production Deployment Patterns

### 1. Template Preloading for Optimal SSR

```typescript
// For maximum SSR performance, preload templates
import { DesignSystemProvider } from '@xala-technologies/ui-system';

// Server-side template loading
async function getServerTemplate(templateId: string) {
  // Load from your database or API
  const template = await fetch(`/api/templates/${templateId}`).then(r => r.json());
  return template;
}

export default async function Layout({ children }) {
  const template = await getServerTemplate('my-brand-light');

  return (
    <html>
      <body>
        <DesignSystemProvider
          templateId="my-brand-light"
          ssrTemplate={template} // Pre-loaded for SSR
        >
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

### 2. Dynamic Theme Switching (Client-Side)

```typescript
// app/theme-switcher.tsx
'use client'; // Only for interactive features

import { useDesignSystem } from '@xala-technologies/ui-system';

export function ThemeSwitcher() {
  const { setTemplate, toggleDarkMode, isDarkMode } = useDesignSystem();

  return (
    <div>
      <button onClick={() => setTemplate('brand-enterprise')}>
        Enterprise Theme
      </button>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### 3. Framework-Specific Implementations

#### Next.js 13+ App Router

```typescript
// app/providers.tsx
'use client';

import { DesignSystemProvider } from '@xala-technologies/ui-system';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DesignSystemProvider
      templateId="my-brand-light"
      autoDetectDarkMode={true}
    >
      {children}
    </DesignSystemProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
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
import { DesignSystemProvider } from '@xala-technologies/ui-system';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DesignSystemProvider templateId="base-light">
      <Component {...pageProps} />
    </DesignSystemProvider>
  );
}
```

#### Remix

```typescript
// app/root.tsx
import { DesignSystemProvider } from '@xala-technologies/ui-system';

export default function App() {
  return (
    <html>
      <body>
        <DesignSystemProvider templateId="base-light">
          <Outlet />
        </DesignSystemProvider>
      </body>
    </html>
  );
}
```

## Performance Optimization

### 1. Bundle Optimization

The UI System v4.0.0 includes advanced tree-shaking support:

```typescript
// ✅ GOOD: Import only what you need
import { Button, Card } from '@xala-technologies/ui-system';

// ❌ AVOID: Importing everything
import * from '@xala-technologies/ui-system';
```

### 2. Lazy Loading for Large Components

```typescript
// For large platform-specific components
import { Desktop, Mobile } from '@xala-technologies/ui-system';

// Lazy load only when needed
const DesktopSidebar = React.lazy(() => Desktop.Sidebar);
const MobileHeader = React.lazy(() => Mobile.Header);
```

### 3. Template Caching Strategy

```typescript
// Implement template caching for production
const templateCache = new Map();

async function getCachedTemplate(templateId: string) {
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId);
  }

  const template = await fetch(`/api/templates/${templateId}`).then(r => r.json());
  templateCache.set(templateId, template);
  return template;
}
```

## Error Handling & Resilience

### 1. Template Loading Failures

```typescript
// The system automatically handles template failures
<DesignSystemProvider
  templateId="my-custom-template"
  enableSSRFallback={true} // Always provide fallback
>
  {children}
</DesignSystemProvider>
```

### 2. Network Resilience

```typescript
// For offline-first applications
const offlineTemplate = {
  id: 'offline-fallback',
  // ... minimal template definition
};

<DesignSystemProvider
  templateId="online-template"
  ssrTemplate={offlineTemplate} // Offline fallback
  enableSSRFallback={true}
>
  {children}
</DesignSystemProvider>
```

### 3. Error Boundaries

```typescript
// Wrap your app with error boundaries
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div style={{ padding: '20px', border: '1px solid red' }}>
      <h2>UI System Error</h2>
      <p>{error.message}</p>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DesignSystemProvider templateId="base-light">
        <YourApp />
      </DesignSystemProvider>
    </ErrorBoundary>
  );
}
```

## Testing SSR Implementation

### 1. Basic SSR Test

```typescript
// __tests__/ssr.test.tsx
import { render } from '@testing-library/react';
import { DesignSystemProvider, Button } from '@xala-technologies/ui-system';

test('components render in SSR environment', () => {
  const { getByText } = render(
    <DesignSystemProvider templateId="base-light">
      <Button>Test Button</Button>
    </DesignSystemProvider>
  );

  expect(getByText('Test Button')).toBeInTheDocument();
});
```

### 2. Template Loading Test

```typescript
test('handles template loading failures gracefully', () => {
  const { getByText } = render(
    <DesignSystemProvider
      templateId="non-existent-template"
      enableSSRFallback={true}
    >
      <Button>Fallback Test</Button>
    </DesignSystemProvider>
  );

  expect(getByText('Fallback Test')).toBeInTheDocument();
});
```

## Production Deployment Checklist

### Pre-Deployment

- [ ] **Template Preloading**: Implement server-side template loading
- [ ] **Error Boundaries**: Add error boundaries around UI System usage
- [ ] **Testing**: Run SSR compatibility tests
- [ ] **Performance**: Verify bundle size and tree-shaking
- [ ] **Fallback Strategy**: Configure emergency fallback templates

### Environment Configuration

```typescript
// Production configuration
const PRODUCTION_CONFIG = {
  templateId: process.env.BRAND_TEMPLATE || 'base-light',
  apiEndpoint: process.env.TEMPLATE_API || '/api/templates',
  enableSSRFallback: true,
  autoDetectDarkMode: true,
  templateCaching: true,
};
```

### Monitoring & Observability

```typescript
// Add monitoring for template loading
const DesignSystemProvider = ({ children, ...props }) => {
  const [loadingStats, setLoadingStats] = useState({});

  const handleTemplateLoad = (templateId, loadTime) => {
    // Send metrics to your monitoring service
    analytics.track('template_loaded', {
      templateId,
      loadTime,
      timestamp: Date.now(),
    });
  };

  return (
    <DesignSystemProvider
      {...props}
      onTemplateLoad={handleTemplateLoad}
    >
      {children}
    </DesignSystemProvider>
  );
};
```

## Common Issues & Solutions

### Issue: `window is not defined`

**Cause**: Component trying to access browser APIs during SSR

**Solution**: The UI System v4.0.0 handles this automatically, but if you see this error:

```typescript
// ✅ CORRECT: Provider handles SSR safety
<DesignSystemProvider enableSSRFallback={true}>
  <YourApp />
</DesignSystemProvider>
```

### Issue: Hydration Mismatches

**Cause**: Server and client rendering different content

**Solution**: Use consistent template loading:

```typescript
// Ensure same template on server and client
<DesignSystemProvider
  templateId="base-light" // Consistent ID
  ssrTemplate={preloadedTemplate} // Same template
>
  <YourApp />
</DesignSystemProvider>
```

### Issue: Large Bundle Size

**Solution**: Use specific imports and lazy loading:

```typescript
// ✅ Tree-shake properly
import { Button, Card } from '@xala-technologies/ui-system';

// ✅ Lazy load platform components
const { Desktop } = await import('@xala-technologies/ui-system');
```

## Migration from v3.x

### Breaking Changes

1. **Provider Name Change**: `UISystemProvider` → `DesignSystemProvider`
2. **Hook Change**: Enhanced `useTokens` replaces previous hooks
3. **Template System**: JSON templates replace TypeScript themes

### Migration Steps

```typescript
// v3.x (OLD)
import { UISystemProvider, useUISystem } from '@xala-technologies/ui-system@3.x';

// v4.x (NEW)
import { DesignSystemProvider, useTokens } from '@xala-technologies/ui-system@4.x';
```

### Component Updates

```typescript
// v3.x (OLD)
const MyComponent = () => {
  const { theme } = useUISystem();
  return <div style={{ color: theme.colors.primary }}>...</div>;
};

// v4.x (NEW)
const MyComponent = () => {
  const { colors } = useTokens();
  return <div style={{ color: colors.primary[500] }}>...</div>;
};
```

## Support & Resources

- **Documentation**: [UI System Docs](https://ui-system.xala.dev)
- **GitHub**: [Repository](https://github.com/xala-technologies/ui-system)
- **Issues**: [Bug Reports](https://github.com/xala-technologies/ui-system/issues)
- **Templates**: [Template Gallery](https://templates.xala.dev)

---

**Version**: 4.0.0  
**Last Updated**: July 2025  
**SSR Compatibility**: ✅ Production Ready
