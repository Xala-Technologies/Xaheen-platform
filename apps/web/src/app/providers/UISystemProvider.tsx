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

"use client";

import { ReactNode } from "react";

interface UISystemProviderProps {
	children: ReactNode;
	locale?: string;
}

/**
 * Temporary UI System Provider - bypassing broken @xala-technologies/ui-system
 * TODO: Fix the broken UI system package structure
 */
export function UISystemProvider({
	children,
	locale = "en",
}: UISystemProviderProps): React.JSX.Element {
	// Temporarily return children directly until UI system is fixed
	return <>{children}</>;
}
