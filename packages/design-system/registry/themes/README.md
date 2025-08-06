# Universal Theme System

A comprehensive theme system that provides consistent theming across all platforms with dark/light mode support, accessibility compliance, and platform-specific optimizations.

## 🌟 Features

- **Universal Tokens**: Platform-agnostic design tokens that work everywhere
- **Dark/Light Modes**: Built-in support for multiple color schemes
- **14+ Platforms**: Native implementations for React, Vue, Angular, Svelte, React Native, Ionic, and more
- **WCAG AAA Compliance**: Accessibility-first design with high contrast ratios
- **Type-Safe**: Full TypeScript support with strict typing
- **Performance Optimized**: Platform-specific optimizations (CSS variables, React Native StyleSheet, etc.)
- **Developer Experience**: Rich tooling and debugging support

## 📦 Installation

```bash
# Install the design system
npm install @xaheen/design-system

# Platform-specific dependencies
npm install @xaheen/design-system-react      # React
npm install @xaheen/design-system-vue        # Vue
npm install @xaheen/design-system-angular    # Angular
npm install @xaheen/design-system-svelte     # Svelte
npm install @xaheen/design-system-rn         # React Native
npm install @xaheen/design-system-ionic      # Ionic
```

## 🚀 Quick Start

### React

```tsx
import { ThemeProvider, useTheme } from '@xaheen/design-system/themes';

function App() {
  return (
    <ThemeProvider defaultColorMode="auto">
      <YourApp />
    </ThemeProvider>
  );
}

function YourComponent() {
  const { theme, isDark, toggleColorMode } = useTheme();
  
  return (
    <div className={theme.isDark ? 'dark' : 'light'}>
      <button onClick={toggleColorMode}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div :class="themeClass">
    <button @click="toggleColorMode">
      Switch to {{ isDark ? 'light' : 'dark' }} mode
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@xaheen/design-system/themes';

const { theme, isDark, toggleColorMode, themeClass } = useTheme();
</script>
```

### Svelte

```svelte
<script lang="ts">
  import { theme, isDark, toggleColorMode } from '@xaheen/design-system/themes';
</script>

<div class={$isDark ? 'dark' : 'light'}>
  <button on:click={toggleColorMode}>
    Switch to {$isDark ? 'light' : 'dark'} mode
  </button>
</div>
```

### Angular

```typescript
import { Component } from '@angular/core';
import { ThemeService } from '@xaheen/design-system/themes';

@Component({
  selector: 'app-root',
  template: `
    <div [class]="themeClass$ | async">
      <button (click)="toggleColorMode()">
        Switch to {{ (isDark$ | async) ? 'light' : 'dark' }} mode
      </button>
    </div>
  `
})
export class AppComponent {
  isDark$ = this.themeService.isDark$;
  themeClass$ = this.isDark$.pipe(
    map(isDark => isDark ? 'dark' : 'light')
  );

  constructor(private themeService: ThemeService) {}

  toggleColorMode() {
    this.themeService.toggleColorMode();
  }
}
```

### React Native

```tsx
import { ReactNativeThemeProvider, useReactNativeTheme } from '@xaheen/design-system/themes';

function App() {
  return (
    <ReactNativeThemeProvider>
      <YourApp />
    </ReactNativeThemeProvider>
  );
}

function YourComponent() {
  const { nativeTheme, isDark, toggleColorMode } = useReactNativeTheme();
  
  return (
    <View style={{ backgroundColor: nativeTheme.colors.background }}>
      <TouchableOpacity onPress={toggleColorMode}>
        <Text style={{ color: nativeTheme.colors.text }}>
          Switch to {isDark ? 'light' : 'dark'} mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Ionic

```tsx
import { IonApp, IonContent, IonButton } from '@ionic/react';
import { useTheme, applyIonicTheme } from '@xaheen/design-system/themes';
import { useEffect } from 'react';

