/**
 * Label Component - Form Field Labels
 * CLAUDE.md Compliant: Professional styling and accessibility standards
 * WCAG AAA: Proper form labeling, required indicators, and screen reader support
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const labelVariants = cva(
  [
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    'cursor-pointer select-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-blue-600 dark:text-blue-400',
        // NSM Security Classification variants
        nsmOpen: 'text-green-700 dark:text-green-400',
        nsmRestricted: 'text-yellow-700 dark:text-yellow-400',
        nsmConfidential: 'text-red-700 dark:text-red-400',
        nsmSecret: 'text-gray-700 dark:text-gray-400'
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
      },
      required: {
        true: 'after:content-["*"] after:ml-1 after:text-destructive after:font-medium',
        false: ''
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      weight: 'medium',
      required: false,
      disabled: false
    }
  }
);

const labelHelpTextVariants = cva(
  [
    'mt-1 block text-xs text-muted-foreground'
  ],
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        muted: 'text-muted-foreground/70',
        destructive: 'text-destructive/70',
        success: 'text-green-600/70 dark:text-green-400/70',
        warning: 'text-yellow-600/70 dark:text-yellow-400/70',
        info: 'text-blue-600/70 dark:text-blue-400/70'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

// Types
export interface LabelProps extends 
  React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> {
  readonly helpText?: string;
  readonly tooltip?: string;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly requiredIndicator?: React.ReactNode;
  readonly optional?: boolean;
}

export interface LabelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly orientation?: 'horizontal' | 'vertical';
  readonly spacing?: 'tight' | 'normal' | 'loose';
}

// Main Label Component
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    size = 'md',
    variant = 'default',
    weight = 'medium',
    required = false,
    disabled = false,
    helpText,
    tooltip,
    nsmClassification,
    requiredIndicator,
    optional = false,
    children,
    htmlFor,
    ...props 
  }, ref) => {
    const labelId = React.useId();
    const helpTextId = helpText ? `${labelId}-help` : undefined;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    return (
      <div className="flex flex-col">
        <label
          ref={ref}
          htmlFor={htmlFor}
          className={cn(
            labelVariants({ 
              size, 
              variant: finalVariant, 
              weight, 
              required: required && !optional, 
              disabled 
            }),
            className
          )}
          title={tooltip}
          {...props}
        >
          <span className="flex items-center gap-2">
            {children}
            
            {/* Custom Required Indicator */}
            {required && !optional && requiredIndicator && (
              <span className="text-destructive" aria-label="Obligatorisk felt">
                {requiredIndicator}
              </span>
            )}
            
            {/* Optional Indicator */}
            {optional && (
              <span className="text-muted-foreground text-xs font-normal">
                (valgfritt)
              </span>
            )}
            
            {/* Tooltip Indicator */}
            {tooltip && (
              <span 
                className="text-muted-foreground hover:text-foreground cursor-help transition-colors"
                title={tooltip}
                aria-label="Hjelpetekst tilgjengelig"
              >
                ℹ
              </span>
            )}
          </span>
        </label>
        
        {/* Help Text */}
        {helpText && (
          <span 
            id={helpTextId}
            className={cn(labelHelpTextVariants({ variant: finalVariant }))}
            role="note"
          >
            {helpText}
          </span>
        )}
        
        {/* NSM Classification for screen readers */}
        {nsmClassification && (
          <span className="sr-only">
            Felt NSM-klassifisering: {nsmClassification}
          </span>
        )}
      </div>
    );
  }
);

Label.displayName = 'Label';

