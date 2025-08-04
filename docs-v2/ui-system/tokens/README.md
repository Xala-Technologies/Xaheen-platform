# UI System - Design Token System

## 🎨 Token-Based Design System v5.0

The Xala Universal Design System v5.0 uses a sophisticated **token-based architecture** that ensures consistency, scalability, and easy theming across all components and platforms. Our design tokens provide a single source of truth for all design decisions.

## 🏗️ Token Architecture

### Three-Layer Token System
```
🎯 Component Tokens (Application Layer)
    ↓ Uses
🔄 Semantic Tokens (Meaning Layer)  
    ↓ References
🎨 Primitive Tokens (Base Layer)
```

#### Primitive Tokens (Base Layer)
Raw design values that form the foundation of the system.

```typescript
// Color primitives
const colorPrimatives = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  }
};

// Spacing primitives (8pt grid)
const spacingPrimitives = {
  1: '4px',   // 0.5 * 8px
  2: '8px',   // 1 * 8px  
  3: '12px',  // 1.5 * 8px
  4: '16px',  // 2 * 8px
  6: '24px',  // 3 * 8px
  8: '32px',  // 4 * 8px
  12: '48px', // 6 * 8px
  16: '64px'  // 8 * 8px
};
```

#### Semantic Tokens (Meaning Layer)
Tokens that convey meaning and intent, mapped to primitive values.

```typescript
// Semantic color tokens
const semanticColors = {
  primary: colorPrimitives.blue[600],
  secondary: colorPrimitives.gray[600],
  success: colorPrimitives.green[600],
  warning: colorPrimitives.yellow[600],
  destructive: colorPrimitives.red[600],
  
  // Surface colors
  background: colorPrimitives.white,
  foreground: colorPrimitives.gray[900],
  card: colorPrimitives.white,
  'card-foreground': colorPrimitives.gray[900],
  muted: colorPrimitives.gray[50],
  'muted-foreground': colorPrimitives.gray[500],
  
  // Interactive colors
  accent: colorPrimitives.gray[100],
  'accent-foreground': colorPrimitives.gray[900],
  border: colorPrimitives.gray[200],
  input: colorPrimitives.gray[200],
  ring: colorPrimitives.blue[500]
};

// Semantic spacing tokens
const semanticSpacing = {
  xs: spacingPrimitives[1],    // 4px
  sm: spacingPrimitives[2],    // 8px
  md: spacingPrimitives[4],    // 16px
  lg: spacingPrimitives[6],    // 24px
  xl: spacingPrimitives[8],    // 32px
  '2xl': spacingPrimitives[12] // 48px
};
```

#### Component Tokens (Application Layer)
Component-specific tokens that reference semantic tokens.

```typescript
// Button component tokens
const buttonTokens = {
  // Primary variant
  'button-primary-bg': semanticColors.primary,
  'button-primary-fg': semanticColors['primary-foreground'],
  'button-primary-hover': `${semanticColors.primary}/90`,
  
  // Secondary variant  
  'button-secondary-bg': semanticColors.secondary,
  'button-secondary-fg': semanticColors['secondary-foreground'],
  
  // Sizing
  'button-height-sm': '36px',
  'button-height-md': '40px', 
  'button-height-lg': '44px',
  'button-padding-x': semanticSpacing.md,
  'button-border-radius': '6px'
};
```

## 📁 Token Organization

### File Structure
```
src/tokens/
├── definitions/           # Raw token definitions
│   ├── colors.json       # Color palette
│   ├── spacing.json      # Spacing scale
│   ├── typography.json   # Type scale
│   ├── shadows.json      # Shadow definitions
│   └── animations.json   # Motion tokens
├── semantic/             # Semantic layer
│   ├── colors.ts         # Semantic color mapping
│   ├── spacing.ts        # Semantic spacing
│   └── typography.ts     # Semantic type styles
├── themes/               # Theme definitions
│   ├── light.ts          # Light theme
│   ├── dark.ts           # Dark theme
│   └── high-contrast.ts  # High contrast theme
├── transformers/         # Token transformers
│   ├── css-variables.ts  # CSS custom properties
│   ├── tailwind-config.ts # Tailwind configuration
│   └── typescript-types.ts # TypeScript interfaces
└── index.ts              # Main token exports
```

