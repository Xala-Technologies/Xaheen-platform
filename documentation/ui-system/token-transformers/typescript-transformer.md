# TypeScript Type Transformer

The TypeScript Type Transformer generates comprehensive type definitions from design tokens, ensuring type safety throughout your application. It creates interfaces, utility types, and module declarations that provide full IntelliSense support in your IDE.

## Overview

The TypeScript transformer converts your design token JSON into:
- Strongly-typed interfaces for each token category
- Utility types for advanced type manipulation
- Module declarations for global type augmentation
- JSDoc comments for enhanced documentation
- Literal types for exact value matching

## Basic Usage

```typescript
import { TypeScriptTypeTransformer } from '@xala-technologies/ui-system/tokens/transformers';

const transformer = new TypeScriptTypeTransformer();
const result = transformer.transform(tokens, {
  includeJSDoc: true,
  generateLiterals: true,
  generateUtilityTypes: true
});

// Access generated content
console.log(result.types);      // Core type definitions
console.log(result.utilities);  // Utility types
console.log(result.declarations); // Module declarations
console.log(result.full);       // Complete output
```

## Configuration Options

### TypeScriptTypeOptions

```typescript
interface TypeScriptTypeOptions {
  // Include JSDoc comments in output
  includeJSDoc?: boolean;
  
  // Generate literal types for exact values
  generateLiterals?: boolean;
  
  // Include descriptive comments
  includeComments?: boolean;
  
  // Generate utility types (Pick, Omit, etc.)
  generateUtilityTypes?: boolean;
  
  // Module name for declarations
  moduleName?: string;
  
  // Export type ('named' | 'default' | 'namespace')
  exportType?: 'named' | 'default' | 'namespace';
  
  // Namespace name for namespace exports
  namespace?: string;
  
  // Custom type mappings
  typeMapping?: Record<string, string>;
  
  // Include index signatures
  includeIndexSignatures?: boolean;
  
  // Generate const assertions
  generateConstAssertions?: boolean;
}
```

## Generated Output Examples

### 1. Core Type Definitions

```typescript
// Generated from color tokens
export interface ColorTokens {
  /** Primary color scale for main brand colors */
  primary: {
    50: '#f0f9ff';
    100: '#e0f2fe';
    200: '#bae6fd';
    300: '#7dd3fc';
    400: '#38bdf8';
    500: '#0ea5e9';
    600: '#0284c7';
    700: '#0369a1';
    800: '#075985';
    900: '#0c4a6e';
  };
  
  /** Secondary color scale for accent colors */
  secondary: ColorScale;
  
  /** Neutral gray scale for UI elements */
  neutral: ColorScale;
  
  /** Semantic colors for states */
  success?: ColorScale;
  warning?: ColorScale;
  danger?: ColorScale;
  info?: ColorScale;
  
  /** Special color values */
  white?: string;
  black?: string;
  transparent?: 'transparent';
  current?: 'currentColor';
}

// Generated color scale type
export type ColorScale = {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
};
```

### 2. Typography Types

```typescript
export interface TypographyTokens {
  /** Font family definitions */
  fontFamily: {
    /** Sans-serif font stack */
    sans: string | readonly string[];
    /** Serif font stack */
    serif?: string | readonly string[];
    /** Monospace font stack */
    mono?: string | readonly string[];
  };
  
  /** Font size scale */
  fontSize: {
    xs: '0.75rem';
    sm: '0.875rem';
    base: '1rem';
    lg: '1.125rem';
    xl: '1.25rem';
    '2xl': '1.5rem';
    '3xl': '1.875rem';
    '4xl': '2.25rem';
    '5xl': '3rem';
    '6xl': '3.75rem';
    '7xl': '4.5rem';
    '8xl': '6rem';
    '9xl': '8rem';
  };
  
  /** Font weight scale */
  fontWeight: {
    thin: 100;
    extralight: 200;
    light: 300;
    normal: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
    extrabold: 800;
    black: 900;
  };
  
  /** Line height scale */
  lineHeight: {
    none: 1;
    tight: 1.25;
    snug: 1.375;
    normal: 1.5;
    relaxed: 1.625;
    loose: 2;
  };
  
  /** Letter spacing scale */
  letterSpacing: {
    tighter: '-0.05em';
    tight: '-0.025em';
    normal: '0em';
    wide: '0.025em';
    wider: '0.05em';
    widest: '0.1em';
  };
}
```

### 3. Utility Types

```typescript
// Extract specific token categories
export type ColorKeys = keyof ColorTokens;
export type ColorValue<K extends ColorKeys> = ColorTokens[K];

// Typography utilities
export type FontSizeKeys = keyof TypographyTokens['fontSize'];
export type FontWeightKeys = keyof TypographyTokens['fontWeight'];

// Token path utilities
export type TokenPath = 
  | `colors.${string}`
  | `typography.${string}`
  | `spacing.${string}`
  | `borderRadius.${string}`;

// Value extraction
export type ExtractTokenValue<T extends TokenPath> = 
  T extends `colors.${infer K}` ? ColorTokens[K] :
  T extends `typography.${infer K}` ? TypographyTokens[K] :
  T extends `spacing.${infer K}` ? SpacingTokens[K] :
  never;

// Deep partial for theme overrides
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Theme override type
export type ThemeOverride = DeepPartial<TokenSystem>;

// Responsive value type
export type ResponsiveValue<T> = T | {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Component variant maps
export type ComponentVariant<T extends Record<string, any>> = {
  [K in keyof T]: {
    base: T[K];
    hover?: Partial<T[K]>;
    focus?: Partial<T[K]>;
    active?: Partial<T[K]>;
    disabled?: Partial<T[K]>;
  };
};
```

