# Token System Documentation

## Table of Contents

- [Overview](#overview)
- [Token Hierarchy](#token-hierarchy)
- [Token Types](#token-types)
- [Usage Guide](#usage-guide)
- [Theming System](#theming-system)
- [Platform Tokens](#platform-tokens)
- [Custom Tokens](#custom-tokens)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

The UI System v5.0 introduces a comprehensive token-based design system that enables dynamic theming, consistent visual language, and runtime customization. Design tokens are the source of truth for all visual properties in the system.

### What are Design Tokens?

Design tokens are named entities that store visual design attributes. They replace hard-coded values in your components with dynamic references that can be changed at runtime.

```typescript
// ❌ Hard-coded values
const Button = () => (
  <button style={{ 
    backgroundColor: '#007bff',
    borderRadius: '4px',
    padding: '8px 16px'
  }}>
    Click me
  </button>
);

// ✅ Token-based values
const Button = () => {
  const tokens = useTokens();
  
  return (
    <button style={{ 
      backgroundColor: tokens.colors.action.primary.background,
      borderRadius: tokens.border.radius.medium,
      padding: `${tokens.spacing.medium} ${tokens.spacing.large}`
    }}>
      Click me
    </button>
  );
};
```

### Key Benefits

- **🎨 Dynamic Theming**: Change themes without rebuilding
- **🌍 Multi-tenancy**: Different brands, same codebase
- **📱 Platform Consistency**: Consistent design across platforms
- **🔧 Type Safety**: Full TypeScript support with IntelliSense
- **⚡ Performance**: Optimized for runtime efficiency
- **🛡️ Compliance**: Norwegian design standards built-in

## Token Hierarchy

The token system follows a three-tier hierarchy:

```
┌─────────────────────────────────────┐
│          Component Tokens          │  ← Specific to components
├─────────────────────────────────────┤
│           Semantic Tokens          │  ← Contextual meaning
├─────────────────────────────────────┤
│          Primitive Tokens          │  ← Base values
└─────────────────────────────────────┘
```

### 1. Primitive Tokens (Foundation)

Base values that define the design language:

```typescript
interface PrimitiveTokens {
  colors: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    gray: { /* ... */ },
    red: { /* ... */ },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  }
}
```

### 2. Semantic Tokens (Context)

Tokens with contextual meaning that reference primitive tokens:

```typescript
interface SemanticTokens {
  colors: {
    text: {
      primary: '{colors.gray.900}',
      secondary: '{colors.gray.600}',
      inverse: '{colors.white}',
    },
    background: {
      primary: '{colors.white}',
      secondary: '{colors.gray.50}',
      inverse: '{colors.gray.900}',
    },
    action: {
      primary: {
        background: '{colors.blue.500}',
        text: '{colors.white}',
        hover: '{colors.blue.600}',
      }
    }
  }
}
```

### 3. Component Tokens (Specific)

Component-specific tokens that reference semantic tokens:

```typescript
interface ComponentTokens {
  button: {
    primary: {
      background: '{colors.action.primary.background}',
      text: '{colors.action.primary.text}',
      border: 'transparent',
      hover: {
        background: '{colors.action.primary.hover}',
      }
    },
    fontSize: {
      small: '{fontSize.sm}',
      medium: '{fontSize.base}',
      large: '{fontSize.lg}',
    }
  }
}
```

## Token Types

### Color Tokens

Color tokens support multiple formats and automatically handle light/dark mode:

```typescript
interface ColorToken {
  // Hex values
  primary: '#3b82f6',
  
  // RGB values
  secondary: 'rgb(59, 130, 246)',
  
  // HSL values
  accent: 'hsl(217, 91%, 60%)',
  
  // CSS custom properties
  surface: 'var(--color-surface)',
  
  // Theme-aware tokens
  text: {
    light: '#1f2937',  // Dark text for light theme
    dark: '#f9fafb',   // Light text for dark theme
  }
}
```

### Typography Tokens

Complete typography system with responsive capabilities:

```typescript
interface TypographyTokens {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Merriweather', 'serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '28px' },
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### Spacing Tokens

Consistent spacing system with logical naming:

```typescript
interface SpacingTokens {
  // Base spacing scale
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  
  // Component-specific spacing
  component: {
    padding: {
      small: '{spacing.sm}',
      medium: '{spacing.md}',
      large: '{spacing.lg}',
    },
    margin: {
      small: '{spacing.xs}',
      medium: '{spacing.sm}',
      large: '{spacing.md}',
    }
  }
}
```

### Border Tokens

Comprehensive border system:

```typescript
interface BorderTokens {
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  radius: {
    none: '0',
    small: '4px',
    medium: '8px',
    large: '12px',
    full: '9999px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  }
}
```

### Shadow Tokens

Elevation system with consistent shadows:

```typescript
interface ShadowTokens {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}
```

## Usage Guide

### Basic Token Usage

#### 1. Using Tokens in Components

```typescript
import { useTokens } from '@/hooks/useTokens';

const MyComponent = () => {
  const tokens = useTokens();
  
  return (
    <div style={{
      backgroundColor: tokens.colors.background.primary,
      color: tokens.colors.text.primary,
      padding: tokens.spacing.lg,
      borderRadius: tokens.border.radius.medium,
      boxShadow: tokens.shadow.md,
    }}>
      Content styled with tokens
    </div>
  );
};
```

#### 2. Token-Aware Styling with CVA

```typescript
import { cva } from 'class-variance-authority';
import { useTokens } from '@/hooks/useTokens';

const buttonVariants = cva([], {
  variants: {
    variant: {
      primary: [],
      secondary: [],
      destructive: [],
    },
    size: {
      small: [],
      medium: [],
      large: [],
    }
  }
});

const Button = ({ variant = 'primary', size = 'medium', ...props }) => {
  const tokens = useTokens();
  
  const tokenStyles = {
    backgroundColor: tokens.components.button[variant].background,
    color: tokens.components.button[variant].text,
    padding: tokens.components.button[size].padding,
    fontSize: tokens.components.button[size].fontSize,
    borderRadius: tokens.border.radius.medium,
  };
  
  return (
    <button
      className={buttonVariants({ variant, size })}
      style={tokenStyles}
      {...props}
    />
  );
};
```

#### 3. Responsive Token Usage

```typescript
const useResponsiveTokens = () => {
  const tokens = useTokens();
  const breakpoint = useBreakpoint();
  
  return useMemo(() => ({
    ...tokens,
    spacing: {
      ...tokens.spacing,
      responsive: {
        xs: tokens.spacing.sm,
        sm: tokens.spacing.md,
        md: tokens.spacing.lg,
        lg: tokens.spacing.xl,
      }[breakpoint]
    }
  }), [tokens, breakpoint]);
};
```

### Advanced Token Usage

#### 1. Token Transformation

```typescript
// Transform tokens for specific use cases
const useTransformedTokens = () => {
  const tokens = useTokens();
  
  return useMemo(() => ({
    ...tokens,
    
    // CSS custom properties
    cssVariables: Object.entries(tokens.colors).reduce((acc, [key, value]) => {
      acc[`--color-${key}`] = value;
      return acc;
    }, {}),
    
    // Tailwind-compatible values
    tailwind: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.border.radius,
    }
  }), [tokens]);
};
```

#### 2. Token Validation

```typescript
// Validate tokens at runtime
const useTokenValidator = () => {
  const tokens = useTokens();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      validateTokenStructure(tokens);
    }
  }, [tokens]);
};

const validateTokenStructure = (tokens) => {
  const requiredTokens = ['colors', 'spacing', 'typography', 'border'];
  
  requiredTokens.forEach(tokenType => {
    if (!tokens[tokenType]) {
      console.warn(`Missing required token type: ${tokenType}`);
    }
  });
};
```

## Theming System

### Theme Structure

Themes are collections of token values that can be swapped at runtime:

```typescript
interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'auto';
  tokens: DesignTokens;
  metadata?: {
    description?: string;
    author?: string;
    version?: string;
    preview?: string;
  };
}
```

### Built-in Themes

#### Light Theme
```typescript
const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  mode: 'light',
  tokens: {
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      }
    }
  }
};
```

#### Dark Theme
```typescript
const darkTheme: Theme = {
  id: 'dark', 
  name: 'Dark',
  mode: 'dark',
  tokens: {
    colors: {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      }
    }
  }
};
```

#### Norwegian Government Theme
```typescript
const norwegianGovTheme: Theme = {
  id: 'norwegian-gov',
  name: 'Norwegian Government',
  mode: 'light',
  tokens: {
    colors: {
      primary: {
        50: '#fff5f5',
        500: '#dc2626', // Norwegian red
        900: '#7f1d1d',
      },
      secondary: {
        500: '#1d4ed8', // Norwegian blue
      }
    }
  },
  metadata: {
    description: 'Official Norwegian government design system',
    compliance: ['NSM', 'WCAG-AAA'],
  }
};
```

### Theme Usage

#### 1. Setting Theme

```typescript
import { useTheme } from '@/hooks/useTheme';

