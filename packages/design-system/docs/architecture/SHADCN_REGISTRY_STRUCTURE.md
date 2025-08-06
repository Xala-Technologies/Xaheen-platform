# 🗂️ shadcn/ui Registry-Based Architecture

## Overview

The Xaheen Universal Design System follows the **shadcn/ui registry pattern** extended for multi-platform support. Components are distributed via a registry system that allows installation and management across different frameworks.

## Registry Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT REGISTRY                          │
├─────────────────────────────────────────────────────────────────┤
│  registry.json  │  Component Metadata  │  Platform Variants    │
│  Build System   │  CLI Integration     │  Auto-Generation     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PURE COMPONENTS                             │
├─────────────────────────────────────────────────────────────────┤
│  Installable     │  Self-Contained    │  Platform-Agnostic    │
│  Dependencies    │  Tailwind Classes  │  Copy & Paste Ready   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                PLATFORM IMPLEMENTATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  React   │  Vue   │  Angular │  Svelte │  React Native │  etc   │
│  JSX     │  SFC   │  Template│  Runes  │  StyleSheet   │  ...   │
│  Hooks   │  Comp  │  Service │  Store  │  Navigation   │        │
└─────────────────────────────────────────────────────────────────┘
```

## Registry Structure

### Core Registry Definition

```json
// registry/metadata/registry.json
{
  "$schema": "./schemas/registry.schema.json",
  "name": "xaheen",
  "version": "1.0.0",
  "description": "Universal design system with multi-platform support",
  "items": [
    {
      "name": "button",
      "type": "registry:component",
      "title": "Button",
      "description": "Professional button with NSM classification",
      "category": "components",
      "platforms": ["react", "vue", "angular", "svelte", "react-native"],
      "dependencies": ["@radix-ui/react-slot", "class-variance-authority"],
      "registryDependencies": ["utils"],
      "files": [
        {
          "path": "components/button/button.tsx",
          "type": "registry:component"
        },
        {
          "path": "platforms/react/button.tsx",
          "type": "registry:component",
          "platform": "react"
        },
        {
          "path": "platforms/vue/Button.vue", 
          "type": "registry:component",
          "platform": "vue"
        }
      ]
    }
  ]
}
```

### File Structure

```
packages/design-system/
├── registry/
│   ├── components/                  # Pure, installable components
│   │   ├── button/
│   │   │   ├── button.tsx          # Main component implementation
│   │   │   ├── button.stories.tsx  # Storybook stories
│   │   │   └── button.test.tsx     # Unit tests
│   │   ├── input/
│   │   ├── card/
│   │   └── [component]/
│   │
│   ├── platforms/                  # Platform-specific implementations
│   │   ├── react/
│   │   │   ├── button.tsx          # React-specific enhancements
│   │   │   ├── input.tsx
│   │   │   └── index.ts
│   │   ├── vue/
│   │   │   ├── Button.vue          # Vue single-file component
│   │   │   ├── Input.vue
│   │   │   └── index.ts
│   │   ├── angular/
│   │   ├── svelte/
│   │   └── [platform]/
│   │
│   ├── blocks/                     # Complex UI patterns
│   │   ├── login-form/
│   │   ├── dashboard-01/
│   │   └── [block]/
│   │
│   ├── lib/                        # Shared utilities
│   │   ├── utils.ts                # Utility functions
│   │   ├── constants.ts            # Constants
│   │   └── index.ts
│   │
│   ├── metadata/                   # Registry metadata
│   │   ├── registry.json           # Main registry definition
│   │   ├── schemas/                # JSON schemas
│   │   └── index.ts
│   │
│   └── index.ts                    # Registry exports
│
├── public/r/                       # Built registry files
│   ├── button.json                 # Individual component registry
│   ├── input.json
│   ├── platforms/
│   │   ├── react/
│   │   │   ├── button.json
│   │   │   └── index.json
│   │   └── [platform]/
│   └── index.json                  # Main registry index
│
├── scripts/
│   ├── build-registry.ts           # Registry build script
│   ├── generate-component.ts       # Component generator
│   └── validate-registry.ts        # Registry validation
│
└── app/api/registry/               # Registry API routes
    ├── [name]/
    │   └── route.ts                # Component API endpoint
    └── route.ts                    # Registry index endpoint
