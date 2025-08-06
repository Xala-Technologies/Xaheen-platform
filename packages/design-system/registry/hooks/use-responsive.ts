/**
 * useResponsive Hook - Responsive breakpoint detection
 * Professional responsive design with Norwegian enterprise standards
 * WCAG AAA: Ensures responsive design doesn't break accessibility
 */

import { useEffect, useState, useCallback } from 'react';

// Breakpoint values matching Tailwind CSS defaults
const breakpoints = {
  xs: 0,      // Mobile first
  sm: 640,    // Small tablets
  md: 768,    // Tablets
  lg: 1024,   // Small laptops
  xl: 1280,   // Desktops
  '2xl': 1536 // Large screens
} as const;

export type Breakpoint = keyof typeof breakpoints;

export interface ResponsiveConfig {
  /** Enable SSR-safe behavior */
  readonly ssr?: boolean;
  /** Debounce resize events (ms) */
  readonly debounce?: number;
  /** Initial breakpoint for SSR */
  readonly initialBreakpoint?: Breakpoint;
}

export interface ResponsiveResult {
  /** Current breakpoint */
  readonly breakpoint: Breakpoint;
  /** Check if current viewport is at least the specified breakpoint */
  readonly isAtLeast: (breakpoint: Breakpoint) => boolean;
  /** Check if current viewport is at most the specified breakpoint */
  readonly isAtMost: (breakpoint: Breakpoint) => boolean;
  /** Check if current viewport exactly matches the breakpoint */
  readonly is: (breakpoint: Breakpoint) => boolean;
  /** Check if current viewport is between two breakpoints (inclusive) */
  readonly isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
  /** Current viewport width */
  readonly width: number;
  /** Current viewport height */
  readonly height: number;
  /** Device orientation */
  readonly orientation: 'portrait' | 'landscape';
  /** Check if device supports touch */
  readonly isTouch: boolean;
  /** Check if reduced motion is preferred */
  readonly prefersReducedMotion: boolean;
}

export const useResponsive = (config: ResponsiveConfig = {}): ResponsiveResult => {
  const { 
    ssr = false, 
    debounce = 150, 
    initialBreakpoint = 'lg' 
  } = config;

  // Initialize with SSR-safe values
  const [width, setWidth] = useState(ssr ? breakpoints[initialBreakpoint] : 0);
  const [height, setHeight] = useState(ssr ? 900 : 0); // Reasonable default height
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Get current breakpoint
  const getBreakpoint = useCallback((w: number): Breakpoint => {
    const entries = Object.entries(breakpoints).reverse() as Array<[Breakpoint, number]>;
    for (const [key, value] of entries) {
      if (w >= value) return key;
    }
    return 'xs';
  }, []);

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    ssr ? initialBreakpoint : 'xs'
  );

  // Responsive check functions
  const isAtLeast = useCallback((bp: Breakpoint): boolean => {
    return width >= breakpoints[bp];
  }, [width]);

  const isAtMost = useCallback((bp: Breakpoint): boolean => {
    const bpIndex = Object.keys(breakpoints).indexOf(bp);
    const nextBp = Object.keys(breakpoints)[bpIndex + 1] as Breakpoint | undefined;
    return nextBp ? width < breakpoints[nextBp] : true;
  }, [width]);

  const is = useCallback((bp: Breakpoint): boolean => {
    return breakpoint === bp;
  }, [breakpoint]);

  const isBetween = useCallback((min: Breakpoint, max: Breakpoint): boolean => {
    return width >= breakpoints[min] && width < breakpoints[max];
  }, [width]);

  // Update dimensions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const updateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setWidth(w);
        setHeight(h);
        setBreakpoint(getBreakpoint(w));
      }, debounce);
    };

    const updateMediaQueries = () => {
      // Check touch support
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      // Check reduced motion preference
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
    };

    // Initial setup
    updateDimensions();
    updateMediaQueries();

    // Set up listeners
    window.addEventListener('resize', updateDimensions);
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', updateMediaQueries);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      motionQuery.removeEventListener('change', updateMediaQueries);
    };
  }, [debounce, getBreakpoint]);

  // Calculate orientation
  const orientation = width > height ? 'landscape' : 'portrait';

  return {
    breakpoint,
    isAtLeast,
    isAtMost,
    is,
    isBetween,
    width,
    height,
    orientation,
    isTouch,
    prefersReducedMotion
  };
};

// Utility hook for conditional rendering based on breakpoints
export const useBreakpointValue = <T,>(
  values: Partial<Record<Breakpoint, T>>,
  config?: ResponsiveConfig
): T | undefined => {
  const { breakpoint } = useResponsive(config);
  
  // Find the value for current breakpoint or fall back to smaller ones
  const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];
  const currentIndex = breakpointKeys.indexOf(breakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointKeys[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

// Export breakpoints for external use
export { breakpoints };