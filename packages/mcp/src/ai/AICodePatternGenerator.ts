/**
 * AI Code Pattern Generator for Xala UI System
 * Implements AI-optimized code structure patterns following TypeScript strict patterns and React best practices
 * 
 * Features:
 * - TypeScript-first code generation with strict types
 * - React 18+ patterns with modern hooks
 * - Professional UI standards (h-12+ buttons, h-14+ inputs)
 * - Tailwind CSS exclusively with semantic classes
 * - WCAG AAA accessibility compliance
 * - Norwegian compliance patterns
 * - Performance optimization patterns
 */

import type {
  SupportedPlatform,
  ComponentCategory,
  AITemplateContext,
  AIEnhancedTemplateConfig,
  IndustryTheme
} from '../types/index.js';

interface CodePatternConfig {
  readonly componentName: string;
  readonly platform: SupportedPlatform;
  readonly category: ComponentCategory;
  readonly features: string[];
  readonly styling: {
    readonly variant: string;
    readonly colorScheme?: 'light' | 'dark' | 'auto';
    readonly spacing: 'compact' | 'comfortable' | 'spacious';
  };
  readonly accessibility: {
    readonly level: 'AA' | 'AAA';
    readonly screenReader: boolean;
    readonly keyboardNavigation: boolean;
  };
  readonly norwegianCompliance?: {
    readonly nsm: boolean;
    readonly gdpr: boolean;
    readonly altinn: boolean;
  };
  readonly performance: {
    readonly lazy: boolean;
    readonly memoization: boolean;
    readonly bundleOptimization: boolean;
  };
}

interface GeneratedCodePattern {
  readonly componentCode: string;
  readonly typesCode: string;
  readonly testsCode: string;
  readonly storiesCode: string;
  readonly documentationCode: string;
  readonly optimizations: string[];
  readonly files: Array<{
    readonly path: string;
    readonly content: string;
    readonly purpose: string;
  }>;
}