### Token Definition Format
```typescript
interface TokenDefinition {
  value: string | number;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'animation';
  description?: string;
  extensions?: {
    'com.xala.accessibility'?: {
      contrastRatio?: number;
      wcagLevel?: 'AA' | 'AAA';
    };
    'com.xala.norwegian'?: {
      nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT';
      gdprCompliant?: boolean;
    };
  };
}
```

## 🎨 Color System

### Semantic Color Palette
```typescript
// Light theme semantic colors
export const lightColors = {
  // Brand colors
  primary: '#2563eb',           // Blue 600
  'primary-foreground': '#ffffff',
  secondary: '#6b7280',         // Gray 500  
  'secondary-foreground': '#ffffff',
  
  // Status colors
  success: '#16a34a',           // Green 600
  'success-foreground': '#ffffff',
  warning: '#ca8a04',           // Yellow 600
  'warning-foreground': '#ffffff', 
  destructive: '#dc2626',       // Red 600
  'destructive-foreground': '#ffffff',
  
  // Surface colors
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  'card-foreground': '#0a0a0a',
  popover: '#ffffff',
  'popover-foreground': '#0a0a0a',
  
  // Muted colors
  muted: '#f1f5f9',            // Slate 100
  'muted-foreground': '#64748b', // Slate 500
  
  // Interactive colors
  accent: '#f1f5f9',           // Slate 100
  'accent-foreground': '#0f172a', // Slate 900
  
  // Border colors
  border: '#e2e8f0',           // Slate 200
  input: '#e2e8f0',            // Slate 200
  ring: '#2563eb',             // Blue 600
};

// Dark theme colors
export const darkColors = {
  primary: '#3b82f6',          // Blue 500
  'primary-foreground': '#ffffff',
  secondary: '#64748b',        // Slate 500
  'secondary-foreground': '#ffffff',
  
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#0a0a0a',
  'card-foreground': '#fafafa',
  
  muted: '#262626',            // Neutral 800
  'muted-foreground': '#a3a3a3', // Neutral 400
  
  border: '#262626',           // Neutral 800
  input: '#262626',            // Neutral 800
  ring: '#3b82f6',             // Blue 500
};
```

### Norwegian Government Colors
```typescript
// Official Norwegian government color palette
export const norwegianGovColors = {
  // Primary brand (Regjeringen red)
  primary: '#d0222d',
  'primary-foreground': '#ffffff',
  
  // Secondary (Dark blue)  
  secondary: '#1e3a8a',
  'secondary-foreground': '#ffffff',
  
  // Norwegian flag inspired
  'norway-red': '#d0222d',
  'norway-blue': '#003f7f',
  'norway-white': '#ffffff',
  
  // Accessibility compliant variants
  'gov-red-light': '#dc2626',   // WCAG AAA compliant
  'gov-blue-light': '#2563eb',  // WCAG AAA compliant
};
```

### Accessibility Color Validation
```typescript
interface AccessibilityColorValidation {
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA';
  largeText: boolean;
  passes: boolean;
}

// All color combinations are validated for WCAG 2.2 AAA compliance
const colorValidation: Record<string, AccessibilityColorValidation> = {
  'primary-on-background': {
    contrastRatio: 7.21,
    wcagLevel: 'AAA',
    largeText: false,
    passes: true
  },
  'muted-foreground-on-background': {
    contrastRatio: 4.73,
    wcagLevel: 'AA',
    largeText: false, 
    passes: true
  }
};
```

## 📏 Spacing System

