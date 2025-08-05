/**
 * Card Component - Professional Implementation
 * CLAUDE.md Compliant: Minimum p-8 (32px) padding
 * WCAG AAA: Proper semantic structure and interactive states
 * NSM Classification: Security level indicators
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  [
    'rounded-xl border bg-card text-card-foreground transition-all duration-200 ease-in-out',
    // High contrast mode support
    '@media (prefers-contrast: high)': {
      'border-2'
    }
  ],
  {
    variants: {
      variant: {
        default: [
          'border-border shadow-sm',
          'hover:shadow-md'
        ],
        elevated: [
          'border-border shadow-lg',
          'hover:shadow-xl hover:-translate-y-1',
          'transition-transform'
        ],
        outline: [
          'border-2 border-border shadow-none',
          'hover:border-border/80'
        ],
        ghost: [
          'border-transparent shadow-none bg-transparent',
          'hover:bg-accent/5'
        ],
        // NSM Security variants
        nsmOpen: [
          'border-green-200 bg-green-50/50 shadow-sm',
          'hover:bg-green-50 hover:shadow-md'
        ],
        nsmRestricted: [
          'border-yellow-200 bg-yellow-50/50 shadow-sm',
          'hover:bg-yellow-50 hover:shadow-md'
        ],
        nsmConfidential: [
          'border-red-200 bg-red-50/50 shadow-sm',
          'hover:bg-red-50 hover:shadow-md'
        ],
        nsmSecret: [
          'border-gray-400 bg-gray-100/50 shadow-sm',
          'hover:bg-gray-100 hover:shadow-md'
        ]
      },
      padding: {
        none: 'p-0',
        xs: 'p-4',        // 16px padding (compact)
        sm: 'p-6',        // 24px padding (small)
        md: 'p-8',        // 32px padding (CLAUDE.md professional standard)
        lg: 'p-10',       // 40px padding (premium)
        xl: 'p-12',       // 48px padding (luxury)
        '2xl': 'p-16'     // 64px padding (ultra-luxury)
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:bg-accent/5 active:bg-accent/10',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transform-gpu'
        ],
        false: ''
      },
      size: {
        default: 'w-full',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'w-full max-w-none'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',     // Professional default
      interactive: false,
      size: 'default'
    }
  }
);

export interface CardProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  readonly children: React.ReactNode;
  readonly asChild?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly classificationVisible?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding, 
    interactive, 
    size,
    children,
    asChild = false,
    nsmClassification,
    classificationVisible = true,
    role,
    tabIndex,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'div';
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as any
      : variant;
    
    // Add proper ARIA attributes for interactive cards
    const interactiveProps = interactive ? {
      role: role || 'button',
      tabIndex: tabIndex || 0,
      'aria-pressed': false
    } : {};
    
    return (
      <Comp
        className={cn(cardVariants({ variant: finalVariant, padding, interactive, size }), className)}
        ref={ref}
        {...interactiveProps}
        {...props}
      >
        {/* NSM Classification Banner */}
        {nsmClassification && classificationVisible && (
          <div 
            className={cn(
              'absolute top-0 right-0 px-3 py-1 rounded-bl-lg rounded-tr-xl text-xs font-semibold',
              nsmClassification === 'OPEN' && 'bg-green-600 text-white',
              nsmClassification === 'RESTRICTED' && 'bg-yellow-600 text-white',
              nsmClassification === 'CONFIDENTIAL' && 'bg-red-600 text-white',
              nsmClassification === 'SECRET' && 'bg-gray-900 text-white'
            )}
            aria-label={`NSM Classification: ${nsmClassification}`}
          >
            {nsmClassification}
          </div>
        )}
        
        <div className={nsmClassification && classificationVisible ? 'pt-2' : ''}>
          {children}
        </div>
        
        {/* Screen reader classification info */}
        {nsmClassification && (
          <span className="sr-only">
            NSM Security Classification: {nsmClassification}
          </span>
        )}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

// Card Sub-components with professional styling
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight text-card-foreground', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Specialized Card Components for specific use cases
export interface StatsCardProps extends Omit<CardProps, 'children'> {
  readonly title: string;
  readonly value: string | number;
  readonly description?: string;
  readonly trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  readonly icon?: React.ReactNode;
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, trend, icon, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold text-card-foreground">{value}</p>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
              
              {trend && (
                <div className="flex items-center mt-2 text-sm">
                  <span 
                    className={cn(
                      'flex items-center font-medium',
                      trend.direction === 'up' && 'text-green-600',
                      trend.direction === 'down' && 'text-red-600',
                      trend.direction === 'neutral' && 'text-muted-foreground'
                    )}
                  >
                    {trend.direction === 'up' && (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend.direction === 'down' && (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend.value}%
                  </span>
                  <span className="text-muted-foreground ml-1">{trend.label}</span>
                </div>
              )}
            </div>
            
            {icon && (
              <div className="text-muted-foreground opacity-80">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

// Export types and variants
export { cardVariants };
export type { VariantProps };