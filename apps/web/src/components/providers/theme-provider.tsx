"use client";

import React from 'react';

interface ThemeIntegratedProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeIntegratedProvider provides a simple wrapper for children.
 * The UI System v5.0.0 components handle theming internally without needing external providers.
 * This maintains compatibility while letting components manage their own theme state.
 */
export function ThemeIntegratedProvider({ children }: ThemeIntegratedProviderProps): React.JSX.Element {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}
