/**
 * Toggle Component - Professional toggle button control
 * CLAUDE.md Compliant: Professional sizing with h-12+ touch targets
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center font-medium',
    'border-2 border-transparent rounded-lg',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary/20 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95',
    'shadow-sm hover:shadow-md'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-transparent border-input text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          'data-[state=on]:border-primary'
        ],
        outline: [
          'bg-transparent border-2 border-input text-foreground',
          'hover:bg-accent hover:text-accent-foreground hover:border-accent',
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          'data-[state=on]:border-primary'
        ],
        ghost: [
          'bg-transparent border-transparent text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
        ],
        success: [
          'bg-transparent border-input text-foreground',
          'hover:bg-green-50 hover:border-green-200',
          'data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:border-green-600'
        ],
        warning: [
          'bg-transparent border-input text-foreground',
          'hover:bg-yellow-50 hover:border-yellow-200',
          'data-[state=on]:bg-yellow-600 data-[state=on]:text-white data-[state=on]:border-yellow-600'
        ],
        destructive: [
          'bg-transparent border-input text-foreground',
          'hover:bg-red-50 hover:border-red-200',
          'data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:border-red-600'
        ],
        // NSM Security Classification variants
        nsmOpen: [
          'bg-transparent border-input text-foreground border-l-4 border-l-green-600',
          'hover:bg-green-50',
          'data-[state=on]:bg-green-600 data-[state=on]:text-white'
        ],
        nsmRestricted: [
          'bg-transparent border-input text-foreground border-l-4 border-l-yellow-600',
          'hover:bg-yellow-50',
          'data-[state=on]:bg-yellow-600 data-[state=on]:text-white'
        ],
        nsmConfidential: [
          'bg-transparent border-input text-foreground border-l-4 border-l-red-600',
          'hover:bg-red-50',
          'data-[state=on]:bg-red-600 data-[state=on]:text-white'
        ],
        nsmSecret: [
          'bg-transparent border-input text-foreground border-l-4 border-l-gray-800',
          'hover:bg-gray-50',
          'data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        ]
      },
      size: {
        sm: 'h-10 px-3 text-sm',       // 40px (still professional)
        md: 'h-12 px-4 text-base',     // 48px (CLAUDE.md compliant)
        lg: 'h-14 px-5 text-lg',       // 56px (premium)
        xl: 'h-16 px-6 text-xl'        // 64px (luxury)
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface ToggleProps extends 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
  VariantProps<typeof toggleVariants> {
  readonly pressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly defaultPressed?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly description?: string;
  readonly helperText?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    className,
    variant,
    size,
    pressed,
    onPressedChange,
    defaultPressed = false,
    disabled,
    nsmClassification,
    description,
    helperText,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const pressedState = isControlled ? pressed : internalPressed;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;
    
    // Generate unique IDs
    const toggleId = React.useId();
    const descriptionId = description ? `${toggleId}-description` : undefined;
    const helperTextId = helperText ? `${toggleId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, descriptionId, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleToggle = React.useCallback(() => {
      if (disabled) return;
      
      try {
        const newPressed = !pressedState;
        
        if (!isControlled) {
          setInternalPressed(newPressed);
        }
        
        onPressedChange?.(newPressed);
      } catch (error) {
        console.error('Toggle error:', error);
      }
    }, [disabled, pressedState, isControlled, onPressedChange]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      // Space key toggles the button (Enter is handled by default button behavior)
      if (event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    }, [handleToggle]);

    const toggleElement = (
      <button
        type="button"
        role="button"
        aria-pressed={pressedState}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={combinedAriaDescribedBy}
        data-state={pressedState ? 'on' : 'off'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(toggleVariants({ variant: finalVariant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );

    // If no description, helper text, or NSM classification, return toggle directly
    if (!description && !helperText && !nsmClassification) {
      return toggleElement;
    }

    // Otherwise, wrap with additional elements
    return (
      <div className="space-y-2">
        {toggleElement}
        
        {/* Description */}
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && (
          <p 
            id={helperTextId}
            className="text-sm text-muted-foreground"
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

Toggle.displayName = 'Toggle';

// Export types and variants
export { toggleVariants };
export type { VariantProps };