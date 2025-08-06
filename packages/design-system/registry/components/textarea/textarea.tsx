/**
 * Textarea Component - Professional multi-line text input
 * CLAUDE.md Compliant: Professional sizing with minimum height standards
 * WCAG AAA: Full keyboard support, screen reader compatibility, and proper labeling
 * Universal tokens integration for consistent theming
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const textareaVariants = cva(
  [
    'flex w-full rounded-lg border-2 border-input bg-background',
    'px-4 py-3 text-base text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary/20 focus-visible:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200 ease-in-out',
    'resize-y',
    // Autofill styles
    'autofill:bg-background',
    // High contrast mode
    'contrast-more:border-2'
  ],
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive',
        success: 'border-green-600 focus-visible:ring-green-600/20 focus-visible:border-green-600',
        warning: 'border-yellow-600 focus-visible:ring-yellow-600/20 focus-visible:border-yellow-600',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600',
        nsmRestricted: 'border-l-4 border-l-yellow-600',
        nsmConfidential: 'border-l-4 border-l-red-600',
        nsmSecret: 'border-l-4 border-l-gray-800'
      },
      size: {
        sm: 'min-h-20 text-sm px-3 py-2',      // 80px minimum (professional)
        md: 'min-h-24 text-base px-4 py-3',    // 96px minimum (CLAUDE.md compliant)
        lg: 'min-h-32 text-lg px-5 py-4',      // 128px minimum (premium)
        xl: 'min-h-40 text-xl px-6 py-5'       // 160px minimum (luxury)
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resize: 'vertical'
    }
  }
);

export interface TextareaProps extends 
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
  VariantProps<typeof textareaVariants> {
  readonly error?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  readonly helperText?: string;
  readonly characterCount?: boolean;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    resize,
    error,
    success,
    warning,
    helperText,
    characterCount = false,
    maxLength,
    minLength,
    nsmClassification,
    autoResize = false,
    disabled,
    value,
    defaultValue,
    onChange,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Use forwarded ref or internal ref
    React.useImperativeHandle(ref, () => textareaRef.current!);
    
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    // Determine variant based on state
    const stateVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : stateVariant;
    
    // Generate unique IDs
    const textareaId = React.useId();
    const helperTextId = helperText ? `${textareaId}-helper` : undefined;
    const countId = characterCount ? `${textareaId}-count` : undefined;
    const combinedAriaDescribedBy = [ariaDescribedBy, helperTextId, countId]
      .filter(Boolean)
      .join(' ') || undefined;

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      if (!autoResize || !textareaRef.current) return;
      
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [autoResize]);

    React.useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [currentValue, autoResize, adjustHeight]);

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
      try {
        if (!isControlled) {
          setInternalValue(event.target.value);
        }
        
        onChange?.(event);
        
        if (autoResize) {
          adjustHeight();
        }
      } catch (error) {
        console.error('Textarea change error:', error);
      }
    }, [isControlled, onChange, autoResize, adjustHeight]);

    // Character count calculation
    const characterCountCurrent = String(currentValue || '').length;
    const isOverLimit = maxLength ? characterCountCurrent > maxLength : false;
    const isUnderLimit = minLength ? characterCountCurrent < minLength : false;

    const textareaElement = (
      <textarea
        className={cn(
          textareaVariants({ 
            variant: finalVariant, 
            size, 
            resize: autoResize ? 'none' : resize 
          }),
          className
        )}
        ref={textareaRef}
        disabled={disabled}
        value={currentValue}
        maxLength={maxLength}
        minLength={minLength}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={combinedAriaDescribedBy}
        onChange={handleChange}
        {...props}
      />
    );

    // If no helper text, character count, or NSM classification, return textarea directly
    if (!helperText && !characterCount && !nsmClassification) {
      return textareaElement;
    }

    // Otherwise, wrap with additional elements
    return (
      <div className="space-y-2">
        {textareaElement}
        
        <div className="flex justify-between items-start">
          {/* Helper Text */}
          {helperText && (
            <p 
              id={helperTextId}
              className={cn(
                'text-sm',
                error && 'text-destructive',
                success && 'text-green-600',
                warning && 'text-yellow-600',
                !error && !success && !warning && 'text-muted-foreground'
              )}
            >
              {helperText}
            </p>
          )}
          
          {/* Character Count */}
          {characterCount && (
            <p 
              id={countId}
              className={cn(
                'text-sm tabular-nums',
                isOverLimit && 'text-destructive font-medium',
                isUnderLimit && minLength && 'text-yellow-600',
                !isOverLimit && !isUnderLimit && 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {characterCountCurrent}
              {maxLength && (
                <span className="text-muted-foreground">
                  /{maxLength}
                </span>
              )}
            </p>
          )}
        </div>
        
        {/* Validation Messages */}
        {isOverLimit && maxLength && (
          <p className="text-sm text-destructive" role="alert">
            Character limit exceeded by {characterCountCurrent - maxLength}
          </p>
        )}
        
        {isUnderLimit && minLength && (
          <p className="text-sm text-yellow-600" role="alert">
            Minimum {minLength - characterCountCurrent} more characters required
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

Textarea.displayName = 'Textarea';

// Export types and variants
export { textareaVariants };
export type { VariantProps };