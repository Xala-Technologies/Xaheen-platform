import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "flex w-full transition-all duration-200",
    "bg-background text-foreground placeholder:text-muted-foreground",
    "border rounded-lg shadow-sm",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
  ].join(' '),
  {
    variants: {
      variant: {
        default: "border-input focus:border-ring",
        filled: "bg-muted border-transparent focus:bg-background focus:border-ring",
        outline: "border-2 border-border focus:border-ring",
        search: [
          "pl-10 pr-4 bg-muted/50 border-transparent",
          "focus:bg-background focus:border-ring"
        ].join(' ')
      },
      size: {
        // CLAUDE.md compliant professional sizing
        sm: "h-11 px-3 py-2 text-sm",      // 44px height (accessibility minimum)
        default: "h-14 px-4 py-3 text-base", // 56px height (professional standard)
        lg: "h-16 px-6 py-4 text-lg",      // 64px height (premium)
        xl: "h-[72px] px-8 py-5 text-xl"   // 72px height (extra large)
      },
      state: {
        default: "",
        invalid: "border-destructive focus:border-destructive focus:ring-destructive/20",
        valid: "border-success focus:border-success focus:ring-success/20"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", // Professional default - 56px height
      state: "default"
    }
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly error?: boolean;
  readonly success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    variant,
    size,
    state: stateProp,
    leftIcon,
    rightIcon,
    error,
    success,
    disabled,
    ...props 
  }, ref): JSX.Element => {
    // Determine state based on error/success props
    const state = error ? 'invalid' : success ? 'valid' : stateProp;
    
    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, size, state }),
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={error || undefined}
        {...props}
      />
    );

    // If no icons, return input directly
    if (!leftIcon && !rightIcon) {
      return inputElement;
    }

    // Wrap with icon container
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };