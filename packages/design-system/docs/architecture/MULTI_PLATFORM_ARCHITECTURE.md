# 🌐 Multi-Platform Architecture

## **Universal Design System for All Frameworks**

The Xaheen Design System Registry is architected as a **truly universal system** that generates components for **any platform or framework**:

- **React** + Next.js + Electron
- **Vue 3** + Nuxt
- **Angular** + Ionic
- **Svelte** + SvelteKit  
- **React Native** + Expo
- **Radix UI** + Headless UI
- **Vanilla JS** + Web Components

---

## **🏗️ Architecture Overview**

### **Three-Layer Architecture**

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

---

## **🎯 Universal Core Layer**

### **Component Specifications**
Framework-agnostic definitions that describe **what** a component does, not **how** it's implemented:

```typescript
// Universal Button Specification
export const ButtonSpec: BaseComponentSpec = {
  id: 'button',
  name: 'Button', 
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', 'react-native', 'expo'],
  
  // Universal properties work across all platforms
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline'",
      required: false,
      default: 'primary',
      description: 'Visual style variant'
    }
  ],
  
  // Accessibility requirements universal to all platforms
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['button'],
    keyboardNavigation: true,
    screenReaderSupport: true
  }
};
```

### **Universal Design Tokens**
Platform-independent design values that convert to any format:

```typescript
export const UniversalTokens = {
  // These work everywhere - web, mobile, desktop
  spacing: {
    4: '1rem',        // Converts to 16px (web) or 16dp (mobile)
    12: '3rem'        // Converts to 48px (web) or 48dp (mobile)
  },
  
  colors: {
    primary: {
      500: '#3b82f6'  // Works in CSS, StyleSheet, anywhere
    }
  }
};
```

---

## **🔄 Generation Layer**

### **Platform Templates**
Each platform has a template that generates native code:

```typescript
// React Template generates .tsx files
ReactTemplate.generateComponent(ButtonSpec) →
  `export const Button = forwardRef<HTMLButtonElement>(...)`

// React Native Template generates StyleSheet-based components  
ReactNativeTemplate.generateComponent(ButtonSpec) →
  `export const Button: React.FC = ({ style, ...props }) => ...`

// Vue Template generates .vue files
VueTemplate.generateComponent(ButtonSpec) →
  `<template><button :class="buttonClasses">...</template>`
```

### **Token Converters**
Transform universal tokens to platform-specific formats:

```typescript
// Web: CSS Custom Properties
UniversalTokens.converters.toCSSVariables(tokens) →
  { '--color-primary-500': '#3b82f6' }

// React Native: Numeric StyleSheet values  
UniversalTokens.converters.toReactNative(tokens) →
  { colorPrimary500: '#3b82f6', spacing4: 16 }

// JavaScript: Theme objects
UniversalTokens.converters.toJSTheme(tokens) →
  { colors: { primary: { 500: '#3b82f6' } } }
```

---

## **📱 Platform Implementations**

### **React Implementation**
```typescript
// Generated React Component
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90'
      }
    }
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, ...props }, ref) => (
    <button 
      className={buttonVariants({ variant })} 
      ref={ref} 
      {...props} 
    />
  )
);
```

### **React Native Implementation**
```typescript
// Generated React Native Component  
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  primary: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48  // WCAG compliant touch target
  }
});

export const Button: React.FC<ButtonProps> = ({ variant, children, ...props }) => (
  <TouchableOpacity style={[styles.primary]} {...props}>
    <Text style={styles.primaryText}>{children}</Text>
  </TouchableOpacity>
);
```

### **Vue Implementation**
```vue
<!-- Generated Vue Component -->
<template>
  <button :class="buttonClasses" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup lang="ts">
const buttonClasses = computed(() => [
  'inline-flex items-center justify-center',
  `bg-${variant} text-${variant}-foreground`
]);
</script>
```

### **Angular Implementation**
```typescript
// Generated Angular Component
@Component({
  selector: 'xaheen-button',
  template: `
    <button [class]="buttonClasses" (click)="buttonClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  get buttonClasses(): string {
    return `btn btn-${this.variant}`;
  }
}
```

---

## **🚀 Usage Examples**

### **Auto-Platform Detection**
The registry automatically detects your platform and loads appropriate components:

```typescript
// Works in ANY framework automatically
import { componentFactory } from '@xaheen-ai/design-system';

// Detects React and loads React Button
const Button = await componentFactory.getComponent('button');

// Detects Vue and loads Vue Button  
const Button = await componentFactory.getComponent('button');

// Detects React Native and loads React Native Button
const Button = await componentFactory.getComponent('button');
```

### **Manual Platform Selection**
Or explicitly choose your platform:

```typescript
import { UniversalComponentFactory } from '@xaheen-ai/design-system';

// Force React components
const reactFactory = new UniversalComponentFactory('react');
const ReactButton = await reactFactory.getComponent('button');

// Force React Native components
const rnFactory = new UniversalComponentFactory('react-native');  
const RNButton = await rnFactory.getComponent('button');

// Force Vue components
const vueFactory = new UniversalComponentFactory('vue');
const VueButton = await vueFactory.getComponent('button');
```

### **Framework-Specific Imports**
Import directly for your specific framework:

```typescript
// React
import { Button } from '@xaheen-ai/design-system/react';

