/**
 * Badge Component - Status Indicators and Labels
 * CLAUDE.md Compliant: Professional sizing and semantic colors
 * WCAG AAA: High contrast colors and proper accessibility attributes
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'whitespace-nowrap',
    // Professional minimum height
    'min-h-[1.5rem] gap-1'
  ],
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-primary text-primary-foreground',
          'hover:bg-primary/80 shadow-sm'
        ],
        secondary: [
          'border-transparent bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80'
        ],
        destructive: [
          'border-transparent bg-destructive text-destructive-foreground',
          'hover:bg-destructive/80 shadow-sm'
        ],
        outline: [
          'border-border text-foreground bg-background',
          'hover:bg-accent hover:text-accent-foreground'
        ],
        success: [
          'border-transparent bg-green-100 text-green-800',
          'hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
          'shadow-sm'
        ],
        warning: [
          'border-transparent bg-yellow-100 text-yellow-800',
          'hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
          'shadow-sm'
        ],
        info: [
          'border-transparent bg-blue-100 text-blue-800',
          'hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
          'shadow-sm'
        ],
        // NSM Security Classification variants
        nsmOpen: [
          'border-transparent bg-green-100 text-green-800',
          'hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
          'ring-1 ring-green-600/20 shadow-sm'
        ],
        nsmRestricted: [
          'border-transparent bg-yellow-100 text-yellow-800',
          'hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
          'ring-1 ring-yellow-600/20 shadow-sm'
        ],
        nsmConfidential: [
          'border-transparent bg-red-100 text-red-800',
          'hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400',
          'ring-1 ring-red-600/20 shadow-sm'
        ],
        nsmSecret: [
          'border-transparent bg-gray-100 text-gray-800',
          'hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400',
          'ring-1 ring-gray-600/20 shadow-sm'
        ]
      },
      size: {
        sm: 'px-2 py-0.5 text-xs min-h-[1.25rem]',
        md: 'px-2.5 py-0.5 text-xs min-h-[1.5rem]',
        lg: 'px-3 py-1 text-sm min-h-[1.75rem]',
        xl: 'px-4 py-1.5 text-base min-h-[2rem]'
      },
      shape: {
        rounded: 'rounded-full',
        square: 'rounded-md',
        pill: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded'
    }
  }
);

const badgeDotVariants = cva(
  [
    'mr-1 h-2 w-2 rounded-full'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary-foreground',
        secondary: 'bg-secondary-foreground',
        destructive: 'bg-destructive-foreground',
        outline: 'bg-current',
        success: 'bg-green-600',
        warning: 'bg-yellow-600', 
        info: 'bg-blue-600',
        nsmOpen: 'bg-green-600',
        nsmRestricted: 'bg-yellow-600',
        nsmConfidential: 'bg-red-600',
        nsmSecret: 'bg-gray-600'
      }
    }
  }
);

// Types
export interface BadgeProps extends 
  React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> {
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly removable?: boolean;
  readonly onRemove?: () => void;
  readonly dot?: boolean;
  readonly pulse?: boolean;
  readonly count?: number;
  readonly max?: number;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly ariaLabel?: string;
}

// Main Badge Component
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    shape = 'rounded',
    leftIcon,
    rightIcon,
    removable = false,
    onRemove,
    dot = false,
    pulse = false,
    count,
    max = 99,
    nsmClassification,
    ariaLabel,
    children,
    ...props 
  }, ref) => {
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    // Handle remove action
    const handleRemove = React.useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove?.();
    }, [onRemove]);

    // Handle keyboard interaction for removal
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (removable && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        onRemove?.();
      }
    }, [removable, onRemove]);

    // Format count for display
    const displayCount = count !== undefined 
      ? count > max ? `${max}+` : count.toString()
      : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant: finalVariant, size, shape }),
          pulse && 'animate-pulse',
          removable && 'pr-1',
          className
        )}
        role={removable ? 'button' : undefined}
        tabIndex={removable ? 0 : undefined}
        aria-label={ariaLabel || (removable ? `Remove ${children}` : undefined)}
        onKeyDown={handleKeyDown}
        data-variant={finalVariant}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && (
          <span className="mr-1 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Dot Indicator */}
        {dot && (
          <span 
            className={cn(
              badgeDotVariants({ variant: finalVariant }),
              pulse && 'animate-ping'
            )}
            aria-hidden="true" 
          />
        )}

        {/* Content */}
        <span className="truncate">
          {displayCount || children}
        </span>

        {/* Right Icon */}
        {rightIcon && (
          <span className="ml-1 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Remove Button */}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'ml-1 flex-shrink-0 rounded-full p-0.5',
              'hover:bg-black/10 dark:hover:bg-white/10',
              'focus:outline-none focus:ring-1 focus:ring-current',
              'transition-colors duration-200'
            )}
            aria-label={`Remove ${children}`}
            tabIndex={-1}
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}

        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            NSM-klassifisering: {nsmClassification}
          </span>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Badge variants for convenience
export interface BadgeTypeProps extends Omit<BadgeProps, 'variant'> {}

export const BadgeSuccess = React.forwardRef<HTMLSpanElement, BadgeTypeProps>(
  (props, ref) => <Badge ref={ref} variant="success" {...props} />
);
BadgeSuccess.displayName = 'BadgeSuccess';

export const BadgeWarning = React.forwardRef<HTMLSpanElement, BadgeTypeProps>(
  (props, ref) => <Badge ref={ref} variant="warning" {...props} />
);
BadgeWarning.displayName = 'BadgeWarning';

export const BadgeError = React.forwardRef<HTMLSpanElement, BadgeTypeProps>(
  (props, ref) => <Badge ref={ref} variant="destructive" {...props} />
);
BadgeError.displayName = 'BadgeError';

export const BadgeInfo = React.forwardRef<HTMLSpanElement, BadgeTypeProps>(
  (props, ref) => <Badge ref={ref} variant="info" {...props} />
);
BadgeInfo.displayName = 'BadgeInfo';

// Notification Badge Component (for counts)
export interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  readonly count: number;
  readonly showZero?: boolean;
}

export const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ 
    count,
    max = 99,
    showZero = false,
    size = 'sm',
    variant = 'destructive',
    ...props 
  }, ref) => {
    if (count === 0 && !showZero) {
      return null;
    }

    const displayValue = count > max ? `${max}+` : count.toString();

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        shape="rounded"
        aria-label={`${count} notifications`}
        {...props}
      >
        {displayValue}
      </Badge>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

// Status Badge Component (with dots)
export interface StatusBadgeProps extends Omit<BadgeProps, 'dot'> {
  readonly status: 'online' | 'offline' | 'away' | 'busy' | 'idle';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ 
    status,
    pulse: pulseProp,
    ...props 
  }, ref) => {
    const statusConfig = {
      online: { variant: 'success' as const, pulse: true, label: 'Online' },
      offline: { variant: 'outline' as const, pulse: false, label: 'Offline' },
      away: { variant: 'warning' as const, pulse: false, label: 'Away' },
      busy: { variant: 'destructive' as const, pulse: false, label: 'Busy' },
      idle: { variant: 'secondary' as const, pulse: false, label: 'Idle' }
    };

    const config = statusConfig[status];
    const shouldPulse = pulseProp !== undefined ? pulseProp : config.pulse;

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot
        pulse={shouldPulse}
        ariaLabel={`Status: ${config.label}`}
        {...props}
      >
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Export variants and types
export { badgeVariants, badgeDotVariants };
export type { VariantProps };