const ThemeSelector = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <select 
      value={theme.id} 
      onChange={(e) => setTheme(e.target.value)}
    >
      {availableThemes.map(theme => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
};
```

#### 2. Theme-Aware Components

```typescript
const ThemedCard = ({ children }) => {
  const tokens = useTokens();
  const { theme } = useTheme();
  
  const cardStyles = {
    backgroundColor: tokens.colors.background.primary,
    border: `1px solid ${tokens.colors.border.primary}`,
    borderRadius: tokens.border.radius.lg,
    padding: tokens.spacing.lg,
    
    // Theme-specific adjustments
    ...(theme.mode === 'dark' && {
      boxShadow: tokens.shadow.lg,
    })
  };
  
  return <div style={cardStyles}>{children}</div>;
};
```

### Custom Themes

#### 1. Creating Custom Themes

```typescript
const createCustomTheme = (overrides: Partial<DesignTokens>): Theme => {
  const baseTheme = getTheme('light');
  
  return {
    id: 'custom',
    name: 'Custom Theme',
    mode: baseTheme.mode,
    tokens: deepMerge(baseTheme.tokens, overrides),
  };
};

// Usage
const brandTheme = createCustomTheme({
  colors: {
    primary: {
      500: '#ff6b35', // Brand orange
    },
    action: {
      primary: {
        background: '#ff6b35',
        text: '#ffffff',
      }
    }
  }
});
```

#### 2. Theme Validation

```typescript
const validateTheme = (theme: Theme): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!theme.id) errors.push('Theme must have an id');
  if (!theme.name) errors.push('Theme must have a name');
  if (!theme.tokens) errors.push('Theme must have tokens');
  
  // Color contrast validation
  if (theme.tokens.colors) {
    const contrastIssues = validateColorContrast(theme.tokens.colors);
    warnings.push(...contrastIssues);
  }
  
  return { valid: errors.length === 0, errors, warnings };
};
```

## Platform Tokens

Different platforms require different token values for optimal user experience:

### Desktop Tokens
```typescript
const desktopTokens = {
  spacing: {
    componentPadding: '12px 16px',
    containerMargin: '24px',
  },
  typography: {
    fontSize: {
      base: '14px',
      large: '16px',
    }
  },
  interaction: {
    hoverTransition: '150ms ease-in-out',
    clickAnimation: 'scale(0.98)',
  }
};
```

### Mobile Tokens
```typescript
const mobileTokens = {
  spacing: {
    componentPadding: '16px 20px',
    containerMargin: '16px',
  },
  typography: {
    fontSize: {
      base: '16px', // Larger for mobile
      large: '18px',
    }
  },
  interaction: {
    touchTarget: '44px', // Minimum touch target
    tapHighlight: 'rgba(0, 0, 0, 0.1)',
  }
};
```

### Tablet Tokens
```typescript
const tabletTokens = {
  spacing: {
    componentPadding: '14px 18px',
    containerMargin: '20px',
  },
  typography: {
    fontSize: {
      base: '15px',
      large: '17px',
    }
  },
  layout: {
    sidebarWidth: '280px',
    contentMaxWidth: '768px',
  }
};
```

### Platform Token Usage

```typescript
const usePlatformTokens = () => {
  const baseTokens = useTokens();
  const platform = usePlatform();
  
  return useMemo(() => {
    const platformOverrides = {
      desktop: desktopTokens,
      mobile: mobileTokens,
      tablet: tabletTokens,
    }[platform] || {};
    
    return deepMerge(baseTokens, platformOverrides);
  }, [baseTokens, platform]);
};
```

## Custom Tokens

### Adding Custom Token Types

```typescript
// Extend the base token interface
interface CustomTokens extends DesignTokens {
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  layout: {
    containerWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    headerHeight: '64px',
    sidebarWidth: '256px',
  }
}
```

### Custom Token Providers

```typescript
const CustomTokenProvider = ({ children, customTokens }) => {
  const baseTokens = useTokens();
  
  const mergedTokens = useMemo(() => 
    deepMerge(baseTokens, customTokens), 
    [baseTokens, customTokens]
  );
  
  return (
    <TokenContext.Provider value={mergedTokens}>
      {children}
    </TokenContext.Provider>
  );
};

