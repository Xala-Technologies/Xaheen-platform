/**
 * Accordion Component - Collapsible Content Sections
 * CLAUDE.md Compliant: Professional sizing and spacing
 * WCAG AAA: Full keyboard navigation, ARIA support, and screen reader compatibility
 * CVA: Class Variance Authority for consistent styling
 * Universal Tokens: Uses design system tokens for consistency
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const accordionVariants = cva(
  [
    'border border-border rounded-lg',
    'bg-card text-card-foreground',
    'transition-all duration-200 ease-in-out'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-sm hover:shadow-md',
        elevated: 'shadow-md hover:shadow-lg',
        outline: 'shadow-none',
        ghost: 'border-transparent shadow-none',
        // NSM Security Classification variants
        nsmOpen: 'border-l-4 border-l-green-600 shadow-sm',
        nsmRestricted: 'border-l-4 border-l-yellow-600 shadow-sm',
        nsmConfidential: 'border-l-4 border-l-red-600 shadow-sm',
        nsmSecret: 'border-l-4 border-l-gray-800 shadow-sm'
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      collapsible: {
        single: '',
        multiple: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      collapsible: 'single'
    }
  }
);

const accordionItemVariants = cva(
  [
    'border-b border-border last:border-b-0',
    'transition-colors duration-200'
  ],
  {
    variants: {
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: ''
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);

const accordionTriggerVariants = cva(
  [
    'flex w-full items-center justify-between',
    'px-6 py-4 text-left font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
    'hover:bg-accent/5 active:bg-accent/10',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Professional minimum height
    'min-h-[3rem]'
  ],
  {
    variants: {
      size: {
        sm: 'px-4 py-3 text-sm min-h-[2.5rem]',
        md: 'px-6 py-4 text-base min-h-[3rem]',
        lg: 'px-8 py-5 text-lg min-h-[3.5rem]'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

const accordionContentVariants = cva(
  [
    'overflow-hidden transition-all duration-200 ease-in-out',
    'data-[state=closed]:animate-accordion-up',
    'data-[state=open]:animate-accordion-down'
  ]
);

const accordionContentInnerVariants = cva(
  [
    'pb-4 pt-0'
  ],
  {
    variants: {
      size: {
        sm: 'px-4 pb-3',
        md: 'px-6 pb-4', 
        lg: 'px-8 pb-5'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

// Types
export interface AccordionProps extends 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'type'>,
  VariantProps<typeof accordionVariants> {
  readonly type?: 'single' | 'multiple';
  readonly value?: string | string[];
  readonly defaultValue?: string | string[];
  readonly onValueChange?: (value: string | string[]) => void;
  readonly disabled?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface AccordionItemProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof accordionItemVariants> {
  readonly value: string;
  readonly disabled?: boolean;
}

export interface AccordionTriggerProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof accordionTriggerVariants> {
  readonly hideChevron?: boolean;
  readonly customIcon?: React.ReactNode;
}

export interface AccordionContentProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof accordionContentVariants> {
  readonly forceMount?: boolean;
}

// Context for managing accordion state
interface AccordionContextType {
  type: 'single' | 'multiple';
  value: string | string[];
  onItemToggle: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

// Hook to use accordion context
function useAccordionContext(): AccordionContextType {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

// Context for individual accordion items
interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | null>(null);

function useAccordionItemContext(): AccordionItemContextType {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger and AccordionContent must be used within an AccordionItem');
  }
  return context;
}

// Main Accordion Component
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'single',
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    nsmClassification,
    children,
    ...props 
  }, ref) => {
    // State management for uncontrolled accordion
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue || (type === 'multiple' ? [] : '')
    );
    
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    
    // Auto-select NSM variant if classification is provided
    const finalVariant = nsmClassification 
      ? `nsm${nsmClassification.charAt(0).toUpperCase() + nsmClassification.slice(1).toLowerCase()}` as 'nsmOpen' | 'nsmRestricted' | 'nsmConfidential' | 'nsmSecret'
      : variant;

    const handleItemToggle = React.useCallback((itemValue: string) => {
      if (disabled) return;
      
      let newValue: string | string[];
      
      if (type === 'multiple') {
        const currentArray = Array.isArray(value) ? value : [];
        newValue = currentArray.includes(itemValue)
          ? currentArray.filter(v => v !== itemValue)
          : [...currentArray, itemValue];
      } else {
        newValue = value === itemValue ? '' : itemValue;
      }
      
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      
      onValueChange?.(newValue);
    }, [disabled, type, value, isControlled, onValueChange]);

    const contextValue: AccordionContextType = {
      type,
      value,
      onItemToggle: handleItemToggle,
      disabled,
      size
    };

    return (
      <AccordionContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(accordionVariants({ variant: finalVariant, size }), className)}
          data-orientation="vertical"
          {...props}
        >
          {/* NSM Classification for screen readers */}
          {nsmClassification && (
            <span className="sr-only">
              NSM Classification: {nsmClassification}
            </span>
          )}
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = 'Accordion';

