/**
 * Responsive breakpoint hook for detecting screen sizes
 * Following Xala UI System v5.0.0 compliance rules
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Breakpoint configuration following common responsive design patterns
 */
const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

/**
 * Return type for the useResponsive hook
 */
export interface UseResponsiveReturn {
	/** Current screen width in pixels */
	readonly width: number;
	/** Current screen height in pixels */
	readonly height: number;
	/** True if screen width is below sm breakpoint (640px) */
	readonly isMobile: boolean;
	/** True if screen width is between sm and lg breakpoints */
	readonly isTablet: boolean;
	/** True if screen width is lg or above (1024px+) */
	readonly isDesktop: boolean;
	/** Current breakpoint name */
	readonly breakpoint: keyof typeof BREAKPOINTS | "xs";
}

/**
 * Custom hook for responsive design detection
 * Provides screen size information and breakpoint detection
 *
 * @returns Object containing screen dimensions and breakpoint information
 */
export function useResponsive(): UseResponsiveReturn {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
	}>({
		width: typeof window !== "undefined" ? window.innerWidth : 1024,
		height: typeof window !== "undefined" ? window.innerHeight : 768,
	});

	useEffect(() => {
		// Handle server-side rendering
		if (typeof window === "undefined") {
			return;
		}

		const handleResize = (): void => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		// Set initial dimensions
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup
		return (): void => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const { width, height } = dimensions;

	// Calculate breakpoint
	const getBreakpoint = (
		screenWidth: number,
	): keyof typeof BREAKPOINTS | "xs" => {
		if (screenWidth >= BREAKPOINTS["2xl"]) return "2xl";
		if (screenWidth >= BREAKPOINTS.xl) return "xl";
		if (screenWidth >= BREAKPOINTS.lg) return "lg";
		if (screenWidth >= BREAKPOINTS.md) return "md";
		if (screenWidth >= BREAKPOINTS.sm) return "sm";
		return "xs";
	};

	const breakpoint = getBreakpoint(width);
	const isMobile = width < BREAKPOINTS.sm;
	const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
	const isDesktop = width >= BREAKPOINTS.lg;

	return {
		width,
		height,
		isMobile,
		isTablet,
		isDesktop,
		breakpoint,
	};
}