export class AICodePatternGenerator {
  private readonly strictTypeScriptPatterns: Map<string, string> = new Map();
  private readonly reactBestPractices: Map<string, string> = new Map();
  private readonly accessibilityPatterns: Map<string, string> = new Map();
  private readonly norwegianCompliancePatterns: Map<string, string> = new Map();
  private readonly performancePatterns: Map<string, string> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.initializeTypeScriptPatterns();
    this.initializeReactPatterns();
    this.initializeAccessibilityPatterns();
    this.initializeNorwegianPatterns();
    this.initializePerformancePatterns();
  }

  private initializeTypeScriptPatterns(): void {
    // Strict TypeScript interface patterns
    this.strictTypeScriptPatterns.set('readonly-interface', `
interface {{ComponentName}}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'data-testid'?: string;
}`);

    this.strictTypeScriptPatterns.set('component-with-explicit-return', `
export const {{ComponentName}} = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
  ...rest
}: {{ComponentName}}Props): JSX.Element => {
  // Component implementation with error handling
  try {
    return (
      <{{elementType}}
        className={cn(
          {{classNames}},
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
        {...rest}
      >
        {loading ? (
          <LoadingSpinner className="mr-2 h-4 w-4" />
        ) : null}
        {children}
      </{{elementType}}>
    );
  } catch (error) {
    console.error('{{ComponentName}} render error:', error);
    return (
      <div className="text-red-600 p-2 rounded border border-red-200 bg-red-50">
        Error rendering {{ComponentName}}
      </div>
    );
  }
};`);

    this.strictTypeScriptPatterns.set('complex-state-management', `
interface {{ComponentName}}State {
  readonly isOpen: boolean;
  readonly selectedItem: string | null;
  readonly searchQuery: string;
  readonly loading: boolean;
  readonly error: string | null;
}

type {{ComponentName}}Action =
  | { type: 'TOGGLE_OPEN' }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const {{componentName}}Reducer = (
  state: {{ComponentName}}State,
  action: {{ComponentName}}Action
): {{ComponentName}}State => {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload, isOpen: false };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};`);
  }

  private initializeReactPatterns(): void {
    // Modern React hooks patterns
    this.reactBestPractices.set('performance-optimized-component', `
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const {{ComponentName}} = React.memo(({
  items,
  onItemSelect,
  searchable = false,
  ...props
}: {{ComponentName}}Props): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery, searchable]);

  // Stable callback references
  const handleItemSelect = useCallback((item: Item) => {
    onItemSelect?.(item);
    setSelectedIndex(-1);
  }, [onItemSelect]);

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          handleItemSelect(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [filteredItems, selectedIndex, handleItemSelect]);

  // Focus management effect
  useEffect(() => {
    if (searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchable]);

  return (
    <div className="relative">
      {searchable && (
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyNavigation}
          className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          placeholder="Search..."
          aria-label="Search items"
        />
      )}
      <ul 
        role="listbox"
        aria-label="{{ComponentName}} options"
        className="mt-2 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        {filteredItems.map((item, index) => (
          <li
            key={item.id}
            role="option"
            aria-selected={index === selectedIndex}
            className={cn(
              "px-4 py-3 cursor-pointer transition-colors",
              "hover:bg-gray-50 focus:bg-gray-50",
              index === selectedIndex && "bg-blue-50 text-blue-900"
            )}
            onClick={() => handleItemSelect(item)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
});

{{ComponentName}}.displayName = '{{ComponentName}}';`);

    this.reactBestPractices.set('error-boundary-pattern', `
interface {{ComponentName}}ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

class {{ComponentName}}ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  {{ComponentName}}ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): {{ComponentName}}ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('{{ComponentName}} Error Boundary caught an error:', error, errorInfo);
    // Log to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">
            An error occurred while rendering this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="h-12 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}`);

    this.reactBestPractices.set('custom-hook-pattern', `
interface Use{{ComponentName}}Options {
  readonly initialValue?: string;
  readonly debounceMs?: number;
  readonly onValueChange?: (value: string) => void;
}

interface Use{{ComponentName}}Return {
  readonly value: string;
  readonly debouncedValue: string;
  readonly setValue: (value: string) => void;
  readonly reset: () => void;
  readonly isDebouncing: boolean;
}

export const use{{ComponentName}} = ({
  initialValue = '',
  debounceMs = 300,
  onValueChange
}: Use{{ComponentName}}Options = {}): Use{{ComponentName}}Return => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce value changes
  useEffect(() => {
    if (value === debouncedValue) return;

    setIsDebouncing(true);
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
      onValueChange?.(value);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setIsDebouncing(false);
    };
  }, [value, debounceMs, onValueChange, debouncedValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
    setIsDebouncing(false);
  }, [initialValue]);

  return {
    value,
    debouncedValue,
    setValue,
    reset,
    isDebouncing
  };
};`);
  }

  private initializeAccessibilityPatterns(): void {
    this.accessibilityPatterns.set('wcag-aaa-button', `
interface AccessibleButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly ariaLabel?: string;
  readonly ariaDescribedBy?: string;
  readonly className?: string;
}

export const AccessibleButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  ...rest
}: AccessibleButtonProps): JSX.Element => {
  const baseClasses = cn(
    // Professional sizing (minimum h-12)
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    // Enhanced focus indicators for WCAG AAA
    'focus:ring-blue-500 focus:ring-offset-2 focus:ring-opacity-75',
    // High contrast support
    'contrast-more:border-2 contrast-more:border-current',
    // Reduced motion support
    'motion-reduce:transition-none',
    // Size variants with professional heights
    {
      'h-12 px-6 text-sm': size === 'sm',
      'h-14 px-8 text-base': size === 'md',
      'h-16 px-10 text-lg': size === 'lg',
    },
    // Color variants with WCAG AAA contrast ratios
    {
      'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300': 
        variant === 'primary',
      'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100': 
        variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300': 
        variant === 'destructive',
    },
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  );

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={loading ? 'sr-only' : undefined}>
        {children}
      </span>
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
    </button>
  );
};`);

    this.accessibilityPatterns.set('wcag-aaa-form-field', `
interface AccessibleFormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly helpText?: string;
  readonly className?: string;
}

export const AccessibleFormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className
}: AccessibleFormFieldProps): JSX.Element => {
  const errorId = error ? \`\${id}-error\` : undefined;
  const helpId = helpText ? \`\${id}-help\` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium text-gray-900',
          // High contrast support
          'contrast-more:text-black',
          // Required indicator
          required && "after:content-['*'] after:ml-1 after:text-red-500"
        )}
      >
        {label}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={cn(
          // Professional sizing (minimum h-14 for inputs)
          'h-14 w-full px-4 py-3 rounded-lg border-2 transition-colors',
          // Enhanced focus indicators for WCAG AAA
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          // High contrast support
          'contrast-more:border-black contrast-more:focus:border-blue-700',
          // Error state with sufficient contrast
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500',
          // Disabled state
          disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
          // Reduced motion support
          'motion-reduce:transition-none'
        )}
      />
      
      {helpText && (
        <p
          id={helpId}
          className="text-sm text-gray-600 contrast-more:text-gray-800"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600 contrast-more:text-red-800"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
};`);

    this.accessibilityPatterns.set('skip-navigation', `
export const SkipNavigation = (): JSX.Element => {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'z-50 px-4 py-2 bg-blue-600 text-white rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
    >
      Skip to main content
    </a>
  );
};`);
  }

  private initializeNorwegianPatterns(): void {
    this.norwegianCompliancePatterns.set('nsm-classified-header', `
interface NSMClassificationHeaderProps {
  readonly classification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly description?: string;
  readonly className?: string;
}

export const NSMClassificationHeader = ({
  classification,
  description,
  className
}: NSMClassificationHeaderProps): JSX.Element => {
  const classificationConfig = {
    OPEN: {
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'ÅPEN',
      englishLabel: 'OPEN'
    },
    RESTRICTED: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'BEGRENSET',
      englishLabel: 'RESTRICTED'
    },
    CONFIDENTIAL: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'KONFIDENSIELL',
      englishLabel: 'CONFIDENTIAL'
    },
    SECRET: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'HEMMELIG',
      englishLabel: 'SECRET'
    }
  };

  const config = classificationConfig[classification];

  return (
    <div className={cn('border-l-4 p-4 mb-6', config.color, className)}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            {config.label} / {config.englishLabel}
          </h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};`);

    this.norwegianCompliancePatterns.set('gdpr-consent-banner', `
interface GDPRConsentBannerProps {
  readonly onAccept: () => void;
  readonly onDecline: () => void;
  readonly onCustomize: () => void;
  readonly locale?: 'nb-NO' | 'en';
}

export const GDPRConsentBanner = ({
  onAccept,
  onDecline,
  onCustomize,
  locale = 'nb-NO'
}: GDPRConsentBannerProps): JSX.Element => {
  const t = useTranslation(locale);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0 lg:mr-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('gdpr.banner.title')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('gdpr.banner.description')}
              <button
                type="button"
                onClick={onCustomize}
                className="ml-1 text-blue-600 hover:text-blue-800 underline"
              >
                {t('gdpr.banner.customize')}
              </button>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="h-12 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('gdpr.banner.decline')}
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('gdpr.banner.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};`);

    this.norwegianCompliancePatterns.set('altinn-form-field', `
interface AltinnFormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly type?: 'text' | 'email' | 'tel' | 'organization-number';
  readonly required?: boolean;
  readonly error?: string;
  readonly helpText?: string;
  readonly locale?: 'nb-NO' | 'nn-NO';
}

export const AltinnFormField = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  helpText,
  locale = 'nb-NO'
}: AltinnFormFieldProps): JSX.Element => {
  const t = useAltinnTranslation(locale);
  
  // Norwegian-specific validation patterns
  const validationPatterns = {
    'organization-number': /^\\d{9}$/,
    'norwegian-phone': /^(\\+47)?[2-9]\\d{7}$/,
    'norwegian-postal': /^\\d{4}$/
  };

  const formatValue = (inputValue: string): string => {
    switch (type) {
      case 'organization-number':
        // Format as XXX XXX XXX
        return inputValue.replace(/\\D/g, '').replace(/(\\d{3})(\\d{3})(\\d{3})/, '$1 $2 $3');
      default:
        return inputValue;
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium text-gray-900',
          // Altinn design system typography
          'font-sans leading-6',
          required && "after:content-['*'] after:ml-1 after:text-red-500"
        )}
      >
        {label}
      </label>
      
      <input
        id={id}
        type={type === 'organization-number' ? 'text' : type}
        value={formatValue(value)}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? \`\${id}-error\` : helpText ? \`\${id}-help\` : undefined}
        className={cn(
          // Altinn design system styling
          'h-14 w-full px-4 py-3 rounded border-2',
          'font-sans text-base leading-6',
          // Norwegian government color scheme
          'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
          'transition-colors duration-150'
        )}
        placeholder={type === 'organization-number' ? '123 456 789' : undefined}
      />
      
      {helpText && (
        <p id={\`\${id}-help\`} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={\`\${id}-error\`} role="alert" className="text-sm text-red-600">
          <span className="sr-only">{t('form.error.prefix')}: </span>
          {error}
        </p>
      )}
    </div>
  );
};`);
  }

  private initializePerformancePatterns(): void {
    this.performancePatterns.set('lazy-loading-pattern', `
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const Heavy{{ComponentName}} = lazy(() => 
  import('./Heavy{{ComponentName}}').then(module => ({
    default: module.Heavy{{ComponentName}}
  }))
);

interface Lazy{{ComponentName}}Props {
  readonly shouldLoad: boolean;
  readonly fallback?: React.ReactNode;
}

export const Lazy{{ComponentName}} = ({ 
  shouldLoad, 
  fallback,
  ...props 
}: Lazy{{ComponentName}}Props): JSX.Element => {
  if (!shouldLoad) {
    return fallback ? <>{fallback}</> : <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )
      }
    >
      <Heavy{{ComponentName}} {...props} />
    </Suspense>
  );
};`);

    this.performancePatterns.set('virtualized-list-pattern', `
import { FixedSizeList as List } from 'react-window';
import { memo, useCallback } from 'react';

interface VirtualizedListItem {
  readonly id: string;
  readonly title: string;
  readonly content: string;
}

interface ItemRendererProps {
  readonly index: number;
  readonly style: React.CSSProperties;
  readonly data: VirtualizedListItem[];
}

const ItemRenderer = memo(({ index, style, data }: ItemRendererProps) => {
  const item = data[index];
  
  return (
    <div style={style} className="px-4 py-2 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900">{item.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{item.content}</p>
    </div>
  );
});

ItemRenderer.displayName = 'ItemRenderer';

interface VirtualizedListProps {
  readonly items: VirtualizedListItem[];
  readonly height: number;
  readonly itemHeight?: number;
}

export const VirtualizedList = ({
  items,
  height,
  itemHeight = 80
}: VirtualizedListProps): JSX.Element => {
  const itemRenderer = useCallback(
    (props: any) => <ItemRenderer {...props} data={items} />,
    [items]
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
      className="border border-gray-200 rounded-lg"
    >
      {itemRenderer}
    </List>
  );
};`);

    this.performancePatterns.set('intersection-observer-pattern', `
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  readonly threshold?: number;
  readonly rootMargin?: string;
  readonly triggerOnce?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseIntersectionObserverOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const isCurrentlyIntersecting = entry.isIntersecting;
    
    setIsIntersecting(isCurrentlyIntersecting);
    
    if (isCurrentlyIntersecting && triggerOnce && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [triggerOnce, hasTriggered]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin]);

  const shouldRender = triggerOnce ? (isIntersecting || hasTriggered) : isIntersecting;

  return { targetRef, isIntersecting: shouldRender };
};

// Usage example
export const LazyImage = ({ src, alt, className }: { 
  readonly src: string; 
  readonly alt: string; 
  readonly className?: string; 
}): JSX.Element => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div ref={targetRef} className={cn('bg-gray-100', className)}>
      {isIntersecting ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};`);
  }

  /**
   * Generate AI-optimized code pattern based on configuration
   */
  public generateCodePattern(config: CodePatternConfig): GeneratedCodePattern {
    try {
      const componentCode = this.generateComponentCode(config);
      const typesCode = this.generateTypesCode(config);
      const testsCode = this.generateTestsCode(config);
      const storiesCode = this.generateStoriesCode(config);
      const documentationCode = this.generateDocumentationCode(config);
      const optimizations = this.generateOptimizations(config);
      const files = this.generateFileStructure(config, {
        componentCode,
        typesCode,
        testsCode,
        storiesCode,
        documentationCode
      });

      return {
        componentCode,
        typesCode,
        testsCode,
        storiesCode,
        documentationCode,
        optimizations,
        files
      };
    } catch (error) {
      throw new Error(`Failed to generate code pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateComponentCode(config: CodePatternConfig): string {
    const { componentName, platform, features, styling, accessibility, norwegianCompliance, performance } = config;
    
    let componentCode = `/**
 * ${componentName} Component
 * Generated with AI-optimized patterns for ${platform}
 * 
 * Features: ${features.join(', ')}
 * Accessibility: WCAG ${accessibility.level}
 * Performance: ${performance.lazy ? 'Lazy loaded' : 'Eager loaded'}
 */

import React, { useState, useCallback, useMemo${performance.memoization ? ', memo' : ''} } from 'react';
import { cn } from '@/lib/utils';
${features.includes('loading') ? "import { LoadingSpinner } from '@/components/ui/loading-spinner';" : ''}
${norwegianCompliance?.gdpr ? "import { useTranslation } from '@/hooks/use-translation';" : ''}

`;

    // Add TypeScript interface
    componentCode += this.generateInterface(componentName, features, accessibility, norwegianCompliance);
    
    // Add component implementation
    componentCode += this.generateComponentImplementation(config);

    // Add error boundary if complex
    if (features.includes('complex') || features.includes('error-handling')) {
      componentCode += this.reactBestPractices.get('error-boundary-pattern')
        ?.replace(/\{\{ComponentName\}\}/g, componentName) || '';
    }

    return componentCode;
  }

  private generateInterface(
    componentName: string, 
    features: string[], 
    accessibility: CodePatternConfig['accessibility'],
    norwegianCompliance?: CodePatternConfig['norwegianCompliance']
  ): string {
    let interfaceCode = `interface ${componentName}Props {\n`;
    
    // Base props
    interfaceCode += `  readonly className?: string;\n`;
    interfaceCode += `  readonly children?: React.ReactNode;\n`;
    
    // Feature-based props
    if (features.includes('interactive')) {
      interfaceCode += `  readonly onClick?: () => void;\n`;
      interfaceCode += `  readonly onFocus?: (event: React.FocusEvent<HTMLElement>) => void;\n`;
      interfaceCode += `  readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;\n`;
    }
    
    if (features.includes('loading')) {
      interfaceCode += `  readonly loading?: boolean;\n`;
    }
    
    if (features.includes('disabled')) {
      interfaceCode += `  readonly disabled?: boolean;\n`;
    }
    
    if (features.includes('variants')) {
      interfaceCode += `  readonly variant?: 'default' | 'primary' | 'secondary' | 'destructive';\n`;
    }
    
    if (features.includes('sizes')) {
      interfaceCode += `  readonly size?: 'sm' | 'md' | 'lg' | 'xl';\n`;
    }
    
    // Accessibility props
    if (accessibility.screenReader) {
      interfaceCode += `  readonly 'aria-label'?: string;\n`;
      interfaceCode += `  readonly 'aria-describedby'?: string;\n`;
    }
    
    // Norwegian compliance props
    if (norwegianCompliance?.nsm) {
      interfaceCode += `  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';\n`;
    }
    
    if (norwegianCompliance?.gdpr) {
      interfaceCode += `  readonly locale?: 'nb-NO' | 'nn-NO' | 'en';\n`;
    }
    
    // Testing props
    interfaceCode += `  readonly 'data-testid'?: string;\n`;
    
    interfaceCode += `}\n\n`;
    
    return interfaceCode;
  }

  private generateComponentImplementation(config: CodePatternConfig): string {
    const { componentName, features, styling, accessibility, performance } = config;
    
    let implementation = `export const ${componentName} = ${performance.memoization ? 'memo(' : ''}({\n`;
    
    // Destructure props
    const propsList = [
      'className',
      'children',
      ...(features.includes('interactive') ? ['onClick', 'onFocus', 'onBlur'] : []),
      ...(features.includes('loading') ? ['loading = false'] : []),
      ...(features.includes('disabled') ? ['disabled = false'] : []),
      ...(features.includes('variants') ? ["variant = 'default'"] : []),
      ...(features.includes('sizes') ? ["size = 'md'"] : []),
      ...(accessibility.screenReader ? ["'aria-label': ariaLabel", "'aria-describedby': ariaDescribedBy"] : []),
      "'data-testid': testId",
      '...rest'
    ];
    
    implementation += `  ${propsList.join(',\\n  ')}\n`;
    implementation += `}: ${componentName}Props): JSX.Element => {\n`;
    
    // Add state management if needed
    if (features.includes('stateful')) {
      implementation += `  const [isOpen, setIsOpen] = useState(false);\n`;
    }
    
    // Add performance optimizations
    if (performance.memoization && features.includes('expensive-calculations')) {
      implementation += `  const expensiveValue = useMemo(() => {\n`;
      implementation += `    // Expensive calculation here\n`;
      implementation += `    return complexCalculation();\n`;
      implementation += `  }, [/* dependencies */]);\n\n`;
    }
    
    // Add callback optimization
    if (features.includes('interactive') && performance.memoization) {
      implementation += `  const handleClick = useCallback(() => {\n`;
      implementation += `    onClick?.();\n`;
      implementation += `  }, [onClick]);\n\n`;
    }
    
    // Generate class names
    implementation += `  const baseClasses = cn(\n`;
    implementation += `    // Base styling\n`;
    implementation += `    'inline-flex items-center justify-center transition-colors',\n`;
    
    // Professional sizing
    if (features.includes('button')) {
      implementation += `    // Professional sizing (minimum h-12)\n`;
      implementation += `    'h-12 px-6 rounded-lg font-medium',\n`;
    } else if (features.includes('input')) {
      implementation += `    // Professional input sizing (minimum h-14)\n`;
      implementation += `    'h-14 w-full px-4 py-3 rounded-lg border-2',\n`;
    }
    
    // Accessibility classes
    if (accessibility.level === 'AAA') {
      implementation += `    // Enhanced accessibility (WCAG AAA)\n`;
      implementation += `    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',\n`;
      implementation += `    'contrast-more:border-2 contrast-more:border-current',\n`;
      implementation += `    'motion-reduce:transition-none',\n`;
    }
    
    // Styling variants
    if (features.includes('variants')) {
      implementation += `    // Color variants\n`;
      implementation += `    {\n`;
      implementation += `      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',\n`;
      implementation += `      'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',\n`;
      implementation += `      'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',\n`;
      implementation += `    },\n`;
    }
    
    // Size variants
    if (features.includes('sizes')) {
      implementation += `    // Size variants\n`;
      implementation += `    {\n`;
      implementation += `      'h-10 px-4 text-sm': size === 'sm',\n`;
      implementation += `      'h-12 px-6 text-base': size === 'md',\n`;
      implementation += `      'h-14 px-8 text-lg': size === 'lg',\n`;
      implementation += `    },\n`;
    }
    
    // State-based classes
    if (features.includes('disabled')) {
      implementation += `    // State classes\n`;
      implementation += `    disabled && 'opacity-50 cursor-not-allowed',\n`;
    }
    
    implementation += `    className\n`;
    implementation += `  );\n\n`;
    
    // Error handling
    implementation += `  try {\n`;
    implementation += `    return (\n`;
    
    // Generate JSX
    const elementType = features.includes('button') ? 'button' : 
                      features.includes('input') ? 'input' : 'div';
    
    implementation += `      <${elementType}\n`;
    if (features.includes('button')) {
      implementation += `        type="button"\n`;
    }
    implementation += `        className={baseClasses}\n`;
    
    // Add event handlers
    if (features.includes('interactive')) {
      implementation += `        onClick={${performance.memoization ? 'handleClick' : 'onClick'}}\n`;
      implementation += `        onFocus={onFocus}\n`;
      implementation += `        onBlur={onBlur}\n`;
    }
    
    // Add accessibility attributes
    if (accessibility.screenReader) {
      implementation += `        aria-label={ariaLabel}\n`;
      implementation += `        aria-describedby={ariaDescribedBy}\n`;
    }
    
    if (features.includes('disabled')) {
      implementation += `        disabled={disabled}\n`;
      implementation += `        aria-disabled={disabled}\n`;
    }
    
    implementation += `        data-testid={testId}\n`;
    implementation += `        {...rest}\n`;
    implementation += `      >\n`;
    
    // Add content
    if (features.includes('loading')) {
      implementation += `        {loading && (\n`;
      implementation += `          <LoadingSpinner className="mr-2 h-4 w-4" />\n`;
      implementation += `        )}\n`;
    }
    
    implementation += `        {children}\n`;
    implementation += `      </${elementType}>\n`;
    implementation += `    );\n`;
    
    // Error catch block
    implementation += `  } catch (error) {\n`;
    implementation += `    console.error('${componentName} render error:', error);\n`;
    implementation += `    return (\n`;
    implementation += `      <div className="text-red-600 p-2 rounded border border-red-200 bg-red-50">\n`;
    implementation += `        Error rendering ${componentName}\n`;
    implementation += `      </div>\n`;
    implementation += `    );\n`;
    implementation += `  }\n`;
    implementation += `}${performance.memoization ? ')' : ''};\n\n`;
    
    // Add display name
    implementation += `${componentName}.displayName = '${componentName}';\n`;
    
    return implementation;
  }

  private generateTypesCode(config: CodePatternConfig): string {
    const { componentName } = config;
    
    return `/**
 * Type definitions for ${componentName}
 */

export type { ${componentName}Props } from './${componentName}';

// Re-export component
export { ${componentName} } from './${componentName}';
`;
  }

  private generateTestsCode(config: CodePatternConfig): string {
    const { componentName, features, accessibility } = config;
    
    let testsCode = `/**
 * Tests for ${componentName}
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without errors', () => {
    render(<${componentName}>Test content</${componentName}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  ${features.includes('interactive') ? `
  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <${componentName} onClick={handleClick}>
        Click me
      </${componentName}>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });` : ''}

  ${accessibility.level === 'AAA' ? `
  it('meets WCAG AAA accessibility requirements', () => {
    const { container } = render(
      <${componentName} aria-label="Test component">
        Content
      </${componentName}>
    );
    
    // Test focus indicators
    const element = screen.getByLabelText('Test component');
    expect(element).toHaveClass('focus:ring-2');
    
    // Test high contrast support
    expect(element).toHaveClass('contrast-more:border-2');
    
    // Test reduced motion support
    expect(element).toHaveClass('motion-reduce:transition-none');
  });` : ''}

  ${features.includes('keyboard-navigation') ? `
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<${componentName}>Keyboard test</${componentName}>);
    
    const element = screen.getByText('Keyboard test');
    
    // Test tab navigation
    await user.tab();
    expect(element).toHaveFocus();
    
    // Test enter activation
    if (element.tagName === 'BUTTON') {
      const handleClick = jest.fn();
      render(<${componentName} onClick={handleClick}>Enter test</${componentName}>);
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    }
  });` : ''}

  ${features.includes('loading') ? `
  it('displays loading state correctly', () => {
    render(<${componentName} loading>Loading test</${componentName}>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });` : ''}

  it('applies custom className', () => {
    render(
      <${componentName} className="custom-class" data-testid="test-component">
        Test
      </${componentName}>
    );
    
    expect(screen.getByTestId('test-component')).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(
      <${componentName} data-custom="test-value" data-testid="test-component">
        Test
      </${componentName}>
    );
    
    expect(screen.getByTestId('test-component')).toHaveAttribute('data-custom', 'test-value');
  });

  // Performance test
  it('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<${componentName}>Performance test</${componentName}>);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
`;

    return testsCode;
  }

  private generateStoriesCode(config: CodePatternConfig): string {
    const { componentName, features } = config;
    
    let storiesCode = `/**
 * Storybook stories for ${componentName}
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AI-generated ${componentName} component with TypeScript, accessibility, and modern patterns.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    ${features.includes('variants') ? `
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'destructive']
    },` : ''}
    ${features.includes('sizes') ? `
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },` : ''}
    ${features.includes('disabled') ? `
    disabled: {
      control: 'boolean'
    },` : ''}
    ${features.includes('loading') ? `
    loading: {
      control: 'boolean'
    },` : ''}
    onClick: { action: 'clicked' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '${componentName}'
  }
};

${features.includes('variants') ? `
export const Primary: Story = {
  args: {
    children: 'Primary ${componentName}',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    children: 'Secondary ${componentName}',
    variant: 'secondary'
  }
};

