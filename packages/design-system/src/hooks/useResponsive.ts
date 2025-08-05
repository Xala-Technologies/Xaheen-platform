/**
 * Responsive Design Hooks
 * Professional responsive utilities with TypeScript support
 * Mobile-first approach with proper breakpoint management
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions (mobile-first)
export const breakpoints = {
  xs: 320,    // Mobile portrait
  sm: 640,    // Mobile landscape  
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / Small desktop
  xl: 1280,   // Desktop
  '2xl': 1536 // Large desktop
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type BreakpointValue = typeof breakpoints[Breakpoint];

/**
 * Hook to track current screen size and breakpoint
 * Returns current breakpoint and screen dimensions
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const updateBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setDimensions({ width, height });

    // Determine current breakpoint (mobile-first)
    if (width >= breakpoints['2xl']) {
      setBreakpoint('2xl');
    } else if (width >= breakpoints.xl) {
      setBreakpoint('xl');
    } else if (width >= breakpoints.lg) {
      setBreakpoint('lg');
    } else if (width >= breakpoints.md) {
      setBreakpoint('md');
    } else if (width >= breakpoints.sm) {
      setBreakpoint('sm');
    } else {
      setBreakpoint('xs');
    }
  }, []);

  useEffect(() => {
    updateBreakpoint();
    
    const handleResize = () => {
      updateBreakpoint();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [updateBreakpoint]);

  return {
    breakpoint,
    dimensions,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isLargeScreen: breakpoint === 'xl' || breakpoint === '2xl'
  } as const;
}

/**
 * Hook to check if screen matches specific breakpoint
 * @param query - Breakpoint query string (e.g., 'min:md', 'max:lg', 'only:sm')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Parse query string
    const [operator, breakpointKey] = query.split(':') as [string, Breakpoint];
    const breakpointValue = breakpoints[breakpointKey];

    if (!breakpointValue) {
      console.warn(`Invalid breakpoint: ${breakpointKey}`);
      return;
    }

    // Create media query string
    let mediaQueryString = '';
    
    switch (operator) {
      case 'min':
        mediaQueryString = `(min-width: ${breakpointValue}px)`;
        break;
      case 'max':
        mediaQueryString = `(max-width: ${breakpointValue - 1}px)`;
        break;
      case 'only': {
        const nextBreakpointIndex = Object.keys(breakpoints).indexOf(breakpointKey) + 1;
        const nextBreakpoint = Object.values(breakpoints)[nextBreakpointIndex];
        
        if (nextBreakpoint) {
          mediaQueryString = `(min-width: ${breakpointValue}px) and (max-width: ${nextBreakpoint - 1}px)`;
        } else {
          mediaQueryString = `(min-width: ${breakpointValue}px)`;
        }
        break;
      }
      default:
        console.warn(`Invalid operator: ${operator}. Use 'min', 'max', or 'only'`);
        return;
    }

    const mediaQuery = window.matchMedia(mediaQueryString);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Hook for responsive values
 * Returns different values based on current breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T {
  const { breakpoint } = useBreakpoint();

  // Return value for current breakpoint, fallback to smaller breakpoints
  return (
    values[breakpoint] ??
    (breakpoint === '2xl' ? values.xl : undefined) ??
    (breakpoint === 'xl' ? values.lg : undefined) ??
    (breakpoint === 'lg' ? values.md : undefined) ??
    (breakpoint === 'md' ? values.sm : undefined) ??
    (breakpoint === 'sm' ? values.xs : undefined) ??
    values.default
  );
}

/**
 * Hook for touch device detection
 * Detects if device has touch capabilities
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - Legacy property
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    
    // Re-check on resize (device orientation change)
    window.addEventListener('resize', checkTouch, { passive: true });
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

/**
 * Hook for container queries support
 * Detects if browser supports container queries
 */
export function useContainerQueries(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for container query support
    setSupported(
      'CSS' in window &&
      'supports' in window.CSS &&
      window.CSS.supports('container-type: inline-size')
    );
  }, []);

  return supported;
}

/**
 * Hook for device orientation
 * Tracks device orientation changes
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    
    window.addEventListener('resize', updateOrientation, { passive: true });
    window.addEventListener('orientationchange', updateOrientation, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  } as const;
}

/**
 * Hook for preferred color scheme
 * Detects system dark/light mode preference
 */
export function usePreferredColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return colorScheme;
}

/**
 * Hook for reduced motion preference
 * Respects user's motion preferences for accessibility
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return reducedMotion;
}

/**
 * Utility function to get responsive classes
 * @param config - Responsive configuration object
 * @returns Responsive Tailwind classes
 */
export function getResponsiveClasses(config: {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const classes: string[] = [];

  if (config.xs) classes.push(config.xs);
  if (config.sm) classes.push(`sm:${config.sm}`);
  if (config.md) classes.push(`md:${config.md}`);
  if (config.lg) classes.push(`lg:${config.lg}`);
  if (config.xl) classes.push(`xl:${config.xl}`);
  if (config['2xl']) classes.push(`2xl:${config['2xl']}`);

  return classes.join(' ');
}