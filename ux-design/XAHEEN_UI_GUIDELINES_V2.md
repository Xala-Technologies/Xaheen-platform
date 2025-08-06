# Xaheen UI Guidelines v2.0
## Registry-Based Multi-Platform Design System

> **Universal Components** | **Multi-Platform Generation** | **WCAG AAA Compliant** | **Norwegian NSM Security Ready**

---

## Table of Contents

1. [Design System Architecture](#1-design-system-architecture)
2. [Universal Component System](#2-universal-component-system)  
3. [Registry-Based Development](#3-registry-based-development)
4. [Multi-Platform Implementation](#4-multi-platform-implementation)
5. [CVA Pattern System](#5-cva-pattern-system)
6. [Universal Design Tokens](#6-universal-design-tokens)
7. [Professional Sizing Standards](#7-professional-sizing-standards)
8. [Accessibility Guidelines (WCAG AAA)](#8-accessibility-guidelines-wcag-aaa)
9. [Norwegian Compliance & NSM Security](#9-norwegian-compliance--nsm-security)
10. [Component Development Workflow](#10-component-development-workflow)
11. [Platform-Specific Adaptations](#11-platform-specific-adaptations)
12. [Performance & Optimization](#12-performance--optimization)
13. [Quality Assurance](#13-quality-assurance)
14. [Migration Guide](#14-migration-guide)

---

## 1. Design System Architecture

### 1.1 Three-Layer Architecture

The Xaheen Design System operates on a revolutionary three-layer architecture that enables true "write once, run everywhere" component development:

```
┌─────────────────────────────────────────────────────────────┐
│                    🎯 UNIVERSAL CORE                        │
├─────────────────────────────────────────────────────────────┤
│  • Component Specifications (Framework Agnostic)           │
│  • Universal Design Tokens (Platform Independent)          │
│  • Business Logic & Accessibility Rules                    │
│  • Validation & Type Definitions                           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   🔄 GENERATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  • Platform Templates (React, Vue, Angular, etc.)          │
│  • Code Generators (Components, Tests, Stories)            │
│  • Token Converters (CSS Variables, StyleSheet, etc.)      │
│  • Auto Platform Detection                                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 📱 PLATFORM IMPLEMENTATIONS                 │
├─────────────────────────────────────────────────────────────┤
│  React     Vue      Angular    Svelte    React Native      │
│  Next.js   Nuxt     Ionic      SvelteKit Expo              │
│  Electron  Radix    Headless   Vanilla   Web Components    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Two-Tier Component System

#### **Tier 1: Pure UI Components** (`registry/components/`)
**Strict Rules Applied:**
- ❌ No React hooks (useState, useEffect, etc.)
- ✅ `forwardRef` pattern mandatory
- ✅ CVA (Class Variance Authority) for all variants
- ✅ Design tokens only (no hardcoded values)
- ✅ WCAG AAA compliance
- ✅ TypeScript strict mode
- ✅ Professional sizing (48px+ buttons, 56px+ inputs)

**Examples:** Button, Input, Card, Badge, Avatar, Typography

#### **Tier 2: Composite Blocks** (`registry/blocks/`)
**Rules Applied:**
- ⚡ Hooks allowed for state management
- ✅ CVA for styling variants where applicable
- ✅ Design tokens only
- ✅ WCAG AAA compliance
- ✅ TypeScript strict mode
- ✅ Professional UX patterns

**Examples:** Chat Interface, Global Search, Filter System, Sidebar, Dashboard Widgets

---

## 2. Universal Component System

### 2.1 Component Specification Standard

Every component follows a universal specification that works across all platforms:

```typescript
export interface BaseComponentSpec {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'atom' | 'molecule' | 'organism';
  readonly platforms: Platform[];
  readonly accessibility: AccessibilitySpec;
  readonly styling: StylingSpec;
  readonly props: PropSpec[];
  readonly variants?: VariantSpec[];
  readonly states?: StateSpec[];
  readonly slots?: SlotSpec[];
}
```

### 2.2 Example: Universal Button Specification

```typescript
export const ButtonSpec: BaseComponentSpec = {
  id: 'button',
  name: 'Button',
  description: 'Interactive button element with multiple variants and sizes',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', 'react-native', 'expo'],
  
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['button'],
    ariaAttributes: ['aria-label', 'aria-disabled', 'aria-pressed'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true,
    colorContrastCompliant: true
  },
  
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
      required: false,
      default: 'primary',
      description: 'Visual style variant of the button'
    }
  ]
};
```

### 2.3 Platform Generation

From this single specification, the system automatically generates:

```typescript
// React Implementation
ReactTemplate.generateComponent(ButtonSpec) →
  `export const Button = forwardRef<HTMLButtonElement>(...)`

// React Native Implementation
ReactNativeTemplate.generateComponent(ButtonSpec) →
  `export const Button: React.FC = ({ style, ...props }) => ...`

// Vue Implementation
VueTemplate.generateComponent(ButtonSpec) →
  `<template><button :class="buttonClasses">...</template>`

// Angular Implementation
AngularTemplate.generateComponent(ButtonSpec) →
  `@Component({ selector: 'xaheen-button' })`
```

---

## 3. Registry-Based Development

### 3.1 Registry Structure

```
registry/
├── components/              # Tier 1: Pure UI Components
│   ├── button/
│   │   ├── button.tsx      # React implementation
│   │   └── button.spec.ts  # Universal specification
│   ├── input/
│   └── card/
├── blocks/                  # Tier 2: Composite Components
│   ├── chat-interface/
│   ├── global-search/
│   └── sidebar/
├── platforms/               # Platform-specific implementations
│   ├── react/
│   ├── vue/
│   ├── angular/
│   ├── svelte/
│   └── react-native/
├── tokens/                  # Universal design tokens
├── themes/                  # Theme configurations
└── validation/              # Quality assurance tools
```

### 3.2 Component Registration

Components are automatically registered and discoverable:

```typescript
// Automatic platform detection
import { componentFactory } from '@xaheen/design-system';
const Button = await componentFactory.getComponent('button');

// Platform-specific imports
import { Button } from '@xaheen/design-system/react';
import Button from '@xaheen/design-system/vue/Button.vue';
import { ButtonComponent } from '@xaheen/design-system/angular';
```

### 3.3 Discovery and Documentation

The registry provides automatic:
- **Component Discovery**: All components are automatically indexed
- **Documentation Generation**: API docs generated from specifications
- **Storybook Integration**: Stories generated for all variants
- **Testing Suite**: Unit tests generated for all platforms
- **TypeScript Definitions**: Types generated from specifications

---

## 4. Multi-Platform Implementation

### 4.1 Supported Platforms Matrix

| Platform | Status | Components | Tokens | Tests | Stories |
|----------|--------|------------|--------|-------|---------|
| **React** | ✅ Complete | All components | CSS Variables | Vitest | Storybook |
| **React Native** | ✅ Complete | All components | StyleSheet | Jest | Storybook RN |
| **Vue 3** | ✅ Complete | All components | CSS Variables | Vitest | Histoire |
| **Angular** | ✅ Complete | All components | CSS Variables | Jasmine | Storybook |
| **Svelte** | ✅ Complete | All components | CSS Variables | Vitest | Storybook |
| **Next.js** | ✅ Complete | Uses React | CSS Variables | Vitest | Storybook |
| **Nuxt** | ✅ Complete | Uses Vue | CSS Variables | Vitest | Histoire |
| **Expo** | ✅ Complete | Uses React Native | StyleSheet | Jest | Storybook RN |
| **Electron** | ✅ Complete | Uses React | CSS Variables | Vitest | Storybook |
| **Ionic** | 🔄 In Progress | React/Angular variants | CSS Variables | Platform specific | Storybook |
| **Radix UI** | 🔄 In Progress | Enhanced React | CSS Variables | Vitest | Storybook |

### 4.2 Platform-Specific Features

#### **Web Platforms** (React, Vue, Angular, Svelte)
```typescript
// CSS Custom Properties
const webTokens = TokenUtils.toCSS(UniversalTokens);
// Result: { '--color-primary-500': '#3b82f6' }

// Tailwind CSS Classes
className="bg-primary text-primary-foreground h-12 px-6"

// CSS Modules Support
import styles from './Button.module.css';
```

#### **React Native / Expo**
```typescript
// StyleSheet Values
const rnTokens = TokenUtils.toReactNative(UniversalTokens.spacing);
// Result: { spacing4: 16, spacing12: 48 }

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.primary500,
    paddingHorizontal: tokens.spacing6,
    minHeight: tokens.spacing12 // 48px minimum
  }
});
```

#### **Angular Specific**
```typescript
@Component({
  selector: 'xaheen-button',
  template: `
    <button [class]="buttonClasses" (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() variant: ButtonVariant = 'primary';
  @Output() onClick = new EventEmitter<MouseEvent>();
}
```

---

## 5. CVA Pattern System

### 5.1 Class Variance Authority Implementation

All components use CVA for consistent variant management:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles (always applied)
  [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-lg shadow-sm'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:bg-primary/95',
          'focus:ring-primary/20 shadow-md',
          'border border-primary/20'
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
        ]
      },
      size: {
        md: 'h-12 px-6 text-base min-w-[6rem]',     // 48px height (minimum)
        lg: 'h-14 px-8 text-lg min-w-[7rem]',       // 56px height (professional)
        xl: 'h-16 px-10 text-xl min-w-[8rem]',      // 64px height (premium)
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg'        // Professional default
    }
  }
);
```

### 5.2 CVA Benefits

- **Type Safety**: Full TypeScript support with autocompletion
- **Consistency**: Uniform styling patterns across all components
- **Performance**: Optimized class name generation
- **Maintainability**: Single source of truth for component styles
- **Extensibility**: Easy to add new variants and combinations

### 5.3 CVA Best Practices

```typescript
// ✅ GOOD: Use semantic variant names
variants: {
  intent: ['primary', 'secondary', 'success', 'warning', 'danger'],
  size: ['sm', 'md', 'lg'],
  fullWidth: [true, false]
}

// ❌ BAD: Use specific implementation details
variants: {
  color: ['blue', 'red', 'green'], // Too specific
  padding: ['small', 'medium', 'large'] // Use semantic sizes instead
}

// ✅ GOOD: Compound variants for complex combinations
compoundVariants: [
  {
    intent: 'primary',
    size: 'lg',
    class: 'shadow-lg hover:shadow-xl' // Enhanced shadow for large primary buttons
  }
]
```

---

## 6. Universal Design Tokens

### 6.1 Token Architecture

Universal tokens that convert to any platform format:

```typescript
export const UniversalTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6', // Main primary
      600: '#2563eb',
      900: '#1e3a8a'
    },
    // NSM Classification Colors (Norwegian Security Model)
    nsm: {
      open: '#10b981',      // Green - Public information
      restricted: '#f59e0b', // Yellow - Limited access
      confidential: '#ef4444', // Red - Sensitive information
      secret: '#374151'     // Dark gray - Highest classification
    }
  },
  
  spacing: {
    4: '1rem',       // 16px / 16dp
    12: '3rem',      // 48px / 48dp
    14: '3.5rem',    // 56px / 56dp
    16: '4rem',      // 64px / 64dp
    
    // Professional component sizing
    button: {
      md: '3rem',    // 48px (minimum professional)
      lg: '3.5rem',  // 56px (recommended)
      xl: '4rem'     // 64px (premium)
    },
    
    input: {
      md: '3.5rem',  // 56px (professional standard)
      lg: '4rem'     // 64px (premium)
    }
  }
};
```

### 6.2 Platform Conversion

Tokens automatically convert to platform-specific formats:

```typescript
// Web: CSS Custom Properties
TokenConverters.toCSSVariables(tokens) →
  { '--color-primary-500': '#3b82f6' }

// React Native: Numeric StyleSheet values
TokenConverters.toReactNative(tokens) →
  { colorPrimary500: '#3b82f6', spacing4: 16 }

// JavaScript: Theme objects
TokenConverters.toJSTheme(tokens) →
  { colors: { primary: { 500: '#3b82f6' } } }
```

### 6.3 Token Usage Guidelines

```typescript
// ✅ GOOD: Use semantic tokens
className="bg-primary text-primary-foreground"
className="h-button-lg px-spacing-6"

// ❌ BAD: Use hardcoded values
className="bg-blue-500 text-white"
className="h-14 px-8"

// ✅ GOOD: Use token references in CSS
.button {
  background-color: var(--color-primary);
  height: var(--spacing-button-lg);
}

// ❌ BAD: Use hardcoded CSS values
.button {
  background-color: #3b82f6;
  height: 56px;
}
```

---

## 7. Professional Sizing Standards

### 7.1 Minimum Size Requirements

**Based on CLAUDE.md compliance and professional standards:**

#### **Buttons**
```typescript
// Minimum sizes for professional interfaces
const buttonSizing = {
  minimum: '3rem',      // 48px height (CLAUDE.md requirement)
  recommended: '3.5rem', // 56px height (professional standard)
  premium: '4rem',      // 64px height (luxury interfaces)
  
  // Touch targets (mobile)
  touchMinimum: '2.75rem', // 44px (WCAG minimum)
  touchComfortable: '3rem', // 48px (comfortable)
  touchAccessible: '3.5rem' // 56px (highly accessible)
};
```

#### **Input Fields**
```typescript
const inputSizing = {
  minimum: '3.5rem',    // 56px height (CLAUDE.md requirement)
  recommended: '4rem',  // 64px height (professional)
  premium: '4.5rem'     // 72px height (luxury)
};
```

#### **Cards & Containers**
```typescript
const cardSizing = {
  padding: {
    minimum: '1.5rem',     // 24px padding
    professional: '2rem',  // 32px padding (standard)
    premium: '2.5rem',     // 40px padding
    luxury: '3rem'         // 48px padding
  }
};
```

### 7.2 Enhanced 8pt Grid System

All spacing follows an 8px increment system:

```typescript
export const SpacingScale = {
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px (minimum button height)
  14: '3.5rem',    // 56px (professional button height)
  16: '4rem',      // 64px (premium button height)
  20: '5rem',      // 80px
  24: '6rem'       // 96px
};
```

### 7.3 Component Size Guidelines

```typescript
// ✅ PROFESSIONAL: Follow minimum sizing standards
<Button size="lg" />        // 56px height
<Input size="md" />         // 56px height
<Card padding="md" />       // 32px padding

// ❌ TOO SMALL: Avoid unprofessional sizing
<Button size="sm" />        // 32px height - too small
<Input size="sm" />         // 40px height - not professional
<Card padding="sm" />       // 16px padding - too cramped
```

---

## 8. Accessibility Guidelines (WCAG AAA)

### 8.1 WCAG AAA Requirements

Every component must meet the highest accessibility standards:

#### **Color Contrast**
```typescript
export const ContrastRequirements = {
  text: {
    normal: '7:1',    // AAA level for normal text
    large: '4.5:1'    // AAA level for large text (18px+ or 14px+ bold)
  },
  interactive: {
    focus: '3:1',     // Focus indicators
    border: '3:1',    // Component borders
    graphical: '3:1'  // Icons and graphics
  }
};
```

#### **Keyboard Navigation**
```typescript
export const KeyboardSupport = {
  tabOrder: {
    skipLinks: 0,           // Skip to main content
    primaryNav: 1,          // Main navigation
    searchInput: 2,         // Global search
    mainContent: 3,         // Primary content area
    secondaryNav: 4,        // Secondary navigation
    footer: 5               // Footer links
  },
  
  shortcuts: {
    'Cmd/Ctrl + K': 'Open command palette',
    'Cmd/Ctrl + /': 'Toggle help panel',
    'Escape': 'Close current modal/panel',
    'Tab': 'Navigate forward',
    'Shift + Tab': 'Navigate backward',
    'Enter': 'Activate focused element',
    'Space': 'Toggle switches/checkboxes',
    'Arrow Keys': 'Navigate within component groups'
  }
};
```

#### **Screen Reader Support**
```typescript
export const AriaStandards = {
  // Semantic HTML requirements
  landmarks: {
    header: '<header role="banner">',
    nav: '<nav role="navigation" aria-label="Main navigation">',
    main: '<main role="main">',
    aside: '<aside role="complementary">',
    footer: '<footer role="contentinfo">'
  },
  
  // Dynamic content announcements
  liveRegions: {
    polite: 'aria-live="polite"',        // Status updates
    assertive: 'aria-live="assertive"',  // Important announcements
    off: 'aria-live="off"'               // No announcements
  }
};
```

### 8.2 Accessibility Component Example

```typescript
export const AccessibleButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, disabled, loading, ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={ariaLabel}
        className={cn(
          buttonVariants({ ...props }),
          // High contrast mode support
          'contrast-more:border-2 contrast-more:border-current'
        )}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
```

### 8.3 Accessibility Testing

Every component includes automated accessibility tests:

```typescript
// Accessibility test example
describe('Button Accessibility', () => {
  it('meets WCAG AAA standards', async () => {
    const { container } = render(<Button>Test</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## 9. Norwegian Compliance & NSM Security

### 9.1 NSM Security Classifications

All components support Norwegian NSM (Nasjonal sikkerhetsmyndighet) classifications:

```typescript
export const NSMClassifications = {
  OPEN: {
    level: 0,
    description: 'Information that can be shared publicly',
    styling: {
      borderColor: '#10B981',      // Green
      backgroundColor: '#F0FDF4',  // Light green
      badgeColor: '#059669'        // Green badge
    }
  },
  
  RESTRICTED: {
    level: 1,
    description: 'Information with limited distribution',
    styling: {
      borderColor: '#F59E0B',      // Yellow
      backgroundColor: '#FFFBEB',  // Light yellow
      badgeColor: '#D97706'        // Yellow badge
    }
  },
  
  CONFIDENTIAL: {
    level: 2,
    description: 'Sensitive information requiring protection',
    styling: {
      borderColor: '#EF4444',      // Red
      backgroundColor: '#FEF2F2',  // Light red
      badgeColor: '#DC2626'        // Red badge
    }
  },
  
  SECRET: {
    level: 3,
    description: 'Highly sensitive classified information',
    styling: {
      borderColor: '#7C2D12',      // Dark red
      backgroundColor: '#FFF1F2',  // Very light red
      badgeColor: '#991B1B'        // Dark red badge
    }
  }
};
```

### 9.2 NSM Component Implementation

Components automatically adapt to security classifications:

```typescript
// Button with NSM classification
<Button 
  variant="primary" 
  nsmClassification="CONFIDENTIAL"
>
  Sensitive Action
</Button>

// Generates:
<button className="bg-red-600 text-white border-red-600/20">
  Sensitive Action
  <span className="sr-only">NSM Classification: CONFIDENTIAL</span>
</button>
```

### 9.3 Norwegian Language Support

```typescript
export const NorwegianLocalization = {
  // Date formats
  dateFormats: {
    short: 'dd.mm.yyyy',         // Norwegian date format
    long: 'dd. MMMM yyyy',       // Long Norwegian format
    time: 'HH:mm'                // 24-hour format
  },
  
  // Number formats
  numberFormats: {
    decimal: ',',                // Comma as decimal separator
    thousands: ' ',              // Space as thousands separator
    currency: 'NOK'              // Norwegian Kroner
  },
  
  // Common UI texts
  texts: {
    search: 'Søk...',
    close: 'Lukk',
    save: 'Lagre',
    cancel: 'Avbryt',
    loading: 'Laster...',
    error: 'Feil',
    success: 'Vellykket'
  }
};
```

---

## 10. Component Development Workflow

### 10.1 Development Process

#### **Step 1: Create Universal Specification**
```typescript
// Define component specification
export const NewComponentSpec: BaseComponentSpec = {
  id: 'new-component',
  name: 'NewComponent',
  description: 'Component description',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte'],
  accessibility: { wcagLevel: 'AAA', /* ... */ },
  props: [/* ... */],
  variants: [/* ... */]
};
```

#### **Step 2: Generate Platform Implementations**
```bash
# Generate for all platforms
npm run generate:component new-component

# Generate for specific platform
npm run generate:component new-component --platform react

# Generated files:
# - registry/components/new-component/new-component.tsx (React)
# - registry/platforms/vue/NewComponent.vue (Vue)
# - registry/platforms/angular/new-component.component.ts (Angular)
```

#### **Step 3: Implement CVA Variants**
```typescript
const newComponentVariants = cva(
  // Base classes
  ['base-class-1', 'base-class-2'],
  {
    variants: {
      variant: {
        primary: ['primary-styles'],
        secondary: ['secondary-styles']
      },
      size: {
        md: ['size-md-styles'],
        lg: ['size-lg-styles']
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);
```

#### **Step 4: Add Accessibility Features**
```typescript
export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(newComponentVariants({ variant, size }), className)}
        role="..." // Appropriate ARIA role
        aria-label="..." // Screen reader label
        tabIndex={0} // Keyboard navigation
        {...props}
      >
        {/* Component content */}
      </div>
    );
  }
);
```

#### **Step 5: Generate Tests and Stories**
```bash
# Generate comprehensive test suite
npm run generate:tests new-component

# Generate Storybook stories
npm run generate:stories new-component

# Run quality checks
npm run validate:component new-component
```

### 10.2 Quality Checklist

Before component approval, ensure:

- ✅ **TypeScript**: Strict mode, explicit return types, no `any` types
- ✅ **Professional Sizing**: Minimum heights (48px+ buttons, 56px+ inputs)
- ✅ **WCAG AAA Compliance**: Color contrast, keyboard navigation, screen readers
- ✅ **Design Tokens**: No hardcoded values, semantic token usage
- ✅ **CVA Implementation**: Consistent variant system
- ✅ **Responsive Design**: Works across all breakpoints
- ✅ **Platform Generation**: Successfully generates for all target platforms
- ✅ **NSM Compliance**: Security classification support
- ✅ **Performance**: Optimized bundle size, efficient rendering
- ✅ **Documentation**: Complete Storybook stories and API docs

---

## 11. Platform-Specific Adaptations

### 11.1 React Implementation

```typescript
// React component with hooks (for Tier 2 components only)
import { useState, useCallback } from 'react';
import { cva } from 'class-variance-authority';

export const ReactComponent: React.FC<ComponentProps> = ({ 
  variant = 'primary',
  children,
  ...props 
}) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);
  
  return (
    <div 
      className={cn(componentVariants({ variant }))}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};
```

### 11.2 Vue 3 Implementation

```vue
<!-- Vue 3 Composition API -->
<template>
  <div 
    :class="componentClasses"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { cva } from 'class-variance-authority';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<ComponentProps>(), {
  variant: 'primary'
});

const isActive = ref(false);

const componentVariants = cva(/* CVA configuration */);

const componentClasses = computed(() => 
  componentVariants({ variant: props.variant })
);

const handleClick = () => {
  isActive.value = !isActive.value;
};
</script>
```

### 11.3 Angular Implementation

```typescript
// Angular standalone component
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'xaheen-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="componentClasses" 
      (click)="handleClick()"
    >
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./component.component.scss']
})
export class ComponentComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Output() clicked = new EventEmitter<void>();
  
  get componentClasses(): string {
    return `component component--${this.variant}`;
  }
  
  handleClick(): void {
    this.clicked.emit();
  }
}
```

### 11.4 React Native Implementation

```typescript
// React Native component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { UniversalTokens } from '../tokens';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onPress?: () => void;
}

const Component: React.FC<ComponentProps> = ({ 
  variant = 'primary', 
  children,
  onPress 
}) => {
  const styles = StyleSheet.create({
    primary: {
      backgroundColor: UniversalTokens.colors.primary[500],
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 48 // Professional minimum
    },
    secondary: {
      backgroundColor: UniversalTokens.colors.secondary[500],
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 48
    }
  });
  
  return (
    <TouchableOpacity style={styles[variant]} onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};
```

---

## 12. Performance & Optimization

### 12.1 Bundle Size Targets

```typescript
export const PerformanceStandards = {
  // Core Web Vitals targets
  coreWebVitals: {
    LCP: '2.5s',    // Largest Contentful Paint
    FID: '100ms',   // First Input Delay
    CLS: '0.1',     // Cumulative Layout Shift
    FCP: '1.8s',    // First Contentful Paint
    TTFB: '600ms'   // Time to First Byte
  },
  
  // Bundle size targets
  bundleSize: {
    initial: '200KB',       // Initial bundle size
    total: '500KB',         // Total bundle size
    components: '50KB',     // Component library
    vendors: '150KB'        // Third-party libraries
  },
  
  // Runtime performance
  runtime: {
    componentRender: '16ms',     // 60fps target
    eventHandling: '5ms',        // Event handler execution
    stateUpdates: '10ms',        // State update processing
    memoryUsage: '50MB'          // Maximum memory usage
  }
};
```

### 12.2 Optimization Strategies

#### **Code Splitting**
```typescript
// Route-based splitting
const ProjectWizard = lazy(() => import('./ProjectWizard'));
const AIDashboard = lazy(() => import('./AIDashboard'));

// Component-based splitting (for large blocks only)
const CodeEditor = lazy(() => import('./CodeEditor'));
const FileTreeViewer = lazy(() => import('./FileTreeViewer'));
```

#### **Tree Shaking**
```typescript
// ✅ GOOD: Import specific components
import { Button } from '@xaheen/design-system/react/button';
import { Input } from '@xaheen/design-system/react/input';

// ❌ BAD: Import entire library
import * as Components from '@xaheen/design-system/react';
```

#### **Asset Optimization**
```typescript
export const AssetOptimization = {
  images: 'webp',           // WebP format preferred
  icons: 'svg-sprite',      // SVG sprite for icons
  fonts: 'woff2',          // WOFF2 format
  compression: 'brotli'     // Brotli compression
};
```

### 12.3 Loading States & Skeleton UI

```typescript
export const SkeletonPatterns = {
  card: {
    structure: [
      { type: 'rectangle', width: '100%', height: '200px' },
      { type: 'text', width: '80%', height: '24px' },
      { type: 'text', width: '60%', height: '16px' }
    ],
    animation: 'pulse',
    duration: '1.5s'
  },
  
  table: {
    rows: 5,
    columns: ['60%', '40%', '30%', '50%'],
    headerHeight: '48px',
    rowHeight: '56px',
    animation: 'shimmer'
  }
};
```

---

## 13. Quality Assurance

### 13.1 Automated Testing

Every component includes comprehensive testing:

```typescript
// Component testing example
describe('Button Component', () => {
  // Unit tests
  it('renders with correct variants', () => {
    render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });
  
  // Accessibility tests
  it('meets WCAG AAA standards', async () => {
    const { container } = render(<Button>Test</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Interaction tests
  it('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
  
  // Visual regression tests
  it('matches visual snapshot', () => {
    const component = render(<Button variant="primary">Test</Button>);
    expect(component).toMatchSnapshot();
  });
});
```

### 13.2 Platform Compatibility Testing

```typescript
// Cross-platform testing
describe('Multi-Platform Compatibility', () => {
  platforms.forEach(platform => {
    it(`generates correctly for ${platform}`, () => {
      const component = generateComponent(ButtonSpec, platform);
      expect(component).toBeDefined();
      expect(component).toMatchPlatformSpec(platform);
    });
  });
});
```

### 13.3 Performance Testing

```typescript
// Performance benchmarks
describe('Performance', () => {
  it('renders within performance budget', () => {
    const startTime = performance.now();
    render(<ComplexComponent />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(16); // 60fps target
  });
  
  it('maintains small bundle size', () => {
    const bundleSize = getBundleSize(['Button', 'Input', 'Card']);
    expect(bundleSize).toBeLessThan(50 * 1024); // 50KB limit
  });
});
```

---

## 14. Migration Guide

### 14.1 Migrating from Legacy Components

#### **Step 1: Identify Components to Migrate**
```bash
# Scan codebase for legacy components
npm run scan:legacy-components

# Output example:
# Found 23 legacy Button components
# Found 15 legacy Input components
# Found 8 legacy Card components
```

#### **Step 2: Install New Design System**
```bash
# Install the new design system
npm install @xaheen/design-system

# Install platform-specific packages
npm install @xaheen/design-system-react
npm install @xaheen/design-system-vue
```

#### **Step 3: Update Imports**
```typescript
// ❌ OLD: Legacy imports
import Button from '../components/Button';
import Input from '../components/Input';

// ✅ NEW: Registry-based imports
import { Button } from '@xaheen/design-system/react';
import { Input } from '@xaheen/design-system/react';

// OR: Auto-detection
import { componentFactory } from '@xaheen/design-system';
const Button = await componentFactory.getComponent('button');
```

#### **Step 4: Update Component Usage**
```typescript
// ❌ OLD: Legacy component usage
<Button 
  type="primary" 
  size="large"
  className="custom-button"
>
  Click me
</Button>

// ✅ NEW: CVA-based usage
<Button 
  variant="primary" 
  size="lg"
  className="custom-button"
>
  Click me
</Button>
```

#### **Step 5: Validate Accessibility**
```bash
# Run accessibility audit
npm run audit:accessibility

# Fix any violations
npm run fix:accessibility
```

### 14.2 Breaking Changes

#### **Size Prop Changes**
```typescript
// OLD sizes
size="small" | "medium" | "large"

// NEW sizes (professional standards)
size="md" | "lg" | "xl"
```

#### **Variant Prop Changes**
```typescript
// OLD variants
type="primary" | "secondary"

// NEW variants (expanded)
variant="primary" | "secondary" | "outline" | "ghost" | "destructive"
```

#### **Minimum Size Requirements**
```typescript
// OLD: Small buttons allowed
<Button size="sm" /> // 32px height

// NEW: Professional minimum sizes
<Button size="md" /> // 48px height minimum
<Button size="lg" /> // 56px height recommended
```

### 14.3 Codemods for Automatic Migration

```bash
# Run automated migration
npx @xaheen/codemod migrate-to-v2 src/

# Specific transformations
npx @xaheen/codemod button-props src/
npx @xaheen/codemod input-props src/
npx @xaheen/codemod size-variants src/
```

### 14.4 Gradual Migration Strategy

1. **Phase 1**: Install new system alongside legacy (2 weeks)
2. **Phase 2**: Migrate core components (Button, Input, Card) (4 weeks)
3. **Phase 3**: Migrate complex components (Forms, Navigation) (6 weeks)
4. **Phase 4**: Remove legacy system (2 weeks)

---

## Conclusion

The Xaheen UI Guidelines v2.0 represent a revolutionary approach to design system architecture. By implementing:

- **Universal Component Specifications** that work across all platforms
- **Registry-Based Development** for automated generation and discovery
- **CVA Pattern System** for consistent and maintainable styling
- **Professional Sizing Standards** that meet modern UX expectations
- **WCAG AAA Compliance** as a fundamental requirement
- **Norwegian NSM Security** integration for government-grade applications

This system enables development teams to:

✅ **Write Once, Run Everywhere** - Single component definitions for all platforms  
✅ **Maintain Consistency** - Unified design language across all applications  
✅ **Scale Efficiently** - Automated generation and validation processes  
✅ **Meet Compliance** - Built-in accessibility and security standards  
✅ **Optimize Performance** - Bundle size optimization and runtime efficiency  

The result is a world-class design system that reduces development time, ensures quality, and provides an exceptional user experience across all platforms.

**Next Steps:**
1. Review component specifications and platform requirements
2. Set up development environment with new tooling
3. Begin migration with core components
4. Train team on new development workflows
5. Establish quality gates and validation processes

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Next Review:** March 2025