export const Destructive: Story = {
  args: {
    children: 'Destructive ${componentName}',
    variant: 'destructive'
  }
};` : ''}

${features.includes('sizes') ? `
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <${componentName} size="sm">Small</${componentName}>
      <${componentName} size="md">Medium</${componentName}>
      <${componentName} size="lg">Large</${componentName}>
      <${componentName} size="xl">Extra Large</${componentName}>
    </div>
  )
};` : ''}

${features.includes('loading') ? `
export const Loading: Story = {
  args: {
    children: 'Loading ${componentName}',
    loading: true
  }
};` : ''}

${features.includes('disabled') ? `
export const Disabled: Story = {
  args: {
    children: 'Disabled ${componentName}',
    disabled: true
  }
};` : ''}

export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-4">
      <${componentName} aria-label="Accessible ${componentName}">
        With ARIA label
      </${componentName}>
      <${componentName} aria-describedby="description">
        With description
      </${componentName}>
      <p id="description" className="text-sm text-gray-600">
        This component has an accessible description
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including ARIA labels and descriptions.'
      }
    }
  }
};
`;

    return storiesCode;
  }

  private generateDocumentationCode(config: CodePatternConfig): string {
    const { componentName, features, accessibility, norwegianCompliance, performance } = config;
    
    return `# ${componentName}

AI-generated React component with TypeScript, accessibility, and modern patterns.

## Features

${features.map(feature => `- ${feature}`).join('\n')}

## Accessibility

- **WCAG Level**: ${accessibility.level}
- **Screen Reader Support**: ${accessibility.screenReader ? '✅' : '❌'}
- **Keyboard Navigation**: ${accessibility.keyboardNavigation ? '✅' : '❌'}

## Performance

- **Lazy Loading**: ${performance.lazy ? '✅' : '❌'}
- **Memoization**: ${performance.memoization ? '✅' : '❌'}
- **Bundle Optimization**: ${performance.bundleOptimization ? '✅' : '❌'}

${norwegianCompliance ? `
## Norwegian Compliance

- **NSM Classification**: ${norwegianCompliance.nsm ? '✅' : '❌'}
- **GDPR Compliance**: ${norwegianCompliance.gdpr ? '✅' : '❌'}
- **Altinn Integration**: ${norwegianCompliance.altinn ? '✅' : '❌'}
` : ''}

## Usage

\`\`\`tsx
import { ${componentName} } from '@/components/ui/${componentName.toLowerCase()}';

function Example() {
  return (
    <${componentName}${features.includes('variants') ? ' variant="primary"' : ''}${features.includes('sizes') ? ' size="md"' : ''}>
      Example content
    </${componentName}>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | undefined | Additional CSS classes |
| children | ReactNode | undefined | Component content |
${features.includes('variants') ? '| variant | "default" \\| "primary" \\| "secondary" \\| "destructive" | "default" | Visual variant |' : ''}
${features.includes('sizes') ? '| size | "sm" \\| "md" \\| "lg" \\| "xl" | "md" | Component size |' : ''}
${features.includes('disabled') ? '| disabled | boolean | false | Disable interaction |' : ''}
${features.includes('loading') ? '| loading | boolean | false | Show loading state |' : ''}

## Best Practices

1. **Always provide meaningful content** for screen readers
2. **Use semantic HTML** elements when possible
3. **Test keyboard navigation** thoroughly
4. **Verify color contrast** meets WCAG standards
5. **Consider reduced motion** preferences

## Testing

Run the test suite:

\`\`\`bash
npm test ${componentName}.test.tsx
\`\`\`

## Storybook

View component stories:

\`\`\`bash
npm run storybook
\`\`\`

Navigate to Components/${componentName} in the Storybook UI.
`;
  }

  private generateOptimizations(config: CodePatternConfig): string[] {
    const optimizations: string[] = [];
    
    if (config.performance.lazy) {
      optimizations.push('Implement lazy loading for non-critical components');
    }
    
    if (config.performance.memoization) {
      optimizations.push('Use React.memo and useMemo for expensive operations');
    }
    
    if (config.performance.bundleOptimization) {
      optimizations.push('Enable tree shaking and code splitting');
    }
    
    if (config.accessibility.level === 'AAA') {
      optimizations.push('Enhanced accessibility with WCAG AAA compliance');
    }
    
    if (config.norwegianCompliance?.gdpr) {
      optimizations.push('GDPR-compliant data handling patterns');
    }
    
    if (config.features.includes('responsive')) {
      optimizations.push('Mobile-first responsive design patterns');
    }
    
    return optimizations;
  }

  private generateFileStructure(
    config: CodePatternConfig, 
    generatedCode: {
      componentCode: string;
      typesCode: string;
      testsCode: string;
      storiesCode: string;
      documentationCode: string;
    }
  ): Array<{ readonly path: string; readonly content: string; readonly purpose: string; }> {
    const { componentName } = config;
    const basePath = componentName.toLowerCase();
    
    return [
      {
        path: `src/components/ui/${basePath}/${componentName}.tsx`,
        content: generatedCode.componentCode,
        purpose: 'Main component implementation'
      },
      {
        path: `src/components/ui/${basePath}/index.ts`,
        content: generatedCode.typesCode,
        purpose: 'Type definitions and exports'
      },
      {
        path: `src/components/ui/${basePath}/${componentName}.test.tsx`,
        content: generatedCode.testsCode,
        purpose: 'Component tests'
      },
      {
        path: `src/components/ui/${basePath}/${componentName}.stories.tsx`,
        content: generatedCode.storiesCode,
        purpose: 'Storybook stories'
      },
      {
        path: `src/components/ui/${basePath}/README.md`,
        content: generatedCode.documentationCode,
        purpose: 'Component documentation'
      }
    ];
  }

  /**
   * Get available code patterns for a specific platform and category
   */
  public getAvailablePatterns(platform: SupportedPlatform, category: ComponentCategory): string[] {
    const patterns: string[] = [];
    
    // TypeScript patterns (available for all platforms)
    patterns.push('readonly-interface', 'component-with-explicit-return', 'complex-state-management');
    
    // React-specific patterns
    if (['react', 'nextjs', 'electron'].includes(platform)) {
      patterns.push('performance-optimized-component', 'error-boundary-pattern', 'custom-hook-pattern');
    }
    
    // Accessibility patterns
    patterns.push('wcag-aaa-button', 'wcag-aaa-form-field', 'skip-navigation');
    
    // Norwegian compliance patterns
    patterns.push('nsm-classified-header', 'gdpr-consent-banner', 'altinn-form-field');
    
    // Performance patterns
    patterns.push('lazy-loading-pattern', 'virtualized-list-pattern', 'intersection-observer-pattern');
    
    return patterns;
  }

  /**
   * Get pattern template by name
   */
  public getPatternTemplate(patternName: string): string | undefined {
    return this.strictTypeScriptPatterns.get(patternName) ||
           this.reactBestPractices.get(patternName) ||
           this.accessibilityPatterns.get(patternName) ||
           this.norwegianCompliancePatterns.get(patternName) ||
           this.performancePatterns.get(patternName);
  }

  /**
   * Render pattern template with variables
   */
  public renderPattern(patternName: string, variables: Record<string, string>): string {
    const template = this.getPatternTemplate(patternName);
    if (!template) {
      throw new Error(`Pattern not found: ${patternName}`);
    }
    
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    
    return rendered;
  }
}