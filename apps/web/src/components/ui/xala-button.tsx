/**
 * CLAUDE.md Compliant Button Component
 * Xaheen CLI Ecosystem - Enterprise Grade
 * 
 * MANDATORY COMPLIANCE:
 * ✅ TypeScript strict mode with readonly interfaces
 * ✅ React functional component with JSX.Element return type
 * ✅ Professional sizing (h-12 minimum)
 * ✅ Full accessibility with ARIA attributes
 * ✅ Comprehensive error handling
 * ✅ Tailwind CSS only (no inline styles)
 * ✅ Norwegian compliance support
 */

import React, { useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// CLAUDE.md compliant button variants with professional sizing
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-3 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
        secondary: 'bg-gray-200 text-gray-900 shadow-md hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
        destructive: 'bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
        outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        norway: 'bg-[#0067C5] text-white shadow-md hover:bg-[#1E88E5] focus:ring-[#0067C5] active:bg-[#1565C0]'
      },
      size: {
        sm: 'h-12 px-6 text-sm gap-2 [&_svg]:h-4 [&_svg]:w-4',     // CLAUDE.md minimum h-12
        md: 'h-14 px-8 text-base gap-3 [&_svg]:h-5 [&_svg]:w-5',   // Recommended h-14
        lg: 'h-16 px-10 text-lg gap-4 [&_svg]:h-6 [&_svg]:w-6',    // Premium h-16
        xl: 'h-20 px-12 text-xl gap-4 [&_svg]:h-7 [&_svg]:w-7'     // Extra large h-20
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',  // Professional default h-14
      fullWidth: false
    }
  }
);

// CLAUDE.md compliant interface with readonly properties
interface XalaButtonProps extends 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
  VariantProps<typeof buttonVariants> {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly loading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly ariaLabel?: string;
  readonly ariaDescribedBy?: string;
  readonly ariaPressed?: boolean;
  readonly dataTestId?: string;
}

// CLAUDE.md compliant functional component with JSX.Element return type
export const XalaButton = ({
  children,
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  dataTestId,
  onClick,
  ...props
}: XalaButtonProps): JSX.Element => {
  // Error handling wrapper
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      if (!loading && !disabled && onClick) {
        onClick(event);
      }
    } catch (error) {
      console.error('XalaButton click error:', error);
      // Could integrate with error reporting service here
    }
  }, [loading, disabled, onClick]);

  // Memoize button classes for performance
  const buttonClasses = useMemo(() => {
    return buttonVariants({ variant, size, fullWidth, className });
  }, [variant, size, fullWidth, className]);

  // Loading spinner component
  const LoadingSpinner = (): JSX.Element => (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  try {
    return (
      <button
        className={buttonClasses}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        aria-busy={loading}
        data-testid={dataTestId}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  } catch (error) {
    console.error('XalaButton render error:', error);
    return (
      <div className="inline-flex items-center justify-center h-14 px-8 bg-red-100 text-red-700 rounded-lg">
        Error rendering button
      </div>
    );
  }
};

// Export button variants for external use
export { buttonVariants };

// Default export for convenience
export default XalaButton;