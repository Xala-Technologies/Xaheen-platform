{{ ... }}

This guide explains how to use, extend, and customize themes in the Xala UI System, ensuring brand consistency, accessibility, and compliance.

---

#/**
 * Responsive Design Configuration - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.)
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Professional breakpoint system
 * - Container max-widths
 * - Typography scaling
 * - Spacing adjustments
 * - Component behavior per device
 * - Norwegian mobile patterns
 * - Accessibility-first responsive design
 */

# Theme System

The Xala UI System provides a **comprehensive theming system** that enables complete visual customization while maintaining accessibility, consistency, and brand compliance. Our theme system is built on design tokens and supports white-label applications.

## 🎯 Core Concepts

### 1. **Token-Based Theming**
All themes are built on design tokens, ensuring consistency and maintainability.

### 2. **Accessibility First**
Every theme maintains WCAG 2.2 AAA compliance with proper contrast ratios.

### 3. **White-Label Ready**
Complete brand customization support for enterprise applications.

### 4. **SSR Compatible**
Themes work seamlessly with server-side rendering and hydration.

## 🎨 Built-in Themes

### Light Theme (Default)

```typescript
import { lightTheme } from '@xala-technologies/ui-system';

const lightThemeTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b'
    }
  }
};
```

### Dark Theme

```typescript
import { darkTheme } from '@xala-technologies/ui-system';

const darkThemeTokens = {
  colors: {
    primary: {
      50: '#0c4a6e',
      500: '#38bdf8',
      900: '#f0f9ff'
    },
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8'
    }
  }
};
```

### Tum Tum Sahour Theme (Norwegian Heritage)

```typescript
import { tumTumSahour } from '@xala-technologies/ui-system';

// Inspired by Norwegian design principles
const tumTumSahourTokens = {
  colors: {
    primary: {
      500: '#BA0C2F', // Norwegian red
      complementary: '#00205B' // Norwegian blue
    },
    nature: {
      forest: '#2D5016', // Norwegian forest green
      fjord: '#4A90A4',  // Fjord blue
      aurora: '#00FF7F'  // Northern lights green
    }
  },
  spacing: {
    // Generous spacing following Norwegian design preferences
    comfortable: '48px',
    cozy: '32px'
  }
};
```

## 🔨 Creating Custom Themes

### 1. Basic Custom Theme

```typescript
import { createTheme, baseTokens } from '@xala-technologies/ui-system';

const brandTheme = createTheme({
  name: 'brand-theme',
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Brand red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      1000: '#450a0a'
    },
    secondary: {
      50: '#f0fdf4',
      500: '#22c55e', // Brand green
      900: '#14532d'
    }
  },
  typography: {
    fontFamily: {
      heading: ['Montserrat', 'sans-serif'],
      body: ['Open Sans', 'sans-serif']
    }
  },
  spacing: {
    // Custom spacing values
    brand: '40px',
    hero: '120px'
  },
  borderRadius: {
    brand: '12px',
    organic: '16px 24px 16px 24px'
  }
});
```

### 2. Using Design Tokens for Custom Styling

```typescript
import { useTokens, Button, Card } from '@xala-technologies/ui-system';

function CustomStyledComponents(): JSX.Element {
  const { colors, spacing, typography, borderRadius } = useTokens();
  
  return (
    <>
      {/* Use tokens for custom styling when needed */}
      <Button 
        variant="primary" 
        style={{
          backgroundColor: colors.primary[600],
          padding: `${spacing.sm} ${spacing.lg}`,
          borderRadius: borderRadius.md
        }}
      >
        Custom Button
      </Button>
      
      <Card 
        variant="elevated" 
        padding="lg"
        style={{
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.border.primary}`
        }}
      >
        Custom Card Content
      </Card>
    </>
  );
}
```

## 📋 Theme Usage

### 1. Basic Theme Usage

```tsx
import { UISystemProvider, useTheme } from '@xala-technologies/ui-system';

function App(): JSX.Element {
  return (
    <UISystemProvider>
      <ThemeAwareContent />
    </UISystemProvider>
  );
}

function ThemeAwareContent(): JSX.Element {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = (): void => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} theme
      </button>
      {/* Your app content */}
    </div>
  );
}
```

### 2. Dynamic Theme Switching

```tsx
import { 
  UISystemProvider, 
  useTheme, 
  Button, 
  Container 
} from '@xala-technologies/ui-system';