// Usage
<CustomTokenProvider customTokens={{
  animation: { duration: { fast: '100ms' } }
}}>
  <App />
</CustomTokenProvider>
```

## Migration Guide

### From CSS Variables to Tokens

```typescript
// Before: CSS variables
const Component = () => (
  <div style={{
    backgroundColor: 'var(--primary-color)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--border-radius)',
  }}>
    Content
  </div>
);

// After: Design tokens
const Component = () => {
  const tokens = useTokens();
  
  return (
    <div style={{
      backgroundColor: tokens.colors.primary[500],
      padding: tokens.spacing.lg,
      borderRadius: tokens.border.radius.medium,
    }}>
      Content
    </div>
  );
};
```

### From Styled Components to Tokens

```typescript
// Before: Styled components
const StyledButton = styled.button`
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
`;

// After: Token-based styling
const Button = ({ variant = 'primary', ...props }) => {
  const tokens = useTokens();
  
  return (
    <button
      style={{
        backgroundColor: tokens.components.button[variant].background,
        color: tokens.components.button[variant].text,
        padding: tokens.components.button.padding.medium,
        borderRadius: tokens.border.radius.medium,
      }}
      {...props}
    />
  );
};
```

## Best Practices

### 1. Token Naming Conventions

```typescript
// ✅ Good: Semantic and descriptive names
tokens.colors.action.primary.background
tokens.spacing.component.padding.large
tokens.typography.heading.fontSize.xl