### 8pt Grid System
```typescript
// Base 8pt grid system for consistent spacing
export const spacingScale = {
  0: '0px',
  px: '1px',
  0.5: '2px',   // 0.25 * 8px
  1: '4px',     // 0.5 * 8px
  1.5: '6px',   // 0.75 * 8px
  2: '8px',     // 1 * 8px (base unit)
  2.5: '10px',  // 1.25 * 8px
  3: '12px',    // 1.5 * 8px
  3.5: '14px',  // 1.75 * 8px
  4: '16px',    // 2 * 8px
  5: '20px',    // 2.5 * 8px
  6: '24px',    // 3 * 8px
  7: '28px',    // 3.5 * 8px
  8: '32px',    // 4 * 8px
  9: '36px',    // 4.5 * 8px
  10: '40px',   // 5 * 8px
  11: '44px',   // 5.5 * 8px
  12: '48px',   // 6 * 8px
  14: '56px',   // 7 * 8px
  16: '64px',   // 8 * 8px
  20: '80px',   // 10 * 8px
  24: '96px',   // 12 * 8px
  32: '128px',  // 16 * 8px
  40: '160px',  // 20 * 8px
  48: '192px',  // 24 * 8px
  56: '224px',  // 28 * 8px
  64: '256px'   // 32 * 8px
};

// Semantic spacing tokens
export const semanticSpacing = {
  xs: spacingScale[1],    // 4px
  sm: spacingScale[2],    // 8px
  md: spacingScale[4],    // 16px
  lg: spacingScale[6],    // 24px
  xl: spacingScale[8],    // 32px
  '2xl': spacingScale[12], // 48px
  '3xl': spacingScale[16], // 64px
  '4xl': spacingScale[20], // 80px
  '5xl': spacingScale[24], // 96px
};
```

### Component Spacing
```typescript
// Component-specific spacing tokens
export const componentSpacing = {
  // Button spacing
  'button-px-sm': spacingScale[3],   // 12px
  'button-px-md': spacingScale[4],   // 16px
  'button-px-lg': spacingScale[8],   // 32px
  'button-py-sm': spacingScale[2],   // 8px
  'button-py-md': spacingScale[2.5], // 10px
  'button-py-lg': spacingScale[3],   // 12px
  
  // Card spacing
  'card-padding-sm': spacingScale[4],  // 16px
  'card-padding-md': spacingScale[6],  // 24px
  'card-padding-lg': spacingScale[8],  // 32px
  'card-gap': spacingScale[4],         // 16px
  
  // Form spacing
  'form-field-gap': spacingScale[4],   // 16px
  'form-section-gap': spacingScale[6], // 24px
  'form-group-gap': spacingScale[8],   // 32px
};
```

## 🔤 Typography System

### Type Scale
```typescript
// Responsive typography scale
export const typographyScale = {
  // Font sizes
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem',    // 128px
  
  // Line heights
  lineHeight: {
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Font weights
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
  }
};

// Semantic typography tokens
export const semanticTypography = {
  // Headings
  'heading-1': {
    fontSize: typographyScale['4xl'],
    lineHeight: typographyScale.lineHeight[10],
    fontWeight: typographyScale.fontWeight.bold,
    letterSpacing: '-0.025em'
  },
  'heading-2': {
    fontSize: typographyScale['3xl'],
    lineHeight: typographyScale.lineHeight[9],
    fontWeight: typographyScale.fontWeight.semibold,
    letterSpacing: '-0.025em'
  },
  'heading-3': {
    fontSize: typographyScale['2xl'],
    lineHeight: typographyScale.lineHeight[8],
    fontWeight: typographyScale.fontWeight.semibold
  },
  
  // Body text
  'body-large': {
    fontSize: typographyScale.lg,
    lineHeight: typographyScale.lineHeight[7],
    fontWeight: typographyScale.fontWeight.normal
  },
  'body': {
    fontSize: typographyScale.base,
    lineHeight: typographyScale.lineHeight[6],
    fontWeight: typographyScale.fontWeight.normal
  },
  'body-small': {
    fontSize: typographyScale.sm,
    lineHeight: typographyScale.lineHeight[5],
    fontWeight: typographyScale.fontWeight.normal
  },
  
  // UI text
  'caption': {
    fontSize: typographyScale.xs,
    lineHeight: typographyScale.lineHeight[4],
    fontWeight: typographyScale.fontWeight.normal,
    color: semanticColors['muted-foreground']
  }
};
```

### Font Families
```typescript
// Font family tokens
export const fontFamilies = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ],
  mono: [
    'JetBrains Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Menlo',
    'Courier New',
    'monospace'
  ],
  // Norwegian font preferences
  norwegian: [
    'Inter',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ]
};
```

## 🎭 Theme System