function ThemeSwitcher(): JSX.Element {
  const { theme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (newTheme: string): void => {
    setTheme(newTheme);
    // Optionally persist to localStorage
    localStorage.setItem('preferred-theme', newTheme);
  };

  return (
    <Container padding="4">
      {availableThemes.map((themeName) => (
        <Button
          key={themeName}
          variant={theme === themeName ? 'primary' : 'outline'}
          onClick={() => handleThemeChange(themeName)}
          margin="2"
        >
          {themeName}
        </Button>
      ))}
    </Container>
  );
}
```

### 3. Theme-Aware Components

```tsx
import { useTokens, Container, Text } from '@xala-technologies/ui-system';

function ThemeAwareCard(): JSX.Element {
  const tokens = useTokens();

  return (
    <Container
      backgroundColor="secondary"
      padding="6"
      borderRadius="lg"
      shadow="md"
      style={{
        border: `1px solid ${tokens.colors.border.secondary}`,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Text variant="h3" color="primary">
        Theme-Aware Content
      </Text>
      <Text variant="body1" color="secondary">
        This card adapts to the current theme automatically.
      </Text>
    </Container>
  );
}
```

## 🌐 White-Label Theming

### 1. Brand Configuration

```typescript
import { createWhiteLabelTheme } from '@xala-technologies/ui-system';

interface BrandConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo: string;
  typography: {
    heading: string[];
    body: string[];
  };
}

const brandConfig: BrandConfig = {
  name: 'Acme Corporation',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4'
  },
  logo: '/assets/acme-logo.svg',
  typography: {
    heading: ['Poppins', 'sans-serif'],
    body: ['Inter', 'sans-serif']
  }
};

const acmeTheme = createWhiteLabelTheme(brandConfig);
```

### 2. Multi-Tenant Theme Management

```tsx
import { 
  UISystemProvider, 
  WhiteLabelProvider,
  useWhiteLabel 
} from '@xala-technologies/ui-system';

interface TenantThemeProviderProps {
  tenantId: string;
  children: ReactNode;
}

function TenantThemeProvider({ 
  tenantId, 
  children 
}: TenantThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Load tenant-specific theme
    loadTenantTheme(tenantId).then(setTheme);
  }, [tenantId]);

  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return (
    <WhiteLabelProvider tenantId={tenantId}>
      <UISystemProvider theme={theme}>
        {children}
      </UISystemProvider>
    </WhiteLabelProvider>
  );
}

async function loadTenantTheme(tenantId: string) {
  const response = await fetch(`/api/themes/${tenantId}`);
  return response.json();
}
```

## 📱 Responsive Theming

### 1. Breakpoint-Specific Themes

```typescript
const responsiveTheme = createTheme({
  name: 'responsive-theme',
  breakpoints: {
    xs: {
      typography: {
        fontSize: {
          h1: '24px',
          body1: '14px'
        }
      },
      spacing: {
        container: '16px'
      }
    },
    md: {
      typography: {
        fontSize: {
          h1: '32px',
          body1: '16px'
        }
      },
      spacing: {
        container: '32px'
      }
    },
    lg: {
      typography: {
        fontSize: {
          h1: '48px',
          body1: '18px'
        }
      },
      spacing: {
        container: '48px'
      }
    }
  }
});
```

### 2. Device-Specific Adaptations

```tsx
import { useMediaQuery, useTheme } from '@xala-technologies/ui-system';

