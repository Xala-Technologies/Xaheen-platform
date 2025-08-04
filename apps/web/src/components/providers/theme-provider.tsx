"use client";

/**
 * Theme Provider Integration - Xala UI System v5.0.0 Compliant
 * Provides a simple wrapper that works with UI System's internal theme management
 *
 * MANDATORY COMPLIANCE RULES:
 * Let UI System v5.0.0 handle theming internally
 * No external theme libraries or bridging
 * SSR-safe implementation
 * Explicit TypeScript return types
 *
 * Note: This component is now deprecated in favor of the new locale-based
 * UISystemProvider. It's kept for backward compatibility.
 */

import * as React from "react";
import { UISystemProvider } from "@/app/providers/UISystemProvider";

interface ThemeIntegratedProviderProps {
	children: React.ReactNode;
}

/**
 * Legacy theme provider wrapper - now uses the enhanced UISystemProvider
 * @deprecated Use UISystemProvider directly in new implementations
 */
export function ThemeIntegratedProvider({
	children,
}: ThemeIntegratedProviderProps): React.JSX.Element {
	return <UISystemProvider>{children}</UISystemProvider>;
}
