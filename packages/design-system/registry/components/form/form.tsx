/**
 * Form Component - Form Container with Validation
 * CLAUDE.md Compliant: Professional form styling and validation
 * WCAG AAA: Proper form labeling, error handling, and accessibility support
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 * Norwegian locale support with proper formatting and validation
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const formVariants = cva(
  [
    'space-y-6'
  ],
  {
    variants: {
      layout: {
        vertical: 'space-y-6',
        horizontal: 'space-y-4',
        inline: 'flex flex-wrap gap-4',
        grid: 'grid gap-4'
      },
      size: {
        sm: 'text-sm space-y-4',
        md: 'text-base space-y-6',
        lg: 'text-lg space-y-8'
      },
      variant: {
        default: '',
        card: 'p-6 border border-border rounded-lg bg-card',
        elevated: 'p-8 border border-border rounded-xl bg-card shadow-lg',
        // NSM Security Classification variants
        nsmOpen: 'p-6 border-l-4 border-l-green-600 border border-border rounded-lg bg-card',
        nsmRestricted: 'p-6 border-l-4 border-l-yellow-600 border border-border rounded-lg bg-card',
        nsmConfidential: 'p-6 border-l-4 border-l-red-600 border border-border rounded-lg bg-card',
        nsmSecret: 'p-8 border-l-4 border-l-gray-800 border border-border rounded-xl bg-card shadow-lg'
      }
    },
    defaultVariants: {
      layout: 'vertical',
      size: 'md',
      variant: 'default'
    }
  }
);

const formFieldVariants = cva(
  [
    'space-y-2'
  ],
  {
    variants: {
      layout: {
        vertical: 'space-y-2',
        horizontal: 'flex items-center gap-4',
        inline: 'flex items-center gap-2'
      }
    },
    defaultVariants: {
      layout: 'vertical'
    }
  }
);

const formLabelVariants = cva(
  [
    'text-sm font-medium leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ],
  {
    variants: {
      required: {
        true: 'after:content-["*"] after:ml-1 after:text-destructive',
        false: ''
      },
      size: {
        sm: 'text-sm',
        md: 'text-base', 
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      required: false,
      size: 'md'
    }
  }
);

const formDescriptionVariants = cva(
  [
    'text-sm text-muted-foreground'
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

const formMessageVariants = cva(
  [
    'text-sm font-medium flex items-center gap-1.5'
  ],
  {
    variants: {
      type: {
        error: 'text-destructive',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-blue-600 dark:text-blue-400'
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      type: 'error',
      size: 'md'
    }
  }
);

// Types
export interface FormProps extends 
  React.FormHTMLAttributes<HTMLFormElement>,
  VariantProps<typeof formVariants> {
  readonly onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly onReset?: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly errors?: Record<string, string>;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly norwegianValidation?: boolean;
}

export interface FormFieldProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof formFieldVariants> {
  readonly name?: string;
  readonly error?: string;
  readonly success?: string;
  readonly warning?: string;
  readonly info?: string;
}

export interface FormLabelProps extends 
  React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof formLabelVariants> {
  readonly htmlFor: string;
}

export interface FormDescriptionProps extends 
  React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof formDescriptionVariants> {}

export interface FormMessageProps extends 
  React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof formMessageVariants> {
  readonly children: React.ReactNode;
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly name?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
}

// Context for form state management
interface FormContextType {
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  errors?: Record<string, string>;
  norwegianValidation?: boolean;
}

const FormContext = React.createContext<FormContextType>({});

export function useFormContext(): FormContextType {
  return React.useContext(FormContext);
}

// Norwegian validation patterns
const norwegianValidationPatterns = {
  phone: {
    pattern: /^(\+47)?[\s]?[2-9]\d{7}$/,
    message: 'Vennligst oppgi et gyldig norsk telefonnummer'
  },
  postalCode: {
    pattern: /^\d{4}$/,
    message: 'Postnummeret må være 4 siffer'
  },
  organizationNumber: {
    pattern: /^\d{9}$/,
    message: 'Organisasjonsnummeret må være 9 siffer'
  },
  nationalId: {
    pattern: /^\d{11}$/,
    message: 'Personnummeret må være 11 siffer'
  },
  bankAccount: {
    pattern: /^\d{4}[\s.]?\d{2}[\s.]?\d{5}$/,
    message: 'Vennligst oppgi et gyldig norsk kontonummer'
  }
};

// Main Form Component
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className, 
    layout = 'vertical',
    size = 'md',
    variant = 'default',
    loading = false,
    disabled = false,
    errors = {},
    nsmClassification,
    norwegianValidation = false,
    onSubmit,
    onReset,
    children,
    ...props 
  }, ref) => {
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    const contextValue: FormContextType = {
      layout,
      size,
      loading,
      disabled,
      errors,
      norwegianValidation
    };

    const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }
      onSubmit?.(event);
    }, [loading, disabled, onSubmit]);

    const handleReset = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
      onReset?.(event);
    }, [onReset]);

    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={ref}
          className={cn(
            formVariants({ layout, size, variant: finalVariant }),
            loading && 'opacity-70 pointer-events-none',
            className
          )}
          onSubmit={handleSubmit}
          onReset={handleReset}
          noValidate={norwegianValidation}
          data-loading={loading || undefined}
          {...props}
        >
          {children}

          {/* NSM Classification for screen readers */}
          {nsmClassification && (
            <span className="sr-only">
              Skjema NSM-klassifisering: {nsmClassification}
            </span>
          )}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

