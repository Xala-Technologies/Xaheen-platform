/**
 * React Platform Input Component
 * Norwegian-optimized text input with full accessibility support
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
      },
      size: {
        md: 'h-12 px-4 py-3 text-base rounded-lg',
        lg: 'h-14 px-5 py-4 text-lg rounded-lg',
        xl: 'h-16 px-6 py-5 text-xl rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
      fullWidth: true
    }
  }
);

export interface ReactInputProps extends 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  readonly error?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  readonly helperText?: string;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, ReactInputProps>(
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
    disabled,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    const helperId = React.useId();
    const helperTextId = helperText ? `${helperId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId].filter(Boolean).join(' ') || undefined;
    
    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: stateVariant, size, fullWidth }),
          leadingIcon && 'pl-12',
          trailingIcon && 'pr-12',
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={combinedAriaDescribedBy}
        {...props}
      />
    );
    
    if (!leadingIcon && !trailingIcon && !helperText) {
      return inputElement;
    }
    
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {leadingIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            {leadingIcon}
          </div>
        )}
        
        {inputElement}
        
        {trailingIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            {trailingIcon}
          </div>
        )}
        
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
      </div>
    );
  }
);

Input.displayName = 'ReactInput';

export { inputVariants };