/**
 * Pagination Component - Data Pagination Controls
 * CLAUDE.md Compliant: Professional sizing and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Norwegian localization support
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import { cn } from '../../lib/utils';

// =============================================================================
// PAGINATION CONTAINER
// =============================================================================

const paginationVariants = cva(
  [
    'mx-auto flex w-full justify-center',
    'focus-within:outline-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface PaginationProps extends 
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof paginationVariants> {
  readonly ariaLabel?: string;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, size, ariaLabel, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label={ariaLabel || 'pagination'}
      className={cn(paginationVariants({ size }), className)}
      {...props}
    />
  )
);
Pagination.displayName = 'Pagination';

// =============================================================================
// PAGINATION CONTENT
// =============================================================================

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

// =============================================================================
// PAGINATION ITEM
// =============================================================================

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

// =============================================================================
// PAGINATION LINK
// =============================================================================

const paginationLinkVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-colors focus-visible:outline-none',
    'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'border border-input bg-background shadow-sm',
    'hover:bg-accent hover:text-accent-foreground',
    'min-h-[2.75rem]', // Professional touch target (44px)
    'contrast-more:border-2'
  ],
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent shadow-none hover:bg-accent hover:text-accent-foreground',
        outline: 'border-2 border-input hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        sm: 'h-8 px-3 text-xs min-h-[2rem]',
        md: 'h-10 px-4 text-sm min-h-[2.75rem]',
        lg: 'h-12 px-6 text-base min-h-[3rem]'
      },
      isActive: {
        true: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isActive: false
    }
  }
);

export interface PaginationLinkProps extends 
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  VariantProps<typeof paginationLinkVariants> {
  readonly isActive?: boolean;
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, size, variant, children, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(paginationLinkVariants({ variant, size, isActive }), className)}
      {...props}
    >
      {children}
    </a>
  )
);
PaginationLink.displayName = 'PaginationLink';

// =============================================================================
// PAGINATION PREVIOUS
// =============================================================================

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof PaginationLink>
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size={props.size || 'md'}
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
    <span>{children || 'Previous'}</span>
  </PaginationLink>
));
PaginationPrevious.displayName = 'PaginationPrevious';

// =============================================================================
// PAGINATION NEXT
// =============================================================================

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof PaginationLink>
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size={props.size || 'md'}
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>{children || 'Next'}</span>
    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
  </PaginationLink>
));
PaginationNext.displayName = 'PaginationNext';

// =============================================================================
// PAGINATION ELLIPSIS
// =============================================================================

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn(
      'flex h-10 w-10 items-center justify-center min-h-[2.75rem]',
      className
    )}
    {...props}
  >
    <DotsHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

// =============================================================================
// ADVANCED PAGINATION
// =============================================================================

export interface AdvancedPaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly showFirstLast?: boolean;
  readonly showPreviousNext?: boolean;
  readonly maxVisiblePages?: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly variant?: 'default' | 'ghost' | 'outline';
  readonly className?: string;
  readonly disabled?: boolean;
  // Norwegian localization
  readonly labels?: {
    readonly previous?: string;
    readonly next?: string;
    readonly first?: string;
    readonly last?: string;
    readonly page?: string;
    readonly of?: string;
  };
  readonly ariaLabel?: string;
}

const AdvancedPagination = React.forwardRef<HTMLElement, AdvancedPaginationProps>(
  ({ 
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = false,
    showPreviousNext = true,
    maxVisiblePages = 7,
    size = 'md',
    variant = 'default',
    className,
    disabled = false,
    labels = {
      previous: 'Forrige',
      next: 'Neste',
      first: 'Første',
      last: 'Siste',
      page: 'Side',
      of: 'av'
    },
    ariaLabel = 'Navigasjon for paginering',
    ...props 
  }, ref) => {
    // Calculate visible page numbers
    const getVisiblePages = (): (number | 'ellipsis')[] => {
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | 'ellipsis')[] = [];
      const sidePages = Math.floor((maxVisiblePages - 3) / 2); // Reserve space for first, last, and ellipsis

      if (currentPage <= sidePages + 2) {
        // Show pages from start
        for (let i = 1; i <= maxVisiblePages - 2; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - sidePages - 1) {
        // Show pages from end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - (maxVisiblePages - 3); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }

      return pages;
    };

    const visiblePages = getVisiblePages();
    const canGoPrevious = currentPage > 1 && !disabled;
    const canGoNext = currentPage < totalPages && !disabled;

    const handlePageClick = (page: number, event: React.MouseEvent) => {
      event.preventDefault();
      if (!disabled && page !== currentPage && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    };

    const handleKeyDown = (page: number, event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePageClick(page, event as any);
      }
    };

    return (
      <Pagination
        ref={ref}
        size={size}
        className={className}
        ariaLabel={ariaLabel}
        {...props}
      >
        <PaginationContent>
          {/* First Page */}
          {showFirstLast && currentPage > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                size={size}
                variant={variant}
                onClick={(e) => handlePageClick(1, e)}
                onKeyDown={(e) => handleKeyDown(1, e)}
                aria-label={`${labels.page} 1`}
                className={disabled ? 'pointer-events-none opacity-50' : ''}
              >
                {labels.first}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Previous */}
          {showPreviousNext && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                size={size}
                variant={variant}
                onClick={(e) => handlePageClick(currentPage - 1, e)}
                onKeyDown={(e) => handleKeyDown(currentPage - 1, e)}
                className={!canGoPrevious ? 'pointer-events-none opacity-50' : ''}
                aria-disabled={!canGoPrevious}
              >
                {labels.previous}
              </PaginationPrevious>
            </PaginationItem>
          )}

          {/* Page Numbers */}
          {visiblePages.map((page, index) => (
            <PaginationItem key={`page-${page}-${index}`}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  size={size}
                  variant={variant}
                  isActive={page === currentPage}
                  onClick={(e) => handlePageClick(page as number, e)}
                  onKeyDown={(e) => handleKeyDown(page as number, e)}
                  aria-label={`${labels.page} ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={disabled ? 'pointer-events-none opacity-50' : ''}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next */}
          {showPreviousNext && (
            <PaginationItem>
              <PaginationNext
                href="#"
                size={size}
                variant={variant}
                onClick={(e) => handlePageClick(currentPage + 1, e)}
                onKeyDown={(e) => handleKeyDown(currentPage + 1, e)}
                className={!canGoNext ? 'pointer-events-none opacity-50' : ''}
                aria-disabled={!canGoNext}
              >
                {labels.next}
              </PaginationNext>
            </PaginationItem>
          )}

          {/* Last Page */}
          {showFirstLast && currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                href="#"
                size={size}
                variant={variant}
                onClick={(e) => handlePageClick(totalPages, e)}
                onKeyDown={(e) => handleKeyDown(totalPages, e)}
                aria-label={`${labels.page} ${totalPages}`}
                className={disabled ? 'pointer-events-none opacity-50' : ''}
              >
                {labels.last}
              </PaginationLink>
            </PaginationItem>
          )}
        </PaginationContent>

        {/* Screen reader summary */}
        <div className="sr-only" aria-live="polite">
          {labels.page} {currentPage} {labels.of} {totalPages}
        </div>
      </Pagination>
    );
  }
);
AdvancedPagination.displayName = 'AdvancedPagination';

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  AdvancedPagination,
  paginationVariants,
  paginationLinkVariants,
};

export type { VariantProps };