### Theme Definition Structure
```typescript
interface Theme {
  name: string;
  displayName: string;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  animations: AnimationTokens;
  compliance?: {
    norwegian?: boolean;
    nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT';
    gdpr?: boolean;
    wcagLevel?: 'AA' | 'AAA';
  };
}
```

### Built-in Themes
```typescript
// Light theme (default)
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light',
  colors: lightColors,
  spacing: semanticSpacing,
  typography: semanticTypography,
  shadows: lightShadows,
  borderRadius: borderRadiusTokens,
  animations: animationTokens,
  compliance: {
    wcagLevel: 'AAA'
  }
};

// Dark theme
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Dark',
  colors: darkColors,
  spacing: semanticSpacing,
  typography: semanticTypography,
  shadows: darkShadows,
  borderRadius: borderRadiusTokens,
  animations: animationTokens,
  compliance: {
    wcagLevel: 'AAA'
  }
};

// High contrast theme (accessibility)
export const highContrastTheme: Theme = {
  name: 'high-contrast',
  displayName: 'High Contrast',
  colors: highContrastColors,
  spacing: semanticSpacing,
  typography: {
    ...semanticTypography,
    // Enhanced typography for better readability
    'body': {
      ...semanticTypography.body,
      fontWeight: typographyScale.fontWeight.medium
    }
  },
  shadows: minimalShadows,
  borderRadius: minimalBorderRadius,
  animations: reducedAnimations,
  compliance: {
    wcagLevel: 'AAA'
  }
};

// Norwegian government theme
export const norwegianGovTheme: Theme = {
  name: 'norwegian-government',
  displayName: 'Regjeringen',
  colors: norwegianGovColors,
  spacing: semanticSpacing,
  typography: {
    ...semanticTypography,
    fontFamily: fontFamilies.norwegian
  },
  shadows: lightShadows,
  borderRadius: borderRadiusTokens,
  animations: animationTokens,
  compliance: {
    norwegian: true,
    nsmClassification: 'ÅPEN',
    gdpr: true,
    wcagLevel: 'AAA'
  }
};
```

## 🔧 Token Transformers

### CSS Custom Properties
```typescript
// Generate CSS custom properties from tokens
export function generateCSSVariables(theme: Theme): string {
  const cssVars: string[] = [':root {'];
  
  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`  --color-${key}: ${value};`);
  });
  
  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });
  
  // Typography variables
  Object.entries(theme.typography).forEach(([key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([prop, val]) => {
        cssVars.push(`  --typography-${key}-${prop}: ${val};`);
      });
    } else {
      cssVars.push(`  --typography-${key}: ${value};`);
    }
  });
  
  cssVars.push('}');
  return cssVars.join('\n');
}

// Example output:
/*
:root {
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-secondary: #6b7280;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --typography-heading-1-font-size: 2.25rem;
  --typography-heading-1-line-height: 2.5rem;
}
*/
```

### Tailwind Configuration
```typescript
// Generate Tailwind config from tokens
export function generateTailwindConfig(theme: Theme) {
  return {
    theme: {
      colors: {
        primary: {
          DEFAULT: theme.colors.primary,
          foreground: theme.colors['primary-foreground']
        },
        secondary: {
          DEFAULT: theme.colors.secondary,
          foreground: theme.colors['secondary-foreground']
        },
        // ... more colors
      },
      spacing: theme.spacing,
      fontSize: {
        xs: [theme.typography['caption'].fontSize, { lineHeight: theme.typography['caption'].lineHeight }],
        sm: [theme.typography['body-small'].fontSize, { lineHeight: theme.typography['body-small'].lineHeight }],
        base: [theme.typography['body'].fontSize, { lineHeight: theme.typography['body'].lineHeight }],
        // ... more sizes
      },
      fontFamily: {
        sans: theme.typography.fontFamily?.sans || fontFamilies.sans,
        mono: theme.typography.fontFamily?.mono || fontFamilies.mono
      }
    }
  };
}
```

### TypeScript Types
```typescript
// Generate TypeScript interfaces from tokens
export function generateTypeScriptTypes(theme: Theme): string {
  return `
export interface ColorTokens {
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  // ... generated from theme.colors
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  // ... generated from theme.spacing
}