// Form Field Component
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    layout: fieldLayout,
    name,
    error: fieldError,
    success,
    warning,
    info,
    children,
    ...props 
  }, ref) => {
    const { layout: formLayout, errors } = useFormContext();
    const finalLayout = fieldLayout || formLayout || 'vertical';
    const error = fieldError || (name && errors?.[name]);

    const fieldId = React.useId();
    const errorId = error ? `${fieldId}-error` : undefined;
    const descriptionId = `${fieldId}-description`;

    // Enhanced children with IDs for accessibility
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Clone with appropriate props based on component type
        const childProps: any = {
          ...child.props,
        };

        // Add error state to form controls
        if (error) {
          childProps.error = true;
          childProps['aria-invalid'] = true;
        }

        // Add describedby for accessibility
        const existingDescribedBy = child.props['aria-describedby'];
        const newDescribedBy = [existingDescribedBy, errorId].filter(Boolean).join(' ');
        if (newDescribedBy) {
          childProps['aria-describedby'] = newDescribedBy;
        }

        return React.cloneElement(child, childProps);
      }
      return child;
    });

    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ layout: finalLayout }), className)}
        {...props}
      >
        {enhancedChildren}
        
        {/* Error Message */}
        {error && (
          <FormMessage id={errorId} type="error">
            {error}
          </FormMessage>
        )}
        
        {/* Success Message */}
        {success && !error && (
          <FormMessage type="success">
            {success}
          </FormMessage>
        )}
        
        {/* Warning Message */}
        {warning && !error && !success && (
          <FormMessage type="warning">
            {warning}
          </FormMessage>
        )}
        
        {/* Info Message */}
        {info && !error && !success && !warning && (
          <FormMessage type="info">
            {info}
          </FormMessage>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Form Label Component
export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ 
    className, 
    required = false,
    size,
    children,
    ...props 
  }, ref) => {
    const { size: formSize } = useFormContext();
    const finalSize = size || formSize || 'md';

    return (
      <label
        ref={ref}
        className={cn(formLabelVariants({ required, size: finalSize }), className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

// Form Description Component
export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ 
    className, 
    size,
    ...props 
  }, ref) => {
    const { size: formSize } = useFormContext();
    const finalSize = size || formSize || 'md';

    return (
      <p
        ref={ref}
        className={cn(formDescriptionVariants({ size: finalSize }), className)}
        {...props}
      />
    );
  }
);

FormDescription.displayName = 'FormDescription';

// Form Message Component
export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ 
    className, 
    type = 'error',
    size,
    children,
    ...props 
  }, ref) => {
    const { size: formSize } = useFormContext();
    const finalSize = size || formSize || 'md';

    const getIcon = () => {
      switch (type) {
        case 'error':
          return <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />;
        case 'success':
          return <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />;
        default:
          return null;
      }
    };

    return (
      <p
        ref={ref}
        role={type === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        className={cn(formMessageVariants({ type, size: finalSize }), className)}
        {...props}
      >
        {getIcon()}
        <span>{children}</span>
      </p>
    );
  }
);

FormMessage.displayName = 'FormMessage';

// Form Control Component - Wrapper for form inputs
export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ 
    className, 
    name,
    required = false,
    disabled = false,
    error,
    children,
    ...props 
  }, ref) => {
    const { disabled: formDisabled, errors } = useFormContext();
    const isDisabled = disabled || formDisabled;
    const fieldError = error || (name && errors?.[name]);

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        data-disabled={isDisabled || undefined}
        data-error={fieldError ? true : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormControl.displayName = 'FormControl';

// Form Group Component - Groups related form fields
export interface FormGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  readonly legend?: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
}

export const FormGroup = React.forwardRef<HTMLFieldSetElement, FormGroupProps>(
  ({ 
    className, 
    legend,
    description,
    required = false,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    const { disabled: formDisabled } = useFormContext();
    const isDisabled = disabled || formDisabled;

    const groupId = React.useId();
    const descriptionId = description ? `${groupId}-description` : undefined;

    return (
      <fieldset
        ref={ref}
        disabled={isDisabled}
        aria-describedby={descriptionId}
        className={cn(
          'border border-border rounded-lg p-4 space-y-4',
          isDisabled && 'opacity-50',
          className
        )}
        {...props}
      >
        {legend && (
          <legend className={cn(
            'text-sm font-medium px-2 -ml-2',
            required && 'after:content-["*"] after:ml-1 after:text-destructive'
          )}>
            {legend}
          </legend>
        )}
        
        {description && (
          <FormDescription id={descriptionId}>
            {description}
          </FormDescription>
        )}
        
        {children}
      </fieldset>
    );
  }
);

FormGroup.displayName = 'FormGroup';

// Form Section Component - Logical sections within a form
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly title?: string;
  readonly description?: string;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ 
    className, 
    title,
    description,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <FormDescription>
                {description}
              </FormDescription>
            )}
          </div>
        )}
        
        {children}
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';

// Norwegian Validation Hook
export function useNorwegianValidation() {
  return React.useCallback((field: keyof typeof norwegianValidationPatterns, value: string): string | null => {
    const validation = norwegianValidationPatterns[field];
    if (!validation) return null;
    
    return validation.pattern.test(value) ? null : validation.message;
  }, []);
}

// Export variants and types
export { 
  formVariants, 
  formFieldVariants, 
  formLabelVariants, 
  formDescriptionVariants,
  formMessageVariants,
  norwegianValidationPatterns 
};
export type { VariantProps };