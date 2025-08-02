# SSR Implementation Documentation

## Table of Contents

- [Overview](#overview)
- [SSR Architecture](#ssr-architecture)
- [Environment Detection](#environment-detection)
- [Theme Serialization](#theme-serialization)
- [Hydration Strategy](#hydration-strategy)
- [Framework Integration](#framework-integration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

The UI System v5.0 provides comprehensive Server-Side Rendering (SSR) support designed for modern React frameworks. The SSR implementation ensures consistent rendering between server and client while maintaining optimal performance and preventing hydration mismatches.

### Key Features

- **🔄 Isomorphic Rendering**: Consistent server and client rendering
- **🎨 Theme Serialization**: Seamless theme transfer from server to client
- **⚡ Hydration Optimization**: Minimal hydration overhead with mismatch detection
- **🛡️ Framework Agnostic**: Support for Next.js, Remix, Gatsby, and custom SSR
- **📱 Platform Detection**: Server-side platform and device detection
- **🔧 Development Tools**: Comprehensive debugging and monitoring tools

### Architecture Principles

- **SSR-First Design**: All components are built with SSR as the primary concern
- **Hydration Safety**: Prevent hydration mismatches through careful state management
- **Performance Focused**: Minimize server-to-client payload and processing time
- **Developer Experience**: Clear debugging tools and error messages

## SSR Architecture

### Core SSR System

The SSR system consists of several interconnected layers:

```
┌─────────────────────────────────────────┐
│           SSR Orchestration            │
├─────────────────────────────────────────┤
│          Framework Adapters            │
├─────────────────────────────────────────┤
│         Theme Serialization           │
├─────────────────────────────────────────┤
│        Hydration Management           │
├─────────────────────────────────────────┤
│       Environment Detection           │
├─────────────────────────────────────────┤
│         SSR Utilities & Helpers       │
└─────────────────────────────────────────┘
```

### SSR Context System

The SSR context provides server-side information to components:

```typescript
export interface SSRContext {
  readonly isServer: boolean;
  readonly isClient: boolean;
  readonly canUseDOM: boolean;
  readonly userAgent?: string;
  readonly platform: 'desktop' | 'mobile' | 'tablet';
  readonly framework: 'nextjs' | 'remix' | 'gatsby' | 'vite' | 'unknown';
  readonly environment: 'development' | 'production' | 'test';
  readonly headers?: Record<string, string>;
  readonly cookies?: Record<string, string>;
  readonly url?: string;
  readonly pathname?: string;
  readonly search?: string;
  readonly timestamp: number;
}

export function createSSRContext(options: Partial<SSRContext> = {}): SSRContext {
  const isServer = typeof window === 'undefined';
  const isClient = !isServer;
  const canUseDOM = !!(typeof window !== 'undefined' && window.document);

  return {
    isServer,
    isClient,
    canUseDOM,
    platform: detectPlatform(options.userAgent),
    framework: detectFramework(),
    environment: detectEnvironment(),
    timestamp: Date.now(),
    ...options,
  };
}
```

### SSR Provider Implementation

The SSR provider manages server-side context throughout the component tree:

```typescript
import React, { createContext, useContext, useMemo } from 'react';

const SSRContextProvider = createContext<SSRContext | null>(null);

export interface SSRProviderProps {
  readonly children: React.ReactNode;
  readonly value?: Partial<SSRContext>;
  readonly userAgent?: string;
  readonly headers?: Record<string, string>;
  readonly cookies?: Record<string, string>;
  readonly url?: string;
}

export const SSRProvider: React.FC<SSRProviderProps> = ({
  children,
  value,
  userAgent,
  headers,
  cookies,
  url,
}) => {
  const contextValue = useMemo<SSRContext>(() => {
    return createSSRContext({
      userAgent,
      headers,
      cookies,
      url,
      ...value,
    });
  }, [value, userAgent, headers, cookies, url]);

  return (
    <SSRContextProvider.Provider value={contextValue}>
      {children}
    </SSRContextProvider.Provider>
  );
};

export function useSSRContext(): SSRContext {
  const context = useContext(SSRContextProvider);
  
  if (!context) {
    return createSSRContext();
  }
  
  return context;
}
```

## Environment Detection

### Platform Detection

Server-side platform detection based on user agent:

```typescript
export function detectPlatform(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
  if (!userAgent) {
    return 'desktop';
  }

  const ua = userAgent.toLowerCase();

  // Mobile detection patterns
  const mobilePatterns = [
    /android.*mobile/,
    /iphone/,
    /ipod/,
    /blackberry/,
    /windows phone/,
    /mobile/
  ];

  // Tablet detection patterns  
  const tabletPatterns = [
    /ipad/,
    /android(?!.*mobile)/,
    /tablet/,
    /kindle/,
    /silk/,
    /playbook/
  ];

  if (tabletPatterns.some(pattern => pattern.test(ua))) {
    return 'tablet';
  }

  if (mobilePatterns.some(pattern => pattern.test(ua))) {
    return 'mobile';
  }

  return 'desktop';
}

export function detectFramework(): SSRContext['framework'] {
  // Next.js detection
  if (typeof process !== 'undefined' && process.env.__NEXT_ROUTER_BASEPATH !== undefined) {
    return 'nextjs';
  }

  // Remix detection
  if (typeof globalThis !== 'undefined' && 'RemixRouter' in globalThis) {
    return 'remix';
  }

  // Gatsby detection
  if (typeof process !== 'undefined' && process.env.GATSBY_FUNCTIONS_PORT !== undefined) {
    return 'gatsby';
  }

  // Vite detection
  if (typeof process !== 'undefined' && process.env.VITE_USER_NODE_ENV !== undefined) {
    return 'vite';
  }

  return 'unknown';
}

export function detectEnvironment(): 'development' | 'production' | 'test' {
  if (typeof process !== 'undefined') {
    if (process.env.NODE_ENV === 'test') return 'test';
    if (process.env.NODE_ENV === 'development') return 'development';
    if (process.env.NODE_ENV === 'production') return 'production';
  }

  return 'production';
}
```

### Runtime Environment Checks

Safe environment checks for server and client code:

```typescript
export function isServer(): boolean {
  return typeof window === 'undefined';
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function canUseDOM(): boolean {
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
}

export function isEdgeRuntime(): boolean {
  return typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
}

export function isNodeJS(): boolean {
  return typeof process !== 'undefined' && process.versions && process.versions.node;
}

export function isBrowser(): boolean {
  return canUseDOM() && typeof navigator !== 'undefined';
}

// Safe access to window/document
export function safeWindow(): Window | undefined {
  return canUseDOM() ? window : undefined;
}

export function safeDocument(): Document | undefined {
  return canUseDOM() ? document : undefined;
}

export function safeNavigator(): Navigator | undefined {
  return isBrowser() ? navigator : undefined;
}
```

## Theme Serialization

### Theme Snapshot System

Themes are serialized on the server and injected into the HTML for client hydration:

```typescript
export interface ThemeSnapshot {
  readonly id: string;
  readonly theme: string;
  readonly tokens: DesignTokens;
  readonly platform: 'desktop' | 'mobile' | 'tablet';
  readonly timestamp: number;
  readonly checksum: string;
}

export function createThemeSnapshot(
  theme: string,
  tokens: DesignTokens,
  platform: string = 'desktop'
): ThemeSnapshot {
  const snapshot = {
    id: generateId(),
    theme,
    tokens,
    platform: platform as 'desktop' | 'mobile' | 'tablet',
    timestamp: Date.now(),
    checksum: '', // Will be calculated
  };

  snapshot.checksum = calculateChecksum(snapshot);
  return snapshot;
}

export function serializeThemeSnapshot(snapshot: ThemeSnapshot): string {
  try {
    return JSON.stringify(snapshot);
  } catch (error) {
    console.error('Failed to serialize theme snapshot:', error);
    return '{}';
  }
}

export function deserializeThemeSnapshot(serialized: string): ThemeSnapshot | null {
  try {
    const snapshot = JSON.parse(serialized) as ThemeSnapshot;
    
    // Validate snapshot
    if (!validateThemeSnapshot(snapshot)) {
      return null;
    }
    
    return snapshot;
  } catch (error) {
    console.error('Failed to deserialize theme snapshot:', error);
    return null;
  }
}

function validateThemeSnapshot(snapshot: any): snapshot is ThemeSnapshot {
  return (
    typeof snapshot === 'object' &&
    typeof snapshot.id === 'string' &&
    typeof snapshot.theme === 'string' &&
    typeof snapshot.tokens === 'object' &&
    typeof snapshot.platform === 'string' &&
    typeof snapshot.timestamp === 'number' &&
    typeof snapshot.checksum === 'string'
  );
}

function calculateChecksum(snapshot: Omit<ThemeSnapshot, 'checksum'>): string {
  const content = JSON.stringify(snapshot);
  // Simple hash implementation (use crypto in production)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
```

### HTML Injection

Inject theme snapshots into HTML during SSR:

```typescript
export function injectThemeIntoHTML(html: string, snapshot: ThemeSnapshot): string {
  const script = `
    <script id="__THEME_SNAPSHOT__" type="application/json">
      ${serializeThemeSnapshot(snapshot)}
    </script>
  `;

  // Inject before closing head tag
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex !== -1) {
    return html.slice(0, headCloseIndex) + script + html.slice(headCloseIndex);
  }

  // Fallback: inject at the beginning of body
  const bodyOpenIndex = html.indexOf('<body>');
  if (bodyOpenIndex !== -1) {
    const insertIndex = bodyOpenIndex + '<body>'.length;
    return html.slice(0, insertIndex) + script + html.slice(insertIndex);
  }

  // Last resort: append to end
  return html + script;
}

export function extractThemeSnapshot(): ThemeSnapshot | null {
  if (!canUseDOM()) {
    return null;
  }

  const script = document.getElementById('__THEME_SNAPSHOT__');
  if (!script) {
    return null;
  }

  try {
    const content = script.textContent || script.innerHTML;
    return deserializeThemeSnapshot(content);
  } catch (error) {
    console.error('Failed to extract theme snapshot:', error);
    return null;
  }
}
```

## Hydration Strategy

### Hydration Provider

Manages client-side hydration and theme synchronization:

```typescript
export interface HydrationProviderProps {
  readonly children: React.ReactNode;
  readonly suppressHydrationWarning?: boolean;
  readonly onMismatch?: (mismatch: HydrationMismatch) => void;
  readonly fallbackTheme?: string;
}

export interface HydrationMismatch {
  readonly type: 'theme' | 'platform' | 'tokens';
  readonly server: any;
  readonly client: any;
  readonly timestamp: number;
}

export const HydrationProvider: React.FC<HydrationProviderProps> = ({
  children,
  suppressHydrationWarning = false,
  onMismatch,
  fallbackTheme = 'light',
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [themeSnapshot, setThemeSnapshot] = useState<ThemeSnapshot | null>(null);
  const [mismatches, setMismatches] = useState<HydrationMismatch[]>([]);

  // Extract theme snapshot on mount
  useEffect(() => {
    const snapshot = extractThemeSnapshot();
    setThemeSnapshot(snapshot);
    setIsHydrated(true);

    // Clean up the script tag
    const script = document.getElementById('__THEME_SNAPSHOT__');
    if (script) {
      script.remove();
    }
  }, []);

  // Detect hydration mismatches
  useEffect(() => {
    if (!isHydrated || !themeSnapshot) return;

    const currentPlatform = detectPlatform(navigator.userAgent);
    const currentTokens = getResolvedTokens(themeSnapshot.theme);

    const detectedMismatches: HydrationMismatch[] = [];

    // Platform mismatch
    if (currentPlatform !== themeSnapshot.platform) {
      detectedMismatches.push({
        type: 'platform',
        server: themeSnapshot.platform,
        client: currentPlatform,
        timestamp: Date.now(),
      });
    }

    // Token mismatch (simplified check)
    if (JSON.stringify(currentTokens) !== JSON.stringify(themeSnapshot.tokens)) {
      detectedMismatches.push({
        type: 'tokens',
        server: themeSnapshot.tokens,
        client: currentTokens,
        timestamp: Date.now(),
      });
    }

    if (detectedMismatches.length > 0) {
      setMismatches(detectedMismatches);
      detectedMismatches.forEach(onMismatch);
    }
  }, [isHydrated, themeSnapshot, onMismatch]);

  if (!isHydrated) {
    // Show fallback during hydration
    return (
      <div suppressHydrationWarning={suppressHydrationWarning}>
        {children}
      </div>
    );
  }

  return (
    <HydrationContext.Provider value={{ 
      isHydrated, 
      themeSnapshot, 
      mismatches 
    }}>
      {children}
    </HydrationContext.Provider>
  );
};

const HydrationContext = createContext<{
  isHydrated: boolean;
  themeSnapshot: ThemeSnapshot | null;
  mismatches: HydrationMismatch[];
} | null>(null);

export function useHydration() {
  const context = useContext(HydrationContext);
  if (!context) {
    throw new Error('useHydration must be used within HydrationProvider');
  }
  return context;
}
```

### SSR-Safe Hooks

Hooks that work safely in both server and client environments:

```typescript
export function useSSRSafeValue<T>(serverValue: T, clientValue: T): T {
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);

  return value;
}

export function useSSRSafeEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  useEffect(() => {
    if (canUseDOM()) {
      return effect();
    }
    // Return empty cleanup function for SSR
    return () => {};
  }, deps);
}

export function useSSRSafeLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const useEffectHook = canUseDOM() ? useLayoutEffect : useEffect;
  
  useEffectHook(() => {
    if (canUseDOM()) {
      return effect();
    }
    return () => {};
  }, deps);
}

export function useSSRSafeState<T>(
  initialValue: T | (() => T),
  clientValue?: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    if (clientValue !== undefined) {
      setState(clientValue);
    }
  }, [clientValue]);

  return [state, setState];
}
```

## Framework Integration

### Next.js Integration

Complete Next.js setup with SSR support:

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider 
} from '@xala-technologies/ui-system';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DesignSystemProvider theme="light" platform="web">
      <SSRProvider 
        userAgent={pageProps.userAgent}
        headers={pageProps.headers}
      >
        <HydrationProvider suppressHydrationWarning>
          <Component {...pageProps} />
        </HydrationProvider>
      </SSRProvider>
    </DesignSystemProvider>
  );
}

export default MyApp;

// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { 
  getResolvedTokens, 
  createThemeSnapshot, 
  injectThemeIntoHTML 
} from '@xala-technologies/ui-system/ssr';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    
    // Create theme snapshot for SSR
    const userAgent = ctx.req?.headers['user-agent'] || '';
    const platform = detectPlatform(userAgent);
    const tokens = getResolvedTokens('light', platform);
    
    const themeSnapshot = createThemeSnapshot('light', tokens, platform);
    
    // Inject theme into HTML
    initialProps.html = injectThemeIntoHTML(
      initialProps.html, 
      themeSnapshot
    );
    
    return {
      ...initialProps,
      userAgent,
      headers: ctx.req?.headers || {},
    };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### Remix Integration

Remix setup with loader-based SSR:

```typescript
// app/root.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { 
  DesignSystemProvider,
  SSRProvider,
  HydrationProvider 
} from '@xala-technologies/ui-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const userAgent = request.headers.get('user-agent') || '';
  const platform = detectPlatform(userAgent);
  
  return json({
    userAgent,
    platform,
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
  });
}

export default function App() {
  const { userAgent, platform, headers, url } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <DesignSystemProvider theme="light" platform={platform}>
          <SSRProvider 
            userAgent={userAgent}
            headers={headers}
            url={url}
          >
            <HydrationProvider>
              <Outlet />
            </HydrationProvider>
          </SSRProvider>
        </DesignSystemProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### Gatsby Integration

Gatsby configuration with SSR support:

```typescript
// gatsby-ssr.js
import React from 'react';
import { 
  DesignSystemProvider,
  SSRProvider 
} from '@xala-technologies/ui-system';

export const wrapRootElement = ({ element }) => {
  return (
    <DesignSystemProvider theme="light" platform="web">
      <SSRProvider>
        {element}
      </SSRProvider>
    </DesignSystemProvider>
  );
};

// gatsby-browser.js
import React from 'react';
import { 
  DesignSystemProvider,
  HydrationProvider 
} from '@xala-technologies/ui-system';

export const wrapRootElement = ({ element }) => {
  return (
    <DesignSystemProvider theme="light" platform="web">
      <HydrationProvider>
        {element}
      </HydrationProvider>
    </DesignSystemProvider>
  );
};
```

## Performance Optimization

### Critical CSS Extraction

Extract and inline critical CSS for first paint optimization:

```typescript
export interface CriticalCSSOptions {
  readonly components: string[];
  readonly themes: string[];
  readonly platforms: string[];
  readonly minify?: boolean;
}

export function extractCriticalCSS(
  options: CriticalCSSOptions
): Promise<string> {
  return new Promise((resolve) => {
    const { components, themes, platforms, minify = true } = options;
    
    const criticalCSS: string[] = [];
    
    // Extract base tokens CSS
    themes.forEach(theme => {
      const tokens = getResolvedTokens(theme);
      criticalCSS.push(generateTokensCSS(tokens, theme));
    });
    
    // Extract component CSS
    components.forEach(component => {
      themes.forEach(theme => {
        platforms.forEach(platform => {
          const css = generateComponentCSS(component, theme, platform);
          criticalCSS.push(css);
        });
      });
    });
    
    let result = criticalCSS.join('\n');
    
    if (minify) {
      result = minifyCSS(result);
    }
    
    resolve(result);
  });
}

function generateTokensCSS(tokens: DesignTokens, theme: string): string {
  const cssVariables: string[] = [];
  
  // Generate CSS custom properties
  Object.entries(flattenTokens(tokens)).forEach(([key, value]) => {
    cssVariables.push(`  --${kebabCase(key)}: ${value};`);
  });
  
  return `
:root[data-theme="${theme}"] {
${cssVariables.join('\n')}
}
  `.trim();
}

function generateComponentCSS(
  component: string, 
  theme: string, 
  platform: string
): string {
  // Generate component-specific CSS based on tokens
  const tokens = getResolvedTokens(theme, platform);
  const componentTokens = tokens.components[component];
  
  if (!componentTokens) return '';
  
  return generateCSSFromTokens(component, componentTokens);
}
```

### Streaming SSR

Implement streaming SSR for xaheen performance:

```typescript
export interface StreamingSSROptions {
  readonly theme: string;
  readonly platform: string;
  readonly userAgent?: string;
  readonly priority?: 'critical' | 'high' | 'normal' | 'low';
}

export function createSSRStream(
  element: React.ReactElement,
  options: StreamingSSROptions
): NodeJS.ReadableStream {
  const { theme, platform, userAgent, priority = 'normal' } = options;
  
  // Create theme snapshot
  const tokens = getResolvedTokens(theme, platform);
  const snapshot = createThemeSnapshot(theme, tokens, platform);
  
  // Create SSR context
  const ssrContext = createSSRContext({
    userAgent,
    platform: platform as any,
  });
  
  // Wrap element with providers
  const wrappedElement = (
    <DesignSystemProvider theme={theme} platform={platform}>
      <SSRProvider value={ssrContext}>
        {element}
      </SSRProvider>
    </DesignSystemProvider>
  );
  
  // Use React's streaming SSR
  const stream = renderToReadableStream(wrappedElement, {
    bootstrapScripts: ['/ui-system.js'],
    onError: (error) => {
      console.error('SSR streaming error:', error);
    },
  });
  
  return stream;
}

// Usage with Next.js Edge Runtime
export async function GET(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const platform = detectPlatform(userAgent);
  
  const stream = createSSRStream(
    <App />,
    { 
      theme: 'light', 
      platform, 
      userAgent,
      priority: 'critical' 
    }
  );
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

### Selective Hydration

Implement selective hydration for performance:

```typescript
export interface SelectiveHydrationOptions {
  readonly strategy: 'critical' | 'lazy' | 'on-demand';
  readonly components: string[];
  readonly priority: number;
}

export function createSelectiveHydration(
  options: SelectiveHydrationOptions
) {
  const { strategy, components, priority } = options;
  
  return {
    shouldHydrate: (componentName: string) => {
      if (strategy === 'critical') {
        return components.includes(componentName);
      }
      
      if (strategy === 'lazy') {
        return false; // Hydrate later
      }
      
      return true; // on-demand
    },
    
    getPriority: (componentName: string) => {
      const index = components.indexOf(componentName);
      return index === -1 ? 999 : index + priority;
    },
  };
}

const HydrationScheduler = () => {
  const [hydratedComponents, setHydratedComponents] = useState<Set<string>>(new Set());
  
  const scheduleHydration = useCallback((componentName: string, priority: number) => {
    // Use scheduler to prioritize hydration
    unstable_scheduleCallback(
      priority > 0 ? unstable_ImmediatePriority : unstable_NormalPriority,
      () => {
        setHydratedComponents(prev => new Set(prev).add(componentName));
      }
    );
  }, []);
  
  return { hydratedComponents, scheduleHydration };
};
```

## Troubleshooting

### Common SSR Issues

#### 1. Hydration Mismatches

**Problem**: Server and client render different content

```typescript
// ❌ Problematic code
const Component = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div>
      {isClient ? 'Client' : 'Server'}
    </div>
  );
};
```

**Solution**: Use SSR-safe patterns

```typescript
// ✅ Fixed code
const Component = () => {
  const { isHydrated } = useHydration();
  
  return (
    <div suppressHydrationWarning>
      {isHydrated ? 'Hydrated' : 'Loading'}
    </div>
  );
};
```

#### 2. Theme Mismatches

**Problem**: Theme not synchronized between server and client

```typescript
// ❌ Problematic code
const Component = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);
  
  return <div data-theme={theme} />;
};
```

**Solution**: Use theme snapshot system

```typescript
// ✅ Fixed code
const Component = () => {
  const { themeSnapshot } = useHydration();
  const [theme, setTheme] = useState(themeSnapshot?.theme || 'light');
  
  useEffect(() => {
    if (themeSnapshot) {
      setTheme(themeSnapshot.theme);
    }
  }, [themeSnapshot]);
  
  return <div data-theme={theme} />;
};
```

### Debugging Tools

Development tools for SSR debugging:

```typescript
export const SSRDebugger = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const ssrContext = useSSRContext();
  const { isHydrated, mismatches } = useHydration();
  
  if (!enabled) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
    }}>
      <div>SSR: {ssrContext.isServer ? '✅' : '❌'}</div>
      <div>Hydrated: {isHydrated ? '✅' : '❌'}</div>
      <div>Platform: {ssrContext.platform}</div>
      <div>Framework: {ssrContext.framework}</div>
      {mismatches.length > 0 && (
        <div style={{ color: 'red' }}>
          Mismatches: {mismatches.length}
        </div>
      )}
    </div>
  );
};
```

### Performance Monitoring

Monitor SSR performance:

```typescript
export function useSSRPerformanceMonitor() {
  const ssrContext = useSSRContext();
  
  useEffect(() => {
    if (ssrContext.isClient) {
      // Measure hydration time
      const hydrationStart = performance.now();
      
      return () => {
        const hydrationTime = performance.now() - hydrationStart;
        
        // Report metrics
        analytics.track('ssr_hydration_time', {
          duration: hydrationTime,
          platform: ssrContext.platform,
          framework: ssrContext.framework,
        });
      };
    }
  }, [ssrContext]);
  
  // Monitor for hydration errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('hydration')) {
        analytics.track('ssr_hydration_error', {
          error: event.message,
          platform: ssrContext.platform,
        });
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [ssrContext]);
}
```

## Conclusion

The UI System v5.0 SSR implementation provides a robust, performant foundation for server-side rendering across all major React frameworks. By following the patterns and guidelines outlined in this documentation, developers can build applications that render consistently on both server and client while maintaining optimal performance and user experience.

### Key Benefits

- **🔄 Universal Rendering**: Consistent server and client output
- **⚡ Optimized Performance**: Minimal hydration overhead and fast first paint
- **🛡️ Reliability**: Comprehensive error handling and mismatch detection
- **🔧 Developer Experience**: Clear debugging tools and error messages
- **📱 Platform Awareness**: Automatic platform detection and optimization

The SSR system is designed to handle the complexities of modern web applications while providing a simple, declarative API for developers to work with.