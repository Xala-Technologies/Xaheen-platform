/**
 * Breadcrumb Component - Navigation Path Display
 * CLAUDE.md Compliant: Professional sizing and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Norwegian localization support
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

// =============================================================================
// BREADCRUMB CONTAINER
// =============================================================================

const breadcrumbVariants = cva(
  [
    'flex items-center space-x-1 text-sm text-muted-foreground',
    'focus-within:outline-none',
    'contrast-more:text-foreground'
  ],
  {
    variants: {
      size: {
        sm: 'text-xs h-8 space-x-1',
        md: 'text-sm h-10 space-x-2',
        lg: 'text-base h-12 space-x-3'
      },
      variant: {
        default: '',
        subtle: 'text-muted-foreground/70',
        prominent: 'text-foreground font-medium'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface BreadcrumbProps extends
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof breadcrumbVariants> {
  readonly separator?: React.ReactNode;
  readonly ariaLabel?: string;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, size, variant, separator, ariaLabel, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel || 'Breadcrumb'}
        className={cn(breadcrumbVariants({ size, variant }), className)}
        {...props}
      />
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

// =============================================================================
// BREADCRUMB LIST
// =============================================================================

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

// =============================================================================
// BREADCRUMB ITEM
// =============================================================================

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

// =============================================================================
// BREADCRUMB LINK
// =============================================================================

const breadcrumbLinkVariants = cva(
  [
    'inline-flex items-center gap-1.5 transition-colors',
    'hover:text-foreground focus:outline-none',
    'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm',
    'underline-offset-4 hover:underline',
    'min-h-[2.75rem] px-1 -mx-1 rounded-sm', // Professional touch target
    'contrast-more:hover:underline contrast-more:focus:underline'
  ],
  {
    variants: {
      isActive: {
        true: 'text-foreground font-medium cursor-default hover:no-underline',
        false: 'text-muted-foreground hover:text-foreground cursor-pointer'
      }
    },
    defaultVariants: {
      isActive: false
    }
  }
);

export interface BreadcrumbLinkProps extends
  React.AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly asChild?: boolean;
  readonly isActive?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, isActive = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <Comp
        ref={ref}
        className={cn(breadcrumbLinkVariants({ isActive }), className)}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

// =============================================================================
// BREADCRUMB PAGE (CURRENT PAGE)
// =============================================================================

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn(
      'font-medium text-foreground min-h-[2.75rem] flex items-center px-1',
      className
    )}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

// =============================================================================
// BREADCRUMB SEPARATOR
// =============================================================================

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    readonly children?: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5 text-muted-foreground/70', className)}
    {...props}
  >
    {children ?? <ChevronRightIcon />}
  </li>
));
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// =============================================================================
// BREADCRUMB ELLIPSIS
// =============================================================================

const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn(
      'flex h-9 w-9 items-center justify-center text-muted-foreground/70',
      className
    )}
    {...props}
  >
    <span className="sr-only">More</span>
    <span aria-hidden="true">…</span>
  </span>
));
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// =============================================================================
// ADVANCED BREADCRUMB WITH AUTO-COLLAPSE
// =============================================================================

export interface AdvancedBreadcrumbProps {
  readonly items: readonly {
    readonly label: string;
    readonly href?: string;
    readonly isActive?: boolean;
    readonly onClick?: () => void;
  }[];
  readonly maxItems?: number;
  readonly separator?: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly variant?: 'default' | 'subtle' | 'prominent';
  readonly className?: string;
  readonly homeLabel?: string; // Norwegian localization
  readonly moreLabel?: string; // Norwegian localization
  readonly ariaLabel?: string;
}

const AdvancedBreadcrumb = React.forwardRef<HTMLElement, AdvancedBreadcrumbProps>(
  ({ 
    items, 
    maxItems = 5, 
    separator,
    size = 'md',
    variant = 'default',
    className,
    homeLabel = 'Hjem', // Norwegian default
    moreLabel = 'Mer', // Norwegian default
    ariaLabel = 'Navigasjonssti',
    ...props 
  }, ref) => {
    const shouldCollapse = items.length > maxItems;
    const displayItems = shouldCollapse 
      ? [
          items[0], // Always show first item
          { label: '...', href: undefined, isActive: false }, // Ellipsis
          ...items.slice(-(maxItems - 2)) // Show last items
        ]
      : items;

    return (
      <Breadcrumb
        ref={ref}
        size={size}
        variant={variant}
        className={className}
        ariaLabel={ariaLabel}
        {...props}
      >
        <BreadcrumbList>
          {displayItems.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {item.label === '...' ? (
                  <BreadcrumbEllipsis />
                ) : item.isActive ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    onClick={item.onClick}
                    aria-label={item.label}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {index < displayItems.length - 1 && (
                <BreadcrumbSeparator>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
);
AdvancedBreadcrumb.displayName = 'AdvancedBreadcrumb';

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  AdvancedBreadcrumb,
  breadcrumbVariants,
  breadcrumbLinkVariants
};

export type { VariantProps };