# Xaheen Design System Specification v5.0
## Comprehensive UX Design System for Full-Stack Development + Universal Design System

### Overview
This specification covers **two complementary platforms**:
1. **Xaheen CLI Full-Stack Platform** - AI-native full-stack development toolkit
2. **Universal Design System** - Multi-platform component registry (React, Vue, Angular, Svelte, etc.)

### Table of Contents
1. [Dual Platform Architecture](#dual-platform-architecture)
2. [Design Token Foundation](#design-token-foundation)
3. [Component Hierarchy & CVA System](#component-hierarchy--cva-system)
4. [Universal Multi-Platform System](#universal-multi-platform-system)
5. [Accessibility Guidelines (WCAG AAA)](#accessibility-guidelines-wcag-aaa)
6. [Responsive Design Patterns](#responsive-design-patterns)
7. [Professional Sizing Standards](#professional-sizing-standards)
8. [Color Systems & Typography](#color-systems--typography)
9. [Interaction Patterns & Animations](#interaction-patterns--animations)
10. [Layout Systems & Grids](#layout-systems--grids)
11. [Norwegian Compliance & NSM Security](#norwegian-compliance--nsm-security)
12. [Performance & Optimization](#performance--optimization)
13. [Implementation Guidelines](#implementation-guidelines)

---

## 1. Dual Platform Architecture

### 1.1 Platform Overview
```
Xaheen Ecosystem v5.0
├── Full-Stack Development Platform (CLI)
│   ├── Project Generation & Scaffolding
│   ├── AI-Assisted Development
│   ├── Technology Stack Configuration  
│   ├── Full-Stack Application Templates
│   └── Enhanced with Universal UI Components
└── Universal Design System (Registry)
    ├── Multi-Platform Component Generation
    ├── Framework-Agnostic Component Specifications
    ├── Platform-Specific Implementations
    ├── Interactive Component Playground
    └── Norwegian Compliance & Accessibility
```

### 1.2 Atomic Design Methodology (Shared)
```
Universal Design System Hierarchy
├── Atoms (Universal Design Tokens)
│   ├── Colors (WCAG AAA, NSM Classifications)
│   ├── Typography (Norwegian-Optimized, Multi-Platform)
│   ├── Spacing (Enhanced 8pt Grid, Professional Sizing)
│   ├── Sizing (CLAUDE.md Compliant, Touch-Optimized)
│   ├── Border Radius (Consistent Across Platforms)
│   ├── Shadows & Elevation (Platform-Adaptive)
│   └── Animation (Reduced Motion Support)
├── Molecules (Universal Components)
│   ├── Button (11+ Platform Implementations)
│   ├── Input (Norwegian Compliance, Validation)
│   ├── Badge (NSM Classifications, Status)
│   ├── Avatar (Accessibility, Fallbacks)
│   ├── Icon (SVG, Platform-Optimized)
│   └── Typography (Semantic, Responsive)
├── Organisms (Composite Blocks)
│   ├── Navigation (Cross-Platform Navbar, Sidebar)
│   ├── Forms (Universal Form Builder)
│   ├── Cards (Interactive, Data Display)
│   ├── Tables (Enterprise Data Tables)
│   ├── Modals (Platform-Native Dialogs)
│   └── AI Interface (Chat, Code Preview)
├── Templates (Layout Patterns)
│   ├── Full-Stack Project Templates
│   ├── Design System Registry Interface
│   ├── Interactive Playground Layout
│   └── Documentation System Layout
└── Pages (Complete Applications)
    ├── CLI Project Creation Wizard
    ├── Universal Component Registry
    ├── Interactive Design Playground
    └── Multi-Platform Documentation
```

### 1.2 Xala MCP Integration Architecture
```typescript
// Design System Foundation
import {
  // Core Design Tokens
  useDesignTokens,
  createTheme,
  ThemeProvider,
  
  // Layout Components
  Container,
  Stack,
  Grid,
  GridItem,
  
  // Navigation Components
  WebNavbar,
  Sidebar,
  Breadcrumb,
  Tabs,
  
  // Form Components
  Input,
  TextArea,
  Button,
  RadioGroup,
  Checkbox,
  Select,
  FormField,
  
  // Display Components
  Typography,
  Card,
  Badge,
  Avatar,
  CodeBlock,
  
  // Interactive Components
  Modal,
  Popover,
  Tooltip,
  ProgressBar,
  
  // Utility Hooks
  useResponsive,
  useAccessibility,
  useTheme
} from '@xala-technologies/ui-system';
```

---

## 2. Universal Multi-Platform System

### 2.1 Platform Support Matrix
```
Platform Compatibility Grid
                    Button  Input  Card   Modal  Table  Form   Charts
React               ✅      ✅     ✅     ✅     ✅     ✅     ✅
Vue 3               ✅      ✅     ✅     ✅     ✅     ✅     🟡
Angular 17+         ✅      ✅     ✅     🟡     🟡     ✅     🟡
Svelte 4+           ✅      ✅     ✅     ✅     🟡     ✅     🟡
React Native        ✅      ✅     ✅     ✅     🟡     ✅     ⚪
Electron            ✅      ✅     ✅     ✅     ✅     ✅     ✅
Radix UI            ✅      ✅     ✅     ✅     ✅     ✅     🟡
Headless UI         ✅      ✅     ✅     ✅     🟡     ✅     ⚪
Vanilla JS          ✅      ✅     ✅     🟡     ⚪     ✅     ⚪
Ionic               🟡      🟡     ✅     ✅     ⚪     ✅     ⚪
Web Components      ✅      ✅     ✅     🟡     ⚪     ✅     ⚪

Legend: ✅ Complete  🟡 Partial  ⚪ Planned
```

### 2.2 Universal Component Architecture
```typescript
// Universal Component Specification (Platform Agnostic)
interface UniversalButtonSpec {
  id: 'button',
  platforms: ['react', 'vue', 'angular', 'svelte', 'react-native'],
  
  // Universal Props (work everywhere)
  props: {
    variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive',
    size: 'sm' | 'md' | 'lg' | 'xl',
    disabled: boolean,
    loading: boolean,
    fullWidth: boolean,
    children: ReactNode | string,
    
    // Norwegian Compliance
    nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET',
    norwegianLocale?: boolean,
    
    // Platform-Specific Enhancements
    platformEnhancements?: {
      react: { onClick: () => void },
      reactNative: { onPress: () => void },
      vue: { '@click': () => void },
      angular: { '(click)': () => void }
    }
  },
  
  // Accessibility Requirements (Universal)
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['button'],
    keyboardNavigation: true,
    screenReaderSupport: true,
    minTouchTarget: '44px'
  }
}
```

### 2.3 Code Generation System
```typescript
// Platform-Specific Code Generation
class UniversalComponentGenerator {
  // React Implementation
  generateReact(spec: UniversalButtonSpec): string {
    return `
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, nsmClassification, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), {
          'nsm-restricted': nsmClassification === 'RESTRICTED',
          'nsm-confidential': nsmClassification === 'CONFIDENTIAL'
        })}
        ref={ref}
        {...props}
      />
    );
  }
);`;
  }
  
  // Vue Implementation  
  generateVue(spec: UniversalButtonSpec): string {
    return `
<template>
  <button 
    :class="buttonClasses" 
    @click="$emit('click', $event)"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<ButtonProps>();
const buttonClasses = computed(() => [
  'btn',
  \`btn-\${variant}\`,
  \`btn-\${size}\`,
  { 'nsm-restricted': nsmClassification === 'RESTRICTED' }
]);
</script>`;
  }
  
  // Angular Implementation
  generateAngular(spec: UniversalButtonSpec): string {
    return `
@Component({
  selector: 'xaheen-button',
  standalone: true,
  template: \`
    <button 
      [class]="buttonClasses" 
      (click)="handleClick($event)"
      [disabled]="disabled"
    >
      <ng-content></ng-content>
    </button>
  \`
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() nsmClassification?: NSMClassification;
  
  get buttonClasses(): string {
    return \`btn btn-\${this.variant} \${this.nsmClassification ? 'nsm-' + this.nsmClassification.toLowerCase() : ''}\`;
  }
}`;
  }
}
```

---

## 3. Design Token Foundation

### 2.1 Color System Architecture
```typescript
// Color Token Specification
export const colorTokens = {
  // Primary Brand Colors
  primary: {
    50: 'hsl(210, 100%, 98%)',   // Ultra light
    100: 'hsl(210, 100%, 95%)',  // Extra light
    200: 'hsl(210, 100%, 90%)',  // Light
    300: 'hsl(210, 100%, 80%)',  // Medium light
    400: 'hsl(210, 100%, 70%)',  // Medium
    500: 'hsl(210, 100%, 60%)',  // Base (Primary)
    600: 'hsl(210, 100%, 50%)',  // Medium dark
    700: 'hsl(210, 100%, 40%)',  // Dark
    800: 'hsl(210, 100%, 30%)',  // Extra dark
    900: 'hsl(210, 100%, 20%)',  // Ultra dark
  },
  
  // Semantic Colors (WCAG AAA Compliant)
  semantic: {
    success: {
      light: 'hsl(142, 76%, 36%)',    // 7:1 contrast ratio
      default: 'hsl(142, 76%, 31%)',  // 8:1 contrast ratio
      dark: 'hsl(142, 76%, 26%)',     // 10:1 contrast ratio
    },
    warning: {
      light: 'hsl(38, 92%, 50%)',     // 7:1 contrast ratio
      default: 'hsl(38, 92%, 45%)',   // 8:1 contrast ratio
      dark: 'hsl(38, 92%, 40%)',      // 10:1 contrast ratio
    },
    error: {
      light: 'hsl(0, 84%, 50%)',      // 7:1 contrast ratio
      default: 'hsl(0, 84%, 45%)',    // 8:1 contrast ratio
      dark: 'hsl(0, 84%, 40%)',       // 10:1 contrast ratio
    },
    info: {
      light: 'hsl(199, 89%, 48%)',    // 7:1 contrast ratio
      default: 'hsl(199, 89%, 43%)',  // 8:1 contrast ratio
      dark: 'hsl(199, 89%, 38%)',     // 10:1 contrast ratio
    }
  },
  
  // Neutral Palette (Multi-theme Support)
  neutral: {
    light: {
      50: 'hsl(0, 0%, 98%)',    // Background
      100: 'hsl(0, 0%, 96%)',   // Surface
      200: 'hsl(0, 0%, 92%)',   // Border
      300: 'hsl(0, 0%, 88%)',   // Muted
      400: 'hsl(0, 0%, 76%)',   // Subtle
      500: 'hsl(0, 0%, 64%)',   // Default
      600: 'hsl(0, 0%, 52%)',   // Strong
      700: 'hsl(0, 0%, 40%)',   // Emphasis
      800: 'hsl(0, 0%, 28%)',   // High Emphasis
      900: 'hsl(0, 0%, 16%)',   // Maximum
    },
    dark: {
      50: 'hsl(0, 0%, 4%)',     // Background
      100: 'hsl(0, 0%, 8%)',    // Surface
      200: 'hsl(0, 0%, 12%)',   // Border
      300: 'hsl(0, 0%, 16%)',   // Muted
      400: 'hsl(0, 0%, 24%)',   // Subtle
      500: 'hsl(0, 0%, 36%)',   // Default
      600: 'hsl(0, 0%, 48%)',   // Strong
      700: 'hsl(0, 0%, 60%)',   // Emphasis
      800: 'hsl(0, 0%, 72%)',   // High Emphasis
      900: 'hsl(0, 0%, 84%)',   // Maximum
    }
  }
};
```

### 2.2 Typography Scale System
```typescript
// Typography Token Specification
export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif']
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
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
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};
```

### 2.3 Spacing & Sizing System
```typescript
// Enhanced 8pt Grid System
export const spacingTokens = {
  // Base spacing units (8px increments)
  spacing: {
    0: '0px',           // 0
    1: '0.25rem',       // 4px
    2: '0.5rem',        // 8px
    3: '0.75rem',       // 12px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    8: '2rem',          // 32px
    10: '2.5rem',       // 40px
    12: '3rem',         // 48px
    16: '4rem',         // 64px
    20: '5rem',         // 80px
    24: '6rem',         // 96px
    32: '8rem',         // 128px
    40: '10rem',        // 160px
    48: '12rem',        // 192px
    56: '14rem',        // 224px
    64: '16rem'         // 256px
  },
  
  // Professional Component Sizing
  componentSizing: {
    button: {
      sm: '2.5rem',     // 40px height
      md: '3rem',       // 48px height (minimum professional)
      lg: '3.5rem',     // 56px height (recommended)
      xl: '4rem'        // 64px height (large interfaces)
    },
    input: {
      sm: '2.75rem',    // 44px height (accessibility minimum)
      md: '3.5rem',     // 56px height (professional standard)
      lg: '4rem',       // 64px height (premium interfaces)
      xl: '4.5rem'      // 72px height (extra large)
    },
    card: {
      sm: '1.5rem',     // 24px padding
      md: '2rem',       // 32px padding (standard)
      lg: '2.5rem',     // 40px padding (professional)
      xl: '3rem'        // 48px padding (premium)
    }
  }
};
```

---

## 3. Component Hierarchy & CVA System

### 3.1 Button Component System
```typescript
// Button CVA Implementation
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
        md: 'h-12 px-6 text-base',         // 48px height (minimum)
        lg: 'h-14 px-8 text-lg',           // 56px height (professional)
        xl: 'h-16 px-10 text-xl',          // 64px height (premium)
        icon: 'h-12 w-12 p-0'              // Icon-only button
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',        // Professional default
      fullWidth: false
    }
  }
);

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  readonly loading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
```

### 3.2 Input Component System
```typescript
// Input CVA Implementation
const inputVariants = cva(
  [
    'flex w-full transition-all duration-200',
    'bg-background text-foreground placeholder:text-muted-foreground',
    'border border-input rounded-lg shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium'
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
        md: 'h-14 px-4 py-3 text-base',    // 56px height (professional)
        lg: 'h-16 px-6 py-4 text-lg'       // 64px height (premium)
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
```

### 3.3 Card Component System
```typescript
// Card CVA Implementation
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
        md: 'p-8',        // 32px padding (professional standard)
        lg: 'p-10',       // 40px padding (premium)
        xl: 'p-12'        // 48px padding (luxury)
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent/5 active:bg-accent/10',
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
```

---

## 4. Accessibility Guidelines (WCAG AAA)

### 4.1 Color Contrast Requirements
```typescript
// WCAG AAA Color Contrast Specifications
export const accessibilityTokens = {
  contrast: {
    // AAA Level Requirements (7:1 ratio minimum)
    text: {
      primary: 'contrast-ratio: 7:1',      // Primary text on background
      secondary: 'contrast-ratio: 7:1',    // Secondary text on background
      onPrimary: 'contrast-ratio: 7:1',    // Text on primary color
      onSecondary: 'contrast-ratio: 7:1'   // Text on secondary color
    },
    
    // Large Text Requirements (4.5:1 ratio minimum for AAA)
    largeText: {
      primary: 'contrast-ratio: 4.5:1',    // 18px+ or 14px+ bold
      secondary: 'contrast-ratio: 4.5:1'
    },
    
    // Interactive Element Requirements
    interactive: {
      focus: 'contrast-ratio: 3:1',        // Focus indicators
      border: 'contrast-ratio: 3:1',       // Component borders
      graphical: 'contrast-ratio: 3:1'     // Icons and graphics
    }
  },
  
  // Focus Management
  focus: {
    ring: {
      width: '2px',
      style: 'solid',
      offset: '2px',
      color: 'var(--ring)'
    },
    visible: {
      outline: '2px solid var(--ring)',
      outlineOffset: '2px'
    }
  }
};
```

### 4.2 Keyboard Navigation System
```typescript
// Keyboard Navigation Implementation
export const keyboardNavigation = {
  // Tab Order Management
  tabOrder: {
    skipLinks: 0,           // Skip to main content
    primaryNav: 1,          // Main navigation
    searchInput: 2,         // Global search
    mainContent: 3,         // Primary content area
    secondaryNav: 4,        // Secondary navigation
    footer: 5               // Footer links
  },
  
  // Keyboard Shortcuts (Global)
  shortcuts: {
    'Cmd/Ctrl + K': 'Open command palette',
    'Cmd/Ctrl + /': 'Toggle help panel',
    'Cmd/Ctrl + Shift + A': 'Open AI assistant',
    'Escape': 'Close current modal/panel',
    'Tab': 'Navigate forward through focusable elements',
    'Shift + Tab': 'Navigate backward through focusable elements',
    'Enter': 'Activate focused element',
    'Space': 'Toggle switches/checkboxes',
    'Arrow Keys': 'Navigate within component groups'
  },
  
  // Focus Trap Implementation
  focusTrap: {
    modal: true,            // Trap focus within modals
    dropdown: true,         // Trap focus within dropdowns
    sidebar: false,         // Allow focus outside sidebar
    popover: true           // Trap focus within popovers
  }
};
```

### 4.3 Screen Reader Support
```typescript
// ARIA Implementation Standards
export const ariaStandards = {
  // Semantic HTML Requirements
  landmarks: {
    header: '<header role="banner">',
    nav: '<nav role="navigation" aria-label="Main navigation">',
    main: '<main role="main">',
    aside: '<aside role="complementary">',
    footer: '<footer role="contentinfo">'
  },
  
  // Dynamic Content Announcements
  liveRegions: {
    polite: 'aria-live="polite"',        // Status updates
    assertive: 'aria-live="assertive"',  // Important announcements
    off: 'aria-live="off"'               // No announcements
  },
  
  // Form Accessibility
  forms: {
    required: 'aria-required="true"',
    invalid: 'aria-invalid="true" aria-describedby="error-id"',
    described: 'aria-describedby="help-id"',
    labelledby: 'aria-labelledby="label-id"'
  },
  
  // Interactive Elements
  interactive: {
    expanded: 'aria-expanded="true|false"',
    selected: 'aria-selected="true|false"',
    pressed: 'aria-pressed="true|false"',
    checked: 'aria-checked="true|false|mixed"'
  }
};
```

---

## 5. Responsive Design Patterns

### 5.1 Breakpoint System
```typescript
// Responsive Breakpoint Specification
export const breakpointTokens = {
  breakpoints: {
    xs: '320px',        // Mobile portrait
    sm: '640px',        // Mobile landscape
    md: '768px',        // Tablet portrait
    lg: '1024px',       // Tablet landscape / Small desktop
    xl: '1280px',       // Desktop
    '2xl': '1536px',    // Large desktop
    '3xl': '1920px',    // Ultra-wide desktop
    '4xl': '2560px'     // 4K displays
  },
  
  // Container Sizes
  containers: {
    xs: '100%',         // Full width on mobile
    sm: '640px',        // Small container
    md: '768px',        // Medium container
    lg: '1024px',       // Large container
    xl: '1280px',       // Extra large container
    '2xl': '1536px'     // Maximum container width
  },
  
  // Component Responsive Behavior
  componentBehavior: {
    navigation: {
      xs: 'drawer',     // Mobile drawer navigation
      sm: 'drawer',     // Keep drawer on small screens
      md: 'tabs',       // Tab navigation on tablets
      lg: 'horizontal', // Horizontal nav on desktop
      xl: 'horizontal'  // Maintain horizontal on large screens
    },
    
    wizard: {
      xs: 'vertical',   // Vertical stepper on mobile
      sm: 'vertical',   // Keep vertical on small screens
      md: 'horizontal', // Horizontal stepper on tablets+
      lg: 'horizontal',
      xl: 'horizontal'
    },
    
    cards: {
      xs: '1fr',        // Single column on mobile
      sm: '1fr',        // Single column on small screens
      md: 'repeat(2, 1fr)', // Two columns on tablets
      lg: 'repeat(3, 1fr)', // Three columns on desktop
      xl: 'repeat(4, 1fr)'  // Four columns on large screens
    }
  }
};
```

### 5.2 Fluid Typography System
```typescript
// Fluid Typography Implementation
export const fluidTypography = {
  // Viewport-based scaling
  fluidScale: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',    // 12px - 14px
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',      // 14px - 16px
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',      // 16px - 18px
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',     // 18px - 20px
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',   // 20px - 24px
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',     // 24px - 30px
    '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)', // 30px - 36px
    '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',     // 36px - 48px
    '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',      // 48px - 60px
    '6xl': 'clamp(3.75rem, 3rem + 3.75vw, 4.5rem)'      // 60px - 72px
  },
  
  // Reading-optimized line heights
  lineHeight: {
    tight: 1.25,       // Headlines
    normal: 1.5,       // Body text (optimal readability)
    relaxed: 1.625,    // Long-form content
    loose: 2           // Special cases
  }
};
```

### 5.3 Adaptive Layout Patterns
```typescript
// Responsive Layout Components
export const responsiveLayouts = {
  // Stack Layout (Vertical/Horizontal switching)
  stack: {
    direction: {
      xs: 'column',     // Vertical on mobile
      sm: 'column',     // Vertical on small screens
      md: 'row',        // Horizontal on tablets+
      lg: 'row',
      xl: 'row'
    },
    spacing: {
      xs: 'var(--spacing-4)',  // 16px on mobile
      sm: 'var(--spacing-4)',  // 16px on small screens
      md: 'var(--spacing-6)',  // 24px on tablets
      lg: 'var(--spacing-8)',  // 32px on desktop
      xl: 'var(--spacing-10)'  // 40px on large screens
    }
  },
  
  // Grid Layout (Responsive columns)
  grid: {
    columns: {
      xs: 1,            // Single column on mobile
      sm: 1,            // Single column on small screens
      md: 2,            // Two columns on tablets
      lg: 3,            // Three columns on desktop
      xl: 4             // Four columns on large screens
    },
    gap: {
      xs: 'var(--spacing-4)',  // 16px gap on mobile
      sm: 'var(--spacing-4)',  // 16px gap on small screens
      md: 'var(--spacing-6)',  // 24px gap on tablets
      lg: 'var(--spacing-8)',  // 32px gap on desktop
      xl: 'var(--spacing-10)'  // 40px gap on large screens
    }
  }
};
```

---

## 6. Professional Sizing Standards

### 6.1 Component Minimum Sizes
```typescript
// Professional Sizing Standards (CLAUDE.md Compliant)
export const professionalSizing = {
  // Button Sizing Standards
  buttons: {
    minimum: {
      height: '3rem',      // 48px minimum (CLAUDE.md requirement)
      padding: '0 1.5rem', // 24px horizontal padding
      fontSize: '1rem',    // 16px text
      lineHeight: '1.5'    // 24px line height
    },
    recommended: {
      height: '3.5rem',    // 56px recommended height
      padding: '0 2rem',   // 32px horizontal padding
      fontSize: '1.125rem', // 18px text
      lineHeight: '1.5'    // 27px line height
    },
    premium: {
      height: '4rem',      // 64px premium height
      padding: '0 2.5rem', // 40px horizontal padding
      fontSize: '1.25rem', // 20px text
      lineHeight: '1.5'    // 30px line height
    }
  },
  
  // Input Field Sizing Standards
  inputs: {
    minimum: {
      height: '3.5rem',    // 56px minimum (CLAUDE.md requirement)
      padding: '0 1rem',   // 16px horizontal padding
      fontSize: '1rem',    // 16px text
      lineHeight: '1.5'    // 24px line height
    },
    recommended: {
      height: '4rem',      // 64px recommended height
      padding: '0 1.5rem', // 24px horizontal padding
      fontSize: '1.125rem', // 18px text
      lineHeight: '1.5'    // 27px line height
    },
    premium: {
      height: '4.5rem',    // 72px premium height
      padding: '0 2rem',   // 32px horizontal padding
      fontSize: '1.25rem', // 20px text
      lineHeight: '1.5'    // 30px line height
    }
  },
  
  // Card Padding Standards
  cards: {
    minimum: {
      padding: '1.5rem',   // 24px padding
    },
    recommended: {
      padding: '2rem',     // 32px padding (professional standard)
    },
    premium: {
      padding: '2.5rem',   // 40px padding
    },
    luxury: {
      padding: '3rem',     // 48px padding
    }
  },
  
  // Touch Target Requirements (Mobile)
  touchTargets: {
    minimum: '44px',       // WCAG AAA minimum
    recommended: '48px',   // Comfortable touch target
    optimal: '56px'        // Optimal touch target
  }
};
```

### 6.2 Spacing Hierarchy
```typescript
// Enhanced 8pt Grid System Implementation
export const spacingHierarchy = {
  // Component Internal Spacing
  component: {
    xs: '0.25rem',    // 4px - tight spacing
    sm: '0.5rem',     // 8px - small spacing
    md: '1rem',       // 16px - standard spacing
    lg: '1.5rem',     // 24px - comfortable spacing
    xl: '2rem',       // 32px - generous spacing
    '2xl': '3rem',    // 48px - section spacing
    '3xl': '4rem',    // 64px - large section spacing
    '4xl': '6rem'     // 96px - major section spacing
  },
  
  // Layout Spacing
  layout: {
    section: '4rem',      // 64px between major sections
    subsection: '2rem',   // 32px between subsections
    group: '1.5rem',      // 24px between related groups
    item: '1rem',         // 16px between individual items
    tight: '0.5rem'       // 8px for tight groupings
  },
  
  // Container Spacing
  container: {
    page: '2rem',         // 32px page margins (mobile)
    pageDesktop: '3rem',  // 48px page margins (desktop)
    modal: '2rem',        // 32px modal padding
    card: '1.5rem',       // 24px card padding (minimum)
    cardPro: '2rem'       // 32px card padding (professional)
  }
};
```

---

## 7. Color Systems & Typography

### 7.1 Multi-Theme Color Architecture
```typescript
// Complete Color System Implementation
export const colorSystem = {
  // Light Theme
  light: {
    // Background Colors
    background: {
      primary: 'hsl(0, 0%, 100%)',      // Pure white
      secondary: 'hsl(0, 0%, 98%)',     // Slightly off-white
      tertiary: 'hsl(0, 0%, 96%)',      // Light gray background
      overlay: 'hsla(0, 0%, 0%, 0.05)'  // Subtle overlay
    },
    
    // Text Colors (WCAG AAA Compliant)
    text: {
      primary: 'hsl(0, 0%, 9%)',        // Near black (7:1 contrast)
      secondary: 'hsl(0, 0%, 25%)',     // Dark gray (7:1 contrast)
      tertiary: 'hsl(0, 0%, 40%)',      // Medium gray (4.5:1 contrast)
      inverse: 'hsl(0, 0%, 100%)',      // White text on dark backgrounds
      muted: 'hsl(0, 0%, 55%)'          // Muted text (3:1 contrast)
    },
    
    // Brand Colors
    brand: {
      primary: 'hsl(210, 100%, 50%)',   // Primary brand color
      secondary: 'hsl(280, 100%, 50%)', // Secondary brand color
      accent: 'hsl(45, 100%, 50%)'      // Accent color
    },
    
    // Border Colors
    border: {
      default: 'hsl(0, 0%, 89%)',       // Standard border
      muted: 'hsl(0, 0%, 94%)',         // Subtle border
      emphasis: 'hsl(0, 0%, 80%)',      // Emphasized border
      focus: 'hsl(210, 100%, 50%)'      // Focus ring color
    }
  },
  
  // Dark Theme
  dark: {
    // Background Colors
    background: {
      primary: 'hsl(0, 0%, 9%)',        // Dark background
      secondary: 'hsl(0, 0%, 12%)',     // Slightly lighter
      tertiary: 'hsl(0, 0%, 15%)',      // Card backgrounds
      overlay: 'hsla(0, 0%, 100%, 0.05)' // Light overlay
    },
    
    // Text Colors (WCAG AAA Compliant)
    text: {
      primary: 'hsl(0, 0%, 95%)',       // Near white (7:1 contrast)
      secondary: 'hsl(0, 0%, 80%)',     // Light gray (7:1 contrast)
      tertiary: 'hsl(0, 0%, 65%)',      // Medium gray (4.5:1 contrast)
      inverse: 'hsl(0, 0%, 9%)',        // Dark text on light backgrounds
      muted: 'hsl(0, 0%, 50%)'          // Muted text (3:1 contrast)
    },
    
    // Brand Colors (Adjusted for dark theme)
    brand: {
      primary: 'hsl(210, 100%, 60%)',   // Lighter primary for dark theme
      secondary: 'hsl(280, 100%, 60%)', // Lighter secondary
      accent: 'hsl(45, 100%, 60%)'      // Lighter accent
    },
    
    // Border Colors
    border: {
      default: 'hsl(0, 0%, 25%)',       // Standard border
      muted: 'hsl(0, 0%, 20%)',         // Subtle border
      emphasis: 'hsl(0, 0%, 35%)',      // Emphasized border
      focus: 'hsl(210, 100%, 60%)'      // Focus ring color
    }
  },
  
  // High Contrast Theme (Accessibility)
  highContrast: {
    background: {
      primary: 'hsl(0, 0%, 0%)',        // Pure black
      secondary: 'hsl(0, 0%, 100%)'     // Pure white
    },
    text: {
      primary: 'hsl(0, 0%, 100%)',      // Pure white text
      inverse: 'hsl(0, 0%, 0%)'         // Pure black text
    },
    border: {
      default: 'hsl(0, 0%, 100%)',      // High contrast borders
      focus: 'hsl(60, 100%, 50%)'       // Yellow focus (maximum visibility)
    }
  }
};
```

### 7.2 Typography System Implementation
```typescript
// Professional Typography Scale
export const typographySystem = {
  // Font Stack (Performance Optimized)
  fontFamilies: {
    sans: [
      'Inter',                    // Primary font (modern, readable)
      '-apple-system',           // macOS system font
      'BlinkMacSystemFont',      // Webkit system font
      'Segoe UI',                // Windows system font
      'Roboto',                  // Android system font
      'Helvetica Neue',          // Fallback
      'Arial',                   // Universal fallback
      'sans-serif'               // Generic fallback
    ],
    mono: [
      'JetBrains Mono',          // Code font (excellent for programming)
      'SF Mono',                 // macOS monospace
      'Monaco',                  // macOS fallback
      'Consolas',                // Windows monospace
      'Ubuntu Mono',             // Linux monospace
      'Liberation Mono',         // Linux fallback
      'Courier New',             // Universal fallback
      'monospace'                // Generic fallback
    ],
    display: [
      'Inter Display',           // Display variant of Inter
      'Inter',                   // Fallback to regular Inter
      '-apple-system',           // System fallbacks
      'BlinkMacSystemFont',
      'sans-serif'
    ]
  },
  
  // Semantic Typography Roles
  semanticTypes: {
    // Headings
    heading1: {
      fontSize: 'var(--font-size-4xl)',     // 36px
      fontWeight: 'var(--font-weight-bold)', // 700
      lineHeight: 'var(--line-height-tight)', // 1.25
      letterSpacing: 'var(--letter-spacing-tight)', // -0.025em
      fontFamily: 'var(--font-family-display)'
    },
    heading2: {
      fontSize: 'var(--font-size-3xl)',     // 30px
      fontWeight: 'var(--font-weight-semibold)', // 600
      lineHeight: 'var(--line-height-tight)',
      letterSpacing: 'var(--letter-spacing-tight)',
      fontFamily: 'var(--font-family-display)'
    },
    heading3: {
      fontSize: 'var(--font-size-2xl)',     // 24px
      fontWeight: 'var(--font-weight-semibold)',
      lineHeight: 'var(--line-height-snug)', // 1.375
      fontFamily: 'var(--font-family-sans)'
    },
    
    // Body Text
    bodyLarge: {
      fontSize: 'var(--font-size-lg)',      // 18px
      fontWeight: 'var(--font-weight-normal)', // 400
      lineHeight: 'var(--line-height-relaxed)', // 1.625
      fontFamily: 'var(--font-family-sans)'
    },
    body: {
      fontSize: 'var(--font-size-base)',    // 16px
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 'var(--line-height-normal)', // 1.5
      fontFamily: 'var(--font-family-sans)'
    },
    bodySmall: {
      fontSize: 'var(--font-size-sm)',      // 14px
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 'var(--line-height-normal)',
      fontFamily: 'var(--font-family-sans)'
    },
    
    // Interface Text
    button: {
      fontSize: 'var(--font-size-base)',    // 16px
      fontWeight: 'var(--font-weight-medium)', // 500
      lineHeight: 'var(--line-height-none)', // 1
      letterSpacing: 'var(--letter-spacing-wide)', // 0.025em
      fontFamily: 'var(--font-family-sans)'
    },
    caption: {
      fontSize: 'var(--font-size-sm)',      // 14px
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 'var(--line-height-normal)',
      color: 'var(--color-text-tertiary)',
      fontFamily: 'var(--font-family-sans)'
    },
    
    // Code Text
    code: {
      fontSize: 'var(--font-size-sm)',      // 14px
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 'var(--line-height-relaxed)',
      fontFamily: 'var(--font-family-mono)',
      backgroundColor: 'var(--color-background-tertiary)',
      padding: '0.125rem 0.25rem',
      borderRadius: 'var(--border-radius-sm)'
    }
  }
};
```

---

## 8. Interaction Patterns & Animations

### 8.1 Animation System
```typescript
// Professional Animation Standards
export const animationSystem = {
  // Timing Functions (Easing Curves)
  easing: {
    linear: 'cubic-bezier(0, 0, 1, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Custom Professional Curves
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',      // Smooth professional feel
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',    // Subtle bounce
    precise: 'cubic-bezier(0.165, 0.84, 0.44, 1)',       // Precise, technical
    organic: 'cubic-bezier(0.23, 1, 0.32, 1)'            // Natural, organic
  },
  
  // Duration Standards
  duration: {
    instant: '0ms',           // Immediate feedback
    fast: '150ms',           // Quick transitions
    normal: '250ms',         // Standard transitions
    slow: '350ms',           // Deliberate transitions
    slower: '500ms',         // Emphasis transitions
    slowest: '750ms'         // Special effect transitions
  },
  
  // Animation Presets
  presets: {
    // Hover Effects
    buttonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    
    // Focus Effects
    focusRing: {
      outline: '2px solid var(--color-focus)',
      outlineOffset: '2px',
      transition: 'outline 150ms cubic-bezier(0.165, 0.84, 0.44, 1)'
    },
    
    // Modal Animations
    modalEnter: {
      opacity: '0',
      transform: 'scale(0.95) translateY(-10px)',
      animation: 'modalEnter 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
    },
    
    modalExit: {
      animation: 'modalExit 200ms cubic-bezier(0.4, 0, 1, 1) forwards'
    },
    
    // Slide Animations
    slideInRight: {
      transform: 'translateX(100%)',
      animation: 'slideInRight 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
    },
    
    slideInLeft: {
      transform: 'translateX(-100%)',
      animation: 'slideInLeft 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
    }
  },
  
  // Reduced Motion Support
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important'
      }
    }
  }
};
```

### 8.2 Micro-Interaction Patterns
```typescript
// Micro-Interaction Specifications
export const microInteractions = {
  // Button Interactions
  buttons: {
    primary: {
      idle: {
        backgroundColor: 'var(--color-primary)',
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      hover: {
        backgroundColor: 'var(--color-primary-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 200ms var(--easing-smooth)'
      },
      active: {
        backgroundColor: 'var(--color-primary-active)',
        transform: 'translateY(0)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        transition: 'all 100ms var(--easing-precise)'
      },
      focus: {
        outline: '2px solid var(--color-focus)',
        outlineOffset: '2px'
      }
    }
  },
  
  // Input Field Interactions
  inputs: {
    default: {
      idle: {
        borderColor: 'var(--color-border-default)',
        backgroundColor: 'var(--color-background-primary)'
      },
      focus: {
        borderColor: 'var(--color-primary)',
        backgroundColor: 'var(--color-background-primary)',
        boxShadow: '0 0 0 3px var(--color-primary-alpha-20)',
        transition: 'all 200ms var(--easing-smooth)'
      },
      error: {
        borderColor: 'var(--color-error)',
        backgroundColor: 'var(--color-error-alpha-5)',
        boxShadow: '0 0 0 3px var(--color-error-alpha-20)'
      },
      success: {
        borderColor: 'var(--color-success)',
        backgroundColor: 'var(--color-success-alpha-5)',
        boxShadow: '0 0 0 3px var(--color-success-alpha-20)'
      }
    }
  },
  
  // Card Interactions
  cards: {
    interactive: {
      idle: {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      },
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        transition: 'all 250ms var(--easing-smooth)'
      },
      active: {
        transform: 'translateY(0)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'all 150ms var(--easing-precise)'
      }
    }
  },
  
  // Loading States
  loading: {
    spinner: {
      animation: 'spin 1s linear infinite'
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    skeleton: {
      background: 'linear-gradient(90deg, var(--color-muted) 25%, var(--color-muted-light) 50%, var(--color-muted) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.5s ease-in-out infinite'
    }
  }
};
```

### 8.3 Page Transition System
```typescript
// Page Transition Specifications
export const pageTransitions = {
  // Route Transitions
  routes: {
    fadeInOut: {
      enter: {
        opacity: '0',
        animation: 'fadeIn 300ms var(--easing-smooth) forwards'
      },
      exit: {
        animation: 'fadeOut 200ms var(--easing-precise) forwards'
      }
    },
    
    slideLeft: {
      enter: {
        transform: 'translateX(20px)',
        opacity: '0',
        animation: 'slideInLeft 350ms var(--easing-smooth) forwards'
      },
      exit: {
        animation: 'slideOutLeft 250ms var(--easing-precise) forwards'
      }
    }
  },
  
  // Modal Transitions
  modals: {
    backdrop: {
      enter: {
        opacity: '0',
        animation: 'backdropFadeIn 250ms var(--easing-smooth) forwards'
      },
      exit: {
        animation: 'backdropFadeOut 200ms var(--easing-precise) forwards'
      }
    },
    
    content: {
      enter: {
        opacity: '0',
        transform: 'scale(0.95) translateY(-20px)',
        animation: 'modalContentEnter 300ms var(--easing-smooth) forwards'
      },
      exit: {
        animation: 'modalContentExit 200ms var(--easing-precise) forwards'
      }
    }
  },
  
  // Drawer Transitions
  drawers: {
    slideFromRight: {
      enter: {
        transform: 'translateX(100%)',
        animation: 'drawerSlideInRight 350ms var(--easing-smooth) forwards'
      },
      exit: {
        animation: 'drawerSlideOutRight 250ms var(--easing-precise) forwards'
      }
    }
  }
};
```

---

## 9. Layout Systems & Grids

### 9.1 CSS Grid System
```typescript
// Professional Grid System Implementation
export const gridSystem = {
  // Container System
  containers: {
    fluid: {
      width: '100%',
      paddingLeft: 'var(--spacing-4)',    // 16px mobile
      paddingRight: 'var(--spacing-4)',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    
    fixed: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      paddingLeft: 'var(--spacing-6)',     // 24px desktop
      paddingRight: 'var(--spacing-6)',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  
  // Grid Templates
  gridTemplates: {
    // 12-column grid (traditional)
    twelve: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 'var(--spacing-6)',             // 24px gap
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: 'var(--spacing-4)'            // 16px gap on mobile
      }
    },
    
    // Flexible grid (auto-fit)
    autoFit: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--spacing-6)'
    },
    
    // Sidebar layout
    sidebar: {
      display: 'grid',
      gridTemplateColumns: '280px 1fr',    // Fixed sidebar width
      gap: 'var(--spacing-8)',             // 32px gap
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr',
        gap: 'var(--spacing-4)'
      }
    },
    
    // Dashboard layout
    dashboard: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',   // Header, content, footer
      gridTemplateColumns: 'auto 1fr',     // Sidebar, main
      minHeight: '100vh',
      gap: 'var(--spacing-0)'              // No gap for full coverage
    }
  },
  
  // Responsive Grid Areas
  gridAreas: {
    appLayout: {
      gridTemplateAreas: `
        "header header"
        "sidebar main"
        "footer footer"
      `,
      '@media (max-width: 768px)': {
        gridTemplateAreas: `
          "header"
          "main"
          "footer"
        `,
        gridTemplateColumns: '1fr'
      }
    },
    
    wizardLayout: {
      gridTemplateAreas: `
        "stepper stepper"
        "content content"
        "navigation navigation"
      `,
      gridTemplateRows: 'auto 1fr auto'
    }
  }
};
```

### 9.2 Flexbox Utilities
```typescript
// Comprehensive Flexbox System
export const flexboxSystem = {
  // Stack Component (Flex Direction)
  stack: {
    vertical: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)'              // Default 16px gap
    },
    
    horizontal: {
      display: 'flex',
      flexDirection: 'row',
      gap: 'var(--spacing-4)',
      alignItems: 'center'                 // Center align by default
    },
    
    // Responsive direction switching
    responsive: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        gap: 'var(--spacing-6)'
      }
    }
  },
  
  // Alignment Utilities
  alignment: {
    // Justify Content
    justifyStart: { justifyContent: 'flex-start' },
    justifyCenter: { justifyContent: 'center' },
    justifyEnd: { justifyContent: 'flex-end' },
    justifyBetween: { justifyContent: 'space-between' },
    justifyAround: { justifyContent: 'space-around' },
    justifyEvenly: { justifyContent: 'space-evenly' },
    
    // Align Items
    alignStart: { alignItems: 'flex-start' },
    alignCenter: { alignItems: 'center' },
    alignEnd: { alignItems: 'flex-end' },
    alignStretch: { alignItems: 'stretch' },
    alignBaseline: { alignItems: 'baseline' }
  },
  
  // Common Layout Patterns
  patterns: {
    // Center content (both axes)
    centered: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%'
    },
    
    // Split layout (space between)
    split: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--spacing-4)'
    },
    
    // Button group
    buttonGroup: {
      display: 'flex',
      gap: 'var(--spacing-2)',             // 8px gap between buttons
      '@media (max-width: 640px)': {
        flexDirection: 'column',
        gap: 'var(--spacing-3)'            // 12px gap on mobile
      }
    }
  }
};
```

### 9.3 Layout Components
```typescript
// Professional Layout Component Specifications
export const layoutComponents = {
  // Application Shell
  appShell: {
    structure: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateColumns: 'auto 1fr',
      minHeight: '100vh',
      backgroundColor: 'var(--color-background-primary)'
    },
    
    header: {
      gridArea: 'header',
      height: '4rem',                      // 64px header height
      borderBottom: '1px solid var(--color-border-default)',
      backgroundColor: 'var(--color-background-primary)',
      zIndex: 100
    },
    
    sidebar: {
      gridArea: 'sidebar',
      width: '280px',                      // Standard sidebar width
      borderRight: '1px solid var(--color-border-default)',
      backgroundColor: 'var(--color-background-secondary)',
      overflowY: 'auto'
    },
    
    main: {
      gridArea: 'main',
      padding: 'var(--spacing-8)',         // 32px padding
      overflowY: 'auto',
      backgroundColor: 'var(--color-background-primary)'
    },
    
    // Mobile responsiveness
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      gridTemplateAreas: `
        "header"
        "main"
        "footer"
      `
    }
  },
  
  // Card Layout System
  cardLayout: {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 'var(--spacing-6)',             // 24px gap
      padding: 'var(--spacing-6)'
    },
    
    masonry: {
      columns: 'auto',
      columnWidth: '320px',
      columnGap: 'var(--spacing-6)',
      padding: 'var(--spacing-6)'
    }
  },
  
  // Form Layout System
  formLayout: {
    singleColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-6)',             // 24px between form groups
      maxWidth: '32rem',                   // 512px max width
      margin: '0 auto'
    },
    
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--spacing-6)',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    
    wizard: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '70vh',
      gap: 'var(--spacing-8)'              // 32px between sections
    }
  }
};
```

---

## 10. Multi-Platform Implementation

### 10.1 Platform-Specific Adaptations
```typescript
// Multi-Platform Component Architecture
export const platformAdaptations = {
  // React Implementation
  react: {
    componentStructure: {
      functional: true,                    // Functional components only
      hooks: ['useState', 'useCallback', 'useMemo', 'useEffect'],
      typescript: true,                    // Strict TypeScript
      returnType: 'JSX.Element'            // Explicit return types
    },
    
    stateManagement: {
      local: 'React.useState',
      global: 'Zustand',                   // Recommended state management
      forms: 'React Hook Form',            // Form state management
      async: 'TanStack Query'              // Server state management
    },
    
    styling: {
      system: 'Tailwind CSS',              // Primary styling system
      components: 'CVA (Class Variance Authority)',
      tokens: '@xala-technologies/ui-system'
    }
  },
  
  // Next.js Implementation
  nextjs: {
    features: {
      appRouter: true,                     // App Router (Next.js 13+)
      serverComponents: true,              // Server Components
      streaming: true,                     // Streaming SSR
      staticGeneration: true               // Static Site Generation
    },
    
    performance: {
      imageOptimization: 'next/image',
      fontOptimization: 'next/font',
      bundleAnalyzer: '@next/bundle-analyzer',
      compression: 'gzip'
    },
    
    seo: {
      metadata: 'generateMetadata',
      sitemap: 'sitemap.xml',
      robots: 'robots.txt',
      jsonLd: 'structured-data'
    }
  },
  
  // Vue Implementation
  vue: {
    version: '3.x',                        // Vue 3 Composition API
    composition: true,                     // Composition API preferred
    typescript: true,                      // TypeScript support
    
    reactivity: {
      refs: 'ref, reactive',
      computed: 'computed',
      watchers: 'watch, watchEffect'
    },
    
    routing: 'Vue Router 4',
    stateManagement: 'Pinia',
    styling: 'CSS Modules + Tailwind'
  },
  
  // Angular Implementation
  angular: {
    version: '17+',                        // Latest Angular
    standalone: true,                      // Standalone components
    signals: true,                         // Angular Signals
    
    architecture: {
      components: 'Standalone Components',
      services: 'Injectable Services',
      routing: 'Angular Router',
      forms: 'Reactive Forms'
    },
    
    styling: {
      primary: 'Angular Material + Tailwind',
      theming: 'Angular Material Theming',
      responsive: 'Angular Flex Layout'
    }
  },
  
  // Svelte Implementation
  svelte: {
    version: '4.x',                        // Svelte 4
    kit: 'SvelteKit',                      // Full-stack framework
    typescript: true,                      // TypeScript support
    
    features: {
      reactivity: 'Built-in reactivity',
      stores: 'Svelte stores',
      animations: 'Svelte transitions',
      actions: 'Svelte actions'
    },
    
    styling: {
      scoped: 'Scoped CSS',
      global: 'Tailwind CSS',
      animations: 'Svelte animations'
    }
  }
};
```

### 10.2 Design Token Transformation
```typescript
// Platform-Specific Token Generation
export const tokenTransformation = {
  // Web Platforms (CSS Custom Properties)
  css: {
    colors: {
      '--color-primary': 'hsl(210, 100%, 50%)',
      '--color-primary-hover': 'hsl(210, 100%, 45%)',
      '--color-primary-foreground': 'hsl(0, 0%, 100%)'
    },
    
    spacing: {
      '--spacing-xs': '0.25rem',          // 4px
      '--spacing-sm': '0.5rem',           // 8px
      '--spacing-md': '1rem',             // 16px
      '--spacing-lg': '1.5rem',           // 24px
      '--spacing-xl': '2rem'              // 32px
    },
    
    typography: {
      '--font-size-sm': '0.875rem',       // 14px
      '--font-size-base': '1rem',         // 16px
      '--font-size-lg': '1.125rem',       // 18px
      '--line-height-tight': '1.25',
      '--line-height-normal': '1.5'
    }
  },
  
  // React Native (JavaScript Objects)
  reactNative: {
    colors: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryForeground: '#FFFFFF'
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    
    typography: {
      fontSize: {
        sm: 14,
        base: 16,
        lg: 18
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5
      }
    }
  },
  
  // Electron (Mixed Web + Native)
  electron: {
    platform: 'web',                      // Uses web tokens
    nativeIntegration: {
      titleBar: 'custom',                  // Custom title bar
      windowControls: 'frameless',        // Frameless window
      nativeMenus: true                    // Native context menus
    }
  }
};
```

---

## 11. Norwegian Compliance & NSM Security

### 11.1 Norwegian Digital Standards
```typescript
// Norwegian Compliance Implementation
export const norwegianCompliance = {
  // Language Support
  localization: {
    primary: 'nb-NO',                      // Norwegian Bokmål
    fallback: 'en-US',                     // English fallback
    
    dateFormats: {
      short: 'dd.mm.yyyy',                 // Norwegian date format
      long: 'dd. MMMM yyyy',               // Long Norwegian format
      time: 'HH:mm'                        // 24-hour format
    },
    
    numberFormats: {
      decimal: ',',                        // Comma as decimal separator
      thousands: ' ',                      // Space as thousands separator
      currency: 'NOK'                      // Norwegian Kroner
    }
  },
  
  // Accessibility Standards
  accessibility: {
    standard: 'WCAG 2.1 AA',              // Minimum Norwegian requirement
    target: 'WCAG 2.2 AAA',               // Target compliance level
    
    keyboardNavigation: {
      required: true,
      skipLinks: true,                     // Required skip links
      focusVisible: true,                  // Visible focus indicators
      tabOrder: 'logical'                  // Logical tab order
    },
    
    screenReader: {
      tested: ['NVDA', 'JAWS', 'VoiceOver'],
      language: 'nb-NO',                   // Norwegian screen reader support
      landmarks: true                      // ARIA landmarks required
    }
  },
  
  // Privacy & Data Protection
  privacy: {
    gdpr: true,                            // GDPR compliance required
    cookieConsent: 'explicit',             // Explicit consent required
    dataMinimization: true,                // Data minimization principle
    rightToBeforgotten: true,             // Deletion rights
    
    dataProcessing: {
      legalBasis: 'consent',               // Primary legal basis
      purposeLimitation: true,             // Purpose limitation
      storageMinimization: true,           // Storage minimization
      securityMeasures: 'technical'        // Technical security measures
    }
  }
};
```

### 11.2 NSM Security Classifications
```typescript
// NSM Security Implementation
export const nsmSecurity = {
  // Security Classifications
  classifications: {
    OPEN: {
      level: 0,
      description: 'Information that can be shared publicly',
      requirements: {
        encryption: 'optional',
        access: 'public',
        storage: 'any',
        transmission: 'any'
      },
      styling: {
        borderColor: '#10B981',             // Green border
        backgroundColor: '#F0FDF4',        // Light green background
        badgeColor: '#059669'              // Green badge
      }
    },
    
    RESTRICTED: {
      level: 1,
      description: 'Information with limited distribution',
      requirements: {
        encryption: 'recommended',
        access: 'authenticated',
        storage: 'secure',
        transmission: 'https'
      },
      styling: {
        borderColor: '#F59E0B',             // Yellow border
        backgroundColor: '#FFFBEB',        // Light yellow background
        badgeColor: '#D97706'              // Yellow badge
      }
    },
    
    CONFIDENTIAL: {
      level: 2,
      description: 'Sensitive information requiring protection',
      requirements: {
        encryption: 'required',
        access: 'authorized',
        storage: 'encrypted',
        transmission: 'tls',
        audit: 'required'
      },
      styling: {
        borderColor: '#EF4444',             // Red border
        backgroundColor: '#FEF2F2',        // Light red background
        badgeColor: '#DC2626'              // Red badge
      }
    },
    
    SECRET: {
      level: 3,
      description: 'Highly sensitive classified information',
      requirements: {
        encryption: 'advanced',
        access: 'cleared-personnel',
        storage: 'air-gapped',
        transmission: 'secure-channel',
        audit: 'comprehensive',
        retention: 'controlled'
      },
      styling: {
        borderColor: '#7C2D12',             // Dark red border
        backgroundColor: '#FFF1F2',        // Very light red background
        badgeColor: '#991B1B'              // Dark red badge
      }
    }
  },
  
  // Security UI Components
  securityComponents: {
    classificationBadge: {
      position: 'top-right',
      size: 'sm',
      contrast: 'high',                    // High contrast for visibility
      required: true                       // Always visible
    },
    
    warningBanner: {
      position: 'top',
      dismissible: false,                  // Cannot be dismissed
      persistent: true,                    // Always visible with classified data
      animation: 'none'                    // No distracting animations
    },
    
    accessControls: {
      authentication: 'multi-factor',      // MFA required for higher levels
      sessionTimeout: 'automatic',         // Automatic session timeout
      auditLogging: 'comprehensive'        // Comprehensive audit logging
    }
  }
};
```

### 11.3 Government Integration Standards
```typescript
// Norwegian Government Digital Standards
export const governmentStandards = {
  // ID-porten Integration
  idPorten: {
    provider: 'ID-porten',
    levels: ['substantial', 'high'],       // Assurance levels
    attributes: ['pid', 'name', 'address'],
    integration: {
      protocol: 'OIDC',                    // OpenID Connect
      endpoints: 'production',             // Production endpoints
      certificates: 'virksomhetssertifikat'
    }
  },
  
  // Altinn Integration
  altinn: {
    services: ['authorization', 'notifications'],
    apis: ['REST', 'SOAP'],
    authentication: 'maskinporten',
    dataFormats: ['JSON', 'XML']
  },
  
  // Design System Integration
  designSystem: {
    norge: {
      fonts: ['Source Sans Pro', 'system-ui'],
      colors: {
        primary: '#0067C5',                // Norge.no blue
        secondary: '#1E88E5',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
      },
      spacing: '8px-grid',                 // 8px grid system
      accessibility: 'WCAG 2.1 AA'        // Minimum requirement
    }
  }
};
```

---

## 12. Performance & Optimization

### 12.1 Performance Standards
```typescript
// Performance Optimization Specifications
export const performanceStandards = {
  // Core Web Vitals Targets
  coreWebVitals: {
    LCP: '2.5s',                          // Largest Contentful Paint
    FID: '100ms',                         // First Input Delay
    CLS: '0.1',                           // Cumulative Layout Shift
    FCP: '1.8s',                          // First Contentful Paint
    TTFB: '600ms'                         // Time to First Byte
  },
  
  // Bundle Size Targets
  bundleSize: {
    initial: '200KB',                     // Initial bundle size
    total: '500KB',                       // Total bundle size
    components: '50KB',                   // Component library
    vendors: '150KB'                      // Third-party libraries
  },
  
  // Runtime Performance
  runtime: {
    componentRender: '16ms',              // 60fps target
    eventHandling: '5ms',                 // Event handler execution
    stateUpdates: '10ms',                 // State update processing
    memoryUsage: '50MB'                   // Maximum memory usage
  },
  
  // Optimization Strategies
  optimizations: {
    // Code Splitting
    codeSplitting: {
      routes: 'dynamic',                  // Route-based splitting
      components: 'lazy',                 // Lazy component loading
      vendors: 'separate',                // Separate vendor chunks
      commons: 'shared'                   // Shared common chunks
    },
    
    // Asset Optimization
    assets: {
      images: 'webp',                     // WebP format preferred
      icons: 'svg-sprite',                // SVG sprite for icons
      fonts: 'woff2',                     // WOFF2 format
      compression: 'brotli'               // Brotli compression
    },
    
    // Caching Strategy
    caching: {
      static: '1-year',                   // Static assets cache
      api: '5-minutes',                   // API response cache
      components: 'build-time',           // Component cache
      service-worker: 'network-first'     // Service worker strategy
    }
  }
};
```

### 12.2 Loading States & Skeleton UI
```typescript
// Performance-Oriented Loading States
export const loadingStates = {
  // Skeleton UI Patterns
  skeletons: {
    card: {
      structure: [
        { type: 'rectangle', width: '100%', height: '200px' },  // Image placeholder
        { type: 'text', width: '80%', height: '24px' },        // Title placeholder
        { type: 'text', width: '60%', height: '16px' },        // Subtitle placeholder
        { type: 'text', width: '90%', height: '14px' },        // Content line 1
        { type: 'text', width: '70%', height: '14px' }         // Content line 2
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
    },
    
    form: {
      fields: [
        { type: 'label', width: '30%', height: '20px' },
        { type: 'input', width: '100%', height: '56px' },
        { type: 'spacing', height: '24px' }
      ],
      repeat: 4
    }
  },
  
  // Progressive Loading
  progressive: {
    images: {
      placeholder: 'blur',                // Blur placeholder
      fadeIn: '300ms',                    // Fade-in duration
      progressive: true,                  // Progressive JPEG
      lazy: true                          // Lazy loading
    },
    
    components: {
      priority: ['above-fold', 'interactive', 'below-fold'],
      loading: 'incremental',             // Incremental loading
      fallback: 'skeleton'                // Skeleton fallback
    }
  },
  
  // Error States
  errorStates: {
    network: {
      icon: 'wifi-off',
      title: 'Connection Error',
      message: 'Check your internet connection and try again',
      actions: ['retry', 'offline-mode']
    },
    
    notFound: {
      icon: 'search',
      title: 'No Results Found',
      message: 'Try adjusting your search criteria',
      actions: ['clear-filters', 'browse-all']
    },
    
    serverError: {
      icon: 'alert-triangle',
      title: 'Something Went Wrong',
      message: 'We\'re working to fix this issue',
      actions: ['retry', 'report-issue']
    }
  }
};
```

---

## 13. Implementation Guidelines

### 13.1 Development Workflow
```typescript
// Implementation Standards & Guidelines
export const implementationGuidelines = {
  // Component Development Process
  componentDevelopment: {
    structure: {
      1: 'Create TypeScript interface with readonly props',
      2: 'Implement functional component with JSX.Element return type',
      3: 'Add CVA variants system for styling',
      4: 'Implement accessibility features (ARIA, keyboard nav)',
      5: 'Add responsive behavior and breakpoint handling',
      6: 'Create comprehensive tests (unit, integration, a11y)',
      7: 'Generate Storybook stories and documentation',
      8: 'Performance optimization and bundle analysis'
    },
    
    checklist: [
      'TypeScript interfaces with readonly props',
      'Professional sizing (h-12+ buttons, h-14+ inputs)',
      'WCAG AAA accessibility compliance',
      'Design token usage (no hardcoded values)',
      'CVA variant system implementation',
      'Responsive design across all breakpoints',
      'Error boundaries and loading states',
      'Comprehensive test coverage',
      'Storybook documentation',
      'Performance optimization'
    ]
  },
  
  // Code Quality Standards
  codeQuality: {
    typescript: {
      strict: true,                       // Strict TypeScript mode
      noImplicitAny: true,                // No implicit any types
      exactOptionalPropertyTypes: true,   // Exact optional properties
      noUncheckedIndexedAccess: true,     // No unchecked indexed access
      noImplicitReturns: true             // No implicit returns
    },
    
    linting: {
      eslint: '@typescript-eslint/recommended',
      prettier: 'standard',
      stylelint: 'standard',
      husky: 'pre-commit-hooks'
    },
    
    testing: {
      unit: 'Vitest',                     // Unit testing framework
      integration: 'Testing Library',     // Integration testing
      e2e: 'Playwright',                  // End-to-end testing
      a11y: 'axe-core',                   // Accessibility testing
      visual: 'Chromatic'                 // Visual regression testing
    }
  },
  
  // Documentation Standards
  documentation: {
    components: {
      required: [
        'Component description and purpose',
        'Props interface documentation',
        'Usage examples with code snippets',
        'Accessibility considerations',
        'Design token references',
        'Responsive behavior documentation',
        'Browser compatibility notes'
      ]
    },
    
    storybook: {
      stories: [
        'Default',                        // Default state
        'All Variants',                   // All variant combinations
        'Interactive',                    // Interactive examples
        'Accessibility',                  // Accessibility demonstrations
        'Edge Cases'                      // Edge case handling
      ]
    }
  }
};
```

### 13.2 Design System Maintenance
```typescript
// Long-term Maintenance Strategy
export const maintenanceStrategy = {
  // Version Management
  versioning: {
    semantic: 'MAJOR.MINOR.PATCH',
    breaking: 'MAJOR',                    // Breaking changes
    features: 'MINOR',                    // New features
    fixes: 'PATCH',                       // Bug fixes
    
    deprecation: {
      notice: '2-versions',               // 2-version deprecation notice
      removal: '3-versions',              // Removal after 3 versions
      migration: 'automatic-codemods'     // Automated migration tools
    }
  },
  
  // Quality Assurance
  qa: {
    automated: [
      'Unit tests (95% coverage)',
      'Integration tests',
      'Accessibility tests (axe-core)',
      'Visual regression tests',
      'Performance tests',
      'Bundle size monitoring'
    ],
    
    manual: [
      'Cross-browser testing',
      'Device testing',
      'Screen reader testing',
      'User acceptance testing',
      'Performance profiling'
    ]
  },
  
  // Community & Adoption
  adoption: {
    training: [
      'Developer onboarding',
      'Design system workshops',
      'Best practices documentation',
      'Video tutorials',
      'Interactive examples'
    ],
    
    feedback: [
      'Component usage analytics',
      'Developer feedback collection',
      'Design system surveys',
      'GitHub issue tracking',
      'Community discussions'
    ]
  }
};
```

---

## Conclusion

This comprehensive design system specification provides the foundation for building a world-class, accessible, and performant web interface for the Xaheen CLI. The system is designed to:

1. **Ensure Consistency**: Through design tokens and CVA variant systems
2. **Maintain Accessibility**: With WCAG AAA compliance as standard
3. **Support Multi-Platform**: Across React, Next.js, Vue, Angular, and Svelte
4. **Meet Norwegian Standards**: With proper localization and NSM security
5. **Optimize Performance**: Through modern optimization techniques
6. **Scale Effectively**: With proper architecture and maintenance strategies

The implementation of this design system will result in a professional, accessible, and high-performance web interface that serves developers across all skill levels while maintaining the highest standards of quality and usability.

**Next Steps:**
1. Begin implementation with foundation components (Button, Input, Card)
2. Establish design token architecture and theme system
3. Create comprehensive component library with CVA variants
4. Implement accessibility testing and validation
5. Build responsive layouts and interaction patterns
6. Establish performance monitoring and optimization
7. Create documentation and developer resources
8. Launch design system and gather community feedback

This design system specification serves as the definitive guide for all frontend development on the Xaheen CLI platform, ensuring consistency, quality, and accessibility across all user interfaces.