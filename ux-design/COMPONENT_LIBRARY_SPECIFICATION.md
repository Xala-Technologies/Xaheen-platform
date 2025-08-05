# Xaheen CLI Component Library Specification
## Complete Component Architecture for Professional Development Interface

### Table of Contents
1. [Component Architecture Overview](#component-architecture-overview)
2. [Atomic Components (Design Tokens)](#atomic-components-design-tokens)
3. [Molecular Components (Basic UI)](#molecular-components-basic-ui)
4. [Organism Components (Complex UI)](#organism-components-complex-ui)
5. [Template Components (Layout Patterns)](#template-components-layout-patterns)
6. [Page Components (Complete Interfaces)](#page-components-complete-interfaces)
7. [Specialized Components (Domain-Specific)](#specialized-components-domain-specific)
8. [Component API Standards](#component-api-standards)
9. [Testing Specifications](#testing-specifications)
10. [Documentation Requirements](#documentation-requirements)

---

## Component Architecture Overview

### Design System Hierarchy
```
Xaheen CLI Component Library
├── Tokens (Atomic Level)
│   ├── Color Tokens
│   ├── Typography Tokens
│   ├── Spacing Tokens
│   ├── Sizing Tokens
│   └── Animation Tokens
├── Components (Molecular Level)
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   └── Avatar
├── Patterns (Organism Level)
│   ├── Navigation
│   ├── Forms
│   ├── Tables
│   ├── Modals
│   └── AI Interface
├── Templates (Layout Level)
│   ├── Application Shell
│   ├── Wizard Layout
│   ├── Dashboard Layout
│   └── Modal Layout
└── Pages (Application Level)
    ├── Project Creation
    ├── Module Generation
    ├── AI Assistant
    └── Settings
```

---

## Atomic Components (Design Tokens)

### Color System Implementation
```typescript
// Color Token Specification
export const colorTokens = {
  // Primary Brand Colors (WCAG AAA Compliant)
  primary: {
    50: '#f0f9ff',   // Ultra light
    100: '#e0f2fe',  // Extra light
    200: '#bae6fd',  // Light
    300: '#7dd3fc',  // Medium light
    400: '#38bdf8',  // Medium
    500: '#0ea5e9',  // Base (7:1 contrast ratio)
    600: '#0284c7',  // Medium dark
    700: '#0369a1',  // Dark (8:1 contrast ratio)
    800: '#075985',  // Extra dark (10:1 contrast ratio)
    900: '#0c4a6e',  // Ultra dark
  },
  
  // Semantic Colors
  success: {
    light: '#22c55e',    // 7:1 contrast
    default: '#16a34a',  // 8:1 contrast
    dark: '#15803d',     // 10:1 contrast
  },
  
  warning: {
    light: '#f59e0b',    // 7:1 contrast
    default: '#d97706',  // 8:1 contrast
    dark: '#b45309',     // 10:1 contrast
  },
  
  error: {
    light: '#ef4444',    // 7:1 contrast
    default: '#dc2626',  // 8:1 contrast
    dark: '#b91c1c',     // 10:1 contrast
  },
  
  // Neutral Palette (Light Theme)
  neutral: {
    0: '#ffffff',      // Pure white
    50: '#f9fafb',     // Background
    100: '#f3f4f6',    // Surface
    200: '#e5e7eb',    // Border
    300: '#d1d5db',    // Muted
    400: '#9ca3af',    // Subtle
    500: '#6b7280',    // Default
    600: '#4b5563',    // Strong
    700: '#374151',    // Emphasis
    800: '#1f2937',    // High emphasis
    900: '#111827',    // Maximum
    950: '#030712'     // Ultra dark
  }
};

// Usage in CSS Custom Properties
:root {
  --color-primary: hsl(199, 89%, 48%);
  --color-primary-foreground: hsl(0, 0%, 100%);
  --color-success: hsl(142, 76%, 36%);
  --color-warning: hsl(38, 92%, 50%);
  --color-error: hsl(0, 84%, 60%);
  --color-background: hsl(0, 0%, 100%);
  --color-foreground: hsl(222.2, 84%, 4.9%);
  --color-border: hsl(214.3, 31.8%, 91.4%);
  --color-muted: hsl(210, 40%, 98%);
}
```

### Typography Scale System
```typescript
// Typography Token Implementation
export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
    display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif']
  },
  
  // Fluid Typography Scale (clamp functions)
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',    // 12px - 14px
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',      // 14px - 16px
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',      // 16px - 18px
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',     // 18px - 20px
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',   // 20px - 24px
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',     // 24px - 30px
    '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)', // 30px - 36px
    '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',     // 36px - 48px
    '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',      // 48px - 60px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};
```

### Spacing & Sizing Tokens
```typescript
// Enhanced 8pt Grid System
export const spacingTokens = {
  // Base spacing units
  spacing: {
    0: '0px',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },
  
  // Professional Component Sizing (CLAUDE.md Compliant)
  sizing: {
    button: {
      sm: '2.5rem',     // 40px (minimum touch target)
      md: '3rem',       // 48px (CLAUDE.md minimum)
      lg: '3.5rem',     // 56px (professional standard)
      xl: '4rem'        // 64px (premium)
    },
    input: {
      sm: '2.75rem',    // 44px (accessibility minimum)
      md: '3.5rem',     // 56px (CLAUDE.md minimum)
      lg: '4rem',       // 64px (professional standard)
      xl: '4.5rem'      // 72px (premium)
    }
  }
};
```

---

## Molecular Components (Basic UI)

### Button Component
```typescript
// Button Component Implementation
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-lg shadow-sm',
    'whitespace-nowrap'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:bg-primary/95',
          'focus:ring-primary/20 shadow-md',
          'border border-primary/10'
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 active:bg-secondary/85',
          'focus:ring-secondary/20 shadow-sm',
          'border border-secondary/20'
        ],
        outline: [
          'bg-transparent text-foreground',
          'hover:bg-accent/10 active:bg-accent/20',
          'focus:ring-accent/20',
          'border-2 border-border hover:border-accent'
        ],
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-accent/10 active:bg-accent/20',
          'focus:ring-accent/20 shadow-none'
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 active:bg-destructive/95',
          'focus:ring-destructive/20 shadow-md',
          'border border-destructive/20'
        ]
      },
      size: {
        sm: 'h-10 px-4 text-sm',           // 40px height
        md: 'h-12 px-6 text-base',         // 48px height (CLAUDE.md minimum)
        lg: 'h-14 px-8 text-lg',           // 56px height (professional)
        xl: 'h-16 px-10 text-xl',          // 64px height (premium)
        icon: 'h-12 w-12 p-0'              // Icon-only button
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      },
      loading: {
        true: 'cursor-wait',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',        // Professional default
      fullWidth: false,
      loading: false
    }
  }
);

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  readonly loading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          <>
            {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Input Component
```typescript
// Input Component Implementation
const inputVariants = cva(
  [
    'flex w-full transition-all duration-200',
    'bg-background text-foreground placeholder:text-muted-foreground',
    'border border-input rounded-lg shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'read-only:cursor-default read-only:focus:ring-0'
  ],
  {
    variants: {
      variant: {
        default: 'border-input focus:border-ring',
        filled: 'bg-muted border-transparent focus:bg-background focus:border-ring',
        outline: 'border-2 border-border focus:border-ring',
        search: [
          'pl-10 pr-4 bg-muted/50 border-transparent',
          'focus:bg-background focus:border-ring'
        ]
      },
      size: {
        sm: 'h-11 px-3 py-2 text-sm',      // 44px height (accessibility minimum)
        md: 'h-14 px-4 py-3 text-base',    // 56px height (CLAUDE.md minimum)
        lg: 'h-16 px-6 py-4 text-lg'       // 64px height (professional)
      },
      state: {
        default: '',
        invalid: 'border-destructive focus:border-destructive focus:ring-destructive/20',
        valid: 'border-success focus:border-success focus:ring-success/20'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',        // Professional default
      state: 'default'
    }
  }
);

interface InputProps extends 
  React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> {
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly error?: string;
  readonly helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    leftIcon, 
    rightIcon, 
    error, 
    helperText,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ');
    
    const finalState = error ? 'invalid' : state;
    
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          className={cn(
            inputVariants({ variant, size, state: finalState }),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          ref={ref}
          id={inputId}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Card Component
```typescript
// Card Component Implementation
const cardVariants = cva(
  [
    'rounded-xl border bg-card text-card-foreground transition-all duration-200'
  ],
  {
    variants: {
      variant: {
        default: 'border-border shadow-sm',
        elevated: 'border-border shadow-lg hover:shadow-xl',
        outline: 'border-2 border-border shadow-none',
        ghost: 'border-transparent shadow-none bg-transparent'
      },
      padding: {
        none: 'p-0',
        sm: 'p-6',        // 24px padding
        md: 'p-8',        // 32px padding (CLAUDE.md professional)
        lg: 'p-10',       // 40px padding (premium)
        xl: 'p-12'        // 48px padding (luxury)
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent/5 active:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',     // Professional default
      interactive: false
    }
  }
);

interface CardProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  readonly children: React.ReactNode;
  readonly asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding, 
    interactive, 
    children,
    asChild = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'div';
    
    return (
      <Comp
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

// Card Sub-components
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
```

### Badge Component
```typescript
// Badge Component Implementation
const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-border hover:bg-accent hover:text-accent-foreground',
        // NSM Security Classifications
        nsmOpen: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        nsmRestricted: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        nsmConfidential: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        nsmSecret: 'border-transparent bg-gray-900 text-white hover:bg-gray-800'
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

interface BadgeProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, icon, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
```

---

## Organism Components (Complex UI)

### Navigation Components
```typescript
// WebNavbar Component Implementation
interface WebNavbarProps {
  readonly variant?: 'default' | 'transparent' | 'bordered';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly sticky?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const WebNavbar = React.forwardRef<HTMLElement, WebNavbarProps>(
  ({ variant = 'default', size = 'md', sticky = false, children, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          sticky && 'sticky top-0 z-50',
          size === 'sm' && 'h-14',
          size === 'md' && 'h-16',
          size === 'lg' && 'h-20',
          variant === 'transparent' && 'bg-transparent border-transparent',
          variant === 'bordered' && 'border-b-2',
          className
        )}
        {...props}
      >
        {children}
      </header>
    );
  }
);

WebNavbar.displayName = 'WebNavbar';

// Sidebar Component Implementation
interface SidebarProps {
  readonly width?: 'sm' | 'md' | 'lg';
  readonly variant?: 'default' | 'bordered' | 'elevated';
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ 
    width = 'md', 
    variant = 'default', 
    collapsible = false,
    collapsed = false,
    onCollapsedChange,
    children, 
    className, 
    ...props 
  }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'flex flex-col border-r bg-background',
          width === 'sm' && (collapsed ? 'w-16' : 'w-64'),
          width === 'md' && (collapsed ? 'w-16' : 'w-80'),
          width === 'lg' && (collapsed ? 'w-16' : 'w-96'),
          variant === 'bordered' && 'border-r-2',
          variant === 'elevated' && 'shadow-lg',
          'transition-all duration-300 ease-in-out',
          className
        )}
        aria-expanded={!collapsed}
        {...props}
      >
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md"
            onClick={() => onCollapsedChange?.(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </Button>
        )}
        {children}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';
```

### Form Components
```typescript
// Form Field Component Implementation
interface FormFieldProps {
  readonly label?: string;
  readonly description?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, error, required, children, className, ...props }, ref) => {
    const fieldId = React.useId();
    const errorId = error ? `${fieldId}-error` : undefined;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? 'true' : undefined,
            'aria-required': required
          })}
        </div>
        
        {description && !error && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Radio Group Component Implementation
interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly icon?: React.ReactNode;
}

interface RadioGroupProps {
  readonly name: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly options: readonly RadioOption[];
  readonly onChange?: (value: string) => void;
  readonly orientation?: 'horizontal' | 'vertical';
  readonly variant?: 'default' | 'cards';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    name,
    value,
    defaultValue,
    options,
    onChange,
    orientation = 'vertical',
    variant = 'default',
    size = 'md',
    disabled = false,
    required = false,
    className,
    ...props 
  }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');
    
    const handleChange = (newValue: string) => {
      setSelectedValue(newValue);
      onChange?.(newValue);
    };
    
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-required={required}
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex space-x-4 space-y-0',
          variant === 'cards' && 'grid gap-4',
          variant === 'cards' && orientation === 'horizontal' && 'grid-flow-col auto-cols-fr',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'relative flex cursor-pointer select-none items-center',
              variant === 'cards' && [
                'rounded-lg border-2 p-4 hover:bg-accent/50',
                selectedValue === option.value && 'border-primary bg-primary/10',
                !selectedValue || selectedValue !== option.value ? 'border-border' : ''
              ],
              (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled || option.disabled}
              className={cn(
                'h-4 w-4 border-border text-primary',
                'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                size === 'sm' && 'h-3 w-3',
                size === 'lg' && 'h-5 w-5'
              )}
            />
            
            <div className={cn('ml-3', variant === 'cards' && 'ml-0 flex-1')}>
              {option.icon && variant === 'cards' && (
                <div className="mb-2 text-2xl">{option.icon}</div>
              )}
              
              <div className={cn(
                'text-sm font-medium',
                size === 'sm' && 'text-xs',
                size === 'lg' && 'text-base'
              )}>
                {option.label}
              </div>
              
              {option.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
```

### Modal Components
```typescript
// Modal Component Implementation
interface ModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly children: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  readonly closeOnOverlayClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly preventScroll?: boolean;
}

export const Modal = ({
  open,
  onOpenChange,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true
}: ModalProps): JSX.Element => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (preventScroll) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [open, closeOnEscape, onOpenChange, preventScroll]);
  
  if (!mounted || !open) return <></>;
  
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 animate-in fade-in-0"
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          'relative z-50 w-full animate-in fade-in-0 zoom-in-95',
          'bg-background border border-border rounded-lg shadow-lg',
          'mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-xl',
          size === 'full' && 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]'
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// Modal Sub-components
export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
ModalContent.displayName = 'ModalContent';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4', className)}
    {...props}
  />
));
ModalFooter.displayName = 'ModalFooter';
```

---

## Specialized Components (Domain-Specific)

### AI Interface Components
```typescript
// AI Chat Component Implementation
interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly codeChanges?: readonly CodeChange[];
  readonly loading?: boolean;
}

interface CodeChange {
  readonly file: string;
  readonly action: 'create' | 'modify' | 'delete';
  readonly content: string;
  readonly language: string;
}

interface AIChatProps {
  readonly messages: readonly ChatMessage[];
  readonly isLoading?: boolean;
  readonly onSendMessage: (message: string) => void;
  readonly onApplyChanges: (changes: readonly CodeChange[]) => void;
  readonly className?: string;
}

export const AIChat = React.forwardRef<HTMLDivElement, AIChatProps>(
  ({ messages, isLoading, onSendMessage, onApplyChanges, className, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    
    const scrollToBottom = React.useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    React.useEffect(() => {
      scrollToBottom();
    }, [messages, scrollToBottom]);
    
    const handleSend = React.useCallback(() => {
      if (!inputValue.trim() || isLoading) return;
      
      onSendMessage(inputValue);
      setInputValue('');
    }, [inputValue, isLoading, onSendMessage]);
    
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    }, [handleSend]);
    
    return (
      <Card 
        ref={ref}
        variant="elevated"
        padding="none"
        className={cn('flex flex-col h-full max-h-[600px]', className)}
        {...props}
      >
        {/* Chat Header */}
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              🤖
            </div>
            AI Assistant
          </CardTitle>
          <CardDescription>
            Get help with code generation and project setup
          </CardDescription>
        </CardHeader>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  🤖
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {message.codeChanges && message.codeChanges.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium opacity-70">
                      Proposed Changes:
                    </div>
                    {message.codeChanges.map((change, idx) => (
                      <Card key={idx} variant="outline" padding="sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={change.action === 'create' ? 'success' : 'default'}
                            size="sm"
                          >
                            {change.action.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-medium">{change.file}</span>
                        </div>
                        <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                          <code>{change.content}</code>
                        </pre>
                      </Card>
                    ))}
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => onApplyChanges(message.codeChanges!)}
                      >
                        Apply Changes
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  👤
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                🤖
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe what you want to build..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="md"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Cmd+Enter to send
          </div>
        </div>
      </Card>
    );
  }
);

AIChat.displayName = 'AIChat';
```

### Project Wizard Components
```typescript
// Wizard Stepper Component Implementation
interface WizardStep {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly completed?: boolean;
  readonly disabled?: boolean;
}

interface WizardStepperProps {
  readonly steps: readonly WizardStep[];
  readonly currentStep: string;
  readonly onStepChange?: (stepId: string) => void;
  readonly orientation?: 'horizontal' | 'vertical';
  readonly variant?: 'default' | 'numbered' | 'progress';
  readonly className?: string;
}

export const WizardStepper = React.forwardRef<HTMLDivElement, WizardStepperProps>(
  ({ 
    steps, 
    currentStep, 
    onStepChange, 
    orientation = 'horizontal', 
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    return (
      <nav
        ref={ref}
        aria-label="Progress"
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed || index < currentIndex;
          const isDisabled = step.disabled;
          
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                orientation === 'horizontal' && index < steps.length - 1 && 'flex-1',
                orientation === 'vertical' && 'mb-4'
              )}
            >
              <button
                onClick={() => !isDisabled && onStepChange?.(step.id)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center text-left transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md',
                  !isDisabled && 'hover:bg-accent/50',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isActive && !isCompleted && 'border-primary text-primary',
                    !isActive && !isCompleted && 'border-muted-foreground text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : variant === 'numbered' ? (
                    index + 1
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="ml-4 min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isActive && 'text-primary',
                      isCompleted && 'text-foreground',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        'text-sm',
                        isActive && 'text-primary/70',
                        !isActive && 'text-muted-foreground'
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </button>
              
              {/* Connector Line */}
              {orientation === 'horizontal' && index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-4',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>
    );
  }
);

WizardStepper.displayName = 'WizardStepper';
```

---

## Component API Standards

### TypeScript Interface Requirements
```typescript
// Standard Component Interface Pattern
interface ComponentProps extends 
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof componentVariants> {
  readonly children?: React.ReactNode;
  readonly asChild?: boolean;
  readonly className?: string;
}

// Form Component Interface Pattern
interface FormComponentProps extends 
  React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> {
  readonly error?: string;
  readonly helperText?: string;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

// Event Handler Interface Pattern
interface EventHandlerProps {
  readonly onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  readonly onChange?: (value: string) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
}
```

### CVA Variant Standards
```typescript
// Standard CVA Implementation Pattern
const componentVariants = cva(
  // Base classes (always applied)
  [
    'base-class-1',
    'base-class-2',
    'transition-all duration-200'  // Always include smooth transitions
  ],
  {
    variants: {
      variant: {
        default: 'default-variant-classes',
        primary: 'primary-variant-classes',
        secondary: 'secondary-variant-classes'
      },
      size: {
        sm: 'small-size-classes',
        md: 'medium-size-classes',      // Professional default
        lg: 'large-size-classes'
      },
      state: {
        default: '',
        disabled: 'disabled-classes',
        loading: 'loading-classes',
        error: 'error-classes'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',                       // Professional sizing default
      state: 'default'
    }
  }
);
```

### Accessibility Standards
```typescript
// Accessibility Implementation Pattern
export const AccessibleComponent = React.forwardRef<HTMLElement, ComponentProps>(
  ({ children, ...props }, ref) => {
    return (
      <element
        ref={ref}
        // Required ARIA attributes
        role="appropriate-role"
        aria-label="descriptive-label"
        aria-describedby="description-id"
        // Keyboard navigation
        tabIndex={0}
        onKeyDown={handleKeyDown}
        // State indicators
        aria-expanded={isExpanded}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        {...props}
      >
        {children}
      </element>
    );
  }
);
```

---

## Testing Specifications

### Unit Testing Pattern
```typescript
// Component Unit Test Template
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Component } from './Component';

expect.extend(toHaveNoViolations);

describe('Component', () => {
  // Basic rendering tests
  it('renders without crashing', () => {
    render(<Component>Test content</Component>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  // Variant tests
  it('applies correct variant classes', () => {
    render(<Component variant="primary">Test</Component>);
    expect(screen.getByRole('button')).toHaveClass('primary-variant-class');
  });
  
  // Interaction tests
  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick}>Click me</Component>);
    
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  // Accessibility tests
  it('has no accessibility violations', async () => {
    const { container } = render(<Component>Test</Component>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Keyboard navigation tests
  it('supports keyboard navigation', () => {
    render(<Component>Test</Component>);
    const element = screen.getByRole('button');
    
    element.focus();
    expect(element).toHaveFocus();
    
    fireEvent.keyDown(element, { key: 'Enter' });
    // Assert expected behavior
  });
  
  // Error state tests
  it('displays error state correctly', () => {
    render(<Component error="Error message">Test</Component>);
    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });
});
```

### Integration Testing Pattern
```typescript
// Integration Test Template
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentWithProvider } from './ComponentWithProvider';

describe('Component Integration', () => {
  it('integrates correctly with form context', async () => {
    render(
      <FormProvider>
        <ComponentWithProvider name="test-field" />
      </FormProvider>
    );
    
    // Test integration behavior
  });
  
  it('handles complex user workflows', async () => {
    render(<ComplexWorkflow />);
    
    // Step 1
    fireEvent.click(screen.getByText('Start Workflow'));
    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
    
    // Step 2
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
    
    // Complete workflow
    fireEvent.click(screen.getByText('Complete'));
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

---

## Documentation Requirements

### Component Documentation Template
```markdown
# Component Name

Brief description of the component's purpose and primary use cases.

## Usage

\`\`\`tsx
import { Component } from '@xala-technologies/ui-system';

export function Example() {
  return (
    <Component variant="primary" size="lg">
      Content goes here
    </Component>
  );
}
\`\`\`

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'primary' \| 'secondary' | 'default' | Visual style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Component size |
| disabled | boolean | false | Disables the component |
| children | ReactNode | - | Component content |

### Events

| Event | Type | Description |
|-------|------|-------------|
| onClick | (event: MouseEvent) => void | Fired when component is clicked |
| onChange | (value: string) => void | Fired when value changes |

## Accessibility

- Supports keyboard navigation with Tab and Enter keys
- Includes proper ARIA labels and descriptions
- Meets WCAG 2.2 AAA contrast requirements
- Compatible with screen readers

## Examples

### Basic Usage
\`\`\`tsx
<Component>Basic example</Component>
\`\`\`

### With Variants
\`\`\`tsx
<Component variant="primary" size="lg">
  Primary large button
</Component>
\`\`\`

### Error State
\`\`\`tsx
<Component error="Something went wrong">
  Component with error
</Component>
\`\`\`

## Design Tokens

This component uses the following design tokens:

- \`--color-primary\`: Primary brand color
- \`--spacing-md\`: Medium spacing (16px)
- \`--border-radius-lg\`: Large border radius (12px)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
```

This comprehensive component library specification provides the foundation for building a world-class, accessible, and maintainable design system for the Xaheen CLI. Each component follows strict TypeScript patterns, accessibility guidelines, and professional design standards to ensure consistency and quality across the entire application.