/**
 * Checkbox Component - React Platform Implementation
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const checkboxVariants = cva(
  [
    'peer appearance-none rounded border-2 transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'checked:bg-primary checked:border-primary',
    'relative cursor-pointer'
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
      },
      variant: {
        default: [
          'border-input hover:border-primary/50',
          'focus:ring-primary'
        ],
        destructive: [
          'border-destructive hover:border-destructive/70',
          'checked:bg-destructive checked:border-destructive',
          'focus:ring-destructive'
        ],
        success: [
          'border-green-500 hover:border-green-600',
          'checked:bg-green-500 checked:border-green-500',
          'focus:ring-green-500'
        ]
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  readonly label?: string;
  readonly onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, size, label, onCheckedChange, onChange, ...props }, ref) => {
    const id = React.useId();
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={cn(checkboxVariants({ variant, size }), className)}
          onChange={handleChange}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'ml-2 select-none cursor-pointer',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Add CSS for checkmark
const checkboxStyles = `
  input[type="checkbox"]:checked::before {
    content: "✓";
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }
  
  input[type="checkbox"]:checked.h-4::before {
    font-size: 0.75rem;
  }
  
  input[type="checkbox"]:checked.h-5::before {
    font-size: 0.875rem;
  }
  
  input[type="checkbox"]:checked.h-6::before {
    font-size: 1rem;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = checkboxStyles;
  document.head.appendChild(styleElement);
}