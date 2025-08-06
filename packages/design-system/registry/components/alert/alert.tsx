/**
 * Alert Component - Status Messages and Notifications
 * CLAUDE.md Compliant: Professional spacing and semantic colors
 * WCAG AAA: Proper ARIA roles, live regions, and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  [
    'relative w-full rounded-lg border px-6 py-4',
    'text-sm transition-all duration-200',
    '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    // Professional minimum padding and spacing
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
        ],
        // NSM Security Classification variants
        nsmOpen: [
          'border-green-600/50 text-green-900 dark:text-green-100',
          'bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600',
          'border-l-4 border-l-green-600'
        ],
        nsmRestricted: [
          'border-yellow-600/50 text-yellow-900 dark:text-yellow-100',
          'bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600',
          'border-l-4 border-l-yellow-600'
        ],
        nsmConfidential: [
          'border-red-600/50 text-red-900 dark:text-red-100',
          'bg-red-50 dark:bg-red-900/20 [&>svg]:text-red-600',
          'border-l-4 border-l-red-600'
        ],
        nsmSecret: [
          'border-gray-600/50 text-gray-900 dark:text-gray-100',
          'bg-gray-50 dark:bg-gray-900/20 [&>svg]:text-gray-600',
          'border-l-4 border-l-gray-800'
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

const alertTitleVariants = cva(
  [
    'mb-1 font-medium leading-none tracking-tight'
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

const alertDescriptionVariants = cva(
  [
    'text-sm [&_p]:leading-relaxed'
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

// Icon mapping for variants
const variantIcons = {
  default: InformationCircleIcon,
  destructive: XCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  info: InformationCircleIcon,
  nsmOpen: CheckCircleIcon,
  nsmRestricted: ExclamationTriangleIcon,
  nsmConfidential: XCircleIcon,
  nsmSecret: XCircleIcon
} as const;

// Types
export interface AlertProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  readonly dismissible?: boolean;
  readonly onDismiss?: () => void;
  readonly icon?: React.ReactNode | boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly ariaLive?: 'polite' | 'assertive' | 'off';
  readonly autoFocus?: boolean;
}

export interface AlertTitleProps extends 
  React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof alertTitleVariants> {
  readonly as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface AlertDescriptionProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertDescriptionVariants> {}

// Alert Root Component
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    dismissible = false,
    onDismiss,
    icon: customIcon,
    nsmClassification,
    ariaLive = 'polite',
    autoFocus = false,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const alertRef = React.useRef<HTMLDivElement>(null);
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    // Handle dismiss
    const handleDismiss = React.useCallback(() => {
      setIsVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    // Auto focus for important alerts
    React.useEffect(() => {
      if (autoFocus && alertRef.current && (finalVariant === 'destructive' || finalVariant === 'nsmSecret')) {
        alertRef.current.focus();
      }
    }, [autoFocus, finalVariant]);

    // Handle escape key for dismissible alerts
    React.useEffect(() => {
      if (!dismissible) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleDismiss();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [dismissible, handleDismiss]);

    if (!isVisible) {
      return null;
    }

    // Determine which icon to show
    const IconComponent = variantIcons[finalVariant];
    const shouldShowIcon = customIcon !== false;
    const iconToRender = customIcon === true || customIcon === undefined 
      ? <IconComponent className="h-5 w-5" /> 
      : customIcon;

    // Determine ARIA role based on variant
    const getAriaRole = () => {
      switch (finalVariant) {
        case 'destructive':
        case 'nsmSecret':
        case 'nsmConfidential':
          return 'alert';
        default:
          return 'status';
      }
    };

    return (
      <div
        ref={ref || alertRef}
        role={getAriaRole()}
        aria-live={ariaLive}
        tabIndex={autoFocus ? -1 : undefined}
        className={cn(
          alertVariants({ variant: finalVariant, size }),
          dismissible && 'pr-12',
          className
        )}
        data-variant={finalVariant}
        {...props}
      >
        {/* Icon */}
        {shouldShowIcon && iconToRender}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Lukk varsling"
            className={cn(
              'absolute right-4 top-4 rounded-md p-1',
              'opacity-70 hover:opacity-100 focus:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
              'transition-opacity duration-200'
            )}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}

        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            NSM-klassifisering: {nsmClassification}
          </span>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Alert Title Component
export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ 
    className, 
    size = 'md', 
    as: Component = 'h5', 
    ...props 
  }, ref) => (
    <Component
      ref={ref}
      className={cn(alertTitleVariants({ size }), className)}
      {...props}
    />
  )
);

AlertTitle.displayName = 'AlertTitle';

// Alert Description Component
export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ 
    className, 
    size = 'md', 
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(alertDescriptionVariants({ size }), className)}
      {...props}
    />
  )
);

AlertDescription.displayName = 'AlertDescription';

// Convenience Alert Types
export interface AlertTypeProps extends Omit<AlertProps, 'variant'> {}

export const AlertSuccess = React.forwardRef<HTMLDivElement, AlertTypeProps>(
  (props, ref) => <Alert ref={ref} variant="success" {...props} />
);

AlertSuccess.displayName = 'AlertSuccess';

export const AlertError = React.forwardRef<HTMLDivElement, AlertTypeProps>(
  (props, ref) => <Alert ref={ref} variant="destructive" {...props} />
);

AlertError.displayName = 'AlertError';

export const AlertWarning = React.forwardRef<HTMLDivElement, AlertTypeProps>(
  (props, ref) => <Alert ref={ref} variant="warning" {...props} />
);

AlertWarning.displayName = 'AlertWarning';

export const AlertInfo = React.forwardRef<HTMLDivElement, AlertTypeProps>(
  (props, ref) => <Alert ref={ref} variant="info" {...props} />
);

AlertInfo.displayName = 'AlertInfo';

// Export variants and types
export { alertVariants, alertTitleVariants, alertDescriptionVariants };
export type { VariantProps };