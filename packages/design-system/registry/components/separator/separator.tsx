/**
 * Separator Component - Professional Visual Content Dividers
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// SEPARATOR VARIANTS
// =============================================================================

const separatorVariants = cva(
  [
    'shrink-0',
    'transition-colors duration-200'
  ],
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'w-px h-full'
      },
      variant: {
        default: 'bg-border',
        solid: 'bg-border',
        dashed: 'border-dashed bg-transparent',
        dotted: 'border-dotted bg-transparent',
        gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
        primary: 'bg-primary/20',
        secondary: 'bg-secondary',
        muted: 'bg-muted',
        accent: 'bg-accent'
      },
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
        xl: ''
      },
      spacing: {
        none: '',
        xs: 'my-1',
        sm: 'my-2', 
        md: 'my-4',
        lg: 'my-6',
        xl: 'my-8'
      },
      decorative: {
        true: '',
        false: ''
      }
    },
    compoundVariants: [
      // Horizontal size variants
      {
        orientation: 'horizontal',
        size: 'xs',
        className: 'h-px'
      },
      {
        orientation: 'horizontal', 
        size: 'sm',
        className: 'h-px'
      },
      {
        orientation: 'horizontal',
        size: 'md', 
        className: 'h-0.5'
      },
      {
        orientation: 'horizontal',
        size: 'lg',
        className: 'h-1'
      },
      {
        orientation: 'horizontal',
        size: 'xl',
        className: 'h-2'
      },
      // Vertical size variants
      {
        orientation: 'vertical',
        size: 'xs',
        className: 'w-px'
      },
      {
        orientation: 'vertical',
        size: 'sm', 
        className: 'w-px'
      },
      {
        orientation: 'vertical',
        size: 'md',
        className: 'w-0.5'
      },
      {
        orientation: 'vertical',
        size: 'lg',
        className: 'w-1'
      },
      {
        orientation: 'vertical',
        size: 'xl',
        className: 'w-2'
      },
      // Dashed/dotted variants need border instead of background
      {
        variant: 'dashed',
        orientation: 'horizontal',
        className: 'border-t border-dashed border-border bg-transparent'
      },
      {
        variant: 'dashed',
        orientation: 'vertical',
        className: 'border-l border-dashed border-border bg-transparent'
      },
      {
        variant: 'dotted',
        orientation: 'horizontal', 
        className: 'border-t border-dotted border-border bg-transparent'
      },
      {
        variant: 'dotted',
        orientation: 'vertical',
        className: 'border-l border-dotted border-border bg-transparent'
      },
      // Vertical spacing adjustments
      {
        orientation: 'vertical',
        spacing: 'xs',
        className: 'mx-1 my-0'
      },
      {
        orientation: 'vertical',
        spacing: 'sm',
        className: 'mx-2 my-0'
      },
      {
        orientation: 'vertical',
        spacing: 'md',
        className: 'mx-4 my-0'
      },
      {
        orientation: 'vertical',
        spacing: 'lg',
        className: 'mx-6 my-0'
      },
      {
        orientation: 'vertical',
        spacing: 'xl',
        className: 'mx-8 my-0'
      }
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      size: 'sm',
      spacing: 'none',
      decorative: true
    }
  }
);

const separatorLabelVariants = cva([
  'flex items-center',
  'text-sm text-muted-foreground',
  'whitespace-nowrap'
]);

const separatorContentVariants = cva([
  'relative flex items-center justify-center'
]);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface SeparatorProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof separatorVariants> {
  readonly ariaLabel?: string;
  readonly ariaOrientation?: 'horizontal' | 'vertical';
}

export interface SeparatorWithLabelProps extends 
  Omit<SeparatorProps, 'children'> {
  readonly label: string;
  readonly labelPosition?: 'left' | 'center' | 'right';
  readonly icon?: React.ReactNode;
}

export interface SeparatorWithIconProps extends 
  Omit<SeparatorProps, 'children'> {
  readonly icon: React.ReactNode;
  readonly iconPosition?: 'left' | 'center' | 'right';
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getDefaultAriaLabel = (
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  decorative: boolean = true
): string | undefined => {
  if (decorative) return undefined;
  return orientation === 'horizontal' ? 'Horizontal separator' : 'Vertical separator';
};

// =============================================================================
// SEPARATOR COMPONENTS
// =============================================================================

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(({
  className,
  orientation = 'horizontal',
  variant,
  size,
  spacing,
  decorative = true,
  ariaLabel,
  ariaOrientation,
  role,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(separatorVariants({ orientation, variant, size, spacing, decorative }), className)}
    role={decorative ? 'presentation' : role || 'separator'}
    aria-label={decorative ? undefined : (ariaLabel || getDefaultAriaLabel(orientation, decorative))}
    aria-orientation={decorative ? undefined : (ariaOrientation || orientation)}
    data-orientation={orientation}
    {...props}
  />
));

export const SeparatorWithLabel = React.forwardRef<HTMLDivElement, SeparatorWithLabelProps>(({
  className,
  orientation = 'horizontal',
  variant = 'default',
  size = 'sm',
  spacing,
  label,
  labelPosition = 'center',
  icon,
  ariaLabel,
  decorative = false,
  ...props
}, ref) => {
  if (orientation === 'vertical') {
    // Vertical separator with label is complex, fallback to basic separator
    return (
      <div className="flex flex-col items-center">
        <Separator 
          ref={ref}
          orientation="horizontal" 
          variant={variant}
          size={size}
          className={cn('w-px h-4', className)}
          decorative={decorative}
          ariaLabel={ariaLabel}
          {...props}
        />
        <span className={cn(separatorLabelVariants(), 'py-2 writing-mode-vertical')}>
          {icon && <span className="mb-2" aria-hidden="true">{icon}</span>}
          {label}
        </span>
        <Separator 
          orientation="horizontal" 
          variant={variant}
          size={size}
          className="w-px h-4"
          decorative
        />
      </div>
    );
  }

  const labelContent = (
    <span className={separatorLabelVariants()}>
      {icon && labelPosition !== 'right' && (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      )}
      {label}
      {icon && labelPosition === 'right' && (
        <span className="ml-2" aria-hidden="true">{icon}</span>
      )}
    </span>
  );

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center',
        spacing === 'xs' && 'my-1',
        spacing === 'sm' && 'my-2',
        spacing === 'md' && 'my-4',
        spacing === 'lg' && 'my-6',
        spacing === 'xl' && 'my-8',
        className
      )}
      role={decorative ? 'presentation' : 'separator'}
      aria-label={decorative ? undefined : (ariaLabel || `Separator with label: ${label}`)}
      data-orientation={orientation}
      {...props}
    >
      {labelPosition === 'left' && (
        <>
          {labelContent}
          <Separator
            variant={variant}
            size={size}
            className="flex-1 ml-4"
            decorative
          />
        </>
      )}
      
      {labelPosition === 'center' && (
        <>
          <Separator
            variant={variant}
            size={size}
            className="flex-1"
            decorative
          />
          <div className="px-4">
            {labelContent}
          </div>
          <Separator
            variant={variant}
            size={size}
            className="flex-1"
            decorative
          />
        </>
      )}
      
      {labelPosition === 'right' && (
        <>
          <Separator
            variant={variant}
            size={size}
            className="flex-1 mr-4"
            decorative
          />
          {labelContent}
        </>
      )}
    </div>
  );
});

export const SeparatorWithIcon = React.forwardRef<HTMLDivElement, SeparatorWithIconProps>(({
  className,
  orientation = 'horizontal',
  variant = 'default',
  size = 'sm',
  spacing,
  icon,
  iconPosition = 'center',
  ariaLabel,
  decorative = true,
  ...props
}, ref) => {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center">
        <Separator 
          ref={ref}
          orientation="horizontal" 
          variant={variant}
          size={size}
          className={cn('w-px h-4', className)}
          decorative={decorative}
          ariaLabel={ariaLabel}
          {...props}
        />
        <div className="py-2 text-muted-foreground" aria-hidden={decorative}>
          {icon}
        </div>
        <Separator 
          orientation="horizontal" 
          variant={variant}
          size={size}
          className="w-px h-4"
          decorative
        />
      </div>
    );
  }

  const iconContent = (
    <div className="text-muted-foreground" aria-hidden={decorative}>
      {icon}
    </div>
  );

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center',
        spacing === 'xs' && 'my-1',
        spacing === 'sm' && 'my-2', 
        spacing === 'md' && 'my-4',
        spacing === 'lg' && 'my-6',
        spacing === 'xl' && 'my-8',
        className
      )}
      role={decorative ? 'presentation' : 'separator'}
      aria-label={decorative ? undefined : (ariaLabel || 'Separator with icon')}
      data-orientation={orientation}
      {...props}
    >
      {iconPosition === 'left' && (
        <>
          {iconContent}
          <Separator
            variant={variant}
            size={size}
            className="flex-1 ml-4"
            decorative
          />
        </>
      )}
      
      {iconPosition === 'center' && (
        <>
          <Separator
            variant={variant}
            size={size}
            className="flex-1"
            decorative
          />
          <div className="px-4">
            {iconContent}
          </div>
          <Separator
            variant={variant}
            size={size}
            className="flex-1"
            decorative
          />
        </>
      )}
      
      {iconPosition === 'right' && (
        <>
          <Separator
            variant={variant}
            size={size}
            className="flex-1 mr-4"
            decorative
          />
          {iconContent}
        </>
      )}
    </div>
  );
});

// =============================================================================
// SPECIALIZED SEPARATOR COMPONENTS
// =============================================================================

// Section separator with enhanced styling
export const SectionSeparator = React.forwardRef<HTMLDivElement, SeparatorProps>(({
  className,
  spacing = 'lg',
  variant = 'gradient',
  ...props
}, ref) => (
  <Separator
    ref={ref}
    variant={variant}
    spacing={spacing}
    className={cn('mx-auto max-w-xs', className)}
    decorative
    {...props}
  />
));

// Breadcrumb separator for navigation
export const BreadcrumbSeparator = React.forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation' | 'decorative'>>(({
  className,
  variant = 'muted',
  size = 'xs',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-center',
      'text-muted-foreground',
      'px-1',
      className
    )}
    role="presentation"
    aria-hidden="true"
    {...props}
  >
    {children || (
      <svg 
        className="w-4 h-4" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    )}
  </div>
));

// Menu separator for dropdown menus
export const MenuSeparator = React.forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation' | 'spacing'>>(({
  className,
  variant = 'default',
  size = 'xs',
  ...props
}, ref) => (
  <Separator
    ref={ref}
    orientation="horizontal"
    variant={variant}
    size={size}
    className={cn('my-1', className)}
    decorative
    {...props}
  />
));

// Toolbar separator for tool groups
export const ToolbarSeparator = React.forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation' | 'spacing'>>(({
  className,
  variant = 'muted',
  size = 'md',
  ...props
}, ref) => (
  <Separator
    ref={ref}
    orientation="vertical"
    variant={variant}
    size={size}
    className={cn('mx-2 h-6', className)}
    decorative={false}
    ariaLabel="Toolbar separator"
    {...props}
  />
));

// Card separator for content sections within cards
export const CardSeparator = React.forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(({
  className,
  variant = 'default',
  size = 'xs',
  spacing = 'md',
  ...props
}, ref) => (
  <Separator
    ref={ref}
    orientation="horizontal"
    variant={variant}
    size={size}
    spacing={spacing}
    className={className}
    decorative
    {...props}
  />
));

// Display names for React DevTools
Separator.displayName = 'Separator';
SeparatorWithLabel.displayName = 'SeparatorWithLabel';
SeparatorWithIcon.displayName = 'SeparatorWithIcon';
SectionSeparator.displayName = 'SectionSeparator';
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
MenuSeparator.displayName = 'MenuSeparator';
ToolbarSeparator.displayName = 'ToolbarSeparator';
CardSeparator.displayName = 'CardSeparator';

// Export types and variants
export type { VariantProps };
export { separatorVariants, separatorLabelVariants, separatorContentVariants };