// Label Group Component - For grouping related labels
export const LabelGroup = React.forwardRef<HTMLDivElement, LabelGroupProps>(
  ({ 
    className, 
    orientation = 'vertical',
    spacing = 'normal',
    children,
    ...props 
  }, ref) => {
    const spacingClasses = {
      tight: orientation === 'vertical' ? 'space-y-2' : 'space-x-2',
      normal: orientation === 'vertical' ? 'space-y-4' : 'space-x-4',
      loose: orientation === 'vertical' ? 'space-y-6' : 'space-x-6'
    };

    const orientationClasses = {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row items-center'
    };

    return (
      <div
        ref={ref}
        className={cn(
          orientationClasses[orientation],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LabelGroup.displayName = 'LabelGroup';

// Floating Label Component - For input fields with floating labels
export interface FloatingLabelProps extends LabelProps {
  readonly active?: boolean;
  readonly focused?: boolean;
  readonly hasValue?: boolean;
}

export const FloatingLabel = React.forwardRef<HTMLLabelElement, FloatingLabelProps>(
  ({ 
    className, 
    active = false,
    focused = false,
    hasValue = false,
    size = 'md',
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const isFloating = active || focused || hasValue;

    const floatingClasses = isFloating
      ? 'transform -translate-y-3 scale-75 origin-top-left'
      : 'transform translate-y-0 scale-100';

    const sizeClasses = {
      sm: isFloating ? 'text-xs' : 'text-sm',
      md: isFloating ? 'text-xs' : 'text-base',
      lg: isFloating ? 'text-sm' : 'text-lg',
      xl: isFloating ? 'text-base' : 'text-xl'
    };

    return (
      <Label
        ref={ref}
        className={cn(
          'absolute left-3 transition-all duration-200 ease-in-out pointer-events-none',
          floatingClasses,
          sizeClasses[size],
          focused && 'text-primary',
          className
        )}
        size={size}
        variant={variant}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

FloatingLabel.displayName = 'FloatingLabel';

// Label with Icon Component
export interface LabelWithIconProps extends LabelProps {
  readonly icon?: React.ReactNode;
  readonly iconPosition?: 'left' | 'right';
}

export const LabelWithIcon = React.forwardRef<HTMLLabelElement, LabelWithIconProps>(
  ({ 
    className, 
    icon,
    iconPosition = 'left',
    children,
    ...props 
  }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        <span className="flex-1">
          {children}
        </span>
        
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </Label>
    );
  }
);

LabelWithIcon.displayName = 'LabelWithIcon';

// Field Label Component - Specifically for form fields with enhanced features
export interface FieldLabelProps extends LabelProps {
  readonly fieldId: string;
  readonly error?: string;
  readonly description?: string;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ 
    className, 
    fieldId,
    error,
    description,
    variant,
    helpText,
    children,
    ...props 
  }, ref) => {
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;
    
    // Override variant based on error state
    const finalVariant = error ? 'destructive' : variant;
    const finalHelpText = error || helpText || description;

    return (
      <Label
        ref={ref}
        htmlFor={fieldId}
        className={className}
        variant={finalVariant}
        helpText={finalHelpText}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

FieldLabel.displayName = 'FieldLabel';

// Label variants for convenience
export interface LabelTypeProps extends Omit<LabelProps, 'variant'> {}

export const LabelRequired = React.forwardRef<HTMLLabelElement, LabelTypeProps>(
  (props, ref) => <Label ref={ref} variant="default" required {...props} />
);
LabelRequired.displayName = 'LabelRequired';

export const LabelOptional = React.forwardRef<HTMLLabelElement, LabelTypeProps>(
  (props, ref) => <Label ref={ref} variant="default" optional {...props} />
);
LabelOptional.displayName = 'LabelOptional';

export const LabelError = React.forwardRef<HTMLLabelElement, LabelTypeProps>(
  (props, ref) => <Label ref={ref} variant="destructive" {...props} />
);
LabelError.displayName = 'LabelError';

export const LabelSuccess = React.forwardRef<HTMLLabelElement, LabelTypeProps>(
  (props, ref) => <Label ref={ref} variant="success" {...props} />
);
LabelSuccess.displayName = 'LabelSuccess';

export const LabelMuted = React.forwardRef<HTMLLabelElement, LabelTypeProps>(
  (props, ref) => <Label ref={ref} variant="muted" {...props} />
);
LabelMuted.displayName = 'LabelMuted';

// Export variants and types
export { labelVariants, labelHelpTextVariants };
export type { VariantProps };