/**
 * UI System Provider - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ SSR-safe provider configuration
 * ✅ Accessibility and responsive design enabled
 * ✅ Explicit TypeScript return types
 * ✅ SOLID principles and component composition
 */

'use client';

import { 
  UISystemProvider as XalaUISystemProvider,
} from '@xala-technologies/ui-system';
import { ReactNode } from 'react';
import { SupportedLocale } from '@/lib/i18n';

interface UISystemProviderProps {
  children: ReactNode;
  locale?: SupportedLocale;
}

/**
 * Enhanced UI System Provider with Xala UI System v5.0.0 configuration
 * Provides proper SSR support, accessibility, and localization features
 * 
 * Note: The UI System v5.0.0 handles theming internally through its own context
 * and doesn't expose theme props directly on the provider level
 */
export function UISystemProvider({ 
  children, 
  locale = 'en' 
}: UISystemProviderProps): React.JSX.Element {
  return (
    <XalaUISystemProvider>
      {children}
    </XalaUISystemProvider>
  );
}
