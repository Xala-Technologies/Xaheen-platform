/**
 * @fileoverview TestCard Component - CVA Design System Compliant
 * @description TestCard component using CVA pattern with semantic tokens
 * @version 5.0.0
 * @compliance CVA-based, SSR-safe, Framework-agnostic, Token-based
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@xala-technologies/ui-system/utils';
import { Box, Button, Link } from '@xala-technologies/ui-system/semantic';


// =============================================================================
// TESTCARD VARIANTS USING CVA
// =============================================================================

const testcardVariants = cva(
  // Base classes using semantic tokens
  'relative inline-flex items-center justify-center gap-2 rounded-lg border bg-card text-card-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-accent',
  {
    variants: {
      variant: {
        default: 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/90',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/90'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-12 text-base'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// =============================================================================
// TESTCARD COMPONENT INTERFACE
// =============================================================================

export interface TestCardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof testcardVariants> {
  readonly children?: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly intent?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  readonly semanticElement?: 'button' | 'a';
  readonly nsmLevel?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly 'data-testid'?: string;
}

// =============================================================================
// TESTCARD COMPONENT
// =============================================================================

export const TestCard = React.forwardRef<HTMLElement, TestCardProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    intent,
    semanticElement,
    loading = false,
    disabled = false,
    nsmLevel,
    children,
    'data-testid': testId,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const SemanticComponent = Button;

    return (
      <SemanticComponent
        as={semanticElement}
        intent={intent}
        variant={variant}
        className={cn(testcardVariants({ variant, size }), className)}
        ref={ref}
        data-testid={testId}
        data-nsm-level={nsmLevel}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full border-2 border-transparent border-t-current h-4 w-4" />
        )}
        {children}
      </SemanticComponent>
    );
  }
);

TestCard.displayName = 'TestCard';
