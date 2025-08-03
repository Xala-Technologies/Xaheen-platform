"use client";

import React from "react";
import { useTheme } from "next-themes";
import { UISystemProvider } from "@xala-technologies/ui-system";

interface ThemeIntegratedProviderProps {
  children: React.ReactNode;
}

/**
 * Theme-integrated provider that connects next-themes with UI system
 * Ensures UI system components respond to theme changes
 */
export function ThemeIntegratedProvider({ children }: ThemeIntegratedProviderProps): React.JSX.Element {
  const { theme, systemTheme } = useTheme();
  
  // Resolve the actual theme being used
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <UISystemProvider>
      <div data-theme={resolvedTheme} className="theme-provider">
        {children}
      </div>
    </UISystemProvider>
  );
}