### 4. Module Declarations

```typescript
// Global module augmentation
declare module '@xala-technologies/ui-system' {
  export interface TokenSystem extends GeneratedTokenSystem {}
  export interface ThemeTokens extends GeneratedTokenSystem {}
}

// Namespace export
export namespace XalaTokens {
  export interface Colors extends ColorTokens {}
  export interface Typography extends TypographyTokens {}
  export interface Spacing extends SpacingTokens {}
  
  export type Theme = {
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
  };
  
  export const tokens: Theme;
}

// CSS module declarations
declare module '*.module.css' {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
}
```

### 5. Const Assertions

```typescript
// Token constants with literal types
export const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
  // ... more colors
} as const;

// Type extraction from const
export type ColorValues = typeof colors;
export type PrimaryColor = ColorValues['primary'][keyof ColorValues['primary']];

// Token paths as const
export const TOKEN_PATHS = {
  PRIMARY_COLOR: 'colors.primary.500',
  BODY_FONT: 'typography.fontFamily.sans',
  BASE_SPACING: 'spacing.4',
} as const;

export type TokenPathKeys = keyof typeof TOKEN_PATHS;
export type TokenPathValues = typeof TOKEN_PATHS[TokenPathKeys];
```

## Advanced Features

### 1. Custom Type Mappings

```typescript
const result = transformer.transform(tokens, {
  typeMapping: {
    // Map token categories to custom types
    'colors.*.50-950': 'ColorScale',
    'spacing.*': 'SpacingValue',
    'typography.fontSize.*': 'FontSizeValue',
    
    // Map specific values
    'transparent': '"transparent"',
    'current': '"currentColor"',
    'inherit': '"inherit"',
  }
});
```

### 2. Conditional Type Generation

```typescript
// Generate different types based on token structure
export type TokenValue<T extends keyof TokenSystem> = 
  T extends 'colors' ? ColorTokens :
  T extends 'typography' ? TypographyTokens :
  T extends 'spacing' ? SpacingTokens :
  T extends 'animation' ? AnimationTokens :
  T extends 'responsive' ? ResponsiveTokens :
  never;

// Component-specific token types
export type ButtonTokens = Pick<TokenSystem, 
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borderRadius'
  | 'shadows'
>;

export type InputTokens = Pick<TokenSystem,
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'borderWidth'
  | 'borderRadius'
>;
```

### 3. Type Guards

```typescript
// Generated type guards
export function isColorToken(value: unknown): value is ColorTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    'primary' in value &&
    'neutral' in value
  );
}

export function isValidColorScale(value: unknown): value is ColorScale {
  if (typeof value !== 'object' || value === null) return false;
  
  const validKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  return Object.keys(value).every(key => validKeys.includes(key));
}

export function isTokenReference(value: unknown): value is TokenReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    'token' in value &&
    typeof (value as any).token === 'string'
  );
}
```

### 4. Discriminated Unions

```typescript
// Token value types with discrimination
export type TokenValueType = 
  | { type: 'color'; value: string; }
  | { type: 'spacing'; value: string; unit: 'px' | 'rem' | 'em'; }
  | { type: 'typography'; value: TypographyValue; }
  | { type: 'shadow'; value: ShadowValue; }
  | { type: 'reference'; token: string; fallback?: string; };

// Helper type for token resolution
export type ResolvedToken<T extends TokenValueType> = 
  T extends { type: 'reference' } ? string :
  T extends { type: 'color' } ? string :
  T extends { type: 'spacing' } ? string :
  T extends { type: 'typography' } ? TypographyValue :
  T extends { type: 'shadow' } ? ShadowValue :
  never;
```

## Integration Examples

### 1. With React Components

```typescript
import { ColorTokens, SpacingTokens } from './generated/tokens.types';

interface ButtonProps {
  variant?: keyof ColorTokens;
  size?: keyof SpacingTokens;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = '4',
  children 
}) => {
  // TypeScript provides full IntelliSense here
  const backgroundColor = tokens.colors[variant]?.[500];
  const padding = tokens.spacing[size];
  
  return (
    <button style={{ backgroundColor, padding }}>
      {children}
    </button>
  );
};
```

### 2. With Styled Components

```typescript
import styled from 'styled-components';
import { TokenSystem } from './generated/tokens.types';

const StyledButton = styled.button<{ 
  $variant: keyof TokenSystem['colors'];
  $size: keyof TokenSystem['spacing'];
}>`
  background-color: ${props => props.theme.colors[props.$variant][500]};
  padding: ${props => props.theme.spacing[props.$size]};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
