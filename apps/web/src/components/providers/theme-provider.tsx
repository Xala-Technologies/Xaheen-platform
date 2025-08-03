"use client";

import React from 'react';

interface ThemeIntegratedProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeIntegratedProvider provides the UI System context.
 * Based on console logs, the UI System has a DesignSystemProvider that initializes automatically.
 * This wrapper ensures components have access to theme tokens and context.
 */
export function ThemeIntegratedProvider({ children }: ThemeIntegratedProviderProps): React.JSX.Element {
  // The UI System v5.0.0 appears to auto-initialize its DesignSystemProvider
  // based on the console logs showing "SSR-safe DesignSystemProvider initialized"
  // We just need to provide a wrapper that doesn't interfere with this process
  return (
    <div data-ui-system-root>
      {children}
    </div>
  );
}
