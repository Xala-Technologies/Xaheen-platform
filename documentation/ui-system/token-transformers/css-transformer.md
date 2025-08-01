# CSS Variable Transformer

The CSS Variable Transformer generates CSS custom properties (CSS variables) from design tokens, enabling runtime theming, dynamic style updates, and seamless integration with existing CSS workflows. It also generates utility classes and media queries for responsive design.

## Overview

The CSS transformer converts your design tokens into:
- CSS custom properties with configurable prefixes
- Utility classes for common styling patterns
- Responsive media queries with breakpoint-specific values
- Theme-specific CSS with data attribute selectors
- Fallback values for browser compatibility
- Comprehensive documentation comments

## Basic Usage

```typescript
import { CSSVariableTransformer } from '@xala-technologies/ui-system/tokens/transformers';

const transformer = new CSSVariableTransformer();
const result = transformer.transform(tokens, {
  prefix: 'ui-',
  selector: ':root',
  generateUtilityClasses: true,
  generateMediaQueries: true
});

// Access generated content
console.log(result.variables);     // CSS variables
console.log(result.utilities);     // Utility classes
console.log(result.mediaQueries);  // Media queries
console.log(result.full);          // Complete CSS output
```

## Configuration Options

### CSSVariableOptions

```typescript
interface CSSVariableOptions {
  // Variable prefix (e.g., 'app-' results in --app-color-primary)
  prefix?: string;
  
  // Root selector for variables (default: ':root')
  selector?: string;
  
  // Include descriptive comments
  includeComments?: boolean;
  
  // Generate utility classes
  generateUtilityClasses?: boolean;
  
  // Generate responsive media queries
  generateMediaQueries?: boolean;
  
  // Color format ('hex' | 'rgb' | 'hsl')
  colorFormat?: 'hex' | 'rgb' | 'hsl';
  
  // Flatten nested objects
  flatten?: boolean;
  
  // Custom property formatter
  formatter?: (path: string[], value: any) => string;
  
  // Utility class configuration
  utilityConfig?: {
    colorProperties?: string[];
    spacingProperties?: string[];
    typographyProperties?: string[];
    generateNegative?: boolean;
  };
  
  // Media query configuration
  mediaConfig?: {
    breakpoints?: Record<string, string>;
    generateContainerQueries?: boolean;
  };
}
```

## Generated Output Examples

### 1. CSS Variables