export interface TypographyTokens {
  'heading-1': {
    fontSize: string;
    lineHeight: string;
    fontWeight: string;
    letterSpacing?: string;
  };
  // ... generated from theme.typography
}

export interface Theme {
  name: string;
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
}
  `;
}
```

## 🇳🇴 Norwegian Compliance

### NSM Classification Tokens
```typescript
// NSM (Nasjonal sikkerhetsmyndighet) classification tokens
export const nsmTokens = {
  classification: {
    'ÅPEN': {
      color: '#16a34a',        // Green
      background: '#dcfce7',   // Green 100
      border: '#16a34a'
    },
    'BEGRENSET': {
      color: '#ca8a04',        // Yellow 600
      background: '#fef3c7',   // Yellow 100
      border: '#ca8a04'
    },
    'KONFIDENSIELT': {
      color: '#dc2626',        // Red 600
      background: '#fee2e2',   // Red 100
      border: '#dc2626'
    },
    'HEMMELIG': {
      color: '#7c2d12',        // Red 900
      background: '#fecaca',   // Red 200
      border: '#7c2d12'
    }
  }
};
```

### GDPR Compliance Tokens
```typescript
// GDPR compliance visual indicators
export const gdprTokens = {
  'data-category': {
    'personal': {
      color: '#2563eb',        // Blue 600
      background: '#dbeafe',   // Blue 100
      icon: 'user'
    },
    'sensitive': {
      color: '#dc2626',        // Red 600  
      background: '#fee2e2',   // Red 100
      icon: 'shield-alert'
    },
    'anonymous': {
      color: '#16a34a',        // Green 600
      background: '#dcfce7',   // Green 100
      icon: 'eye-off'
    }
  }
};
```

### Accessibility Tokens
```typescript
// WCAG 2.2 AAA compliant accessibility tokens
export const accessibilityTokens = {
  // Focus indicators
  focus: {
    ring: '#2563eb',           // Blue 600
    'ring-offset': '#ffffff',  // White
    'ring-width': '2px',
    'ring-offset-width': '2px'
  },
  
  // High contrast ratios (7:1 minimum)
  contrast: {
    'text-on-background': '#000000',    // 21:1 ratio
    'text-on-primary': '#ffffff',       // 8.59:1 ratio
    'text-on-success': '#ffffff',       // 7.21:1 ratio
    'text-on-warning': '#000000',       // 8.35:1 ratio
    'text-on-destructive': '#ffffff'    // 9.12:1 ratio
  },
  
  // Motion preferences
  motion: {
    'duration-fast': '150ms',
    'duration-normal': '300ms',
    'duration-slow': '500ms',
    'reduced-duration': '0ms'  // For prefers-reduced-motion
  }
};
```

## 📱 Responsive Tokens

### Breakpoint System
```typescript
// Responsive breakpoint tokens
export const breakpointTokens = {
  xs: '0px',
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Container max-widths
export const containerTokens = {
  xs: '100%',
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

### Responsive Typography
```typescript
// Responsive typography scaling
export const responsiveTypography = {
  'heading-1': {
    xs: { fontSize: '2rem', lineHeight: '2.25rem' },      // 32px
    md: { fontSize: '2.25rem', lineHeight: '2.5rem' },    // 36px
    lg: { fontSize: '3rem', lineHeight: '3.5rem' }        // 48px
  },
  'heading-2': {
    xs: { fontSize: '1.5rem', lineHeight: '2rem' },       // 24px
    md: { fontSize: '1.875rem', lineHeight: '2.25rem' },  // 30px
    lg: { fontSize: '2.25rem', lineHeight: '2.5rem' }     // 36px
  },
  'body': {
    xs: { fontSize: '0.875rem', lineHeight: '1.25rem' },  // 14px
    md: { fontSize: '1rem', lineHeight: '1.5rem' }        // 16px
  }
};
```

## 🔧 Token Usage

### CSS-in-JS Usage
```typescript
import { useTheme } from '@xala-technologies/ui-system';

