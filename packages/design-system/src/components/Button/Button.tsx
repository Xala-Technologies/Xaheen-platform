/**
 * Button Component - Professional Implementation
 * CLAUDE.md Compliant: Minimum h-12 (48px) height
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-lg shadow-sm',
    'whitespace-nowrap',
    'border',
    // High contrast mode support
    'contrast-more:border-2'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:bg-primary/95',
          'focus:ring-primary/20 shadow-md',
          'border-primary/10',
          'hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-md'
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 active:bg-secondary/85',
          'focus:ring-secondary/20 shadow-sm',
          'border-secondary/20',
          'hover:shadow-md hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm'
        ],
        outline: [
          'bg-transparent text-foreground',
          'hover:bg-accent/10 active:bg-accent/20',
          'focus:ring-accent/20',
          'border-2 border-border hover:border-accent',
          'hover:shadow-sm'
        ],
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-accent/10 active:bg-accent/20',
          'focus:ring-accent/20 shadow-none border-transparent',
          'hover:shadow-sm'
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 active:bg-destructive/95',
          'focus:ring-destructive/20 shadow-md',
          'border-destructive/20',
          'hover:shadow-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-md'
        ],
        // NSM Security Classification variants
        nsmOpen: [
          'bg-green-600 text-white',
          'hover:bg-green-700 active:bg-green-800',
          'focus:ring-green-500/20 shadow-md',
          'border-green-600/20'
        ],
        nsmRestricted: [
          'bg-yellow-600 text-white',
          'hover:bg-yellow-700 active:bg-yellow-800',
          'focus:ring-yellow-500/20 shadow-md',
          'border-yellow-600/20'
        ],
        nsmConfidential: [
          'bg-red-600 text-white',
          'hover:bg-red-700 active:bg-red-800',
          'focus:ring-red-500/20 shadow-md',
          'border-red-600/20'
        ],
        nsmSecret: [
          'bg-gray-800 text-white',
          'hover:bg-gray-900 active:bg-black',
          'focus:ring-gray-600/20 shadow-md',
          'border-gray-800/20'
        ]
      },
      size: {
        // Professional sizing - no small buttons
        md: 'h-12 px-6 text-base min-w-[6rem]',     // 48px height (CLAUDE.md minimum)
        lg: 'h-14 px-8 text-lg min-w-[7rem]',       // 56px height (professional)
        xl: 'h-16 px-10 text-xl min-w-[8rem]',      // 64px height (premium)
        '2xl': 'h-18 px-12 text-2xl min-w-[9rem]', // 72px height (luxury)
        icon: 'h-12 w-12 p-0',                      // Icon-only button (48px)
        iconLg: 'h-14 w-14 p-0',                    // Large icon button (56px)
        iconXl: 'h-16 w-16 p-0'                     // Extra large icon button (64px)
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      },
      loading: {
        true: 'cursor-wait',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',        // Professional default
      fullWidth: false,
      loading: false
    }
  }
);

export interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  readonly loading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly asChild?: boolean;
  readonly loadingText?: string;
  readonly ariaLabel?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    asChild = false,
    loadingText,
    ariaLabel,
    nsmClassification,
    type = 'button',
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;
    
    // Loading state announcement for screen readers
    const ariaLive = loading ? 'polite' : undefined;
    const ariaBusy = loading ? true : undefined;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant: finalVariant, size, fullWidth, loading }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={ariaBusy}
        aria-live={ariaLive}
        aria-label={ariaLabel || (loading && loadingText ? loadingText : undefined)}
        type={asChild ? undefined : type}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner 
              size={size === 'md' ? 'sm' : size === 'lg' ? 'md' : 'lg'} 
              className="text-current" 
            />
            {loadingText && (
              <span className="sr-only">
                {loadingText}
              </span>
            )}
            {!loadingText && children && (
              <span className="opacity-0" aria-hidden="true">
                {children}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            
            {children && (
              <span className="truncate">
                {children}
              </span>
            )}
            
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </div>
        )}
        
        {/* NSM Classification indicator for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            NSM Classification: {nsmClassification}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Export types
export type { VariantProps };
export { buttonVariants };