// React Native
import { Button } from '@xaheen-ai/design-system/react-native';

// Vue  
import Button from '@xaheen-ai/design-system/vue/Button.vue';

// Angular
import { ButtonComponent } from '@xaheen-ai/design-system/angular';

// Svelte
import Button from '@xaheen-ai/design-system/svelte/Button.svelte';
```

---

## **🎨 Universal Token Usage**

### **Web Frameworks** (React, Vue, Angular, Svelte)
```typescript
// Tokens become CSS custom properties
import { TokenUtils } from '@xaheen-ai/design-system';

const cssTokens = TokenUtils.toCSS(UniversalTokens.colors);
// Result: { '--color-primary-500': '#3b82f6' }
```

### **React Native / Expo**
```typescript
// Tokens become StyleSheet-compatible values
const rnTokens = TokenUtils.toReactNative(UniversalTokens.spacing);
// Result: { spacing4: 16, spacing12: 48 }

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: rnTokens.spacing6,
    minHeight: rnTokens.spacing12
  }
});
```

### **JavaScript Frameworks**
```typescript
// Tokens become theme objects
const themeTokens = TokenUtils.toJS(UniversalTokens);
// Result: { colors: { primary: { 500: '#3b82f6' } } }
```

---

## **⚙️ Component Generation**

Generate components for any platform on demand:

```typescript
import { ComponentGenerator, ButtonSpec } from '@xaheen-ai/design-system';

// Generate React implementation
const reactFiles = ComponentGenerator.generateComponent(
  ButtonSpec, 
  'react',
  { includeTests: true, includeStories: true }
);

// Generate for all platforms
const allPlatforms = ComponentGenerator.generateForAllPlatforms(
  ButtonSpec,
  { includeTests: true }
);

// Results in platform-specific files:
// - react/button.tsx
// - react-native/Button.tsx  
// - vue/Button.vue
// - angular/button.component.ts
// - svelte/Button.svelte
```

---

## **🎯 Benefits**

### **For Developers**
- ✅ **Write Once, Run Everywhere**: Single component definition works across all platforms
- ✅ **Native Experience**: Each platform gets optimized, native implementation
- ✅ **Auto-Detection**: Framework automatically detected and appropriate components loaded
- ✅ **Type Safety**: Full TypeScript support across all platforms
- ✅ **Tree Shaking**: Only load components for your actual platform

### **For Teams**
- ✅ **Consistency**: Identical behavior and styling across all platforms
- ✅ **Maintainability**: Update once, all platforms benefit
- ✅ **Flexibility**: Mix and match platforms in same organization
- ✅ **Migration Safe**: Switch frameworks without redesigning components

### **For Organizations**
- ✅ **Future Proof**: Add new platforms without rewriting components
- ✅ **Cost Effective**: Maintain one design system instead of many
- ✅ **Quality**: Professional accessibility and standards across all platforms
- ✅ **Speed**: Generate new platform support instantly

---

## **🔮 Supported Platforms Matrix**

| Platform | Status | Components | Tokens | Tests | Stories |
|----------|--------|------------|--------|-------|---------|
| **React** | ✅ Complete | Button, Input, Card, etc. | CSS Variables | Jest/Vitest | Storybook |
| **React Native** | ✅ Complete | Button, Input, Card, etc. | StyleSheet | Jest | Storybook RN |
| **Vue 3** | ✅ Complete | Button, Input, Card, etc. | CSS Variables | Vitest | Histoire |
| **Angular** | ✅ Complete | Button, Input, Card, etc. | CSS Variables | Jasmine | Storybook |
| **Svelte** | ✅ Complete | Button, Input, Card, etc. | CSS Variables | Vitest | Storybook |
| **Next.js** | ✅ Complete | Uses React | CSS Variables | Jest/Vitest | Storybook |
| **Nuxt** | ✅ Complete | Uses Vue | CSS Variables | Vitest | Histoire |
| **SvelteKit** | ✅ Complete | Uses Svelte | CSS Variables | Vitest | Storybook |
| **Expo** | ✅ Complete | Uses React Native | StyleSheet | Jest | Storybook RN |
| **Electron** | ✅ Complete | Uses React | CSS Variables | Jest/Vitest | Storybook |
| **Ionic** | 🔄 In Progress | React/Angular variants | CSS Variables | Framework specific | Storybook |
| **Radix UI** | 🔄 In Progress | Enhanced React | CSS Variables | Jest/Vitest | Storybook |
| **Headless UI** | 🔄 In Progress | Enhanced React/Vue | CSS Variables | Framework specific | Storybook |
| **Vanilla JS** | 📋 Planned | Web Components | CSS Variables | Web Test Runner | Storybook |

---

## **🚀 Getting Started**

### **Installation**
```bash
npm install @xaheen-ai/design-system
```

### **Usage**
```typescript
// Automatic platform detection (recommended)
import { componentFactory } from '@xaheen-ai/design-system';
const Button = await componentFactory.getComponent('button');

// Platform-specific (explicit)
import { Button } from '@xaheen-ai/design-system/react';          // React
import { Button } from '@xaheen-ai/design-system/react-native';   // React Native  
import Button from '@xaheen-ai/design-system/vue/Button.vue';     // Vue
```

**The world's first truly universal design system - write once, run everywhere!** 🌍✨