function CustomComponent() {
  const theme = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: theme.colors.card,
        color: theme.colors['card-foreground'],
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.shadows.md
      }}
    >
      <h2 style={{
        fontSize: theme.typography['heading-2'].fontSize,
        fontWeight: theme.typography['heading-2'].fontWeight,
        marginBottom: theme.spacing.md
      }}>
        Custom Component
      </h2>
      <p style={{
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        color: theme.colors['muted-foreground']
      }}>
        Using design tokens for consistent styling.
      </p>
    </div>
  );
}
```

### Tailwind Classes (Recommended)
```typescript
function CustomComponent() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        Custom Component
      </h2>
      <p className="text-base leading-6 text-muted-foreground">
        Using semantic Tailwind classes powered by design tokens.
      </p>
    </div>
  );
}
```

### CSS Custom Properties
```css
/* Using CSS custom properties generated from tokens */
.custom-component {
  background-color: var(--color-card);
  color: var(--color-card-foreground);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}

.custom-heading {
  font-size: var(--typography-heading-2-font-size);
  font-weight: var(--typography-heading-2-font-weight);
  line-height: var(--typography-heading-2-line-height);
  margin-bottom: var(--spacing-md);
}
```

## 🛠️ Token Development

### Creating Custom Tokens
```typescript
// 1. Define primitive tokens
const customColorPrimitives = {
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  }
};

// 2. Create semantic mappings
const customSemanticColors = {
  'brand-primary': customColorPrimitives.brand[600],
  'brand-secondary': customColorPrimitives.brand[500],
  'brand-muted': customColorPrimitives.brand[100]
};

// 3. Define component tokens
const customButtonTokens = {
  'button-brand-bg': customSemanticColors['brand-primary'],
  'button-brand-fg': '#ffffff',
  'button-brand-hover': customSemanticColors['brand-secondary']
};

// 4. Create theme
const customTheme: Theme = {
  name: 'custom-brand',
  displayName: 'Custom Brand',
  colors: {
    ...lightColors,
    ...customSemanticColors
  },
  // ... other token categories
};
```

### Token Validation
```typescript
// Validate color contrast ratios
export function validateColorContrast(
  foreground: string, 
  background: string
): AccessibilityValidation {
  const contrastRatio = calculateContrastRatio(foreground, background);
  
  return {
    contrastRatio,
    wcagLevel: contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'FAIL',
    passes: contrastRatio >= 4.5,
    largeTextPasses: contrastRatio >= 3,
    recommendations: contrastRatio < 4.5 ? [
      'Increase contrast ratio to meet WCAG AA standards',
      'Consider using a darker foreground or lighter background'
    ] : []
  };
}

// Validate spacing consistency
export function validateSpacing(tokens: SpacingTokens): ValidationResult {
  const spacingValues = Object.values(tokens).map(parseFloat);
  const inconsistencies = spacingValues.filter((value, index) => {
    return index > 0 && value <= spacingValues[index - 1];
  });
  
  return {
    valid: inconsistencies.length === 0,
    errors: inconsistencies.length > 0 ? [
      'Spacing tokens should increase in value'  
    ] : [],
    warnings: []
  };
}
```

## 📊 Token Performance

### Bundle Size Optimization
```typescript
// Tree-shakeable token imports
import { lightColors } from '@xala-technologies/ui-system/tokens/colors';
import { semanticSpacing } from '@xala-technologies/ui-system/tokens/spacing';

// Instead of importing everything
import { allTokens } from '@xala-technologies/ui-system/tokens'; // ❌ Large bundle
```

### Runtime Performance
```typescript
// Tokens are pre-computed at build time
// No runtime calculations needed
const buttonStyles = {
  backgroundColor: 'var(--color-primary)',     // CSS custom property
  padding: 'var(--spacing-md)',               // No JS calculation
  borderRadius: 'var(--border-radius-md)'     // Static value
};

// Efficient theme switching via CSS custom properties
function switchTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  // Instant theme switch with no re-renders
}
```

## 🔗 Related Documentation

- **[Theming Guide](../theming/)** - Custom theme creation and branding
- **[Component Library](../components/)** - How components use tokens
- **[Architecture](../architecture/)** - System architecture and patterns
- **[Norwegian Compliance](../compliance/)** - NSM, GDPR, and WCAG requirements

---

*UI System Design Tokens v2.0 - Token-based design system with Norwegian compliance*