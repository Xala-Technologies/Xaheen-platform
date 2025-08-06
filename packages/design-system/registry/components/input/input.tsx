/**
 * Input Component - Norwegian-optimized text input
 * CLAUDE.md Compliant: Minimum h-14 (56px) height
 * WCAG AAA: Full keyboard support and proper labeling
 * Norwegian locale support with proper formatting
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'flex w-full',
    'font-medium text-foreground placeholder:text-muted-foreground',
    'bg-background',
    'border-2 border-input',
    'transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Focus styles
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
    'focus:border-primary',
    // File input styles
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    // Autofill styles
    'autofill:bg-background',
    // High contrast mode
    'contrast-more:border-2'
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
        // Professional sizing - no small inputs
        md: 'h-12 px-4 py-3 text-base rounded-lg',      // 48px height (minimum)
        lg: 'h-14 px-5 py-4 text-lg rounded-lg',        // 56px height (professional)
        xl: 'h-16 px-6 py-5 text-xl rounded-xl',        // 64px height (premium)
        '2xl': 'h-18 px-8 py-6 text-2xl rounded-xl'     // 72px height (luxury)
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',  // Professional default
      fullWidth: true
    }
  }
);

export interface InputProps extends 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  readonly error?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  readonly helperText?: string;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly norwegianFormat?: 'phone' | 'postalCode' | 'organizationNumber' | 'nationalId';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant,
    size,
    fullWidth,
    error,
    success,
    warning,
    helperText,
    leadingIcon,
    trailingIcon,
    nsmClassification,
    norwegianFormat,
    disabled,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    // Determine variant based on state
    const stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : stateVariant;
    
    // Generate unique ID for helper text
    const helperId = React.useId();
    const helperTextId = helperText ? `${helperId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId].filter(Boolean).join(' ') || undefined;
    
    // Norwegian formatting patterns
    const formatPatterns = {
      phone: {
        pattern: '^(\\+47)?[\\s]?[2-9]\\d{7}$',
        placeholder: '+47 XXX XX XXX',
        inputMode: 'tel' as const
      },
      postalCode: {
        pattern: '^\\d{4}$',
        placeholder: '0000',
        inputMode: 'numeric' as const,
        maxLength: 4
      },
      organizationNumber: {
        pattern: '^\\d{9}$',
        placeholder: '123 456 789',
        inputMode: 'numeric' as const,
        maxLength: 9
      },
      nationalId: {
        pattern: '^\\d{11}$',
        placeholder: 'DDMMYYXXXXX',
        inputMode: 'numeric' as const,
        maxLength: 11
      }
    };
    
    const formatProps = norwegianFormat ? formatPatterns[norwegianFormat] : {};
    
    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: finalVariant, size, fullWidth }),
          leadingIcon && 'pl-12',
          trailingIcon && 'pr-12',
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={combinedAriaDescribedBy}
        {...formatProps}
        {...props}
      />
    );
    
    // If no icons or helper text, return input directly
    if (!leadingIcon && !trailingIcon && !helperText && !nsmClassification) {
      return inputElement;
    }
    
    // Otherwise, wrap with additional elements
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Leading Icon */}
        {leadingIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            {leadingIcon}
          </div>
        )}
        
        {/* Input Element */}
        {inputElement}
        
        {/* Trailing Icon */}
        {trailingIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            {trailingIcon}
          </div>
        )}
        
        {/* Helper Text */}
        {helperText && (
          <p 
            id={helperTextId}
            className={cn(
              'mt-2 text-sm',
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

Input.displayName = 'Input';

// Export types and variants
export { inputVariants };
export type { VariantProps };