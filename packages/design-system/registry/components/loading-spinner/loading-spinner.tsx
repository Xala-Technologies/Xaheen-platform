/**
 * Loading Spinner Component - Accessible Loading States
 * WCAG AAA: Proper ARIA attributes and reduced motion support
 * Professional styling with multiple sizes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const spinnerVariants = cva(
  [
    'animate-spin rounded-full border-solid border-current',
    'border-r-transparent',
    // Respect reduced motion preferences
    'motion-reduce:animate-none'
  ],
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',      // 12px
        sm: 'h-4 w-4 border',      // 16px
        md: 'h-6 w-6 border-2',    // 24px
        lg: 'h-8 w-8 border-2',    // 32px
        xl: 'h-12 w-12 border-2',  // 48px
        '2xl': 'h-16 w-16 border-4' // 64px
      },
      variant: {
        default: 'text-current',
        primary: 'text-primary',
        muted: 'text-muted-foreground',
        white: 'text-white',
        // NSM Classifications
        nsmOpen: 'text-green-600',
        nsmRestricted: 'text-yellow-600',
        nsmConfidential: 'text-red-600',
        nsmSecret: 'text-gray-900'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface LoadingSpinnerProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> {
  readonly label?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size, 
    variant,
    label = 'Loading',
    nsmClassification,
    ...props 
  }, ref) => {
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant: finalVariant }), className)}
        role="status"
        aria-label={label}
        aria-live="polite"
        {...props}
      >
        <span className="sr-only">{label}...</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton Loading Component for content placeholders
const skeletonVariants = cva(
  [
    'animate-pulse rounded-md bg-muted',
    // Respect reduced motion preferences
    'motion-reduce:animate-none motion-reduce:opacity-50'
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        shimmer: [
          'bg-gradient-to-r from-muted via-muted/50 to-muted',
          'bg-[length:200%_100%]',
          'animate-[shimmer_1.5s_ease-in-out_infinite]'
        ]
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface SkeletonProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> {
  readonly width?: string | number;
  readonly height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant,
    width,
    height,
    style,
    ...props 
  }, ref) => {
    const skeletonStyle = {
      width,
      height,
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        style={skeletonStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pulse Loading Animation for text content
export interface PulseTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly length?: 'short' | 'medium' | 'long';
}

export const PulseText = React.forwardRef<HTMLSpanElement, PulseTextProps>(
  ({ className, length = 'medium', ...props }, ref) => {
    const widths = {
      short: 'w-16',
      medium: 'w-32', 
      long: 'w-48'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-block h-4 rounded animate-pulse bg-muted',
          widths[length],
          // Respect reduced motion preferences  
          'motion-reduce:animate-none motion-reduce:opacity-50',
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

PulseText.displayName = 'PulseText';

// Loading States Container
export interface LoadingStateProps {
  readonly isLoading: boolean;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
  readonly delay?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  fallback,
  delay = 0
}) => {
  const [showLoader, setShowLoader] = React.useState(!delay);

  React.useEffect(() => {
    if (isLoading && delay > 0) {
      const timer = setTimeout(() => setShowLoader(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(isLoading);
      return undefined;
    }
  }, [isLoading, delay]);

  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center p-8">
        {fallback || <LoadingSpinner size="lg" label="Loading content" />}
      </div>
    );
  }

  return <>{children}</>;
};

LoadingState.displayName = 'LoadingState';

// Export types and variants
export { spinnerVariants, skeletonVariants };
export type { VariantProps };