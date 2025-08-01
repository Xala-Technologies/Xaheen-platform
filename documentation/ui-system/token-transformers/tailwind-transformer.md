# Tailwind Config Transformer

The Tailwind Config Transformer generates complete Tailwind CSS configuration files from design tokens, enabling seamless integration with Tailwind-based projects while maintaining design system consistency. It supports extend mode, custom plugins, and comprehensive safelist generation.

## Overview

The Tailwind transformer converts your design tokens into:
- Complete Tailwind configuration objects
- Theme extensions or replacements
- Custom plugin definitions
- Safelist patterns for dynamic classes
- Content path configurations
- TypeScript type definitions for config

## Basic Usage

```typescript
import { TailwindConfigTransformer } from '@xala-technologies/ui-system/tokens/transformers';

const transformer = new TailwindConfigTransformer();
const result = transformer.transform(tokens, {
  mode: 'extend',
  includePlugins: true,
  generateSafelist: true
});

// Access generated content
console.log(result.config);      // Configuration object
console.log(result.plugins);     // Plugin definitions
console.log(result.types);       // TypeScript types
console.log(result.full);        // Complete config file
```

## Configuration Options

### TailwindConfigOptions

```typescript
interface TailwindConfigOptions {
  // Mode: 'extend' to extend default theme, 'replace' to replace it
  mode?: 'extend' | 'replace';
  
  // Include descriptive comments
  includeComments?: boolean;
  
  // Generate content paths
  generateContent?: boolean;
  
  // Include plugin configurations
  includePlugins?: boolean;
  
  // Generate TypeScript types
  generateTypes?: boolean;
  
  // Tailwind prefix for all classes
  prefix?: string;
  
  // Important selector
  important?: boolean | string;
  
  // Generate safelist patterns
  generateSafelist?: boolean;
  
  // Custom content paths
  contentPaths?: string[];
  
  // Plugin options
  pluginOptions?: {
    forms?: boolean;
    typography?: boolean;
    aspectRatio?: boolean;
    containerQueries?: boolean;
  };
  
  // Safelist options
  safelistOptions?: {
    colors?: string[];
    patterns?: RegExp[];
    deep?: boolean;
  };
  
  // Dark mode configuration
  darkMode?: 'media' | 'class' | ['class', string];
  
  // Custom theme mapping
  themeMapping?: Record<string, string>;
}
```

## Generated Output Examples

### 1. Basic Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content paths for tree-shaking
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Dark mode configuration
  darkMode: 'class',
  
  // Theme configuration
  theme: {
    extend: {
      // Color palette from tokens
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
        // Semantic colors
        background: 'var(--ui-color-background)',
        foreground: 'var(--ui-color-foreground)',
        card: {
          DEFAULT: 'var(--ui-color-card)',
          foreground: 'var(--ui-color-card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--ui-color-popover)',
          foreground: 'var(--ui-color-popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--ui-color-muted)',
          foreground: 'var(--ui-color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--ui-color-accent)',
          foreground: 'var(--ui-color-accent-foreground)',
        },
        border: 'var(--ui-color-border)',
        input: 'var(--ui-color-input)',
        ring: 'var(--ui-color-ring)',
      },
      
      // Spacing scale from tokens
      spacing: {
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      
      // Typography configuration
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
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
        black: '900',
      },
      
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        '3': '.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },
      
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      
      // Border radius scale
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      
      // Box shadow scale
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': '0 0 #0000',
      },
      
      // Animation configuration
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      
      // Z-index scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
      },
    },
  },
  
  // Plugin configuration
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  
  // Safelist for dynamic classes
  safelist: [
    // Color safelist
    {
      pattern: /^(bg|text|border)-(primary|secondary|neutral|success|warning|danger)-(50|100|200|300|400|500|600|700|800|900|950)$/,
      variants: ['hover', 'focus', 'active', 'disabled'],
    },
    // Spacing safelist
    {
      pattern: /^(p|m|gap)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    // Typography safelist
    {
      pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    // Border radius safelist
    {
      pattern: /^rounded-(none|sm|DEFAULT|md|lg|xl|2xl|3xl|full)$/,
    },
    // Shadow safelist
    {
      pattern: /^shadow-(xs|sm|DEFAULT|md|lg|xl|2xl|inner|none)$/,
    },
  ],
};
```

### 2. Replace Mode Configuration

```javascript
// Replace mode - completely replaces Tailwind's default theme
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Complete theme replacement
    colors: {
      // Only your token colors, no Tailwind defaults
      primary: { /* ... */ },
      secondary: { /* ... */ },
      neutral: { /* ... */ },
      // No inherit, current, transparent unless you add them
    },
    spacing: {
      // Only your token spacing
      '0': '0px',
      '1': '0.25rem',
      '2': '0.5rem',
      // ... your spacing scale
    },
    // All other theme values must be explicitly defined
  },
};
```

### 3. With Custom Prefix

```javascript
module.exports = {
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
        },
      },
    },
  },
};