```css
/* =================================================================== */
/* Design System Tokens - Generated CSS Variables                      */
/* =================================================================== */

:root {
  /* =============== Color Tokens =============== */
  
  /* Primary Colors */
  --ui-color-primary-50: #f0f9ff;
  --ui-color-primary-100: #e0f2fe;
  --ui-color-primary-200: #bae6fd;
  --ui-color-primary-300: #7dd3fc;
  --ui-color-primary-400: #38bdf8;
  --ui-color-primary-500: #0ea5e9;
  --ui-color-primary-600: #0284c7;
  --ui-color-primary-700: #0369a1;
  --ui-color-primary-800: #075985;
  --ui-color-primary-900: #0c4a6e;
  --ui-color-primary-950: #082f49;
  
  /* Neutral Colors */
  --ui-color-neutral-50: #f9fafb;
  --ui-color-neutral-100: #f3f4f6;
  --ui-color-neutral-200: #e5e7eb;
  --ui-color-neutral-300: #d1d5db;
  --ui-color-neutral-400: #9ca3af;
  --ui-color-neutral-500: #6b7280;
  --ui-color-neutral-600: #4b5563;
  --ui-color-neutral-700: #374151;
  --ui-color-neutral-800: #1f2937;
  --ui-color-neutral-900: #111827;
  --ui-color-neutral-950: #030712;
  
  /* Semantic Colors */
  --ui-color-success: var(--ui-color-success-500);
  --ui-color-warning: var(--ui-color-warning-500);
  --ui-color-danger: var(--ui-color-danger-500);
  --ui-color-info: var(--ui-color-info-500);
  
  /* =============== Typography Tokens =============== */
  
  /* Font Families */
  --ui-font-family-sans: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  --ui-font-family-serif: ui-serif, Georgia, Cambria, serif;
  --ui-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  
  /* Font Sizes */
  --ui-font-size-xs: 0.75rem;    /* 12px */
  --ui-font-size-sm: 0.875rem;   /* 14px */
  --ui-font-size-base: 1rem;     /* 16px */
  --ui-font-size-lg: 1.125rem;   /* 18px */
  --ui-font-size-xl: 1.25rem;    /* 20px */
  --ui-font-size-2xl: 1.5rem;    /* 24px */
  --ui-font-size-3xl: 1.875rem;  /* 30px */
  --ui-font-size-4xl: 2.25rem;   /* 36px */
  --ui-font-size-5xl: 3rem;      /* 48px */
  --ui-font-size-6xl: 3.75rem;   /* 60px */
  --ui-font-size-7xl: 4.5rem;    /* 72px */
  --ui-font-size-8xl: 6rem;      /* 96px */
  --ui-font-size-9xl: 8rem;      /* 128px */
  
  /* Font Weights */
  --ui-font-weight-thin: 100;
  --ui-font-weight-extralight: 200;
  --ui-font-weight-light: 300;
  --ui-font-weight-normal: 400;
  --ui-font-weight-medium: 500;
  --ui-font-weight-semibold: 600;
  --ui-font-weight-bold: 700;
  --ui-font-weight-extrabold: 800;
  --ui-font-weight-black: 900;
  
  /* Line Heights */
  --ui-line-height-none: 1;
  --ui-line-height-tight: 1.25;
  --ui-line-height-snug: 1.375;
  --ui-line-height-normal: 1.5;
  --ui-line-height-relaxed: 1.625;
  --ui-line-height-loose: 2;
  
  /* Letter Spacing */
  --ui-letter-spacing-tighter: -0.05em;
  --ui-letter-spacing-tight: -0.025em;
  --ui-letter-spacing-normal: 0em;
  --ui-letter-spacing-wide: 0.025em;
  --ui-letter-spacing-wider: 0.05em;
  --ui-letter-spacing-widest: 0.1em;
  
  /* =============== Spacing Tokens =============== */
  
  --ui-spacing-0: 0px;
  --ui-spacing-px: 1px;
  --ui-spacing-0-5: 0.125rem;  /* 2px */
  --ui-spacing-1: 0.25rem;     /* 4px */
  --ui-spacing-1-5: 0.375rem;  /* 6px */
  --ui-spacing-2: 0.5rem;      /* 8px */
  --ui-spacing-2-5: 0.625rem;  /* 10px */
  --ui-spacing-3: 0.75rem;     /* 12px */
  --ui-spacing-3-5: 0.875rem;  /* 14px */
  --ui-spacing-4: 1rem;        /* 16px */
  --ui-spacing-5: 1.25rem;     /* 20px */
  --ui-spacing-6: 1.5rem;      /* 24px */
  --ui-spacing-7: 1.75rem;     /* 28px */
  --ui-spacing-8: 2rem;        /* 32px */
  --ui-spacing-9: 2.25rem;     /* 36px */
  --ui-spacing-10: 2.5rem;     /* 40px */
  --ui-spacing-11: 2.75rem;    /* 44px */
  --ui-spacing-12: 3rem;       /* 48px */
  --ui-spacing-14: 3.5rem;     /* 56px */
  --ui-spacing-16: 4rem;       /* 64px */
  --ui-spacing-20: 5rem;       /* 80px */
  --ui-spacing-24: 6rem;       /* 96px */
  --ui-spacing-28: 7rem;       /* 112px */
  --ui-spacing-32: 8rem;       /* 128px */
  
  /* =============== Border Radius Tokens =============== */
  
  --ui-radius-none: 0px;
  --ui-radius-sm: 0.125rem;    /* 2px */
  --ui-radius-base: 0.25rem;   /* 4px */
  --ui-radius-md: 0.375rem;    /* 6px */
  --ui-radius-lg: 0.5rem;      /* 8px */
  --ui-radius-xl: 0.75rem;     /* 12px */
  --ui-radius-2xl: 1rem;       /* 16px */
  --ui-radius-3xl: 1.5rem;     /* 24px */
  --ui-radius-full: 9999px;
  
  /* =============== Shadow Tokens =============== */
  
  --ui-shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --ui-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --ui-shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --ui-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --ui-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --ui-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --ui-shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --ui-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --ui-shadow-none: 0 0 #0000;
}
```

### 2. Theme-Specific Variables

