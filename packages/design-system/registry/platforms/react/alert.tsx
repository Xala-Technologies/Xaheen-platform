/**
 * Alert Component - React Platform Implementation
 * Simplified version without external icon dependencies
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  [
    'relative w-full rounded-lg border px-6 py-4',
    'text-sm transition-all duration-200',
    '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    'min-h-[3rem] flex items-start gap-3'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-background text-foreground',
          'border-border'
        ],
        destructive: [
          'border-destructive/50 text-destructive dark:border-destructive',
          'bg-destructive/10 [&>svg]:text-destructive'
        ],
        warning: [
          'border-yellow-500/50 text-yellow-900 dark:text-yellow-100',
          'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400'
        ],
        success: [
          'border-green-500/50 text-green-900 dark:text-green-100',
          'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600 dark:[&>svg]:text-green-400'
        ],
        info: [
          'border-blue-500/50 text-blue-900 dark:text-blue-100',
          'bg-blue-50 dark:bg-blue-900/20 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400'
        ]
      },
      size: {
        sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
        md: 'px-6 py-4 text-base min-h-[3rem]',
        lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export interface AlertProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  readonly dismissible?: boolean;
  readonly onDismiss?: () => void;
  readonly icon?: React.ReactNode | boolean;
  readonly ariaLive?: 'polite' | 'assertive' | 'off';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    dismissible = false,
    onDismiss,
    icon,
    ariaLive = 'polite',
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    
    const handleDismiss = React.useCallback(() => {
      setIsVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role={variant === 'destructive' ? 'alert' : 'status'}
        aria-live={ariaLive}
        className={cn(
          alertVariants({ variant, size }),
          dismissible && 'pr-12',
          className
        )}
        {...props}
      >
        {icon && icon !== false && (
          <div className="flex-shrink-0">
            {icon === true ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            className={cn(
              'absolute right-4 top-4 rounded-md p-1',
              'opacity-70 hover:opacity-100 focus:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
              'transition-opacity duration-200'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';