function App() {
  const { theme, toggleColorMode } = useTheme();
  
  useEffect(() => {
    applyIonicTheme(document);
  }, []);
  
  return (
    <IonApp>
      <IonContent>
        <IonButton onClick={toggleColorMode}>
          Toggle Theme
        </IonButton>
      </IonContent>
    </IonApp>
  );
}
```

### Vanilla JS

```javascript
import { themeManager, toggleTheme } from '@xaheen/design-system/themes';

// Theme is automatically applied to document
document.getElementById('theme-toggle').addEventListener('click', () => {
  toggleTheme();
});

// Listen for theme changes
window.addEventListener('themechange', (event) => {
  console.log('Theme changed to:', event.detail.theme);
});
```

## 🎨 Theme Structure

### Color System

```typescript
interface ColorTokens {
  primary: ColorScale;     // Brand primary color (blue by default)
  secondary: ColorScale;   // Secondary color (slate by default) 
  accent: ColorScale;      // Accent color (purple by default)
  neutral: ColorScale;     // Neutral colors (zinc by default)
  success: ColorScale;     // Success states (green)
  warning: ColorScale;     // Warning states (amber)
  error: ColorScale;       // Error states (red)
  info: ColorScale;        // Info states (cyan)
  surface: SurfaceColors;  // Background/surface colors
  text: TextColors;        // Text colors
  border: BorderColors;    // Border colors
}

interface ColorScale {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;  // Darkest
}
```

### Typography System

```typescript
interface TypographyTokens {
  fontFamily: {
    sans: string[];     // ['Inter', 'system-ui', 'sans-serif']
    serif: string[];    // ['Georgia', 'Times New Roman', 'serif']
    mono: string[];     // ['JetBrains Mono', 'Consolas', 'monospace']
    display: string[];  // ['Inter Display', 'Inter', 'sans-serif']
  };
  fontSize: {
    xs: string;    // 0.75rem (12px)
    sm: string;    // 0.875rem (14px)  
    base: string;  // 1rem (16px)
    lg: string;    // 1.125rem (18px)
    xl: string;    // 1.25rem (20px)
    '2xl': string; // 1.5rem (24px)
    // ... up to 9xl
  };
  fontWeight: {
    thin: 100;
    light: 300;
    normal: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
    // ... etc
  };
}
```

### Spacing System

```typescript
interface SpacingTokens {
  px: '1px';
  0: '0px';
  0.5: '0.125rem';  // 2px
  1: '0.25rem';     // 4px
  1.5: '0.375rem';  // 6px
  2: '0.5rem';      // 8px
  // ... consistent scale up to 96
}
```

## 🔧 Advanced Usage

### Custom Themes

```typescript
import { UniversalTheme, THEME_REGISTRY } from '@xaheen/design-system/themes';

// Create custom theme by extending existing theme
const customTheme: UniversalTheme = {
  ...LightTheme,
  id: 'custom',
  name: 'Custom Theme',
  tokens: {
    ...LightTheme.tokens,
    colors: {
      ...LightTheme.tokens.colors,
      primary: {
        50: '#fef3c7',
        // ... custom primary color scale
        500: '#f59e0b', // Custom brand color
        // ... rest of scale
      }
    }
  }
};

// Register custom theme
THEME_REGISTRY.custom = customTheme;
```

### Platform-Specific Optimizations

```typescript
// React - CSS Variables + Tailwind
import { ThemeConverters } from '@xaheen/design-system/themes';

const tailwindConfig = ThemeConverters.toTailwind(theme);
const cssVariables = ThemeConverters.toCSSVariables(theme);

// React Native - StyleSheet
const nativeTheme = ThemeConverters.toReactNative(theme);
const styles = StyleSheet.create({
  container: {
    backgroundColor: nativeTheme.colors.background
  }
});

// Ionic - Ionic Variables
const ionicVariables = ThemeConverters.toIonic(theme);
const ionicCSS = generateIonicCSS(ionicVariables);
```

### Theme Generation

```typescript
import { ThemeGenerator } from '@xaheen/design-system/themes';

