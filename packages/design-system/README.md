# 🌍 Xaheen Universal Design System

**The world's first truly universal design system - write once, run everywhere!**

[![NPM Version](https://img.shields.io/npm/v/@xaheen/design-system)](https://npmjs.com/package/@xaheen/design-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![WCAG AAA](https://img.shields.io/badge/WCAG-AAA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

## ✨ What Makes It Universal?

The Xaheen Design System is built on a **revolutionary 3-layer architecture** that generates native components for **any platform or framework**:

```
📱 Your App (React, Vue, Angular, Svelte, React Native...)
    ↓
🔄 Generation Layer (Platform Templates & Converters)
    ↓  
🎯 Universal Core (Framework-Agnostic Specifications)
```

**One component definition → 14+ platform implementations**

## 🚀 Supported Platforms

| Platform | Status | Components | Features |
|----------|--------|------------|----------|
| **React** | ✅ Complete | All | Hooks, forwardRef, TypeScript |
| **Vue 3** | ✅ Complete | All | Composition API, SFC, Reactivity |
| **Angular** | ✅ Complete | All | Standalone, Signals, DI |
| **Svelte** | ✅ Complete | All | Reactive, Compile-time |
| **React Native** | ✅ Complete | All | StyleSheet, TouchableOpacity |
| **Next.js** | ✅ Complete | All | Uses React implementation |
| **Nuxt** | ✅ Complete | All | Uses Vue implementation |
| **SvelteKit** | ✅ Complete | All | Uses Svelte implementation |
| **Expo** | ✅ Complete | All | Uses React Native implementation |
| **Electron** | ✅ Complete | All | Uses React implementation |
| **Radix UI** | ✅ Enhanced | All | Primitives, asChild, Composition |
| **Headless UI** | ✅ Enhanced | All | Data attributes, State management |
| **Web Components** | ✅ Complete | All | Custom Elements, Shadow DOM |
| **Ionic** | 🔄 In Progress | - | React/Angular variants |

## 🎯 Quick Start

### Installation

```bash
npm install @xaheen/design-system
```

### Automatic Platform Detection (Recommended)

```typescript
import { componentFactory } from '@xaheen/design-system';

// Automatically detects your framework and loads appropriate components
const Button = await componentFactory.getComponent('button');
```

### Platform-Specific Imports

```typescript
// React
import { Button } from '@xaheen/design-system/react';

// Vue
import Button from '@xaheen/design-system/vue/Button.vue';

// Angular
import { ButtonComponent } from '@xaheen/design-system/angular';

// Svelte
import Button from '@xaheen/design-system/svelte/Button.svelte';

// React Native
import { Button } from '@xaheen/design-system/react-native';

// Radix UI (Enhanced React)
import { Button } from '@xaheen/design-system/radix';

// Headless UI (Enhanced React)
import { Button } from '@xaheen/design-system/headless-ui';

// Web Components
import '@xaheen/design-system/vanilla/button.js';
// Use: <xaheen-button>Click me</xaheen-button>
```

## 🧩 Available Components

| Component | Description | Platforms | Status |
|-----------|-------------|-----------|--------|
| **Button** | Interactive button with variants and loading states | 11+ | ✅ Complete |
| **Input** | Text input with validation and error states | 11+ | ✅ Complete |
| **Textarea** | Multi-line text input with auto-resize | 11+ | ✅ Complete |
| **Card** | Container with header, body, footer slots | 11+ | ✅ Complete |
| **Form** | Form container with validation | 9+ | ✅ Complete |
| **GlobalSearch** | Search component with autocomplete | 6+ | ✅ Complete |

## 🎨 Universal Design Tokens

Design tokens that work across ALL platforms:

```typescript
import { UniversalTokens, TokenUtils } from '@xaheen/design-system/tokens';

// Tokens automatically convert to the right format for each platform:

// Web (CSS Custom Properties)
const cssTokens = TokenUtils.toCSS(UniversalTokens.colors);
// Result: { '--color-primary-500': '#3b82f6' }

// React Native (StyleSheet values)
const nativeTokens = TokenUtils.toReactNative(UniversalTokens.spacing);
// Result: { spacing4: 16, spacing12: 48 }

// JavaScript (Theme objects)
const jsTokens = TokenUtils.toJS(UniversalTokens);
// Result: { colors: { primary: { 500: '#3b82f6' } } }
```

## 🎭 Component Recipes

High-level patterns for common use cases:

```typescript
import { RecipeGenerator } from '@xaheen/design-system/recipes';

// Generate a complete contact form
const contactForm = RecipeGenerator.generateFromRecipe('contact-form', 'react');

// Generate a dashboard layout
const dashboard = RecipeGenerator.generateFromRecipe('app-header', 'vue');

// Generate icon button group
const toolbar = RecipeGenerator.generateFromRecipe('icon-button-group', 'angular');
```

## 🛠️ CLI Integration

Generate components from command line:

```bash
# Generate button for all platforms
npx xaheen generate button --platform all --output ./components

# Generate for specific platform with tests and stories
npx xaheen generate card --platform react --include-tests --include-stories

# Generate recipe
npx xaheen recipe contact-form --platform vue --output ./forms

# List available components
npx xaheen list components

# Get component information
npx xaheen info button

# Test platform compatibility
npx xaheen test react
```

## 🏗️ Architecture Deep Dive

### 1. Universal Core Layer

**Framework-agnostic specifications** that describe components:

```typescript
export const ButtonSpec: BaseComponentSpec = {
  id: 'button',
  name: 'Button',
  category: 'atom',
  platforms: ['react', 'vue', 'angular', 'svelte', /* ... */],
  
  // Universal properties work everywhere
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline'",
      default: 'primary'
    }
  ],
  
  // Accessibility requirements
  accessibility: {
    wcagLevel: 'AAA',
    roles: ['button'],
    keyboardNavigation: true
  }
};
```

### 2. Generation Layer

**Platform templates** that generate native code:

```typescript
// React generates .tsx with hooks
ReactTemplate.generateComponent(ButtonSpec) →
  export const Button = forwardRef<HTMLButtonElement>(...);

// Vue generates .vue with Composition API
VueTemplate.generateComponent(ButtonSpec) →
  <template><button :class="buttonClasses">...</template>

// Angular generates .component.ts with decorators
AngularTemplate.generateComponent(ButtonSpec) →
  @Component({ selector: 'xaheen-button' })
```

### 3. Platform Layer

**Native implementations** optimized for each platform:

- **React**: Hooks, forwardRef, TypeScript interfaces
- **Vue**: Composition API, reactive props, SFC
- **Angular**: Standalone components, signals, dependency injection
- **Svelte**: Reactive declarations, event dispatchers
- **React Native**: StyleSheet, TouchableOpacity, platform-specific
- **Web Components**: Custom elements, shadow DOM, vanilla JS

## 🎯 Key Features

### ✅ Write Once, Run Everywhere
Single component definition generates native implementations for all platforms.

### ✅ Native Experience
Each platform gets optimized, idiomatic code - not generic wrappers.

### ✅ Auto-Platform Detection
Automatically detects your framework and loads appropriate components.

### ✅ Type Safety Everywhere
Full TypeScript support across all platforms with proper interfaces.

### ✅ Accessibility First
WCAG AAA compliance built-in with platform-appropriate implementations.

### ✅ Enhanced UI Libraries
Special implementations for Radix UI and Headless UI with composition patterns.

### ✅ Universal Tokens
Design tokens that convert to CSS variables, StyleSheet, or JS objects.

### ✅ Tree Shaking Ready
Only load components for your actual platform and usage.

## 🎨 Design Philosophy

### Pure Components (LEGO Architecture)
Every component is a **pure, stateless building block**:
- ✅ 100% controlled via props
- ✅ No internal state management
- ✅ Composable and predictable
- ✅ Easy to test and debug

### Universal Specifications
Components are defined **once** in a platform-agnostic way:
- ✅ Props, variants, and accessibility rules
- ✅ Platform capabilities and constraints
- ✅ Consistent behavior across all platforms

### Native Code Generation
Generate **truly native** implementations:
- ✅ React hooks and forwardRef patterns
- ✅ Vue 3 Composition API and reactivity
- ✅ Angular standalone components and signals
- ✅ Svelte reactive declarations
- ✅ React Native StyleSheet and platform APIs

## 📚 Advanced Usage

### Custom Component Generation

```typescript
import { ComponentGenerator } from '@xaheen/design-system';

// Generate for specific platform
const reactFiles = ComponentGenerator.generateComponent(
  ButtonSpec, 
  'react',
  { includeTests: true, includeStories: true }
);

// Generate for all platforms
const allPlatforms = ComponentGenerator.generateForAllPlatforms(ButtonSpec);
```

### Platform-Specific Features

```typescript
// Radix UI - Enhanced with primitives
import { Button, TooltipButton, DialogTriggerButton } from '@xaheen/design-system/radix';

<TooltipButton tooltip="Save changes">Save</TooltipButton>
<DialogTriggerButton>Open Modal</DialogTriggerButton>

// Headless UI - Enhanced with state management  
import { Button, ButtonGroup, ToggleButton } from '@xaheen/design-system/headless-ui';

<ButtonGroup>
  <Button>Left</Button>
  <Button>Center</Button>
  <Button>Right</Button>
</ButtonGroup>
```

### Token Customization

```typescript
import { UniversalTokens } from '@xaheen/design-system/tokens';

// Extend tokens
const customTokens = {
  ...UniversalTokens,
  colors: {
    ...UniversalTokens.colors,
    brand: {
      500: '#your-color'
    }
  }
};
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific platform
npm test -- --grep "react platform"

# Test component generation
npm test -- --grep "Component Generation"

# Test platform compatibility
npm test -- --grep "Platform Compatibility"
```

## 📖 Documentation

- [🏗️ Architecture Guide](./docs/architecture/MULTI_PLATFORM_ARCHITECTURE.md)
- [🎯 Component Specifications](./docs/COMPONENT_SPECS.md)
- [🎨 Design Tokens](./docs/DESIGN_TOKENS.md)
- [🧩 Recipe System](./docs/RECIPES.md)
- [🛠️ CLI Usage](./docs/CLI.md)
- [🔧 Platform Integration](./docs/PLATFORM_INTEGRATION.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌟 Why Choose Xaheen Universal Design System?

### For Developers
- ✅ **One system to learn** instead of multiple design systems
- ✅ **Native code generation** - no performance compromises  
- ✅ **Auto-platform detection** - works out of the box
- ✅ **Type safety everywhere** - full TypeScript support
- ✅ **Future-proof** - add new platforms without rewriting

### For Teams
- ✅ **Consistent UX** across all platforms and applications
- ✅ **Faster development** - reuse components everywhere
- ✅ **Easier maintenance** - update once, all platforms benefit
- ✅ **Better quality** - built-in accessibility and standards

### For Organizations
- ✅ **Cost effective** - one design system instead of many
- ✅ **Future-proof** - platform-agnostic foundation
- ✅ **Quality assurance** - professional standards built-in
- ✅ **Scalable** - works for small apps to enterprise systems

---

**Built with ❤️ by the Xaheen Technologies team**

*The universal design system that adapts to your stack, not the other way around.*