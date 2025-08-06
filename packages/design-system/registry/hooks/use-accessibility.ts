/**
 * useAccessibility Hook - WCAG AAA Compliance Utilities
 * Norwegian accessibility standards and requirements
 * Comprehensive accessibility testing and management
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface AccessibilityConfig {
  /** Enable live region announcements */
  readonly announcements?: boolean;
  /** Language for screen reader announcements */
  readonly language?: 'nb-NO' | 'nn-NO' | 'en-US';
  /** Enable focus trap management */
  readonly focusTrap?: boolean;
  /** Enable skip links */
  readonly skipLinks?: boolean;
}

export interface AccessibilityState {
  /** User prefers reduced motion */
  readonly prefersReducedMotion: boolean;
  /** User prefers high contrast */
  readonly prefersHighContrast: boolean;
  /** User prefers reduced transparency */
  readonly prefersReducedTransparency: boolean;
  /** Keyboard navigation is active */
  readonly keyboardNavigation: boolean;
  /** Screen reader is detected */
  readonly screenReaderActive: boolean;
  /** Current color scheme preference */
  readonly colorScheme: 'light' | 'dark' | 'no-preference';
  /** Current language */
  readonly language: string;
}

export interface AccessibilityHelpers {
  /** Announce message to screen readers */
  readonly announce: (message: string, priority?: 'polite' | 'assertive') => void;
  /** Set page title with proper formatting */
  readonly setTitle: (title: string, includeAppName?: boolean) => void;
  /** Trap focus within an element */
  readonly trapFocus: (element: HTMLElement) => () => void;
  /** Create skip link */
  readonly createSkipLink: (target: string, label?: string) => void;
  /** Check color contrast ratio */
  readonly checkContrast: (foreground: string, background: string) => number;
  /** Format number for Norwegian locale */
  readonly formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  /** Format date for Norwegian locale */
  readonly formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  /** Get ARIA label in Norwegian */
  readonly getAriaLabel: (key: string, params?: Record<string, string>) => string;
}

// Norwegian ARIA labels
const norwegianAriaLabels: Record<string, string> = {
  'close': 'Lukk',
  'open': 'Åpne',
  'menu': 'Meny',
  'navigation': 'Navigasjon',
  'search': 'Søk',
  'loading': 'Laster',
  'error': 'Feil',
  'success': 'Suksess',
  'warning': 'Advarsel',
  'info': 'Informasjon',
  'previous': 'Forrige',
  'next': 'Neste',
  'first': 'Første',
  'last': 'Siste',
  'page': 'Side',
  'of': 'av',
  'items': 'elementer',
  'selected': 'valgt',
  'expanded': 'utvidet',
  'collapsed': 'kollapset',
  'sort-ascending': 'Sorter stigende',
  'sort-descending': 'Sorter synkende',
  'filter': 'Filter',
  'clear': 'Tøm',
  'apply': 'Bruk',
  'cancel': 'Avbryt',
  'save': 'Lagre',
  'delete': 'Slett',
  'edit': 'Rediger',
  'view': 'Vis',
  'more': 'Mer',
  'less': 'Mindre',
  'show-all': 'Vis alle',
  'hide': 'Skjul',
  'required': 'påkrevd',
  'optional': 'valgfritt'
};

export const useAccessibility = (config: AccessibilityConfig = {}): [AccessibilityState, AccessibilityHelpers] => {
  const {
    announcements = true,
    language = 'nb-NO',
    focusTrap = false,
    skipLinks = true
  } = config;

  // State
  const [state, setState] = useState<AccessibilityState>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersReducedTransparency: false,
    keyboardNavigation: false,
    screenReaderActive: false,
    colorScheme: 'no-preference',
    language
  });

  // Refs
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const focusTrapCleanupRef = useRef<(() => void) | null>(null);

  // Initialize accessibility features
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check media queries
    const updateMediaQueries = () => {
      setState(prev => ({
        ...prev,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 
                     window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 
                     'no-preference'
      }));
    };

    updateMediaQueries();

    // Media query listeners
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-transparency: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)')
    ];

    queries.forEach(query => query.addEventListener('change', updateMediaQueries));

    // Keyboard navigation detection
    let lastInteraction: 'mouse' | 'keyboard' = 'mouse';
    
    const handleMouseDown = () => {
      lastInteraction = 'mouse';
      setState(prev => ({ ...prev, keyboardNavigation: false }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        lastInteraction = 'keyboard';
        setState(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    // Create announcer element
    if (announcements && !announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      queries.forEach(query => query.removeEventListener('change', updateMediaQueries));
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, [announcements]);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;
    
    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  // Set document title
  const setTitle = useCallback((title: string, includeAppName = true) => {
    const appName = 'Xaheen';
    document.title = includeAppName ? `${title} - ${appName}` : title;
  }, []);

  // Focus trap implementation
  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Create skip link
  const createSkipLink = useCallback((target: string, label = 'Hopp til hovedinnhold') => {
    const link = document.createElement('a');
    link.href = `#${target}`;
    link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg';
    link.textContent = label;
    
    document.body.insertBefore(link, document.body.firstChild);
  }, []);

  // Check color contrast ratio (WCAG formula)
  const checkContrast = useCallback((foreground: string, background: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g);
      if (!rgb || rgb.length < 3) return 0;
      
      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  // Norwegian number formatting
  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(language, options).format(num);
  }, [language]);

  // Norwegian date formatting
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(language, options).format(date);
  }, [language]);

  // Get ARIA label with parameter substitution
  const getAriaLabel = useCallback((key: string, params?: Record<string, string>): string => {
    let label = norwegianAriaLabels[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        label = label.replace(`{${param}}`, value);
      });
    }
    
    return label;
  }, []);

  const helpers: AccessibilityHelpers = {
    announce,
    setTitle,
    trapFocus,
    createSkipLink,
    checkContrast,
    formatNumber,
    formatDate,
    getAriaLabel
  };

  return [state, helpers];
};

// Export types and labels
export { norwegianAriaLabels };
export type { AccessibilityState, AccessibilityHelpers };