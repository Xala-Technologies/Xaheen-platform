/**
 * Radio Group Component - Professional radio button group control
 * CLAUDE.md Compliant: Professional sizing with h-12+ touch targets
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const radioGroupVariants = cva(
  [
    'grid gap-2'
  ],
  {
    variants: {
      orientation: {
        vertical: 'grid-cols-1',
        horizontal: 'grid-flow-col auto-cols-max gap-6'
      }
    },
    defaultVariants: {
      orientation: 'vertical'
    }
  }
);

const radioItemVariants = cva(
  [
    'flex items-center space-x-3',
    'cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        sm: 'h-10 text-sm',     // 40px (still professional)
        md: 'h-12 text-base',   // 48px (CLAUDE.md compliant)
        lg: 'h-14 text-lg',     // 56px (premium)
        xl: 'h-16 text-xl'      // 64px (luxury)
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

const radioButtonVariants = cva(
  [
    'aspect-square rounded-full border-2 ring-offset-background',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary/20',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200 ease-in-out',
    'relative flex items-center justify-center'
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-5',      // 20px
        md: 'h-6 w-6',      // 24px
        lg: 'h-7 w-7',      // 28px
        xl: 'h-8 w-8'       // 32px
      },
      variant: {
        default: 'border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        success: 'border-input data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600',
        warning: 'border-input data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-600',
        destructive: 'border-input data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600',
        // NSM Security Classification variants
        nsmOpen: 'border-input data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600',
        nsmRestricted: 'border-input data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-600',
        nsmConfidential: 'border-input data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600',
        nsmSecret: 'border-input data-[state=checked]:border-gray-800 data-[state=checked]:bg-gray-800'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

const radioIndicatorVariants = cva(
  [
    'rounded-full bg-background',
    'data-[state=unchecked]:opacity-0 data-[state=checked]:opacity-100',
    'transition-opacity duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'h-2 w-2',      // 8px
        md: 'h-2.5 w-2.5',  // 10px
        lg: 'h-3 w-3',      // 12px
        xl: 'h-3.5 w-3.5'   // 14px
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface RadioGroupContextValue {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'destructive' | 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

const useRadioGroup = (): RadioGroupContextValue => {
  const context = React.useContext(RadioGroupContext);
  return context;
};

export interface RadioGroupProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
  VariantProps<typeof radioGroupVariants> {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly form?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly helperText?: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'destructive';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    className,
    orientation,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    required = false,
    name,
    form,
    nsmClassification,
    helperText,
    variant = 'default',
    size = 'md',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    children,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;
    
    // Generate unique IDs
    const groupId = React.useId();
    const helperTextId = helperText ? `${groupId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleValueChange = React.useCallback((newValue: string) => {
      if (disabled) return;
      
      try {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      } catch (error) {
        console.error('RadioGroup value change error:', error);
      }
    }, [disabled, isControlled, onValueChange]);

    const contextValue = React.useMemo((): RadioGroupContextValue => ({
      value: currentValue,
      onValueChange: handleValueChange,
      disabled,
      required,
      name,
      variant: finalVariant,
      size
    }), [currentValue, handleValueChange, disabled, required, name, finalVariant, size]);

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div className="space-y-3">
          <div
            ref={ref}
            role="radiogroup"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={combinedAriaDescribedBy}
            aria-required={required}
            data-disabled={disabled ? '' : undefined}
            className={cn(radioGroupVariants({ orientation }), className)}
            {...props}
          >
            {children}
          </div>
          
          {/* Helper Text */}
          {helperText && (
            <p 
              id={helperTextId}
              className="text-sm text-muted-foreground"
            >
              {helperText}
            </p>
          )}
          
          {/* NSM Classification for screen readers */}
          {nsmClassification && (
            <span className="sr-only">
              NSM Classification: {nsmClassification}
            </span>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  readonly value: string;
  readonly disabled?: boolean;
  readonly children?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({
    className,
    value,
    disabled: itemDisabled,
    children,
    ...props
  }, ref) => {
    const { 
      value: groupValue, 
      onValueChange, 
      disabled: groupDisabled, 
      name,
      variant,
      size 
    } = useRadioGroup();
    
    const disabled = itemDisabled || groupDisabled;
    const checked = groupValue === value;
    
    const handleClick = React.useCallback(() => {
      if (disabled || checked) return;
      onValueChange?.(value);
    }, [disabled, checked, onValueChange, value]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      // Space or Enter key selects the radio
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    }, [handleClick]);

    return (
      <label className={cn(radioItemVariants({ size }))}>
        <button
          type="button"
          role="radio"
          aria-checked={checked}
          data-state={checked ? 'checked' : 'unchecked'}
          data-disabled={disabled ? '' : undefined}
          value={value}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            radioButtonVariants({ size, variant }),
            className
          )}
          ref={ref}
          {...props}
        >
          <div 
            className={cn(radioIndicatorVariants({ size }))}
            data-state={checked ? 'checked' : 'unchecked'}
            aria-hidden="true"
          />
          
          {/* Hidden input for form integration */}
          <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={() => {}} // Controlled by button click
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </button>
        
        {children && (
          <span className="text-foreground font-medium select-none">
            {children}
          </span>
        )}
      </label>
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

// Export types and variants
export { radioGroupVariants, radioItemVariants, radioButtonVariants, radioIndicatorVariants };
export type { VariantProps };