`;
```

### 3. With CSS-in-JS

```typescript
import { css } from '@emotion/react';
import { useTokens } from '@xala-technologies/ui-system/hooks';
import { ColorKeys, SpacingKeys } from './generated/tokens.types';

function useStyles(variant: ColorKeys, spacing: SpacingKeys) {
  const tokens = useTokens();
  
  return {
    button: css`
      background-color: ${tokens.colors[variant][500]};
      padding: ${tokens.spacing[spacing]};
      
      &:hover {
        background-color: ${tokens.colors[variant][600]};
      }
    `
  };
}
```

## Best Practices

### 1. Type Safety First

```typescript
// ✅ Good: Use generated types
import { ColorTokens, ColorKeys } from './tokens.types';

function getColor(color: ColorKeys, shade: keyof ColorTokens[ColorKeys] = 500) {
  return tokens.colors[color]?.[shade];
}

// ❌ Bad: Using any or loose types
function getColor(color: any, shade: any) {
  return tokens.colors[color]?.[shade];
}
```

### 2. Leverage Utility Types

```typescript
// Create component-specific token subsets
type ButtonColorTokens = Pick<ColorTokens, 'primary' | 'secondary' | 'danger'>;
type ButtonSizeTokens = Pick<SpacingTokens, '2' | '3' | '4'>;

interface ButtonProps {
  color?: keyof ButtonColorTokens;
  size?: keyof ButtonSizeTokens;
}
```

### 3. Use Type Guards

```typescript
import { isTokenReference } from './tokens.types';

function resolveToken(value: unknown): string {
  if (isTokenReference(value)) {
    return resolveTokenPath(value.token) || value.fallback || '';
  }
  return String(value);
}
```

### 4. Document with JSDoc

```typescript
/**
 * Retrieves a color value from the token system
 * @param path - The token path (e.g., 'primary.500')
 * @returns The resolved color value or undefined
 */
export function getColorToken(path: ColorTokenPath): string | undefined {
  // Implementation
}
```

## Troubleshooting

### Common Issues

1. **Type conflicts with existing types**
   ```typescript
   // Solution: Use namespace isolation
   export namespace MyAppTokens {
     export interface Colors extends ColorTokens {}
   }
   ```

2. **Missing types for dynamic keys**
   ```typescript
   // Solution: Use index signatures
   interface DynamicTokens {
     [key: string]: ColorScale | undefined;
     primary: ColorScale; // Required keys
     secondary: ColorScale;
   }
   ```

3. **Circular type dependencies**
   ```typescript
   // Solution: Use type aliases instead of interfaces
   type TokenValue = string | TokenReference;
   type TokenReference = { token: string; fallback?: TokenValue; };
   ```

## Performance Considerations

1. **Use const assertions for static tokens**
   ```typescript
   export const staticTokens = { /* ... */ } as const;
   ```

2. **Avoid excessive type computations**
   ```typescript
   // Instead of complex conditional types
   type SimpleTokenValue = string | number | TokenReference;
   ```

3. **Split large type files**
   ```typescript
   // tokens/colors.types.ts
   // tokens/typography.types.ts
   // tokens/spacing.types.ts
   ```

## Migration Guide

### From Untyped to Typed Tokens

```typescript
// Before: Untyped token access
const color = theme.colors.primary['500'];

// After: Fully typed with IntelliSense
import { useTokens } from '@xala-technologies/ui-system/hooks';
const tokens = useTokens();
const color = tokens.colors.primary[500]; // TypeScript knows this exists!
```

### From Manual Types to Generated Types

```typescript
// Before: Manual type definitions
interface Theme {
  colors: {
    primary: string;
    secondary: string;
  };
}

// After: Generated from tokens
import { TokenSystem } from './generated/tokens.types';
// Full type safety with all token values!
```

## API Reference

### TypeScriptTypeTransformer Class

```typescript
class TypeScriptTypeTransformer implements TokenTransformer<TypeScriptTypesResult> {
  transform(tokens: TokenSystem, options?: TypeScriptTypeOptions): TypeScriptTypesResult;
  
  // Helper methods
  private generateCoreTypes(tokens: TokenSystem, options: TypeScriptTypeOptions): string;
  private generateUtilityTypes(tokens: TokenSystem, options: TypeScriptTypeOptions): string;
  private generateModuleDeclarations(tokens: TokenSystem, options: TypeScriptTypeOptions): string;
  private generateTypeGuards(tokens: TokenSystem): string;
  private generateConstAssertions(tokens: TokenSystem): string;
}
```

### TypeScriptTypesResult Interface

```typescript
interface TypeScriptTypesResult {
  types: string;        // Core type definitions
  utilities: string;    // Utility types
  declarations: string; // Module declarations
  guards?: string;      // Type guards
  constants?: string;   // Const assertions
  full: string;        // Complete output
}
```

## Next Steps

- [CSS Variable Transformer](./css-transformer.md) - Generate CSS custom properties
- [Tailwind Config Transformer](./tailwind-transformer.md) - Generate Tailwind configurations
- [JSON Schema Transformer](./json-schema-transformer.md) - Generate validation schemas