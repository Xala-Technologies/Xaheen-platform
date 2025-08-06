/**
 * Label Component - React Platform Implementation
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const labelVariants = cva(
  [
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600 dark:text-green-400'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  readonly required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-destructive" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';