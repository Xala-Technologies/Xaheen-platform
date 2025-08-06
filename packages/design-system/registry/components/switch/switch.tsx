/**
 * Switch Component - Professional toggle switch control
 * CLAUDE.md Compliant: Professional sizing with h-12+ touch targets
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const switchVariants = cva(
  [
    'peer inline-flex shrink-0 cursor-pointer items-center',
    'rounded-full border-2 border-transparent',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary/20 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Professional sizing - minimum h-12 for accessibility
    'relative'
  ],
  {
    variants: {
      size: {
        sm: 'h-10 w-18',    // 40px x 72px (still professional)
        md: 'h-12 w-20',    // 48px x 80px (CLAUDE.md compliant)
        lg: 'h-14 w-24',    // 56px x 96px (premium)
        xl: 'h-16 w-28'     // 64px x 112px (luxury)
      },
      variant: {
        default: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        success: 'data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-input',
        warning: 'data-[state=checked]:bg-yellow-600 data-[state=unchecked]:bg-input',
        destructive: 'data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-input',
        // NSM Security Classification variants
        nsmOpen: 'data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-input border-l-4 border-l-green-600',
        nsmRestricted: 'data-[state=checked]:bg-yellow-600 data-[state=unchecked]:bg-input border-l-4 border-l-yellow-600',
        nsmConfidential: 'data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-input border-l-4 border-l-red-600',
        nsmSecret: 'data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-input border-l-4 border-l-gray-800'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

const switchThumbVariants = cva(
  [
    'pointer-events-none block rounded-full bg-background shadow-lg ring-0',
    'transition-transform duration-200 ease-in-out',
    'data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0'
  ],
  {
    variants: {
      size: {
        sm: 'h-8 w-8',      // 32px
        md: 'h-10 w-10',    // 40px
        lg: 'h-12 w-12',    // 48px  
        xl: 'h-14 w-14'     // 56px
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface SwitchProps extends 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
  VariantProps<typeof switchVariants> {
  readonly checked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly defaultChecked?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly value?: string;
  readonly form?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly description?: string;
  readonly helperText?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({
    className,
    size,
    variant,
    checked,
    onCheckedChange,
    defaultChecked = false,
    disabled,
    required,
    name,
    value,
    form,
    nsmClassification,
    description,
    helperText,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const checkedState = isControlled ? checked : internalChecked;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;
    
    // Generate unique IDs for helper text and description
    const switchId = React.useId();
    const descriptionId = description ? `${switchId}-description` : undefined;
    const helperTextId = helperText ? `${switchId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, descriptionId, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleToggle = React.useCallback(() => {
      if (disabled) return;
      
      try {
        const newChecked = !checkedState;
        
        if (!isControlled) {
          setInternalChecked(newChecked);
        }
        
        onCheckedChange?.(newChecked);
      } catch (error) {
        console.error('Switch toggle error:', error);
      }
    }, [disabled, checkedState, isControlled, onCheckedChange]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      // Space or Enter key toggles the switch
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleToggle();
      }
    }, [handleToggle]);

    const switchElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checkedState}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={combinedAriaDescribedBy}
        aria-required={required}
        data-state={checkedState ? 'checked' : 'unchecked'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(switchVariants({ size, variant: finalVariant }), className)}
        ref={ref}
        {...props}
      >
        <span 
          className={cn(switchThumbVariants({ size }))}
          data-state={checkedState ? 'checked' : 'unchecked'}
          aria-hidden="true"
        />
        
        {/* Hidden input for form integration */}
        <input
          type="checkbox"
          name={name}
          value={value}
          form={form}
          checked={checkedState}
          required={required}
          onChange={() => {}} // Controlled by switch toggle
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </button>
    );

    // If no description or helper text, return switch directly
    if (!description && !helperText && !nsmClassification) {
      return switchElement;
    }

    // Otherwise, wrap with additional elements
    return (
      <div className="space-y-2">
        {switchElement}
        
        {/* Description */}
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
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
    );
  }
);

Switch.displayName = 'Switch';

// Export types and variants
export { switchVariants, switchThumbVariants };
export type { VariantProps };