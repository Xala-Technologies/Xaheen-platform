/**
 * Accessibility Hooks - WCAG AAA Compliance
 * Professional accessibility utilities for Norwegian compliance
 * Screen reader support, keyboard navigation, and focus management
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing focus trapping within modals/dialogs
 * Ensures keyboard navigation stays within the specified container
 */
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), details, summary'
        )
      ).filter((element) => {
        const htmlElement = element as HTMLElement;
        return (
          !htmlElement.hasAttribute('disabled') &&
          !htmlElement.getAttribute('aria-hidden') &&
          htmlElement.offsetWidth > 0 &&
          htmlElement.offsetHeight > 0
        );
      }) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing ARIA live regions for dynamic content
 * Announces changes to screen readers
 */
export function useAriaLive() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((
    text: string, 
    priority: 'polite' | 'assertive' = 'polite',
    delay: number = 100
  ) => {
    // Clear previous message first
    setMessage('');
    setPoliteness(priority);
    
    // Set new message after brief delay to ensure screen reader picks it up
    setTimeout(() => {
      setMessage(text);
    }, delay);

    // Clear message after it's been announced
    setTimeout(() => {
      setMessage('');
    }, delay + 3000);
  }, []);

  // Create live region element
  useEffect(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'aria-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    liveRegionRef.current.setAttribute('aria-live', politeness);
    liveRegionRef.current.textContent = message;

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, [message, politeness]);

  return { announce };
}

/**
 * Hook for keyboard navigation support
 * Handles arrow key navigation for lists and grids
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    columns?: number; // For grid orientation
    loop?: boolean;   // Whether to loop from end to beginning
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', columns = 1, loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const moveFocus = useCallback((newIndex: number) => {
    if (newIndex < 0) {
      setFocusedIndex(loop ? itemCount - 1 : 0);
    } else if (newIndex >= itemCount) {
      setFocusedIndex(loop ? 0 : itemCount - 1);
    } else {
      setFocusedIndex(newIndex);
    }
  }, [itemCount, loop]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(focusedIndex + 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex + columns);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(focusedIndex - 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex - columns);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal') {
          moveFocus(focusedIndex + 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex + 1);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal') {
          moveFocus(focusedIndex - 1);
        } else if (orientation === 'grid') {
          moveFocus(focusedIndex - 1);
        }
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(focusedIndex);
        break;
    }
  }, [focusedIndex, moveFocus, orientation, columns, onSelect, itemCount]);

  // Focus the currently selected item
  useEffect(() => {
    const currentItem = itemRefs.current[focusedIndex];
    if (currentItem) {
      currentItem.focus();
    }
  }, [focusedIndex]);

  const getItemProps = useCallback((index: number) => ({
    ref: (element: HTMLElement | null) => {
      itemRefs.current[index] = element;
    },
    tabIndex: index === focusedIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
    'aria-selected': index === focusedIndex,
  }), [focusedIndex, handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
    handleKeyDown
  };
}

/**
 * Hook for skip links (accessibility navigation)
 * Provides skip to main content functionality
 */
export function useSkipLinks() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showSkipLink = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideSkipLink = useCallback(() => {
    setIsVisible(false);
  }, []);

  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content') || 
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]');
    
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      hideSkipLink();
    }
  }, [hideSkipLink]);

  return {
    skipLinkRef,
    isVisible,
    showSkipLink,
    hideSkipLink,
    skipToMain
  };
}

/**
 * Hook for color contrast validation
 * Validates if color combinations meet WCAG AAA standards
 */
export function useColorContrast() {
  const validateContrast = useCallback((
    foregroundColor: string,
    backgroundColor: string,
    level: 'AA' | 'AAA' = 'AAA'
  ): { ratio: number; passes: boolean; rating: string } => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const foregroundRgb = hexToRgb(foregroundColor);
    const backgroundRgb = hexToRgb(backgroundColor);

    if (!foregroundRgb || !backgroundRgb) {
      return { ratio: 0, passes: false, rating: 'Invalid colors' };
    }

    const l1 = getLuminance(foregroundRgb);
    const l2 = getLuminance(backgroundRgb);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    // WCAG requirements
    const aaLarge = 3;    // AA Large text
    const aa = 4.5;       // AA Normal text
    const aaaLarge = 4.5; // AAA Large text
    const aaa = 7;        // AAA Normal text

    let passes = false;
    let rating = '';

    if (level === 'AAA') {
      passes = ratio >= aaa;
      if (ratio >= aaa) rating = 'AAA';
      else if (ratio >= aaaLarge) rating = 'AAA Large';
      else if (ratio >= aa) rating = 'AA';
      else if (ratio >= aaLarge) rating = 'AA Large';
      else rating = 'Fail';
    } else {
      passes = ratio >= aa;
      if (ratio >= aaa) rating = 'AAA';
      else if (ratio >= aaaLarge) rating = 'AAA Large';
      else if (ratio >= aa) rating = 'AA';
      else if (ratio >= aaLarge) rating = 'AA Large';
      else rating = 'Fail';
    }

    return { ratio: Math.round(ratio * 100) / 100, passes, rating };
  }, []);

  return { validateContrast };
}

/**
 * Hook for Norwegian language accessibility features
 * Specialized accessibility for Norwegian content
 */
export function useNorwegianA11y() {
  const [locale, setLocale] = useState<'nb-NO' | 'nn-NO' | 'en-US'>('nb-NO');

  const announceInNorwegian = useCallback((
    text: string,
    _priority: 'polite' | 'assertive' = 'polite'
  ) => {
    // Norwegian-specific announcements
    const norwegianText = locale === 'nb-NO' 
      ? text 
      : text; // Add translation logic here if needed

    const utterance = new SpeechSynthesisUtterance(norwegianText);
    utterance.lang = locale;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    speechSynthesis.speak(utterance);
  }, [locale]);

  const getAriaLabel = useCallback((
    englishText: string,
    norwegianText?: string
  ): string => {
    if (locale.startsWith('nb') && norwegianText) {
      return norwegianText;
    }
    return englishText;
  }, [locale]);

  return {
    locale,
    setLocale,
    announceInNorwegian,
    getAriaLabel
  };
}

/**
 * Hook for detecting screen reader usage
 * Detects if user is using a screen reader
 */
export function useScreenReader() {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Check for screen reader indicators
    const checkScreenReader = () => {
      // Check for common screen reader user agents or browser features
      const userAgent = navigator.userAgent.toLowerCase();
      const hasScreenReader = 
        userAgent.includes('nvda') ||
        userAgent.includes('jaws') ||
        userAgent.includes('voiceover') ||
        userAgent.includes('talkback') ||
        Boolean(window.speechSynthesis) ||
        document.documentElement.getAttribute('data-whatinput') === 'keyboard';

      setIsScreenReader(hasScreenReader);
    };

    checkScreenReader();

    // Listen for keyboard navigation (often indicates screen reader use)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
        setIsScreenReader(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { once: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isScreenReader;
}

/**
 * Hook for managing reduced motion preferences
 * Respects user's motion preferences and provides alternatives
 */
export function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const getAnimationClass = useCallback((
    animatedClass: string,
    staticClass?: string
  ): string => {
    return prefersReducedMotion 
      ? staticClass || 'transition-none' 
      : animatedClass;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getAnimationClass
  };
}