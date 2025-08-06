/**
 * Card Component - Container with NSM Security Classification
 * WCAG AAA: Semantic HTML structure with proper headings
 * Professional elevation and spacing standards
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  [
    'bg-card text-card-foreground',
    'border border-border',
    'transition-all duration-200'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-md hover:shadow-lg',
        elevated: 'shadow-lg hover:shadow-xl',
        outline: 'shadow-sm hover:shadow-md',
        ghost: 'shadow-none hover:shadow-sm',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600 shadow-md',
        nsmRestricted: 'border-l-4 border-l-yellow-600 shadow-md',
        nsmConfidential: 'border-l-4 border-l-red-600 shadow-md',
        nsmSecret: 'border-l-4 border-l-gray-800 shadow-md'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      rounded: 'lg'
    }
  }
);

const cardHeaderVariants = cva(
  [
    'flex flex-col space-y-1.5'
  ],
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
);

const cardContentVariants = cva(
  [],
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4 pt-0',
        md: 'p-6 pt-0',
        lg: 'p-8 pt-0'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
);

const cardFooterVariants = cva(
  [
    'flex items-center'
  ],
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4 pt-0',
        md: 'p-6 pt-0',
        lg: 'p-8 pt-0'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
);

// Card Root Component
export interface CardProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  readonly asChild?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, nsmClassification, ...props }, ref) => {
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant: finalVariant, padding, rounded }), className)}
        {...props}
      >
        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            NSM Classification: {nsmClassification}
          </span>
        )}
        {props.children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardHeaderVariants> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding }), className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export interface CardContentProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardContentVariants> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding }), className)}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardFooterVariants> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding }), className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

// Export variants for external use
export { cardVariants };
export type { VariantProps };