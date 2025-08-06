{{!-- Template: BaseLayout.tsx.hbs --}}
{{!-- Category: frontend --}}
{{!-- Type: component --}}
{{!-- Framework: next --}}
{{!-- Migrated from: /Volumes/Development/Xaheen Enterprise/xaheen/apps/cli/templates/frontend/react/next/src/components/layouts/BaseLayout.tsx.hbs --}}
{{#if typescript}}'use client';{{/if}}

/**
 * BaseLayout Component - Xala UI System Compliant
 * Generated with Xaheen CLI - Multi-Platform Foundation Layout
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
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
 * Multi-Platform Features:
 * - Web (Next.js/React) support
 * - Mobile (React Native) support
 * - Desktop (Electron) support
 * - Platform-specific optimizations
 * - Unified component API
 * - Cross-platform theming
 * - Platform detection and adaptation
 */

{{#if typescript}}
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  UISystemProvider,
  ThemeProvider,
  AccessibilityProvider,
  ComplianceProvider,
  Box,
  Stack,
  Typography,
  ErrorBoundary
} from '@xaheen-ai/design-system';
import { Toaster } from '@xaheen-ai/design-system/toast';
import { Analytics } from '@xaheen-ai/design-system/analytics';
import { usePlatform, usePlatformDimensions } from '../hooks/usePlatform';
import { PlatformSafeAreaView, PlatformStatusBar } from '../components/platform/PlatformComponents';
import { getPlatformConfig } from '../config/platform.config';

interface BaseLayoutProps {
  children: React.ReactNode;
  locale?: string;
  theme?: 'light' | 'dark' | 'high-contrast';
  enableCompliance?: boolean;
  enableAnalytics?: boolean;
  messages?: Record<string, any>;
  className?: string;
  platformOptimized?: boolean;
}

interface LayoutContextValue {
  locale: string;
  theme: string;
  isComplianceEnabled: boolean;
}
{{else}}
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  UISystemProvider,
  ThemeProvider,
  AccessibilityProvider,
  ComplianceProvider,
  Box,
  Stack,
  Typography,
  ErrorBoundary
} from '@xaheen-ai/design-system';
import { Toaster } from '@xaheen-ai/design-system/toast';
import { Analytics } from '@xaheen-ai/design-system/analytics';
import { usePlatform, usePlatformDimensions } from '../hooks/usePlatform';
import { PlatformSafeAreaView, PlatformStatusBar } from '../components/platform/PlatformComponents';
import { getPlatformConfig } from '../config/platform.config';
{{/if}}

{{#if typescript}}
const LayoutContext = React.createContext<LayoutContextValue | null>(null);

export const useLayoutContext = (): LayoutContextValue => {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within BaseLayout');
  }
  return context;
};
{{/if}}

/**
 * BaseLayout - Foundation layout component
 * Provides all necessary providers and accessibility infrastructure
 */
{{#if typescript}}
export default function BaseLayout({
  children,
  locale = 'en',
  messages = {},
  theme = 'light',
  enableCompliance = true,
  enableAnalytics = false,
  className,
  platformOptimized = true
}: BaseLayoutProps): React.ReactElement {
{{else}}
export default function BaseLayout({
  children,
  locale = 'en',
  messages = {},
  theme = 'light',
  enableCompliance = true,
  enableAnalytics = false,
  className,
  platformOptimized = true
}) {
{{/if}}
  // Platform detection and configuration
  const platformInfo = usePlatform();
  const dimensions = usePlatformDimensions();
  const platformConfig = getPlatformConfig();

  // Log layout initialization with platform info
  React.useEffect(() => {
    if (enableCompliance) {
      console.log('BaseLayout initialized', {
        platform: platformInfo.platform,
        locale,
        theme,
        dimensions,
        timestamp: new Date().toISOString(),
      });
    }
  }, [locale, theme, platformInfo, dimensions, enableCompliance]);

  // Platform-specific theme configuration
  const getPlatformThemeConfig = React.useCallback({{#if typescript}}(): any{{/if}} => {
    const baseTheme = {
      colors: { primary: 'blue', secondary: 'gray' },
      spacing: 'comfortable',
      typography: 'professional'
    };

    // Platform-specific adjustments
    if (platformInfo.isMobile) {
      return {
        ...baseTheme,
        spacing: 'touch-friendly',
        typography: 'mobile-optimized',
        interactions: 'touch'
      };
    }

    if (platformInfo.isDesktop) {
      return {
        ...baseTheme,
        spacing: 'desktop-comfortable',
        typography: 'desktop-professional',
        interactions: 'mouse-keyboard'
      };
    }

    return baseTheme;
  }, [platformInfo]);

  {{#if typescript}}
  const layoutContextValue: LayoutContextValue = React.useMemo(() => ({
    locale,
    theme,
    isComplianceEnabled: enableCompliance,
    platformInfo,
    dimensions,
  }), [locale, theme, enableCompliance, platformInfo, dimensions]);
  {{else}}
  const layoutContextValue = React.useMemo(() => ({
    locale,
    theme,
    isComplianceEnabled: enableCompliance,
    platformInfo,
    dimensions,
  }), [locale, theme, enableCompliance, platformInfo, dimensions]);
  {{/if}}

  const renderContent = {{#if typescript}}(): React.ReactElement{{/if}} => {
    if (platformOptimized && platformInfo.isReactNative) {
      // React Native optimized layout
      return (
        <PlatformSafeAreaView>
          <PlatformStatusBar 
            barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme === 'dark' ? '#000000' : '#ffffff'}
          />
          <Box 
            variant="page" 
            className=""
            role="main"
            flex="1"
          >
            <Stack direction="vertical" spacing="0" flex="1">
              {children}
            </Stack>
          </Box>
        </PlatformSafeAreaView>
      );
    }

    // Web/Electron layout
    return (
      <Box 
        variant="page" 
        className=""
        role="main"
        id="main-content"
        minHeight="screen"
      >
        <Stack direction="vertical" spacing="0" minHeight="screen">
          {children}
        </Stack>
      </Box>
    );
  };

  // Platform-optimized provider setup
  const renderWithProviders = (content{{#if typescript}}: React.ReactElement{{/if}}) => {
    const providers = [
      // Internationalization
      <NextIntlClientProvider key="intl" locale={locale} messages={messages}>
        {/* UI System with platform config */}
        <UISystemProvider
          theme={theme}
          platformConfig={{{{raw}}}}{
            platform: platformInfo || 'web',
            capabilities: platformInfo || {},
            dimensions,
            ...platformConfig
          }{{{{/raw}}}}
          themeConfig={getPlatformThemeConfig()}
        >
          {/* Theme Provider */}
          <ThemeProvider theme={theme}>
            {/* Accessibility Provider */}
            <AccessibilityProvider
              enableScreenReader={true}
              enableKeyboardNavigation={true}
              enableMotionReduction={true}
              platform={platformInfo.platform}
            >
              {enableCompliance ? (
                <ComplianceProvider
                  gdprEnabled={true}
                  auditLogging={true}
                  platform={platformInfo.platform}
                >
                  <LayoutContext.Provider value={layoutContextValue}>
                    {content}
                    <Toaster position={platformInfo.isMobile ? 'top' : 'bottom-right'} />
                    {enableAnalytics && <Analytics platform={platformInfo.platform} />}
                  </LayoutContext.Provider>
                </ComplianceProvider>
              ) : (
                <LayoutContext.Provider value={layoutContextValue}>
                  {content}
                  <Toaster position={platformInfo.isMobile ? 'top' : 'bottom-right'} />
                  {enableAnalytics && <Analytics platform={platformInfo.platform} />}
                </LayoutContext.Provider>
              )}
            </AccessibilityProvider>
          </ThemeProvider>
        </UISystemProvider>
      </NextIntlClientProvider>
    ];

    return providers[0];
  };

  return renderWithProviders(renderContent());
}

{{#if includeExamples}}
// Example usage:
/*
import BaseLayout from '@/layouts/BaseLayout';
import { useTranslation } from 'next-intl';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      locale="nb"
      theme="light"
      industryTemplate="healthcare"
      enableCompliance={true}
    >
      <Typography variant="heading" size="2xl">
        {t('home.title', 'Welcome')}
      </Typography>
    </BaseLayout>
  );
}
*/
{{/if}}
