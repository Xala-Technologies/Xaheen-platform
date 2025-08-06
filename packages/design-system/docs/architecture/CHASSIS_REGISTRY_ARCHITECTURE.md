# 🚗 Chassis & Registry Architecture

## Core Concept

The Xaheen Universal Design System follows a **Chassis & Registry** pattern where:

- **Chassis**: Pure, framework-agnostic component specifications and implementations
- **Registry**: Central system for discovering, installing, and loading components across platforms

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL REGISTRY                           │
├─────────────────────────────────────────────────────────────────┤
│  Component Discovery | Installation | Platform Detection       │
│  Specification Store | Dependency Resolution | Loading System  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHASSIS LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Pure Components     │  Design Tokens    │  Specifications     │
│  No Dependencies     │  Cross-Platform   │  Type Definitions   │
│  Framework Agnostic  │  Universal        │  Validation Rules   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PLATFORM IMPLEMENTATIONS                     │
├─────────────────────────────────────────────────────────────────┤
│  React   │  Vue   │  Angular │  Svelte │  React Native │  etc   │
│  Hooks   │  Comp  │  Service │  Store  │  StyleSheet   │  ...   │
│  Context │  API   │  DI      │  Runes  │  Navigation   │        │
└─────────────────────────────────────────────────────────────────┘
```

## Registry System

### 1. Component Registration

```typescript
// registry/specifications/registry.ts
export class SpecificationRegistry {
  // Register pure component specifications
  public register(spec: ComponentSpecification): void {
    this.specifications.set(spec.id, spec);
    this.updateIndexes(spec);
  }

  // Query components by criteria
  public query(query: SpecificationQuery): ComponentSpecification[] {
    // Filter by category, platform, compliance, etc.
  }
}
```

### 2. Platform Detection & Loading

```typescript
// registry/universal-index.ts
export const detectPlatform = (): Platform => {
  // Automatic platform detection
  if (typeof window !== 'undefined') {
    if ('Vue' in window) return 'vue';
    if ('__NEXT_DATA__' in window) return 'nextjs';
    return 'react';
  }
  return 'vanilla';
};

export const createPlatformLoader = (platform: Platform) => ({
  react: () => ({
    Button: () => import('./platforms/react/button').then(m => m.Button),
    Input: () => import('./platforms/react/input').then(m => m.Input),
  }),
  vue: () => ({
    Button: () => import('./platforms/vue/Button.vue').then(m => m.default),
    Input: () => import('./platforms/vue/Input.vue').then(m => m.default),
  }),
  // ... other platforms
});
```

## Chassis Components (Pure)

### Pure Component Example

```typescript
// registry/components/button/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Pure component - no hooks, no external dependencies
export interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'outline';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  // Platform-agnostic accessibility props
  readonly ariaLabel?: string;
  readonly ariaDescribedBy?: string;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = ({
  children,
  variant,
  size,
  disabled,
  loading,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ...props
}: ButtonProps): JSX.Element => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};
```

## Platform-Specific Implementations

### React Platform Implementation

```typescript
// registry/platforms/react/button.tsx
import { forwardRef } from 'react';
import { Button as ChassisButton, type ButtonProps } from '../../components/button/button';

// Enhanced React version with refs and hooks support
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <ChassisButton ref={ref} {...props} />
);

Button.displayName = 'Button';
```

### Vue Platform Implementation

```vue
<!-- registry/platforms/vue/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
  >
    <LoadingSpinner v-if="loading" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { buttonVariants } from '../../components/button/button';
import { cn } from '../../lib/utils';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => 
  cn(buttonVariants({ variant: props.variant, size: props.size }))
);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>
```

## Component Installation Flow

### 1. Automatic Installation

```typescript
// Consumer app
import { componentFactory } from '@xaheen/design-system';

// Auto-detects platform and installs appropriate components
const Button = await componentFactory.install('button');
const Input = await componentFactory.install('input');
```

### 2. Manual Platform Selection

```typescript
// Consumer app - explicit platform
import { Button } from '@xaheen/design-system/react';
import Button from '@xaheen/design-system/vue/Button.vue';
import { ButtonComponent } from '@xaheen/design-system/angular';
```

### 3. Registry-Based Installation

```typescript
// Consumer app - registry approach
import { Registry } from '@xaheen/design-system/registry';

const registry = new Registry();

// Install specific components
await registry.install(['button', 'input', 'card']);

// Use installed components
const Button = registry.getComponent('button');
const Input = registry.getComponent('input');
```

## Benefits of Chassis & Registry Pattern

### ✅ **Purity & Portability**
- Components are pure - no hidden dependencies
- Easy to test in isolation
- Work across any platform

### ✅ **Discovery & Installation**
- Centralized component registry
- Dynamic loading and tree-shaking
- Automatic platform detection

### ✅ **Flexibility**
- Consumer apps control providers/context
- Mix and match components as needed
- Override platform implementations

### ✅ **Performance**
- Only load what you use
- Platform-optimized implementations
- Minimal bundle impact

## Consumer Usage Patterns

### Pattern 1: Pure Chassis (Minimal)

```typescript
// Direct import from chassis
import { Button, Card } from '@xaheen/design-system/registry';

// Consumer provides all context
function App() {
  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <Card>
          <Button onClick={handleClick}>
            Click me
          </Button>
        </Card>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}
```

### Pattern 2: Platform-Enhanced

```typescript
// Platform-specific with enhanced features
import { Button, useButton } from '@xaheen/design-system/react';

function App() {
  // Platform-specific hooks available
  const buttonRef = useButton({
    variant: 'primary',
    autoFocus: true,
  });

  return (
    <Button ref={buttonRef}>
      Enhanced React Button
    </Button>
  );
}
```

### Pattern 3: Registry-Managed

```typescript
// Full registry management
import { createRegistry } from '@xaheen/design-system/registry';

const registry = createRegistry({
  platform: 'react',
  components: ['button', 'input', 'card'],
  theme: 'enterprise',
});

function App() {
  const { Button, Input, Card } = registry.getComponents();
  
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Migration & Versioning

The chassis & registry pattern enables smooth migrations:

```typescript
// Gradual migration
import { Button as ButtonV1 } from '@xaheen/design-system/v1/react';
import { Button as ButtonV2 } from '@xaheen/design-system/v2/react';

// Side-by-side usage during migration
function MigrationApp() {
  return (
    <div>
      <ButtonV1>Old Button</ButtonV1>
      <ButtonV2>New Button</ButtonV2>
    </div>
  );
}
```

This architecture ensures components remain pure, discoverable, and installable while providing maximum flexibility for consumer applications.