// Usage: <div class="tw-bg-primary-500 tw-p-4">
```

### 4. With Important Selector

```javascript
module.exports = {
  important: '#app',
  // or
  important: true,
  theme: {
    extend: {
      // Your tokens
    },
  },
};

// Results in:
// #app .bg-primary-500 { background-color: #0ea5e9 !important; }
// or
// .bg-primary-500 { background-color: #0ea5e9 !important; }
```

### 5. Custom Plugins

```javascript
module.exports = {
  theme: {
    extend: {
      // Your token configuration
    },
  },
  plugins: [
    // Component plugin
    function({ addComponents, theme }) {
      addComponents({
        '.btn': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          transition: 'all 150ms ease',
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.secondary.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.secondary.600'),
          },
        },
      });
    },
    
    // Utility plugin
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgb(0 0 0 / 0.05)',
        },
        '.text-shadow-md': {
          textShadow: '0 4px 6px rgb(0 0 0 / 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 10px 15px rgb(0 0 0 / 0.1)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      };
      
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
    
    // Base styles plugin
    function({ addBase, theme }) {
      addBase({
        'h1': {
          fontSize: theme('fontSize.4xl'),
          fontWeight: theme('fontWeight.bold'),
          lineHeight: theme('lineHeight.tight'),
        },
        'h2': {
          fontSize: theme('fontSize.3xl'),
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: theme('lineHeight.tight'),
        },
        'h3': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: theme('lineHeight.snug'),
        },
      });
    },
  ],
};
```

### 6. TypeScript Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { tokenConfig } from './tokens/tailwind';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: tokenConfig.theme,
  },
  plugins: tokenConfig.plugins,
  safelist: tokenConfig.safelist,
} satisfies Config;

export default config;
```

### 7. Advanced Safelist Patterns

```javascript
module.exports = {
  safelist: [
    // Static classes always included
    'bg-primary-500',
    'text-white',
    
    // Pattern matching with variants
    {
      pattern: /^bg-(primary|secondary)-(100|500|900)$/,
      variants: ['lg', 'hover', 'focus', 'lg:hover'],
    },
    
    // Deep scanning (scans actual class usage)
    {
      pattern: /^(bg|text|border)-/,
      deep: true,
    },
    
    // Function-based safelist
    ({ theme }) => {
      return Object.keys(theme.colors).flatMap(color => 
        [`bg-${color}-500`, `text-${color}-500`, `border-${color}-500`]
      );
    },
  ],
};
```

## Advanced Features

### 1. Multi-Theme Configuration

```javascript
// Generate configs for multiple themes
const themes = ['light', 'dark', 'high-contrast'];

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: ({ theme }) => ({
        // Dynamic color generation based on CSS variables
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          // ... continue for all shades
        },
      }),
    },
  },
  plugins: [
    // Theme variant plugin
    function({ addVariant }) {
      themes.forEach(theme => {
        addVariant(theme, `[data-theme="${theme}"] &`);
      });
    },
  ],
};
```

### 2. Responsive Token System

```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      fontSize: {
        // Responsive font sizes with clamp
        'responsive-sm': 'clamp(0.875rem, 2vw, 1rem)',
        'responsive-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
      },
    },
  },
};
```

### 3. Component Variants System

```javascript
module.exports = {
  plugins: [
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          // Button variants
          'btn': (value) => ({
            backgroundColor: theme(`colors.${value}.500`),
            color: theme('colors.white'),
            padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
            borderRadius: theme('borderRadius.md'),
            '&:hover': {
              backgroundColor: theme(`colors.${value}.600`),
            },
          }),
        },
        {
          values: {
            primary: 'primary',
            secondary: 'secondary',
            danger: 'danger',
            success: 'success',
          },
        }
      );
    },
  ],
};

// Usage: <button class="btn-primary">Click me</button>
```

### 4. CSS Variable Integration

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Use CSS variables for runtime theming
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... other shades
        },
        // Semantic colors
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
      },
      // Arbitrary property support
      backgroundColor: {
        'surface': 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
      },
    },
  },
};
```

## Integration Examples

### 1. With Next.js

```javascript
// tailwind.config.js
const { tokenConfig } = require('./design-tokens/tailwind');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [tokenConfig],
  theme: {
    extend: {
      // Additional Next.js specific extensions
    },
  },
};
```

### 2. With Vite

```javascript
// tailwind.config.js
import { generateTailwindConfig } from '@xala-technologies/ui-system/tokens/transformers';
import tokens from './tokens.json';

export default generateTailwindConfig(tokens, {
  mode: 'extend',
  contentPaths: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
}).config;
```

### 3. With PostCSS

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: './tailwind.config.js',
    },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

### 4. With CSS-in-JS

```javascript
// Use Tailwind config in styled-components
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from './tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const theme = {
  colors: fullConfig.theme.colors,
  spacing: fullConfig.theme.spacing,
  // ... other values
};

// Use in styled-components
const Button = styled.button`
  background-color: ${props => theme.colors.primary['500']};
  padding: ${theme.spacing['3']} ${theme.spacing['6']};
`;
```

## Best Practices

### 1. Use Semantic Class Names

```html
<!-- ✅ Good: Semantic, maintainable -->
<button class="btn-primary">Submit</button>