```css
/* Light Theme */
[data-theme="light"] {
  --ui-color-background: var(--ui-color-neutral-50);
  --ui-color-foreground: var(--ui-color-neutral-950);
  --ui-color-card: var(--ui-color-white);
  --ui-color-card-foreground: var(--ui-color-neutral-950);
  --ui-color-muted: var(--ui-color-neutral-100);
  --ui-color-muted-foreground: var(--ui-color-neutral-500);
  --ui-color-border: var(--ui-color-neutral-200);
  --ui-color-input: var(--ui-color-neutral-200);
  --ui-color-ring: var(--ui-color-primary-500);
}

/* Dark Theme */
[data-theme="dark"] {
  --ui-color-background: var(--ui-color-neutral-950);
  --ui-color-foreground: var(--ui-color-neutral-50);
  --ui-color-card: var(--ui-color-neutral-900);
  --ui-color-card-foreground: var(--ui-color-neutral-50);
  --ui-color-muted: var(--ui-color-neutral-800);
  --ui-color-muted-foreground: var(--ui-color-neutral-400);
  --ui-color-border: var(--ui-color-neutral-800);
  --ui-color-input: var(--ui-color-neutral-800);
  --ui-color-ring: var(--ui-color-primary-400);
}

/* High Contrast Theme */
[data-theme="high-contrast"] {
  --ui-color-background: #000000;
  --ui-color-foreground: #ffffff;
  --ui-color-card: #000000;
  --ui-color-card-foreground: #ffffff;
  --ui-color-muted: #1a1a1a;
  --ui-color-muted-foreground: #cccccc;
  --ui-color-border: #ffffff;
  --ui-color-input: #ffffff;
  --ui-color-ring: #ffff00;
}
```

### 3. Utility Classes

```css
/* =============== Color Utilities =============== */

/* Text Colors */
.text-primary { color: var(--ui-color-primary-500); }
.text-primary-50 { color: var(--ui-color-primary-50); }
.text-primary-100 { color: var(--ui-color-primary-100); }
/* ... continues for all color scales ... */

/* Background Colors */
.bg-primary { background-color: var(--ui-color-primary-500); }
.bg-primary-50 { background-color: var(--ui-color-primary-50); }
.bg-primary-100 { background-color: var(--ui-color-primary-100); }
/* ... continues for all color scales ... */

/* Border Colors */
.border-primary { border-color: var(--ui-color-primary-500); }
.border-primary-50 { border-color: var(--ui-color-primary-50); }
.border-primary-100 { border-color: var(--ui-color-primary-100); }
/* ... continues for all color scales ... */

/* =============== Spacing Utilities =============== */

/* Padding */
.p-0 { padding: var(--ui-spacing-0); }
.p-px { padding: var(--ui-spacing-px); }
.p-0-5 { padding: var(--ui-spacing-0-5); }
.p-1 { padding: var(--ui-spacing-1); }
/* ... continues for all spacing values ... */

/* Padding X/Y */
.px-0 { padding-left: var(--ui-spacing-0); padding-right: var(--ui-spacing-0); }
.py-0 { padding-top: var(--ui-spacing-0); padding-bottom: var(--ui-spacing-0); }
/* ... continues for all spacing values ... */

/* Individual Padding */
.pt-0 { padding-top: var(--ui-spacing-0); }
.pr-0 { padding-right: var(--ui-spacing-0); }
.pb-0 { padding-bottom: var(--ui-spacing-0); }
.pl-0 { padding-left: var(--ui-spacing-0); }
/* ... continues for all spacing values ... */

/* Margin (including negative values) */
.m-0 { margin: var(--ui-spacing-0); }
.m-1 { margin: var(--ui-spacing-1); }
.-m-1 { margin: calc(var(--ui-spacing-1) * -1); }
/* ... continues for all spacing values ... */

/* Gap */
.gap-0 { gap: var(--ui-spacing-0); }
.gap-1 { gap: var(--ui-spacing-1); }
/* ... continues for all spacing values ... */

/* =============== Typography Utilities =============== */

/* Font Size */
.text-xs { font-size: var(--ui-font-size-xs); }
.text-sm { font-size: var(--ui-font-size-sm); }
.text-base { font-size: var(--ui-font-size-base); }
.text-lg { font-size: var(--ui-font-size-lg); }
/* ... continues for all font sizes ... */

/* Font Weight */
.font-thin { font-weight: var(--ui-font-weight-thin); }
.font-extralight { font-weight: var(--ui-font-weight-extralight); }
.font-light { font-weight: var(--ui-font-weight-light); }
.font-normal { font-weight: var(--ui-font-weight-normal); }
/* ... continues for all font weights ... */

/* Line Height */
.leading-none { line-height: var(--ui-line-height-none); }
.leading-tight { line-height: var(--ui-line-height-tight); }
.leading-snug { line-height: var(--ui-line-height-snug); }
.leading-normal { line-height: var(--ui-line-height-normal); }
/* ... continues for all line heights ... */

/* Letter Spacing */
.tracking-tighter { letter-spacing: var(--ui-letter-spacing-tighter); }
.tracking-tight { letter-spacing: var(--ui-letter-spacing-tight); }
.tracking-normal { letter-spacing: var(--ui-letter-spacing-normal); }
/* ... continues for all letter spacing values ... */

/* =============== Border Radius Utilities =============== */

.rounded-none { border-radius: var(--ui-radius-none); }
.rounded-sm { border-radius: var(--ui-radius-sm); }
.rounded { border-radius: var(--ui-radius-base); }
.rounded-md { border-radius: var(--ui-radius-md); }
.rounded-lg { border-radius: var(--ui-radius-lg); }
.rounded-xl { border-radius: var(--ui-radius-xl); }
.rounded-2xl { border-radius: var(--ui-radius-2xl); }
.rounded-3xl { border-radius: var(--ui-radius-3xl); }
.rounded-full { border-radius: var(--ui-radius-full); }

/* =============== Shadow Utilities =============== */

.shadow-xs { box-shadow: var(--ui-shadow-xs); }
.shadow-sm { box-shadow: var(--ui-shadow-sm); }
.shadow { box-shadow: var(--ui-shadow-base); }
.shadow-md { box-shadow: var(--ui-shadow-md); }
.shadow-lg { box-shadow: var(--ui-shadow-lg); }
.shadow-xl { box-shadow: var(--ui-shadow-xl); }
.shadow-2xl { box-shadow: var(--ui-shadow-2xl); }
.shadow-inner { box-shadow: var(--ui-shadow-inner); }
.shadow-none { box-shadow: var(--ui-shadow-none); }
```

### 4. Responsive Media Queries

```css
/* =============== Responsive Utilities =============== */

/* Small screens and up (640px) */
@media (min-width: 640px) {
  .sm\:text-primary { color: var(--ui-color-primary-500); }
  .sm\:bg-primary { background-color: var(--ui-color-primary-500); }
  .sm\:p-0 { padding: var(--ui-spacing-0); }
  .sm\:p-1 { padding: var(--ui-spacing-1); }
  /* ... continues for all utilities ... */
}

/* Medium screens and up (768px) */
@media (min-width: 768px) {
  .md\:text-primary { color: var(--ui-color-primary-500); }
  .md\:bg-primary { background-color: var(--ui-color-primary-500); }
  .md\:p-0 { padding: var(--ui-spacing-0); }
  .md\:p-1 { padding: var(--ui-spacing-1); }
  /* ... continues for all utilities ... */
}

/* Large screens and up (1024px) */
@media (min-width: 1024px) {
  .lg\:text-primary { color: var(--ui-color-primary-500); }
  .lg\:bg-primary { background-color: var(--ui-color-primary-500); }
  .lg\:p-0 { padding: var(--ui-spacing-0); }
  .lg\:p-1 { padding: var(--ui-spacing-1); }
  /* ... continues for all utilities ... */
}

/* Extra large screens and up (1280px) */
@media (min-width: 1280px) {
  .xl\:text-primary { color: var(--ui-color-primary-500); }
  .xl\:bg-primary { background-color: var(--ui-color-primary-500); }
  .xl\:p-0 { padding: var(--ui-spacing-0); }
  .xl\:p-1 { padding: var(--ui-spacing-1); }
  /* ... continues for all utilities ... */
}

/* 2X Extra large screens and up (1536px) */
@media (min-width: 1536px) {
  .\32xl\:text-primary { color: var(--ui-color-primary-500); }
  .\32xl\:bg-primary { background-color: var(--ui-color-primary-500); }
  .\32xl\:p-0 { padding: var(--ui-spacing-0); }
  .\32xl\:p-1 { padding: var(--ui-spacing-1); }
  /* ... continues for all utilities ... */
}

/* Container Queries (if enabled) */
@container (min-width: 640px) {
  .sm\:container\:p-4 { padding: var(--ui-spacing-4); }
  /* ... container-specific utilities ... */
}
```

### 5. Advanced Color Formats

```css
/* RGB Format */
:root {
  --ui-color-primary-500-rgb: 14, 165, 233;
  --ui-color-primary-500: rgb(var(--ui-color-primary-500-rgb));
  --ui-color-primary-500-alpha: rgba(var(--ui-color-primary-500-rgb), var(--ui-opacity, 1));
}

/* HSL Format */
:root {
  --ui-color-primary-500-hsl: 199, 89%, 49%;
  --ui-color-primary-500: hsl(var(--ui-color-primary-500-hsl));
  --ui-color-primary-500-alpha: hsla(var(--ui-color-primary-500-hsl), var(--ui-opacity, 1));
}

/* Opacity modifiers */
.text-primary\/50 { 
  color: var(--ui-color-primary-500);
  opacity: 0.5;
}

.bg-primary\/10 { 
  background-color: var(--ui-color-primary-500);
  opacity: 0.1;
}
```

## Advanced Features

### 1. Custom Property Formatter

```typescript
const result = transformer.transform(tokens, {
  formatter: (path, value) => {
    // Custom formatting logic
    if (path.includes('color')) {
      return formatColor(value);
    }
    if (path.includes('spacing')) {
      return formatSpacing(value);
    }
    return String(value);
  }
});
```

### 2. Conditional CSS Generation

```typescript
// Generate CSS for specific token categories
const colorCSS = transformer.transformCategory(tokens.colors, {
  prefix: 'color-',
  generateUtilityClasses: true
});

const typographyCSS = transformer.transformCategory(tokens.typography, {
  prefix: 'type-',
  generateUtilityClasses: true
});
```

### 3. CSS-in-JS Integration

```typescript
// Generate CSS object for CSS-in-JS libraries
const cssObject = transformer.transformToObject(tokens, {
  camelCase: true,
  stripPrefix: true
});

// Result:
{
  colorPrimary500: '#0ea5e9',
  fontSizeBase: '1rem',
  spacing4: '1rem',
  // ...
}
```

### 4. Dynamic Theme Switching

```css
/* Automatic theme switching based on system preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --ui-color-background: var(--ui-color-neutral-950);
    --ui-color-foreground: var(--ui-color-neutral-50);
    /* ... dark theme variables ... */
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --ui-color-border: currentColor;
    --ui-shadow-sm: 0 0 0 1px currentColor;
    /* ... high contrast adjustments ... */
  }
}
```

## Integration Examples

### 1. With Plain CSS

```css
/* styles.css */
@import '@xala-technologies/ui-system/dist/tokens.css';

.button {
  background-color: var(--ui-color-primary-500);
  color: var(--ui-color-white);
  padding: var(--ui-spacing-3) var(--ui-spacing-6);
  border-radius: var(--ui-radius-md);
  font-size: var(--ui-font-size-base);
  font-weight: var(--ui-font-weight-medium);
  box-shadow: var(--ui-shadow-sm);
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--ui-color-primary-600);
  box-shadow: var(--ui-shadow-md);
}

.button:focus {
  outline: 2px solid var(--ui-color-ring);
  outline-offset: 2px;
}
```

### 2. With CSS Modules

```css
/* Button.module.css */
.button {
  composes: bg-primary text-white px-6 py-3 rounded-md shadow-sm from global;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--ui-color-primary-600);
  box-shadow: var(--ui-shadow-md);
}

.variant-secondary {
  composes: button;
  background-color: var(--ui-color-secondary-500);
}

.size-small {
  composes: px-3 py-1 text-sm from global;
}
```

### 3. With Styled Components

```typescript
import { css } from 'styled-components';

const buttonStyles = css`
  background-color: var(--ui-color-primary-500);
  color: var(--ui-color-white);
  padding: var(--ui-spacing-3) var(--ui-spacing-6);
  border-radius: var(--ui-radius-md);
  
  &:hover {
    background-color: var(--ui-color-primary-600);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Using with theme provider
const ThemedButton = styled.button`
  ${props => css`
    background-color: var(--ui-color-${props.variant}-500);
    font-size: var(--ui-font-size-${props.size});
  `}
`;
```

### 4. With Tailwind CSS

```css
/* Extend Tailwind with custom properties */
@layer base {
  :root {
    --tw-color-primary: var(--ui-color-primary-500);
    --tw-color-secondary: var(--ui-color-secondary-500);
  }
}

@layer utilities {
  .text-primary {
    color: var(--ui-color-primary-500);
  }
  
  .bg-surface {
    background-color: var(--ui-color-background);
  }
}
```

## Best Practices

### 1. Semantic Variable Naming

```css
/* ✅ Good: Semantic names */
:root {
  --ui-color-text-primary: var(--ui-color-neutral-900);
  --ui-color-text-secondary: var(--ui-color-neutral-600);
  --ui-color-background-page: var(--ui-color-neutral-50);
  --ui-color-background-card: var(--ui-color-white);
}

/* ❌ Bad: Direct color names */
:root {
  --ui-text-black: #000000;
  --ui-bg-white: #ffffff;
}
```

### 2. Fallback Values

```css
/* Always provide fallbacks for custom properties */
.component {
  color: var(--ui-color-text, #111827);
  background: var(--ui-color-background, #ffffff);
  padding: var(--ui-spacing-4, 1rem);
}
```

### 3. Scoped Variables

```css
/* Component-specific variables */
.button {
  --button-bg: var(--ui-color-primary-500);
  --button-color: var(--ui-color-white);
  --button-padding-x: var(--ui-spacing-6);
  --button-padding-y: var(--ui-spacing-3);
  
  background-color: var(--button-bg);
  color: var(--button-color);
  padding: var(--button-padding-y) var(--button-padding-x);
}

/* Variant overrides */
.button--secondary {
  --button-bg: var(--ui-color-secondary-500);
}

.button--large {
  --button-padding-x: var(--ui-spacing-8);
  --button-padding-y: var(--ui-spacing-4);
}
```

### 4. Performance Optimization

```css
/* Use CSS containment for better performance */
.token-container {
  contain: style layout;
}

/* Minimize recalculation with CSS custom properties */
:root {
  --ui-computed-spacing: calc(var(--ui-spacing-base) * var(--ui-scale, 1));
}

/* Use will-change sparingly */
.theme-transition {
  will-change: background-color, color;
  transition: background-color 0.3s, color 0.3s;
}
```

## Troubleshooting

### Common Issues

1. **Variables not updating**
   ```css
   /* Ensure specificity is correct */
   [data-theme="dark"] {
     --ui-color-background: var(--ui-color-neutral-950) !important;
   }
   ```

2. **Browser compatibility**
   ```css
   /* Provide fallbacks for older browsers */
   .component {
     background-color: #0ea5e9; /* Fallback */
     background-color: var(--ui-color-primary-500);
   }
   ```

3. **CSS variable inheritance**
   ```css
   /* Reset inheritance when needed */
   .isolated-component {
     all: revert;
     /* Re-apply needed variables */
   }
   ```

## Performance Considerations

1. **Minimize CSS variable reads**
   ```css
   /* Cache frequently used values */
   .performance-critical {
     --cached-color: var(--ui-color-primary-500);
     background: var(--cached-color);
     border-color: var(--cached-color);
   }
   ```

2. **Use CSS transforms for animations**
   ```css
   /* Prefer transforms over property changes */
   .animated {
     transform: var(--ui-transform-scale);
     transition: transform 0.2s;
   }
   ```

3. **Lazy load theme CSS**
   ```html
   <link rel="preload" href="tokens.css" as="style">
   <link rel="stylesheet" href="tokens.css" media="print" onload="this.media='all'">
   ```

## Browser Support

CSS custom properties are supported in all modern browsers:
- Chrome/Edge: 49+
- Firefox: 31+
- Safari: 9.1+
- iOS Safari: 9.3+
- Chrome Android: 49+

For older browsers, use PostCSS with custom properties plugin:

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-custom-properties')({
      preserve: true,
      fallback: true
    })
  ]
};
```

## API Reference

### CSSVariableTransformer Class

```typescript
class CSSVariableTransformer implements TokenTransformer<CSSVariableResult> {
  transform(tokens: TokenSystem, options?: CSSVariableOptions): CSSVariableResult;
  
  // Helper methods
  private generateCSSVariables(tokens: TokenSystem, options: CSSVariableOptions): string;
  private generateUtilityClasses(tokens: TokenSystem, options: CSSVariableOptions): string;
  private generateMediaQueries(tokens: TokenSystem, options: CSSVariableOptions): string;
  private formatPropertyName(path: string[], prefix: string): string;
  private formatPropertyValue(value: any, options: CSSVariableOptions): string;
}
```

### CSSVariableResult Interface

```typescript
interface CSSVariableResult {
  variables: string;     // CSS custom properties
  utilities: string;     // Utility classes
  mediaQueries: string;  // Responsive utilities
  themes?: string;       // Theme-specific CSS
  full: string;         // Complete CSS output
}
```

## Next Steps

- [TypeScript Type Transformer](./typescript-transformer.md) - Generate type definitions
- [Tailwind Config Transformer](./tailwind-transformer.md) - Generate Tailwind configurations
- [JSON Schema Transformer](./json-schema-transformer.md) - Generate validation schemas