// ❌ Bad: Generic or unclear names
tokens.colors.blue500
tokens.spacing.big
tokens.font.large
```

### 2. Token Organization

```typescript
// ✅ Good: Organized by category and context
interface WellOrganizedTokens {
  colors: {
    text: { primary, secondary, disabled },
    background: { primary, secondary, elevated },
    border: { primary, secondary, focus },
    action: {
      primary: { background, text, hover, active },
      secondary: { background, text, hover, active },
    }
  }
}

// ❌ Bad: Flat structure without context
interface PoorlyOrganizedTokens {
  primaryBlue: string;
  secondaryGray: string;
  smallSpacing: string;
  bigSpacing: string;
}
```

### 3. Performance Optimization

```typescript
// ✅ Good: Memoize token calculations
const useOptimizedTokens = () => {
  const baseTokens = useTokens();
  const theme = useTheme();
  
  return useMemo(() => {
    return resolveTokens(baseTokens, theme);
  }, [baseTokens, theme]);
};

// ❌ Bad: Recalculate tokens on every render
const useUnoptimizedTokens = () => {
  const baseTokens = useTokens();
  const theme = useTheme();
  
  return resolveTokens(baseTokens, theme); // Recalculates every time
};
```

### 4. Type Safety

```typescript
// ✅ Good: Strongly typed token access
interface TypedTokenAccess {
  colors: {
    primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
    secondary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  };
}

// Usage with full IntelliSense support
const color = tokens.colors.primary[500]; // ✅ TypeScript knows this exists

// ❌ Bad: Untyped token access
const color = tokens.colors.primary.someUnknownShade; // ❌ Could fail at runtime
```

## API Reference

### Hooks

#### `useTokens()`
Returns the current design tokens based on theme and platform.

```typescript
const useTokens: () => DesignTokens;
```

#### `useTheme()`
Manages theme state and provides theme utilities.

```typescript
const useTheme: () => {
  theme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
  toggleMode: () => void;
};
```

#### `usePlatformTokens()`
Returns platform-specific token overrides.

```typescript
const usePlatformTokens: (platform?: Platform) => DesignTokens;
```

### Components

#### `TokenProvider`
Provides design tokens to the component tree.

```typescript
interface TokenProviderProps {
  theme?: string | Theme;
  customTokens?: Partial<DesignTokens>;
  children: React.ReactNode;
}
```

#### `ThemeProvider`
Manages theme state and persistence.

```typescript
interface ThemeProviderProps {
  defaultTheme?: string;
  persistTheme?: boolean;
  children: React.ReactNode;
}
```

### Utilities

#### `createTheme()`
Creates a new theme with token overrides.

```typescript
const createTheme: (
  baseTheme: Theme,
  overrides: Partial<DesignTokens>
) => Theme;
```

#### `validateTokens()`
Validates token structure and values.

```typescript
const validateTokens: (tokens: DesignTokens) => ValidationResult;
```

#### `resolveTokenReferences()`
Resolves token references to actual values.

```typescript
const resolveTokenReferences: (tokens: DesignTokens) => DesignTokens;
```