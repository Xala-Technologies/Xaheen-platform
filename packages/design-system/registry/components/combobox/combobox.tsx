/**
 * Combobox Component - Professional searchable select input
 * CLAUDE.md Compliant: Professional sizing with h-14+ input height
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const comboboxVariants = cva(
  [
    'relative w-full'
  ]
);

const comboboxTriggerVariants = cva(
  [
    'flex w-full items-center justify-between',
    'font-medium text-foreground placeholder:text-muted-foreground',
    'bg-background',
    'border-2 border-input',
    'transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
    'focus:border-primary',
    'cursor-pointer'
  ],
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus:ring-destructive/20 focus:border-destructive',
        success: 'border-green-600 focus:ring-green-600/20 focus:border-green-600',
        warning: 'border-yellow-600 focus:ring-yellow-600/20 focus:border-yellow-600',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600',
        nsmRestricted: 'border-l-4 border-l-yellow-600',
        nsmConfidential: 'border-l-4 border-l-red-600',
        nsmSecret: 'border-l-4 border-l-gray-800'
      },
      size: {
        md: 'h-12 px-4 py-3 text-base rounded-lg',      // 48px height (minimum)
        lg: 'h-14 px-5 py-4 text-lg rounded-lg',        // 56px height (professional)
        xl: 'h-16 px-6 py-5 text-xl rounded-xl',        // 64px height (premium)
        '2xl': 'h-18 px-8 py-6 text-2xl rounded-xl'     // 72px height (luxury)
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg'
    }
  }
);

const comboboxSearchVariants = cva(
  [
    'w-full bg-transparent border-none outline-none',
    'text-foreground placeholder:text-muted-foreground'
  ],
  {
    variants: {
      size: {
        md: 'text-base',
        lg: 'text-lg', 
        xl: 'text-xl',
        '2xl': 'text-2xl'
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  }
);

const comboboxContentVariants = cva(
  [
    'absolute z-50 w-full mt-1 bg-background border-2 border-input rounded-lg shadow-lg',
    'max-h-60 overflow-auto',
    'data-[state=closed]:opacity-0 data-[state=closed]:pointer-events-none',
    'data-[state=open]:opacity-100',
    'transition-opacity duration-200',
    'py-1'
  ]
);

const comboboxItemVariants = cva(
  [
    'relative flex w-full cursor-pointer items-center',
    'text-foreground font-medium',
    'hover:bg-accent hover:text-accent-foreground',
    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
    'aria-selected:bg-primary aria-selected:text-primary-foreground',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-colors duration-150'
  ],
  {
    variants: {
      size: {
        md: 'px-4 py-2 text-base min-h-10',     // 40px minimum
        lg: 'px-5 py-3 text-lg min-h-12',      // 48px minimum  
        xl: 'px-6 py-4 text-xl min-h-14',      // 56px minimum
        '2xl': 'px-8 py-5 text-2xl min-h-16'   // 64px minimum
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  }
);

export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly description?: string;
}

export interface ComboboxProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
  VariantProps<typeof comboboxVariants> {
  readonly options: readonly ComboboxOption[];
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly form?: string;
  readonly error?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  readonly helperText?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly variant?: 'default' | 'error' | 'success' | 'warning';
  readonly size?: 'md' | 'lg' | 'xl' | '2xl';
  readonly emptyMessage?: string;
  readonly searchable?: boolean;
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({
    className,
    options = [],
    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search options...',
    disabled = false,
    required = false,
    name,
    form,
    error,
    success,
    warning,
    helperText,
    nsmClassification,
    variant,
    size = 'lg',
    emptyMessage = 'No options found',
    searchable = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);
    
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    // Determine variant based on state
    const stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : stateVariant;
    
    // Generate unique IDs
    const comboboxId = React.useId();
    const helperTextId = helperText ? `${comboboxId}-helper` : undefined;
    const listboxId = `${comboboxId}-listbox`;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchValue.trim()) {
        return options;
      }
      
      return options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.value.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [options, searchValue, searchable]);

    // Get current option
    const selectedOption = options.find(option => option.value === currentValue);

    // Handle value change
    const handleValueChange = React.useCallback((newValue: string) => {
      if (disabled) return;
      
      try {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        
        onValueChange?.(newValue);
        setIsOpen(false);
        setSearchValue('');
        setFocusedIndex(-1);
        
        // Return focus to trigger
        triggerRef.current?.focus();
      } catch (error) {
        console.error('Combobox value change error:', error);
      }
    }, [disabled, isControlled, onValueChange]);

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(filteredOptions.length - 1);
          } else {
            setFocusedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
          
        case 'Enter':
          event.preventDefault();
          if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleValueChange(filteredOptions[focusedIndex].value);
          } else if (!isOpen) {
            setIsOpen(true);
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchValue('');
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
          
        case 'Tab':
          setIsOpen(false);
          break;
      }
    }, [isOpen, focusedIndex, filteredOptions, handleValueChange]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchValue('');
          setFocusedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    // Focus search input when opened
    React.useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }, [isOpen, searchable]);

    const comboboxElement = (
      <div 
        className={cn(comboboxVariants(), className)}
        ref={ref}
        {...props}
      >
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={combinedAriaDescribedBy}
          aria-required={required}
          disabled={disabled}
          data-state={isOpen ? 'open' : 'closed'}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(comboboxTriggerVariants({ variant: finalVariant, size }))}
        >
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          {/* Dropdown Arrow */}
          <svg
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Content */}
        <div
          className={cn(comboboxContentVariants())}
          data-state={isOpen ? 'open' : 'closed'}
        >
          {/* Search Input */}
          {searchable && isOpen && (
            <div className="px-3 pb-2">
              <input
                ref={searchRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={cn(
                  'w-full bg-background border border-input rounded px-3 py-2',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  comboboxSearchVariants({ size })
                )}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
          
          {/* Options List */}
          <div
            role="listbox"
            id={listboxId}
            aria-label="Options"
          >
            {filteredOptions.length === 0 ? (
              <div className={cn(comboboxItemVariants({ size }), 'text-muted-foreground')}>
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={currentValue === option.value}
                  disabled={option.disabled}
                  data-focused={focusedIndex === index}
                  onClick={() => handleValueChange(option.value)}
                  className={cn(
                    comboboxItemVariants({ size }),
                    currentValue === option.value && 'bg-primary text-primary-foreground',
                    focusedIndex === index && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex-1 text-left">
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-sm opacity-70">
                        {option.description}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Indicator */}
                  {currentValue === option.value && (
                    <svg
                      className="h-4 w-4 ml-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Hidden select for form integration */}
        <select
          name={name}
          form={form}
          value={currentValue}
          required={required}
          disabled={disabled}
          onChange={() => {}} // Controlled by combobox
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );

    // If no helper text or NSM classification, return combobox directly
    if (!helperText && !nsmClassification) {
      return comboboxElement;
    }

    // Otherwise, wrap with additional elements
    return (
      <div className="space-y-2">
        {comboboxElement}
        
        {/* Helper Text */}
        {helperText && (
          <p 
            id={helperTextId}
            className={cn(
              'text-sm',
              error && 'text-destructive',
              success && 'text-green-600',
              warning && 'text-yellow-600',
              !error && !success && !warning && 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
        
        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            NSM Classification: {nsmClassification}
          </span>
        )}
      </div>
    );
  }
);

Combobox.displayName = 'Combobox';

// Export types and variants
export { comboboxVariants, comboboxTriggerVariants, comboboxContentVariants, comboboxItemVariants };
export type { VariantProps, ComboboxOption };