<!-- ❌ Bad: Utility soup -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
  Submit
</button>
```

### 2. Create Component Classes

```css
/* components.css */
@layer components {
  .btn {
    @apply px-6 py-3 font-medium rounded-md transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
  
  .btn-secondary {
    @apply bg-secondary-500 text-white hover:bg-secondary-600;
  }
}
```

### 3. Use CSS Variables for Theming

```css
@layer base {
  :root {
    --color-primary: theme('colors.primary.500');
    --color-secondary: theme('colors.secondary.500');
  }
  
  [data-theme='dark'] {
    --color-primary: theme('colors.primary.400');
    --color-secondary: theme('colors.secondary.400');
  }
}
```

### 4. Optimize for Production

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Be specific to reduce bundle size
  ],
  // Remove unused keyframes
  corePlugins: {
    animation: false, // If not using animations
  },
  // Disable unused variants
  variants: {
    extend: {
      backgroundColor: ['active'], // Only what you need
    },
  },
};
```

## Performance Considerations

### 1. Minimize Safelist Usage

```javascript
// ❌ Bad: Large safelist
safelist: [
  { pattern: /.*/ }, // Includes everything!
]

// ✅ Good: Specific safelist
safelist: [
  { 
    pattern: /^bg-(primary|secondary)-(500|600)$/,
    variants: ['hover'],
  },
]
```

### 2. Use PurgeCSS Options

```javascript
module.exports = {
  content: {
    files: ['./src/**/*.{js,ts,jsx,tsx}'],
    // Advanced extraction
    extract: {
      js: (content) => {
        // Custom extraction logic
        return content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
      },
    },
  },
};
```

### 3. Split Configurations

```javascript
// base.config.js - Shared configuration
const baseConfig = {
  theme: {
    extend: {
      colors: { /* tokens */ },
      spacing: { /* tokens */ },
    },
  },
};

// app.config.js - App-specific
module.exports = {
  presets: [baseConfig],
  content: ['./app/**/*.{js,jsx}'],
  plugins: [/* app plugins */],
};

// marketing.config.js - Marketing-specific
module.exports = {
  presets: [baseConfig],
  content: ['./marketing/**/*.{js,jsx}'],
  plugins: [/* marketing plugins */],
};
```

## Troubleshooting

### Common Issues

1. **Classes not generated**
   ```javascript
   // Ensure content paths are correct
   content: [
     './src/**/*.{js,ts,jsx,tsx}',
     './node_modules/@my-lib/**/*.js', // Include library files
   ],
   ```

2. **Dynamic classes not working**
   ```javascript
   // Don't use string concatenation
   // ❌ Bad
   const color = 'primary';
   <div className={`bg-${color}-500`} />
   
   // ✅ Good
   const colorClass = {
     primary: 'bg-primary-500',
     secondary: 'bg-secondary-500',
   };
   <div className={colorClass[color]} />
   ```

3. **CSS variables not resolving**
   ```javascript
   // Ensure alpha channel support
   colors: {
     primary: {
       500: 'rgb(var(--color-primary-500) / <alpha-value>)',
     },
   },
   ```

## Migration Guide

### From Tailwind Defaults to Token-Based

```javascript
// Before: Using Tailwind defaults
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
      },
    },
  },
};

// After: Using design tokens
import { generateTailwindConfig } from '@xala-technologies/ui-system';
import tokens from './tokens.json';

module.exports = generateTailwindConfig(tokens, {
  mode: 'extend',
}).config;
```

### From Manual Config to Generated

```javascript
// Before: Manual configuration
module.exports = {
  theme: {
    colors: {
      primary: { /* manually defined */ },
      secondary: { /* manually defined */ },
    },
  },
};

// After: Generated from tokens
const config = transformer.transform(tokens);
module.exports = config;
```

## API Reference

### TailwindConfigTransformer Class

```typescript
class TailwindConfigTransformer implements TokenTransformer<TailwindConfigResult> {
  transform(tokens: TokenSystem, options?: TailwindConfigOptions): TailwindConfigResult;
  
  // Helper methods
  private generateThemeConfig(tokens: TokenSystem, options: TailwindConfigOptions): object;
  private generatePlugins(tokens: TokenSystem, options: TailwindConfigOptions): Function[];
  private generateSafelist(tokens: TokenSystem, options: TailwindConfigOptions): any[];
  private generateContentPaths(options: TailwindConfigOptions): string[];
  private formatColorValue(value: string, includeAlpha?: boolean): string;
}
```

### TailwindConfigResult Interface

```typescript
interface TailwindConfigResult {
  config: object;          // Configuration object
  plugins: Function[];     // Plugin functions
  safelist: any[];        // Safelist patterns
  types?: string;         // TypeScript types
  full: string;           // Complete config file
}
```

## Next Steps

- [TypeScript Type Transformer](./typescript-transformer.md) - Generate type definitions
- [CSS Variable Transformer](./css-transformer.md) - Generate CSS custom properties
- [JSON Schema Transformer](./json-schema-transformer.md) - Generate validation schemas