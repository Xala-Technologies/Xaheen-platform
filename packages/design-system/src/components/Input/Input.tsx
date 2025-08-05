/**
 * Input Component - Professional Implementation
 * CLAUDE.md Compliant: Minimum h-14 (56px) height
 * WCAG AAA: Full accessibility with proper ARIA labels and error handling
 * Norwegian Support: Optimized for Norwegian characters and locale
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  [
    'flex w-full transition-all duration-200 ease-in-out',
    'bg-background text-foreground placeholder:text-muted-foreground',
    'border border-input rounded-lg shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:cursor-default read-only:focus:ring-0 read-only:bg-muted/50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
    // High contrast mode support
    'contrast-more:border-2'
  ],
  {
    variants: {
      variant: {
        default: [
          'border-input focus:border-ring',
          'hover:border-input/80'
        ],
        filled: [
          'bg-muted/50 border-transparent',
          'focus:bg-background focus:border-ring',
          'hover:bg-muted/70'
        ],
        outline: [
          'border-2 border-border',
          'focus:border-ring',
          'hover:border-border/80'
        ],
        search: [
          'pl-10 pr-4 bg-muted/30 border-transparent',
          'focus:bg-background focus:border-ring',
          'hover:bg-muted/50'
        ],
        // Norwegian government style
        official: [
          'border-2 border-border bg-background',
          'focus:border-primary focus:ring-primary/20',
          'hover:border-border/80'
        ]
      },
      size: {
        // Professional sizing - no small inputs
        md: 'h-14 px-4 py-3 text-base',    // 56px height (CLAUDE.md minimum)
        lg: 'h-16 px-6 py-4 text-lg',      // 64px height (professional)
        xl: 'h-18 px-8 py-5 text-xl',      // 72px height (premium)
        '2xl': 'h-20 px-10 py-6 text-2xl'  // 80px height (luxury)
      },
      state: {
        default: '',
        invalid: [
          'border-destructive focus:border-destructive',
          'focus:ring-destructive/20',
          'placeholder:text-destructive/60'
        ],
        valid: [
          'border-success focus:border-success',
          'focus:ring-success/20'
        ],
        warning: [
          'border-warning focus:border-warning',
          'focus:ring-warning/20'
        ]
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',        // Professional default
      state: 'default'
    }
  }
);

export interface InputProps extends 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly error?: string;
  readonly helperText?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly norwegianOptimized?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    leftIcon, 
    rightIcon, 
    error, 
    helperText,
    label,
    required = false,
    nsmClassification,
    norwegianOptimized = false,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const labelId = label ? `${inputId}-label` : undefined;
    
    const describedBy = [ariaDescribedBy, errorId, helperId]
      .filter(Boolean)
      .join(' ') || undefined;
    
    const finalState = error ? 'invalid' : state;
    const finalVariant = norwegianOptimized ? 'official' : variant;
    
    // Auto-adjust input attributes for Norwegian locale
    const norwegianProps = norwegianOptimized ? {
      lang: 'nb-NO',
      spellCheck: true,
      autoComplete: props.autoComplete || 'on'
    } : {};
    
    return (
      <div className="relative w-full">
        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium leading-6 mb-2',
              'text-foreground',
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
            {nsmClassification && (
              <span 
                className={cn(
                  'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  nsmClassification === 'OPEN' && 'bg-green-100 text-green-800',
                  nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-800',
                  nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-800',
                  nsmClassification === 'SECRET' && 'bg-gray-900 text-white'
                )}
                aria-label={`NSM Classification: ${nsmClassification}`}
              >
                {nsmClassification}
              </span>
            )}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input Element */}
          <input
            className={cn(
              inputVariants({ variant: finalVariant, size, state: finalState }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : ariaInvalid}
            aria-required={required}
            aria-labelledby={label ? labelId : undefined}
            {...norwegianProps}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
        
        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        
        {/* NSM Classification Screen Reader Info */}
        {nsmClassification && (
          <span className="sr-only">
            This field is classified as NSM {nsmClassification} level
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component (extends Input styling)
export interface TextareaProps extends 
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  readonly error?: string;
  readonly helperText?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly norwegianOptimized?: boolean;
  readonly minRows?: number;
  readonly maxRows?: number;
  readonly resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    error, 
    helperText,
    label,
    required = false,
    nsmClassification,
    norwegianOptimized = false,
    minRows = 3,
    maxRows: _maxRows,
    resize = 'vertical',
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const labelId = label ? `${textareaId}-label` : undefined;
    
    const describedBy = [ariaDescribedBy, errorId, helperId]
      .filter(Boolean)
      .join(' ') || undefined;
    
    const finalState = error ? 'invalid' : state;
    const finalVariant = norwegianOptimized ? 'official' : variant;
    
    const norwegianProps = norwegianOptimized ? {
      lang: 'nb-NO',
      spellCheck: true,
      autoComplete: props.autoComplete || 'on'
    } : {};
    
    return (
      <div className="relative w-full">
        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium leading-6 mb-2',
              'text-foreground',
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
            {nsmClassification && (
              <span 
                className={cn(
                  'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  nsmClassification === 'OPEN' && 'bg-green-100 text-green-800',
                  nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-800',
                  nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-800',
                  nsmClassification === 'SECRET' && 'bg-gray-900 text-white'
                )}
                aria-label={`NSM Classification: ${nsmClassification}`}
              >
                {nsmClassification}
              </span>
            )}
          </label>
        )}
        
        {/* Textarea Element */}
        <textarea
          className={cn(
            inputVariants({ variant: finalVariant, size, state: finalState }),
            'min-h-[6rem]', // Minimum height for textarea
            resize === 'none' && 'resize-none',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            className
          )}
          ref={ref}
          id={textareaId}
          rows={minRows}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : ariaInvalid}
          aria-required={required}
          aria-labelledby={label ? labelId : undefined}
          {...norwegianProps}
          {...props}
        />
        
        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
        
        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-destructive flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Export types and variants
export { inputVariants };
export type { VariantProps };