```

## Component Implementation Pattern

### 1. Pure Component (Registry Base)

```typescript
// registry/components/button/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### 2. Platform-Specific Implementations

```typescript
// registry/platforms/react/button.tsx
import { Button as BaseButton, type ButtonProps } from "../../components/button/button";
export { Button: BaseButton, type ButtonProps };
```

```vue
<!-- registry/platforms/vue/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Vue-specific implementation using composition API
const buttonVariants = cva(/* same variants as base */);

interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default'
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => 
  cn(buttonVariants({ 
    variant: props.variant, 
    size: props.size 
  }), props.class)
);
</script>
```

## Registry Build System

### Build Script

```typescript
// scripts/build-registry.ts
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';
import registryConfig from '../registry/metadata/registry.json';

export async function buildRegistry() {
  const outputDir = resolve(process.cwd(), 'public/r');
  
  // Build main registry index
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    resolve(outputDir, 'index.json'),
    JSON.stringify(registryConfig, null, 2)
  );

  // Build individual component registries
  for (const item of registryConfig.items) {
    const componentRegistry = {
      name: item.name,
      type: item.type,
      files: await resolveComponentFiles(item),
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies
    };

    await writeFile(
      resolve(outputDir, `${item.name}.json`),
      JSON.stringify(componentRegistry, null, 2)
    );

    // Build platform-specific registries
    for (const platform of item.platforms || []) {
      const platformDir = resolve(outputDir, 'platforms', platform);
      await mkdir(platformDir, { recursive: true });
      
      const platformRegistry = {
        ...componentRegistry,
        files: componentRegistry.files.filter(
          f => !f.platform || f.platform === platform
        )
      };

      await writeFile(
        resolve(platformDir, `${item.name}.json`),
        JSON.stringify(platformRegistry, null, 2)
      );
    }
  }
}
```

## CLI Integration

### Installation Command

```bash
# Install specific component
npx xaheen add button

# Install for specific platform
npx xaheen add button --platform vue

# Install multiple components
npx xaheen add button input card

# Install block/pattern
npx xaheen add login-form
```

### CLI Implementation

```typescript
// CLI command handler
export async function addComponent(name: string, options: AddOptions) {
  const platform = options.platform || detectPlatform();
  const registryUrl = `https://registry.xaheen.io/r/${name}.json`;
  
  // Fetch component from registry
  const componentData = await fetch(registryUrl).then(r => r.json());
  
  // Filter files for target platform
  const targetFiles = componentData.files.filter(
    file => !file.platform || file.platform === platform
  );
  
  // Install dependencies
  await installDependencies(componentData.dependencies);
  
  // Install registry dependencies
  for (const dep of componentData.registryDependencies) {
    await addComponent(dep, options);
  }
  
  // Copy component files
  for (const file of targetFiles) {
    await copyComponentFile(file, options.targetDir);
  }
  
  console.log(`✅ Added ${name} component for ${platform}`);
}
```

## Usage Patterns

### 1. Direct Installation (shadcn/ui style)

```bash
npx xaheen add button input card
```

```typescript
// Consumer app
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function App() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

### 2. Platform-Specific Installation

```bash
npx xaheen add button --platform vue
```

```vue
<!-- Consumer Vue app -->
<template>
  <div>
    <Button variant="outline">Click me</Button>
  </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue';
</script>
```

### 3. Registry API Usage

```typescript
// Programmatic installation
import { registryClient } from '@xaheen/design-system/registry';

const button = await registryClient.install('button', {
  platform: 'react',
  targetDir: './src/components/ui'
});
```

## Benefits of Registry Pattern

### ✅ **Copy & Paste Ready**
- Components are self-contained and ready to use
- No complex build setup required
- Direct file installation

### ✅ **Platform Flexibility**
- Same component available for multiple platforms
- Platform-specific optimizations
- Automatic platform detection

### ✅ **Dependency Management**
- Clear dependency declarations
- Automatic registry dependency resolution
- Version compatibility

### ✅ **Customization-Friendly**
- Components are copied to consumer project
- Full customization control
- No vendor lock-in

### ✅ **CLI Integration**
- Simple installation commands
- Automatic file management
- Platform-aware installation

This registry-based approach provides the flexibility of shadcn/ui while extending support to multiple platforms and frameworks.