function ResponsiveThemedComponent(): JSX.Element {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  const adaptiveTheme = {
    ...theme,
    spacing: {
      ...theme.spacing,
      container: isMobile ? '16px' : isTablet ? '32px' : '48px'
    }
  };

  return (
    <Container
      padding={adaptiveTheme.spacing.container}
      backgroundColor="primary"
    >
      {/* Responsive content */}
    </Container>
  );
}
```

## 🌍 Localization & Cultural Themes

### 1. Norwegian Cultural Theme

```typescript
const norwegianTheme = createTheme({
  name: 'norwegian-cultural',
  colors: {
    cultural: {
      red: '#BA0C2F',    // Norwegian flag red
      blue: '#00205B',   // Norwegian flag blue
      white: '#FFFFFF'   // Norwegian flag white
    },
    nature: {
      fjord: '#4A90A4',
      forest: '#2D5016',
      aurora: '#00FF7F',
      midnight: '#191970'
    }
  },
  spacing: {
    // Norwegian design prefers generous spacing
    comfortable: '48px',
    cozy: '32px',
    intimate: '24px'
  },
  typography: {
    // Support for Norwegian characters
    fontFamily: {
      body: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif']
    }
  }
});
```

### 2. RTL Theme Support

```typescript
const arabicTheme = createTheme({
  name: 'arabic-rtl',
  direction: 'rtl',
  colors: {
    primary: {
      500: '#059669' // Arabic green
    }
  },
  spacing: {
    // Logical properties for RTL
    inlineStart: '16px',
    inlineEnd: '16px',
    blockStart: '8px',
    blockEnd: '8px'
  },
  typography: {
    fontFamily: {
      body: ['Noto Sans Arabic', 'Arial', 'sans-serif'],
      heading: ['Amiri', 'Noto Sans Arabic', 'serif']
    },
    textAlign: 'right' // Default RTL alignment
  }
});
```

## 📊 Theme Performance

### 1. Theme Lazy Loading

```tsx
import { lazy, Suspense } from 'react';
import { UISystemProvider } from '@xala-technologies/ui-system';

const LazyTheme = lazy(() => import('./themes/enterprise-theme'));

function App(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading theme...</div>}>
      <LazyTheme>
        {(theme) => (
          <UISystemProvider theme={theme}>
            {/* App content */}
          </UISystemProvider>
        )}
      </LazyTheme>
    </Suspense>
  );
}
```

### 2. Theme Caching

```typescript
class ThemeCache {
  private cache = new Map<string, Theme>();

  async getTheme(themeId: string): Promise<Theme> {
    if (this.cache.has(themeId)) {
      return this.cache.get(themeId)!;
    }

    const theme = await this.loadTheme(themeId);
    this.cache.set(themeId, theme);
    return theme;
  }

  private async loadTheme(themeId: string): Promise<Theme> {
    const response = await fetch(`/api/themes/${themeId}`);
    return response.json();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

const themeCache = new ThemeCache();
```

## 🛠️ Theme Development Tools

### 1. Theme Inspector

```tsx
import { ThemeInspector } from '@xala-technologies/ui-system/dev';

function App(): JSX.Element {
  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <ThemeInspector
          showTokens={true}
          showComponents={true}
          position="bottom-right"
        />
      )}
      {/* Your app */}
    </>
  );
}
```

### 2. Theme Validation

```typescript
import { validateTheme } from '@xala-technologies/ui-system/validation';

const customTheme = createTheme({
  // Theme configuration
});

const validation = validateTheme(customTheme);

if (!validation.isValid) {
  console.error('Theme validation errors:', validation.errors);
}
```

## 📚 Related Documentation

- [Design Tokens](./tokens.md) - Understanding the token system
- [White-Label Support](./white-label.md) - Enterprise branding
- [Provider System](./providers.md) - Theme provider configuration
- [Component Customization](./components/) - Component-level theming

## 🔧 Advanced Theming

For advanced theming patterns, theme compilation, and enterprise theme management, see our [Advanced Theming Guide](./advanced-features/theming.md).

- Switch themes dynamically using context or user settings.
- All components consume the active theme via the `useTokens` hook.

---
{{ ... }}
## Creating Custom Themes
1. **Duplicate an existing theme** in `/src/tokens/themes/`.
2. **Adjust token values** for brand colors, spacing, etc.
3. **Export your theme** from `themes/index.ts`.
4. **Document the new theme** in this file and in code comments.

---

## Accessibility & Compliance
- All themes must meet WCAG 2.2 AA color contrast requirements.
- Provide a high-contrast option for visually impaired users.
- Support for RTL and localization is built-in.

---

## Best Practices
- Never hardcode colors; always use tokens.
- Test themes across all components and layouts.
- Document all new themes and customizations.

---

## Further Reading
- [Design Tokens Guide](./design-tokens.md)
- [Component Documentation](./components/README.md)
- [Accessibility Principles](./architecture.md)
