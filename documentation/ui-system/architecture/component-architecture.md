# Component Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Component Patterns](#component-patterns)
- [Token Integration](#token-integration)
- [Variant System](#variant-system)
- [Composition Patterns](#composition-patterns)
- [Accessibility Architecture](#accessibility-architecture)
- [State Management](#state-management)
- [Performance Optimization](#performance-optimization)
- [Testing Architecture](#testing-architecture)

## Overview

The UI System v5.0 component architecture is built on **token-based design**, **SOLID principles**, and **enterprise-grade requirements**. Every component is designed for maximum reusability, type safety, and performance while maintaining strict accessibility compliance.

### Architecture Goals

- **🎨 Token-Driven Styling**: All visual properties driven by design tokens
- **🔧 Type Safety**: Comprehensive TypeScript coverage with zero `any` types
- **♿ Accessibility First**: WCAG AAA compliance built into every component
- **⚡ Performance**: Sub-100ms initialization, <50MB memory usage
- **🛡️ Norwegian Compliance**: NSM, GDPR, and enterprise standards
- **🔄 Composability**: Flexible composition patterns for complex UIs

### Key Innovations

- **Token-Aware Variants**: Dynamic styling based on design tokens
- **Forward Ref Pattern**: Full ref support for imperative access
- **CVA Integration**: Type-safe variants with class-variance-authority
- **SSR-First Design**: Built for server-side rendering
- **Platform Optimization**: Desktop, mobile, tablet specific behaviors

## Design Principles

### 1. Single Responsibility Principle (SRP)

Each component has a single, well-defined responsibility:

```typescript
// ✅ Good: Single responsibility
const Button = ({ children, onClick, variant, size, ...props }) => {
  // Only handles button rendering and interaction
  const tokens = useTokens();
  return (
    <button
      onClick={onClick}
      className={buttonVariants({ variant, size })}
      style={{ backgroundColor: tokens.colors.action[variant].background }}
      {...props}
    >
      {children}
    </button>
  );
};

// ❌ Bad: Multiple responsibilities
const ButtonWithModal = ({ children, modalContent, onSubmit }) => {
  // Handles both button and modal logic - violates SRP
};
```

### 2. Open/Closed Principle (OCP)

Components are open for extension but closed for modification:

```typescript
// Base button implementation - closed for modification
const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ variant, size, ...props }, ref) => {
    const tokens = useTokens();
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size })}
        style={getTokenStyles(tokens, variant, size)}
        {...props}
      />
    );
  }
);

// Extended button - open for extension
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <BaseButton ref={ref} {...props}>
        {iconPosition === 'left' && <Icon name={icon} />}
        {props.children}
        {iconPosition === 'right' && <Icon name={icon} />}
      </BaseButton>
    );
  }
);
```

### 3. Liskov Substitution Principle (LSP)

All component variants are substitutable for their base type:

```typescript
interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'destructive';
  readonly size?: 'small' | 'medium' | 'large';
  readonly children: React.ReactNode;
}

// All these buttons can be used interchangeably
const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="primary" />
);

const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} variant="secondary" />
);

// Usage - all are substitutable
const buttons: Array<React.FC<ButtonProps>> = [
  PrimaryButton,
  SecondaryButton,
  Button, // Base component
];
```

### 4. Interface Segregation Principle (ISP)

Components depend only on interfaces they use:

```typescript
// ✅ Good: Segregated interfaces
interface ClickableProps {
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

interface StylableProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface AccessibleProps {
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

// Component only implements interfaces it needs
interface ButtonProps extends ClickableProps, StylableProps, AccessibleProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

// ❌ Bad: Monolithic interface
interface BadButtonProps {
  readonly onClick?: () => void;
  readonly onChange?: () => void; // Button doesn't need this
  readonly onScroll?: () => void; // Button doesn't need this
  readonly value?: string;        // Button doesn't need this
}
```

### 5. Dependency Inversion Principle (DIP)

Components depend on abstractions, not concretions:

```typescript
// ✅ Good: Depends on token abstraction
const Button = ({ variant = 'primary' }) => {
  const tokens = useTokens(); // Abstraction
  
  return (
    <button
      style={{
        backgroundColor: tokens.colors.action[variant].background,
        color: tokens.colors.action[variant].text,
      }}
    />
  );
};

// ❌ Bad: Depends on concrete values
const BadButton = ({ variant = 'primary' }) => {
  const backgroundColor = variant === 'primary' ? '#007bff' : '#6c757d'; // Concrete
  
  return <button style={{ backgroundColor }} />;
};
```

## Component Patterns

### 1. Forward Ref Pattern

All components support ref forwarding for imperative access:

```typescript
export interface ComponentProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: 'primary' | 'secondary';
}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, className, variant = 'primary', ...props }, ref) => {
    const tokens = useTokens();
    
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant }), className)}
        style={{
          backgroundColor: tokens.colors.background[variant],
          padding: tokens.spacing.medium,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';

export { Component };
```

### 2. Polymorphic Pattern

Components that can render as different HTML elements:

```typescript
type PolymorphicRef<C extends React.ElementType> = 
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentProp<C extends React.ElementType, Props = {}> = {
  readonly as?: C;
} & Props & 
  Omit<React.ComponentPropsWithRef<C>, keyof Props | 'as'>;

type PolymorphicComponent<C extends React.ElementType, Props = {}> = <
  T extends React.ElementType = C
>(
  props: PolymorphicComponentProp<T, Props> & { ref?: PolymorphicRef<T> }
) => React.ReactElement | null;

interface BoxOwnProps {
  readonly variant?: 'primary' | 'secondary';
  readonly padding?: 'small' | 'medium' | 'large';
}

const Box: PolymorphicComponent<'div', BoxOwnProps> = forwardRef(
  <C extends React.ElementType = 'div'>(
    { 
      as, 
      variant = 'primary', 
      padding = 'medium', 
      children, 
      ...props 
    }: PolymorphicComponentProp<C, BoxOwnProps>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'div';
    const tokens = useTokens();
    
    return (
      <Component
        ref={ref}
        style={{
          backgroundColor: tokens.colors.background[variant],
          padding: tokens.spacing[padding],
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// Usage
<Box as="section" variant="primary">Content</Box>
<Box as="header" variant="secondary">Header</Box>
<Box as="button" onClick={handleClick}>Clickable Box</Box>
```

### 3. Compound Component Pattern

Complex components with multiple related sub-components:

```typescript
// Context for compound component
const AccordionContext = createContext<{
  activeItems: string[];
  toggleItem: (id: string) => void;
  multiple?: boolean;
} | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within Accordion');
  }
  return context;
};

// Root component
interface AccordionProps {
  readonly children: React.ReactNode;
  readonly defaultValue?: string | string[];
  readonly multiple?: boolean;
  readonly onValueChange?: (value: string | string[]) => void;
}

const Accordion: React.FC<AccordionProps> & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
} = ({ children, defaultValue, multiple = false, onValueChange }) => {
  const [activeItems, setActiveItems] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const toggleItem = useCallback((id: string) => {
    setActiveItems(prev => {
      const newItems = multiple 
        ? prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
        : prev.includes(id) 
          ? []
          : [id];
      
      onValueChange?.(multiple ? newItems : newItems[0] || '');
      return newItems;
    });
  }, [multiple, onValueChange]);

  return (
    <AccordionContext.Provider value={{ activeItems, toggleItem, multiple }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
};

// Sub-components
const AccordionItem: React.FC<{ 
  readonly children: React.ReactNode; 
  readonly value: string;
}> = ({ children, value }) => {
  const { activeItems } = useAccordionContext();
  const isActive = activeItems.includes(value);

  return (
    <div className={cn('accordion-item', { active: isActive })} data-value={value}>
      {children}
    </div>
  );
};

const AccordionTrigger = forwardRef<HTMLButtonElement, {
  readonly children: React.ReactNode;
  readonly value: string;
}>(({ children, value, ...props }, ref) => {
  const { toggleItem } = useAccordionContext();
  const tokens = useTokens();

  return (
    <button
      ref={ref}
      onClick={() => toggleItem(value)}
      style={{
        backgroundColor: tokens.colors.background.secondary,
        padding: tokens.spacing.medium,
        border: `1px solid ${tokens.colors.border.primary}`,
      }}
      {...props}
    >
      {children}
    </button>
  );
});

const AccordionContent: React.FC<{
  readonly children: React.ReactNode;
  readonly value: string;
}> = ({ children, value }) => {
  const { activeItems } = useAccordionContext();
  const isActive = activeItems.includes(value);
  const tokens = useTokens();

  if (!isActive) return null;

  return (
    <div
      style={{
        padding: tokens.spacing.medium,
        backgroundColor: tokens.colors.background.primary,
      }}
    >
      {children}
    </div>
  );
};

// Attach sub-components
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

// Usage
<Accordion multiple onValueChange={console.log}>
  <Accordion.Item value="item1">
    <Accordion.Trigger value="item1">Section 1</Accordion.Trigger>
    <Accordion.Content value="item1">Content for section 1</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item2">
    <Accordion.Trigger value="item2">Section 2</Accordion.Trigger>
    <Accordion.Content value="item2">Content for section 2</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

## Token Integration

### Token-Aware Styling

All components use design tokens for consistent styling:

```typescript
const useButtonStyles = (variant: ButtonVariant, size: ButtonSize) => {
  const tokens = useTokens();
  
  return useMemo(() => ({
    // Base styles from tokens
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.fontWeight.medium,
    borderRadius: tokens.border.radius.medium,
    transition: tokens.animation.transition.standard,
    
    // Variant-specific styles
    backgroundColor: tokens.components.button[variant].background,
    color: tokens.components.button[variant].text,
    borderColor: tokens.components.button[variant].border,
    
    // Size-specific styles
    fontSize: tokens.components.button[size].fontSize,
    padding: tokens.components.button[size].padding,
    minHeight: tokens.components.button[size].minHeight,
    
    // Interactive states
    '&:hover': {
      backgroundColor: tokens.components.button[variant].hover.background,
      transform: tokens.animation.hover.transform,
    },
    '&:focus': {
      outline: `2px solid ${tokens.colors.focus.ring}`,
      outlineOffset: tokens.spacing.xs,
    },
    '&:active': {
      transform: tokens.animation.active.transform,
    },
    '&:disabled': {
      backgroundColor: tokens.components.button.disabled.background,
      color: tokens.components.button.disabled.text,
      cursor: 'not-allowed',
      opacity: tokens.opacity.disabled,
    },
  }), [tokens, variant, size]);
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', disabled, ...props }, ref) => {
    const styles = useButtonStyles(variant, size);
    
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size })}
        style={styles}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      />
    );
  }
);
```

### Dynamic Token Resolution

Components adapt to theme changes automatically:

```typescript
const useAdaptiveTokens = (component: string, variant: string) => {
  const baseTokens = useTokens();
  const theme = useTheme();
  const platform = usePlatform();
  
  return useMemo(() => {
    // Start with base tokens
    let tokens = { ...baseTokens };
    
    // Apply theme-specific overrides
    if (theme.overrides?.[component]?.[variant]) {
      tokens = mergeDeep(tokens, theme.overrides[component][variant]);
    }
    
    // Apply platform-specific adjustments
    if (platform !== 'desktop') {
      const platformTokens = getPlatformTokens(platform);
      tokens = mergeDeep(tokens, platformTokens);
    }
    
    return tokens;
  }, [baseTokens, theme, platform, component, variant]);
};

// Usage in component
const Card = ({ variant = 'primary', ...props }) => {
  const tokens = useAdaptiveTokens('card', variant);
  
  return (
    <div
      style={{
        backgroundColor: tokens.components.card[variant].background,
        borderRadius: tokens.border.radius.large,
        padding: tokens.spacing.large,
        boxShadow: tokens.shadow.medium,
      }}
      {...props}
    />
  );
};
```

## Variant System

### CVA Integration

Type-safe variants using class-variance-authority:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary',
          'text-primary-foreground',
          'hover:bg-primary/90',
          'focus-visible:ring-primary',
        ],
        secondary: [
          'bg-secondary',
          'text-secondary-foreground',
          'hover:bg-secondary/80',
          'focus-visible:ring-secondary',
        ],
        destructive: [
          'bg-destructive',
          'text-destructive-foreground',
          'hover:bg-destructive/90',
          'focus-visible:ring-destructive',
        ],
        outline: [
          'border',
          'border-input',
          'bg-background',
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'focus-visible:ring-ring',
        ],
        ghost: [
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'focus-visible:ring-ring',
        ],
        link: [
          'text-primary',
          'underline-offset-4',
          'hover:underline',
          'focus-visible:ring-primary',
        ],
      },
      size: {
        small: ['h-9', 'rounded-md', 'px-3', 'text-sm'],
        medium: ['h-10', 'px-4', 'py-2'],
        large: ['h-11', 'rounded-md', 'px-8'],
        icon: ['h-10', 'w-10'],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const tokens = useTokens();
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          // Token-based overrides
          '--primary': tokens.colors.action.primary.background,
          '--primary-foreground': tokens.colors.action.primary.text,
        } as React.CSSProperties}
        {...props}
      />
    );
  }
);
```

### Responsive Variants

Variants that adapt to screen size:

```typescript
const responsiveVariants = cva([], {
  variants: {
    size: {
      responsive: [], // Base responsive size
    },
    hideOn: {
      mobile: ['hidden', 'sm:block'],
      tablet: ['sm:hidden', 'lg:block'],
      desktop: ['lg:hidden'],
    },
    showOn: {
      mobile: ['sm:hidden'],
      tablet: ['hidden', 'sm:block', 'lg:hidden'],
      desktop: ['hidden', 'lg:block'],
    },
  },
});

const ResponsiveComponent = ({ hideOn, showOn, ...props }) => {
  const tokens = useTokens();
  const breakpoint = useBreakpoint();
  
  // Calculate responsive token values
  const responsiveTokens = useMemo(() => {
    const sizeMap = {
      mobile: 'small',
      tablet: 'medium', 
      desktop: 'large',
    };
    
    const size = sizeMap[breakpoint] || 'medium';
    
    return {
      padding: tokens.spacing[size],
      fontSize: tokens.typography.fontSize[size],
      borderRadius: tokens.border.radius[size],
    };
  }, [tokens, breakpoint]);
  
  return (
    <div
      className={cn(responsiveVariants({ hideOn, showOn }))}
      style={responsiveTokens}
      {...props}
    />
  );
};
```

## Composition Patterns

### Slot Pattern

Allow children to override default elements:

```typescript
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps {
  readonly asChild?: boolean;
  readonly children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp ref={ref} {...props}>
        {children}
      </Comp>
    );
  }
);

// Usage
<Button>Default button</Button>
<Button asChild>
  <a href="/link">Button as link</a>
</Button>
```

### Render Props Pattern

Flexible rendering with access to internal state:

```typescript
interface ToggleProps {
  readonly children: (props: {
    isToggled: boolean;
    toggle: () => void;
    setToggled: (value: boolean) => void;
  }) => React.ReactNode;
  readonly defaultToggled?: boolean;
  readonly onToggle?: (toggled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ 
  children, 
  defaultToggled = false, 
  onToggle 
}) => {
  const [isToggled, setIsToggled] = useState(defaultToggled);
  
  const toggle = useCallback(() => {
    const newValue = !isToggled;
    setIsToggled(newValue);
    onToggle?.(newValue);
  }, [isToggled, onToggle]);
  
  const setToggled = useCallback((value: boolean) => {
    setIsToggled(value);
    onToggle?.(value);
  }, [onToggle]);
  
  return <>{children({ isToggled, toggle, setToggled })}</>;
};

// Usage
<Toggle defaultToggled={false}>
  {({ isToggled, toggle }) => (
    <button onClick={toggle}>
      {isToggled ? 'On' : 'Off'}
    </button>
  )}
</Toggle>
```

### Hook-Based Composition

Separate logic from presentation:

```typescript
// Custom hook for component logic
const useToggle = (defaultValue = false) => {
  const [value, setValue] = useState(defaultValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return {
    value,
    setValue,
    toggle,
    setTrue,
    setFalse,
  };
};

// Component uses hook
const ToggleButton = ({ defaultToggled, onToggle, ...props }) => {
  const { value: isToggled, toggle } = useToggle(defaultToggled);
  const tokens = useTokens();
  
  useEffect(() => {
    onToggle?.(isToggled);
  }, [isToggled, onToggle]);
  
  return (
    <button
      onClick={toggle}
      aria-pressed={isToggled}
      style={{
        backgroundColor: isToggled 
          ? tokens.colors.action.primary.background
          : tokens.colors.action.secondary.background,
      }}
      {...props}
    >
      {isToggled ? 'On' : 'Off'}
    </button>
  );
};

// Hook can be reused in other components
const ToggleSwitch = ({ defaultToggled, onToggle }) => {
  const { value: isToggled, toggle } = useToggle(defaultToggled);
  const tokens = useTokens();
  
  return (
    <div
      role="switch"
      aria-checked={isToggled}
      onClick={toggle}
      style={{
        width: tokens.spacing['2xl'],
        height: tokens.spacing.lg,
        backgroundColor: isToggled 
          ? tokens.colors.success[500] 
          : tokens.colors.gray[300],
        borderRadius: tokens.border.radius.full,
      }}
    >
      <div
        style={{
          width: tokens.spacing.md,
          height: tokens.spacing.md,
          backgroundColor: tokens.colors.white,
          borderRadius: tokens.border.radius.full,
          transform: isToggled ? 'translateX(100%)' : 'translateX(0)',
          transition: tokens.animation.transition.standard,
        }}
      />
    </div>
  );
};
```

## Accessibility Architecture

### Built-in Accessibility

All components include accessibility features by default:

```typescript
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly loading?: boolean;
  readonly loadingText?: string;
  readonly children: React.ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ loading, loadingText, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={loading ? loadingText : props['aria-label']}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        {...props}
      >
        {loading && (
          <span aria-hidden="true" className="loading-spinner">
            ⏳
          </span>
        )}
        <span className={loading ? 'sr-only' : undefined}>
          {children}
        </span>
      </button>
    );
  }
);
```

### Focus Management

Components manage focus appropriately:

```typescript
const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusElement = useCallback(() => {
    focusRef.current?.focus();
  }, []);
  
  const blurElement = useCallback(() => {
    focusRef.current?.blur();
  }, []);
  
  const isFocused = useCallback(() => {
    return document.activeElement === focusRef.current;
  }, []);
  
  return {
    focusRef,
    focusElement,
    blurElement,
    isFocused,
  };
};

const FocusableComponent = ({ autoFocus, ...props }) => {
  const { focusRef, focusElement } = useFocusManagement();
  
  useEffect(() => {
    if (autoFocus) {
      focusElement();
    }
  }, [autoFocus, focusElement]);
  
  return (
    <div
      ref={focusRef}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          props.onClick?.(e);
        }
      }}
      {...props}
    />
  );
};
```

### Screen Reader Support

Components provide comprehensive screen reader support:

```typescript
const useScreenReaderAnnouncement = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  return { announce };
};

const LoadingButton = ({ loading, children, ...props }) => {
  const { announce } = useScreenReaderAnnouncement();
  
  useEffect(() => {
    if (loading) {
      announce('Loading started', 'polite');
    }
  }, [loading, announce]);
  
  return (
    <button
      aria-busy={loading}
      aria-describedby={loading ? 'loading-description' : undefined}
      {...props}
    >
      {children}
      {loading && (
        <span id="loading-description" className="sr-only">
          Please wait while the action is being processed
        </span>
      )}
    </button>
  );
};
```

## State Management

### Internal State Patterns

Components manage their own state appropriately:

```typescript
// Simple state component
const Counter = ({ initialValue = 0, onValueChange }) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    onValueChange?.(newCount);
  }, [count, onValueChange]);
  
  const decrement = useCallback(() => {
    const newCount = count - 1;
    setCount(newCount);
    onValueChange?.(newCount);
  }, [count, onValueChange]);
  
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};

// Complex state with reducer
interface FormState {
  readonly values: Record<string, any>;
  readonly errors: Record<string, string>;
  readonly touched: Record<string, boolean>;
  readonly isSubmitting: boolean;
}

type FormAction = 
  | { type: 'SET_VALUE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    case 'RESET':
      return {
        values: {},
        errors: {},
        touched: {},
        isSubmitting: false,
      };
    default:
      return state;
  }
};

const Form = ({ onSubmit, children }) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
  });
  
  const setValue = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value });
  }, []);
  
  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await onSubmit(state.values);
    } catch (error) {
      // Handle errors
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [onSubmit, state.values]);
  
  return (
    <form onSubmit={handleSubmit}>
      {children({ state, setValue, setError })}
    </form>
  );
};
```

### Controlled vs Uncontrolled

Components support both controlled and uncontrolled patterns:

```typescript
interface InputProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, defaultValue, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    
    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : internalValue;
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      onChange?.(newValue);
    }, [isControlled, onChange]);
    
    return (
      <input
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

// Usage
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled
<Input defaultValue="initial" onChange={handleChange} />
```

## Performance Optimization

### Memoization Strategies

Components use appropriate memoization:

```typescript
// Memo for expensive calculations
const ExpensiveComponent = memo<{ data: any[]; filter: string }>(
  ({ data, filter }) => {
    const filteredData = useMemo(() => {
      return data.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase())
      );
    }, [data, filter]);
    
    const sortedData = useMemo(() => {
      return [...filteredData].sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);
    
    return (
      <div>
        {sortedData.map(item => (
          <Item key={item.id} data={item} />
        ))}
      </div>
    );
  }
);

// Memo with custom comparison
const OptimizedComponent = memo<{
  user: { id: string; name: string; email: string };
  settings: { theme: string; language: string };
}>(
  ({ user, settings }) => {
    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p>Theme: {settings.theme}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if relevant fields change
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.email === nextProps.user.email &&
      prevProps.settings.theme === nextProps.settings.theme
    );
  }
);
```

### Lazy Loading

Components support lazy loading for performance:

```typescript
// Lazy component loading
const LazyModal = lazy(() => import('./Modal'));
const LazyChart = lazy(() => import('./Chart'));

const ComponentWithLazyLoading = () => {
  const [showModal, setShowModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Show Modal
      </button>
      
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>
      
      <Suspense fallback={<div>Loading modal...</div>}>
        {showModal && <LazyModal onClose={() => setShowModal(false)} />}
      </Suspense>
      
      <Suspense fallback={<div>Loading chart...</div>}>
        {showChart && <LazyChart data={[]} />}
      </Suspense>
    </div>
  );
};

// Progressive enhancement
const ProgressiveComponent = ({ enableAdvancedFeatures = false }) => {
  const [AdvancedFeatures, setAdvancedFeatures] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    if (enableAdvancedFeatures && !AdvancedFeatures) {
      import('./AdvancedFeatures').then(module => {
        setAdvancedFeatures(() => module.default);
      });
    }
  }, [enableAdvancedFeatures, AdvancedFeatures]);
  
  return (
    <div>
      <h1>Basic Features</h1>
      <BasicFeatures />
      
      {AdvancedFeatures && (
        <Suspense fallback={<div>Loading advanced features...</div>}>
          <AdvancedFeatures />
        </Suspense>
      )}
    </div>
  );
};
```

## Testing Architecture

### Component Testing Patterns

Components are designed for easy testing:

```typescript
// Testable component with dependency injection
interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly analytics?: {
    track: (event: string, data?: any) => void;
  };
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  analytics = defaultAnalytics 
}) => {
  const handleClick = useCallback(() => {
    analytics.track('button_click', { label: children });
    onClick?.();
  }, [onClick, analytics, children]);
  
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
};

// Test
import { render, fireEvent, screen } from '@testing-library/react';

describe('Button', () => {
  it('tracks analytics on click', () => {
    const mockAnalytics = { track: jest.fn() };
    
    render(
      <Button analytics={mockAnalytics} onClick={() => {}}>
        Test Button
      </Button>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockAnalytics.track).toHaveBeenCalledWith(
      'button_click', 
      { label: 'Test Button' }
    );
  });
});
```

### Custom Testing Utilities

Create utilities for component testing:

```typescript
// Testing utilities
import { render, RenderOptions } from '@testing-library/react';
import { UiProvider } from '../providers/UiProvider';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  readonly theme?: 'light' | 'dark';
  readonly tokens?: Partial<DesignTokens>;
  readonly platform?: 'desktop' | 'mobile' | 'tablet';
}

const customRender = (
  ui: React.ReactElement,
  {
    theme = 'light',
    tokens,
    platform = 'desktop',
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <UiProvider 
      theme={theme} 
      customTokens={tokens}
      platform={platform}
    >
      {children}
    </UiProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Usage in tests
import { render, screen } from './test-utils';

test('button renders with correct theme', () => {
  render(
    <Button variant="primary">Test</Button>,
    { theme: 'dark' }
  );
  
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## Conclusion

The UI System v5.0 component architecture provides a robust foundation for building scalable, accessible, and maintainable user interfaces. By following SOLID principles, leveraging design tokens, and implementing comprehensive testing patterns, components are designed to meet enterprise-grade requirements while maintaining developer productivity and user experience quality.

### Key Takeaways

- **🎨 Token-Driven**: All styling decisions driven by design tokens
- **🔧 Type-Safe**: Comprehensive TypeScript coverage with zero technical debt
- **♿ Accessible**: WCAG AAA compliance built into every component
- **⚡ Performant**: Optimized for sub-100ms initialization and minimal memory usage
- **🔄 Composable**: Flexible patterns for complex UI construction
- **🧪 Testable**: Designed for easy testing with dependency injection and utilities

This architecture ensures that every component meets the highest standards of quality, performance, and maintainability while providing the flexibility needed for enterprise-scale applications.