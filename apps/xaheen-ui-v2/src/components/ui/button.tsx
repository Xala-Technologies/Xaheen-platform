import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "rounded-lg shadow-sm",
    "whitespace-nowrap"
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-blue-600 text-white",
          "hover:bg-blue-700 active:bg-blue-800",
          "focus:ring-blue-500 shadow-md",
          "border border-blue-600"
        ].join(" "),
        secondary: [
          "bg-gray-100 text-gray-900",
          "hover:bg-gray-200 active:bg-gray-300",
          "focus:ring-gray-500 shadow-sm",
          "border border-gray-200"
        ].join(" "),
        outline: [
          "bg-transparent text-gray-700",
          "hover:bg-gray-50 active:bg-gray-100",
          "focus:ring-gray-500",
          "border-2 border-gray-300 hover:border-gray-400"
        ].join(" "),
        ghost: [
          "bg-transparent text-gray-700",
          "hover:bg-gray-50 active:bg-gray-100",
          "focus:ring-gray-500 shadow-none"
        ].join(" "),
        destructive: [
          "bg-red-600 text-white",
          "hover:bg-red-700 active:bg-red-800",
          "focus:ring-red-500 shadow-md",
          "border border-red-600"
        ].join(" ")
      },
      size: {
        sm: "h-10 px-4 text-sm",         // 40px height
        md: "h-12 px-6 text-base",       // 48px height (CLAUDE.md minimum)
        lg: "h-14 px-8 text-lg",         // 56px height (professional)
        xl: "h-16 px-10 text-xl",        // 64px height (premium)
        icon: "h-12 w-12 p-0"            // Icon-only button
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
      fullWidth: false
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        ) : (
          <>
            {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }