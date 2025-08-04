# Quick Start: Token Transformation

Get started with the Xala UI System token transformation pipeline in 5 minutes.

## Installation

```bash
pnpm add @xala-technologies/ui-system
```

## Basic Usage

### 1. Import Transformers

```typescript
import {
  generateTypeScriptTypes,
  generateCSSVariables,
  generateTailwindConfig
} from '@xala-technologies/ui-system/tokens/transformers';
```

### 2. Load Your Theme

```typescript
// Option 1: Import existing theme
import { lightTheme } from '@xala-technologies/ui-system/themes';

// Option 2: Define custom theme
const customTheme = {
  id: 'my-theme',
  name: 'My Custom Theme',
  mode: 'LIGHT',
  colors: {
    primary: {
      500: '#3b82f6'
    }
  },
  // ... other tokens
};
```

### 3. Generate Outputs

```typescript
// Generate TypeScript types
const types = generateTypeScriptTypes(customTheme);
fs.writeFileSync('./theme.types.ts', types.types);

// Generate CSS variables
const css = generateCSSVariables(customTheme);
fs.writeFileSync('./theme.css', css.full);

// Generate Tailwind config
const tailwind = generateTailwindConfig(customTheme);
fs.writeFileSync('./tailwind.config.js', tailwind.full);
```

## Complete Example

```typescript
// generate-tokens.js
const fs = require('fs');
const { 
  generateTypeScriptTypes,
  generateCSSVariables,
  generateTailwindConfig 
} = require('@xala-technologies/ui-system/tokens/transformers');

// Your theme definition
const theme = {
  id: 'app-theme',
  name: 'Application Theme',
  mode: 'LIGHT',
  version: '1.0.0',
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    neutral: {
      50: '#fafafa',
      500: '#737373',
      900: '#171717'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    },
    fontSize: {
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  },
  spacing: {
    0: '0px',
    4: '1rem',
    8: '2rem'
  }
};

// Generate all formats
console.log('🎨 Generating token outputs...');

// TypeScript
const tsResult = generateTypeScriptTypes(theme, {
  includeJSDoc: true,
  namespace: 'AppTheme'
});
fs.writeFileSync('./src/theme.types.ts', tsResult.types);
console.log('✅ TypeScript types generated');

// CSS
const cssResult = generateCSSVariables(theme, {
  prefix: 'app-',
  generateUtilityClasses: true
});
fs.writeFileSync('./src/theme.css', cssResult.full);
console.log('✅ CSS variables generated');

// Tailwind
const twResult = generateTailwindConfig(theme, {
  mode: 'extend'
});
fs.writeFileSync('./tailwind.config.js', twResult.full);
console.log('✅ Tailwind config generated');

console.log('✨ All tokens generated successfully!');
```

## Usage in Your App

### TypeScript
```typescript
import { AppTheme } from './theme.types';

const primaryColor: AppTheme.Colors['primary']['500'] = '#3b82f6';
```

### CSS
```css
@import './theme.css';

.button {
  background-color: var(--app-color-primary-500);
  padding: var(--app-spacing-4);
}
```

### Tailwind
```jsx
// Use generated Tailwind classes
<button className="bg-primary-500 p-4">
  Click me
</button>
```

## Build Integration

Add to your build process:

```json
// package.json
{
  "scripts": {
    "generate-tokens": "node generate-tokens.js",
    "prebuild": "npm run generate-tokens",
    "build": "next build"
  }
}
```

## Multi-Theme Support

Generate for multiple themes:

```typescript
const themes = [lightTheme, darkTheme];

themes.forEach(theme => {
  const types = generateTypeScriptTypes(theme);
  const css = generateCSSVariables(theme, {
    selector: `[data-theme="${theme.id}"]`
  });
  
  fs.writeFileSync(`./themes/${theme.id}.types.ts`, types.types);
  fs.writeFileSync(`./themes/${theme.id}.css`, css.full);
});
```

## Next Steps

- Read the full [Token Transformers Guide](../token-transformers.md)
- Explore [Theme Configuration](../themes.md)
- Learn about [Design Tokens](../design-tokens.md)
- Check out [Examples](../examples/)