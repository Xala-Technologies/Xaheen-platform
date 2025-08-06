/**
 * Slider Component - Professional range input control
 * CLAUDE.md Compliant: Professional sizing with h-12+ touch targets
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const sliderRootVariants = cva(
  [
    'relative flex w-full touch-none select-none items-center',
    'cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        sm: 'h-10',     // 40px (still professional)
        md: 'h-12',     // 48px (CLAUDE.md compliant)
        lg: 'h-14',     // 56px (premium)
        xl: 'h-16'      // 64px (luxury)
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full flex-col'
      }
    },
    defaultVariants: {
      size: 'md',
      orientation: 'horizontal'
    }
  }
);

const sliderTrackVariants = cva(
  [
    'relative grow overflow-hidden rounded-full bg-secondary/20',
    'transition-colors duration-200'
  ],
  {
    variants: {
      size: {
        sm: 'h-2',      // 8px
        md: 'h-3',      // 12px
        lg: 'h-4',      // 16px
        xl: 'h-5'       // 20px
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full w-full'
      },
      variant: {
        default: 'bg-secondary/20',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        destructive: 'bg-red-100',
        // NSM Security Classification variants
        nsmOpen: 'bg-green-100 border-l-2 border-l-green-600',
        nsmRestricted: 'bg-yellow-100 border-l-2 border-l-yellow-600',
        nsmConfidential: 'bg-red-100 border-l-2 border-l-red-600',
        nsmSecret: 'bg-gray-100 border-l-2 border-l-gray-800'
      }
    },
    defaultVariants: {
      size: 'md',
      orientation: 'horizontal',
      variant: 'default'
    }
  }
);

const sliderRangeVariants = cva(
  [
    'absolute h-full rounded-full transition-all duration-200',
    'data-[disabled]:opacity-50'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        destructive: 'bg-red-600',
        nsmOpen: 'bg-green-600',
        nsmRestricted: 'bg-yellow-600',
        nsmConfidential: 'bg-red-600',
        nsmSecret: 'bg-gray-800'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const sliderThumbVariants = cva(
  [
    'block rounded-full border-2 border-primary bg-background ring-offset-background',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary/20',
    'disabled:pointer-events-none disabled:opacity-50',
    'hover:scale-105 active:scale-95',
    'shadow-md hover:shadow-lg'
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
        default: 'border-primary',
        success: 'border-green-600',
        warning: 'border-yellow-600',
        destructive: 'border-red-600',
        nsmOpen: 'border-green-600',
        nsmRestricted: 'border-yellow-600',
        nsmConfidential: 'border-red-600',
        nsmSecret: 'border-gray-800'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface SliderProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
  VariantProps<typeof sliderRootVariants> {
  readonly value?: number[];
  readonly defaultValue?: number[];
  readonly onValueChange?: (value: number[]) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly name?: string;
  readonly form?: string;
  readonly required?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly showValue?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly helperText?: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    className,
    size,
    orientation = 'horizontal',
    variant = 'default',
    value,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    name,
    form,
    required,
    nsmClassification,
    showValue = false,
    formatValue,
    helperText,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;
    
    // Generate unique IDs
    const sliderId = React.useId();
    const helperTextId = helperText ? `${sliderId}-helper` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleValueChange = React.useCallback((newValue: number[]) => {
      if (disabled) return;
      
      try {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      } catch (error) {
        console.error('Slider value change error:', error);
      }
    }, [disabled, isControlled, onValueChange]);

    const handleMouseDown = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      const rect = event.currentTarget.getBoundingClientRect();
      const percentage = orientation === 'horizontal' 
        ? (event.clientX - rect.left) / rect.width
        : 1 - (event.clientY - rect.top) / rect.height;
      
      const newValue = Math.round((min + percentage * (max - min)) / step) * step;
      const clampedValue = Math.max(min, Math.min(max, newValue));
      
      handleValueChange([clampedValue]);
    }, [disabled, orientation, min, max, step, handleValueChange]);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (disabled) return;
      
      const currentVal = currentValue[0] || min;
      let newValue = currentVal;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          newValue = Math.min(max, currentVal + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          newValue = Math.max(min, currentVal - step);
          break;
        case 'Home':
          event.preventDefault();
          newValue = min;
          break;
        case 'End':
          event.preventDefault();
          newValue = max;
          break;
        case 'PageUp':
          event.preventDefault();
          newValue = Math.min(max, currentVal + step * 10);
          break;
        case 'PageDown':
          event.preventDefault();
          newValue = Math.max(min, currentVal - step * 10);
          break;
        default:
          return;
      }
      
      handleValueChange([newValue]);
    }, [disabled, currentValue, min, max, step, handleValueChange]);

    const percentage = ((currentValue[0] || min) - min) / (max - min) * 100;

    const sliderElement = (
      <div className="space-y-2">
        {showValue && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatValue ? formatValue(min) : min}</span>
            <span className="font-medium text-foreground">
              {formatValue ? formatValue(currentValue[0] || min) : (currentValue[0] || min)}
            </span>
            <span>{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(sliderRootVariants({ size, orientation }), className)}
          role="slider"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={combinedAriaDescribedBy}
          aria-valuenow={currentValue[0] || min}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-required={required}
          aria-disabled={disabled}
          data-disabled={disabled ? '' : undefined}
          tabIndex={disabled ? -1 : 0}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {/* Track */}
          <div 
            className={cn(sliderTrackVariants({ 
              size, 
              orientation, 
              variant: finalVariant 
            }))}
          >
            {/* Range */}
            <div
              className={cn(sliderRangeVariants({ variant: finalVariant }))}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${percentage}%`
              }}
              data-disabled={disabled ? '' : undefined}
            />
          </div>
          
          {/* Thumb */}
          <div
            className={cn(sliderThumbVariants({ size, variant: finalVariant }))}
            style={{
              [orientation === 'horizontal' ? 'left' : 'bottom']: `${percentage}%`,
              transform: orientation === 'horizontal' 
                ? 'translateX(-50%)' 
                : 'translateY(50%)'
            }}
            aria-hidden="true"
          />
          
          {/* Hidden input for form integration */}
          <input
            type="range"
            name={name}
            form={form}
            value={currentValue[0] || min}
            min={min}
            max={max}
            step={step}
            required={required}
            disabled={disabled}
            onChange={() => {}} // Controlled by slider
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
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
    );

    return sliderElement;
  }
);

Slider.displayName = 'Slider';

// Export types and variants
export { sliderRootVariants, sliderTrackVariants, sliderRangeVariants, sliderThumbVariants };
export type { VariantProps };