// Generate theme files for all platforms
const files = ThemeGenerator.generateThemeForPlatform(
  customTheme,
  'react',
  {
    includeProvider: true,
    includeCSSVariables: true,
    includeUtilities: true,
    generateTypes: true
  }
);

files.forEach(file => {
  writeFileSync(file.path, file.content);
});
```

## 🎯 Design Tokens

### Semantic Colors

The theme system uses semantic color names that map to appropriate colors:

```typescript
// Intent colors
primary: '#3b82f6'      // Brand primary
secondary: '#64748b'    // Supporting actions  
accent: '#d946ef'       // Highlights and CTAs

// Feedback colors
success: '#22c55e'      // Success states
warning: '#f59e0b'      // Warning states  
error: '#ef4444'        // Error states
info: '#06b6d4'         // Information

// Interactive colors
link: '#3b82f6'         // Links
linkHover: '#2563eb'    // Link hover
focus: '#3b82f6'        // Focus rings
```

### Responsive Breakpoints

```typescript
breakpoints: {
  xs: '475px',    // Extra small devices
  sm: '640px',    // Small devices  
  md: '768px',    // Medium devices
  lg: '1024px',   // Large devices
  xl: '1280px',   // Extra large devices
  '2xl': '1536px' // 2X large devices
}
```

### Motion System

```typescript
motion: {
  duration: {
    instant: '0ms',    // No animation
    fast: '150ms',     // Quick interactions
    normal: '300ms',   // Standard transitions
    slow: '500ms',     // Page transitions
    slower: '800ms'    // Complex animations
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out', 
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
}
```

## ♿ Accessibility

The theme system is built with accessibility as a core principle:

- **WCAG AAA Compliance**: All color combinations meet the highest contrast standards
- **Color Blind Support**: Colors are distinguishable for all types of color blindness  
- **Reduced Motion**: Respects `prefers-reduced-motion` system setting
- **High Contrast**: Support for high contrast mode
- **Semantic Colors**: Meaningful color names that convey purpose

### Accessibility Features

```typescript
accessibility: {
  contrastRatio: 'AAA',           // WCAG AAA compliance
  colorBlindSupport: true,        // Color blind friendly
  reducedMotion: true,            // Respects motion preferences  
  highContrast: true              // High contrast support
}
```

## 🛠️ Development Tools

### Theme Debugging

```typescript
import { useTheme } from '@xaheen/design-system/themes';

function ThemeDebugger() {
  const { theme, tokens } = useTheme();
  
  return (
    <div>
      <h3>Current Theme: {theme.name}</h3>
      <h4>Colors:</h4>
      <pre>{JSON.stringify(tokens.colors, null, 2)}</pre>
    </div>
  );
}
```

### Theme Validation

```typescript
import { ThemeUtils } from '@xaheen/design-system/themes';

// Validate theme structure
const isValid = ThemeUtils.validateTheme(customTheme);

// Check accessibility compliance  
const meetsWCAG = ThemeUtils.checkAccessibility(customTheme);

// Generate theme report
const report = ThemeUtils.generateThemeReport(customTheme);
```

## 📱 Platform Support

| Platform | CSS Variables | Provider | Native Features |
|----------|---------------|----------|-----------------|
| React | ✅ | ✅ | CSS-in-JS, Tailwind |
| Vue | ✅ | ✅ | Composables |
| Angular | ✅ | ✅ | Services, Material |
| Svelte | ✅ | ✅ | Stores |
| React Native | ❌ | ✅ | StyleSheet, AsyncStorage |
| Ionic | ✅ | ✅ | Ion Variables, Platform Detection |
| Next.js | ✅ | ✅ | SSR Support |
| Electron | ✅ | ✅ | Native Menu Theming |
| Vanilla JS | ✅ | ❌ | DOM Manipulation |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.