// Accordion Item Component
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ 
    className, 
    value: itemValue, 
    disabled: itemDisabled = false, 
    children, 
    ...props 
  }, ref) => {
    const { value, onItemToggle, disabled: accordionDisabled, type } = useAccordionContext();
    
    const isDisabled = accordionDisabled || itemDisabled;
    const isOpen = type === 'multiple' 
      ? Array.isArray(value) && value.includes(itemValue)
      : value === itemValue;

    const handleToggle = React.useCallback(() => {
      if (!isDisabled) {
        onItemToggle(itemValue);
      }
    }, [isDisabled, onItemToggle, itemValue]);

    const itemContextValue: AccordionItemContextType = {
      value: itemValue,
      isOpen,
      disabled: isDisabled,
      onToggle: handleToggle
    };

    return (
      <AccordionItemContext.Provider value={itemContextValue}>
        <div
          ref={ref}
          className={cn(accordionItemVariants({ disabled: isDisabled }), className)}
          data-state={isOpen ? 'open' : 'closed'}
          data-disabled={isDisabled || undefined}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

// Accordion Trigger Component
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ 
    className, 
    size, 
    hideChevron = false, 
    customIcon,
    children, 
    ...props 
  }, ref) => {
    const { size: accordionSize } = useAccordionContext();
    const { isOpen, disabled, onToggle, value } = useAccordionItemContext();
    
    const finalSize = size || accordionSize;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(accordionTriggerVariants({ size: finalSize }), className)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${value}`}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={onToggle}
        {...props}
      >
        <span className="text-left">{children}</span>
        
        {!hideChevron && (
          <span 
            className={cn(
              'ml-2 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          >
            {customIcon || (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </span>
        )}
      </button>
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

// Accordion Content Component
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, size, children, forceMount = false, ...props }, ref) => {
    const { size: accordionSize } = useAccordionContext();
    const { isOpen, value } = useAccordionItemContext();
    
    const finalSize = size || accordionSize;

    if (!forceMount && !isOpen) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(accordionContentVariants(), className)}
        id={`accordion-content-${value}`}
        role="region"
        aria-labelledby={`accordion-trigger-${value}`}
        data-state={isOpen ? 'open' : 'closed'}
        style={{
          '--accordion-content-height': 'var(--radix-accordion-content-height)',
          '--accordion-content-width': 'var(--radix-accordion-content-width)',
        } as React.CSSProperties}
        {...props}
      >
        <div className={cn(accordionContentInnerVariants({ size: finalSize }))}>
          {children}
        </div>
      </div>
    );
  }
);

AccordionContent.displayName = 'AccordionContent';

// Export variants and types
export { accordionVariants, accordionItemVariants, accordionTriggerVariants, accordionContentVariants };
export type { VariantProps };