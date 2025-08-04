# UI System - Theming & Customization

## 🎨 Advanced Theming System v5.0

The Xala Universal Design System v5.0 provides a powerful, **token-driven theming system** with **dynamic theme switching**, **SSR support**, **Norwegian compliance**, and **brand customization** capabilities while maintaining **WCAG 2.2 AAA accessibility**.

---

## 🚀 Quick Start

### Basic Theme Setup

```typescript
import { UISystemProvider } from '@xala-technologies/ui-system';

function App() {
  return (
    <UISystemProvider
      theme="light"
      colorMode="auto" // 'light', 'dark', 'auto'
      locale="nb-NO"
      compliance={{
        norwegian: true,
        wcagLevel: 'WCAG_2_2_AAA'
      }}
    >
      <YourApplication />
    </UISystemProvider>
  );
}
```

### Dynamic Theme Switching

```typescript
import { useTheme } from '@xala-technologies/ui-system';

function ThemeToggle() {
  const { theme, setTheme, availableThemes, colorMode, setColorMode } = useTheme();

  return (
    <div>
      {/* Theme selector */}
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {availableThemes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>

      {/* Color mode toggle */}
      <button onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}>
        {colorMode === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
```

---

## 🏗️ Theme Architecture

### Three-Layer Theme System

```typescript
// 1. Base Themes (core theme definitions)
const lightTheme = {
  id: 'light',
  name: 'Light Theme',
  colors: {
    // Primitive colors
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      // ... gray scale
      900: '#111827',
    },
    blue: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
  },
  // Semantic mappings
  semantic: {
    background: 'var(--color-white)',
    foreground: 'var(--color-gray-900)',
    primary: 'var(--color-blue-500)',
    'primary-foreground': 'var(--color-white)',
    muted: 'var(--color-gray-50)',
    'muted-foreground': 'var(--color-gray-600)',
    accent: 'var(--color-blue-50)',
    'accent-foreground': 'var(--color-blue-900)',
    destructive: 'var(--color-red-500)',
    'destructive-foreground': 'var(--color-white)',
    border: 'var(--color-gray-200)',
    input: 'var(--color-gray-200)',
    ring: 'var(--color-blue-500)',
  },
  spacing: {
    // 8pt grid system
    'xs': '0.25rem',  // 4px
    'sm': '0.5rem',   // 8px
    'md': '1rem',     // 16px
    'lg': '1.5rem',   // 24px
    'xl': '2rem',     // 32px
    '2xl': '3rem',    // 48px
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
};

// 2. Dark Theme (inherits and overrides)
const darkTheme = {
  ...lightTheme,
  id: 'dark',
  name: 'Dark Theme',
  semantic: {
    ...lightTheme.semantic,
    background: 'var(--color-gray-900)',
    foreground: 'var(--color-gray-50)',
    muted: 'var(--color-gray-800)',
    'muted-foreground': 'var(--color-gray-400)',
    accent: 'var(--color-gray-800)',
    'accent-foreground': 'var(--color-gray-50)',
    border: 'var(--color-gray-700)',
    input: 'var(--color-gray-700)',
  },
};

// 3. Brand Themes (customizations)
const norwegianGovTheme = {
  ...lightTheme,
  id: 'norwegian-gov',
  name: 'Norwegian Government',
  colors: {
    ...lightTheme.colors,
    // Norwegian government brand colors
    red: '#e02e2e',      // Norwegian red
    blue: '#0040a6',     // Norwegian blue
    white: '#ffffff',
    black: '#000000',
  },
  semantic: {
    ...lightTheme.semantic,
    primary: 'var(--color-blue)',
    'primary-foreground': 'var(--color-white)',
    accent: 'var(--color-red)',
    'accent-foreground': 'var(--color-white)',
  },
};
```

---

## 🎯 Built-in Themes

### Core Themes

#### Light Theme
```typescript
// Default light theme
const light = {
  colors: {
    background: '#ffffff',
    foreground: '#0f172a',
    primary: '#0f172a',
    'primary-foreground': '#f8fafc',
    secondary: '#f1f5f9',
    'secondary-foreground': '#0f172a',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#f1f5f9',
    'accent-foreground': '#0f172a',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#0f172a',
  },
};
```

#### Dark Theme
```typescript
// Dark theme with proper contrast ratios
const dark = {
  colors: {
    background: '#0f172a',
    foreground: '#f8fafc',
    primary: '#f8fafc',
    'primary-foreground': '#0f172a',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f8fafc',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#334155',
    input: '#334155',
    ring: '#f8fafc',
  },
};
```

#### High Contrast Theme (WCAG AAA)
```typescript
// Maximum contrast for accessibility
const highContrast = {
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#000000',
    'primary-foreground': '#ffffff',
    secondary: '#f0f0f0',
    'secondary-foreground': '#000000',
    muted: '#f0f0f0',
    'muted-foreground': '#666666',
    accent: '#000000',
    'accent-foreground': '#ffffff',
    destructive: '#cc0000',
    'destructive-foreground': '#ffffff',
    border: '#000000',
    input: '#000000',
    ring: '#000000',
  },
};
```

### Norwegian Compliance Themes

#### Norwegian Government Theme
```typescript
const norwegianGov = {
  colors: {
    // Official Norwegian government colors
    background: '#ffffff',
    foreground: '#2d3748',
    primary: '#0040a6',      // Official Norwegian blue
    'primary-foreground': '#ffffff',
    secondary: '#f7fafc',
    'secondary-foreground': '#2d3748',
    accent: '#e02e2e',       // Norwegian red
    'accent-foreground': '#ffffff',
    // NSM classification colors
    'nsm-open': '#22c55e',        // Green for ÅPEN
    'nsm-restricted': '#eab308',   // Yellow for BEGRENSET
    'nsm-confidential': '#f97316', // Orange for KONFIDENSIELT
    'nsm-secret': '#ef4444',       // Red for HEMMELIG
  },
};
```

---

## 🛠️ Custom Theme Creation

### 1. Define Your Brand Theme

```typescript
// themes/my-brand-theme.ts
import { createTheme } from '@xala-technologies/ui-system';

export const myBrandTheme = createTheme({
  id: 'my-brand',
  name: 'My Brand Theme',
  extends: 'light', // Base theme to extend
  
  colors: {
    // Brand colors
    primary: '#6366f1',        // Your brand primary
    'primary-foreground': '#ffffff',
    secondary: '#e0e7ff',      // Your brand secondary
    'secondary-foreground': '#1e1b4b',
    accent: '#8b5cf6',         // Your accent color
    'accent-foreground': '#ffffff',
    
    // Custom brand palette
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      900: '#312e81',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Your Brand Font', 'system-ui', 'sans-serif'],
      heading: ['Your Heading Font', 'system-ui', 'sans-serif'],
    },
  },
  
  shadows: {
    // Custom shadow system
    brand: '0 4px 20px rgba(99, 102, 241, 0.15)',
  },
  
  // Custom component overrides
  components: {
    Button: {
      variants: {
        brand: 'bg-brand-500 text-white hover:bg-brand-600',
      },
    },
    Card: {
      variants: {
        brand: 'border-brand-200 bg-brand-50',
      },
    },
  },
});
```

### 2. Register Your Theme

```typescript
// themes/index.ts
import { registerTheme } from '@xala-technologies/ui-system';
import { myBrandTheme } from './my-brand-theme';

// Register the theme
registerTheme(myBrandTheme);

// Export for use
export { myBrandTheme };
```

### 3. Use Your Custom Theme

```typescript
// app.tsx
import { UISystemProvider } from '@xala-technologies/ui-system';
import { myBrandTheme } from './themes';

function App() {
  return (
    <UISystemProvider theme="my-brand">
      <YourApplication />
    </UISystemProvider>
  );
}
```

---

## 🎨 Theme Customization Patterns

### Component-Level Customization

```typescript
// Override specific component styling
const customButton = cva(
  'base-button-classes',
  {
    variants: {
      variant: {
        // Standard variants
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        
        // Custom brand variants
        brand: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      },
    },
  }
);

// Use in component
<Button variant="brand" size="lg">
  Brand Action
</Button>
```

### CSS Custom Properties

```css
/* Custom CSS properties for advanced theming */
:root {
  --brand-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --brand-shadow: 0 10px 25px rgba(99, 102, 241, 0.2);
  --brand-border-radius: 12px;
}

.brand-card {
  background: var(--brand-gradient);
  box-shadow: var(--brand-shadow);
  border-radius: var(--brand-border-radius);
}
```

### Runtime Theme Switching

```typescript
import { useTheme } from '@xala-technologies/ui-system';

function AdvancedThemeControls() {
  const { 
    theme, 
    setTheme, 
    colorMode, 
    setColorMode, 
    customizeTheme,
    resetTheme 
  } = useTheme();

  const handleBrandColorChange = (color: string) => {
    customizeTheme({
      colors: {
        primary: color,
        accent: adjustHue(color, 30), // Utility function
      },
    });
  };

  return (
    <div>
      {/* Theme selector */}
      <ThemeSelect value={theme} onChange={setTheme} />
      
      {/* Color mode toggle */}
      <ColorModeToggle value={colorMode} onChange={setColorMode} />
      
      {/* Brand color customizer */}
      <ColorPicker 
        label="Primary Brand Color"
        value="#6366f1"
        onChange={handleBrandColorChange}
      />
      
      {/* Reset to defaults */}
      <Button variant="outline" onClick={resetTheme}>
        Reset Theme
      </Button>
    </div>
  );
}
```

---

## 🇳🇴 Norwegian Compliance Theming

### NSM Classification Colors

```typescript
// Norwegian Security Authority (NSM) classification system
const nsmClassificationColors = {
  'ÅPEN': {
    background: '#dcfce7',        // Light green
    foreground: '#166534',        // Dark green
    border: '#22c55e',           // Green
  },
  'BEGRENSET': {
    background: '#fef3c7',        // Light yellow
    foreground: '#92400e',        // Dark yellow
    border: '#eab308',           // Yellow
  },
  'KONFIDENSIELT': {
    background: '#fed7aa',        // Light orange
    foreground: '#9a3412',        // Dark orange
    border: '#f97316',           // Orange
  },
  'HEMMELIG': {
    background: '#fecaca',        // Light red
    foreground: '#991b1b',        // Dark red
    border: '#ef4444',           // Red
  },
};

// Usage in components
<ClassificationIndicator 
  level="KONFIDENSIELT"
  style={{
    backgroundColor: nsmClassificationColors.KONFIDENSIELT.background,
    color: nsmClassificationColors.KONFIDENSIELT.foreground,
    borderColor: nsmClassificationColors.KONFIDENSIELT.border,
  }}
/>
```

### Norwegian Government Brand Guidelines

```typescript
const norwegianGovBrandTheme = {
  colors: {
    // Official Norwegian government palette
    'gov-blue': '#0040a6',       // Primary government blue
    'gov-red': '#e02e2e',        // Norwegian flag red
    'gov-white': '#ffffff',      // Pure white
    'gov-black': '#000000',      // Pure black
    'gov-gray': {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  
  // Typography following Norwegian government standards
  typography: {
    fontFamily: {
      sans: ['Source Sans Pro', 'Arial', 'sans-serif'], // Recommended by government
      heading: ['Source Sans Pro', 'Arial', 'sans-serif'],
    },
    fontSize: {
      // Optimized for Norwegian text
      'body': '16px',     // Minimum for accessibility
      'heading': '24px',  // Clear hierarchy
    },
  },
  
  // Accessibility-compliant spacing
  spacing: {
    // Enhanced 8pt grid for government applications
    'gov-xs': '4px',
    'gov-sm': '8px',
    'gov-md': '16px',
    'gov-lg': '24px',
    'gov-xl': '32px',
    'gov-2xl': '48px',
  },
};
```

---

## 🧪 Theme Testing & Validation

### Accessibility Testing

```typescript
// Test theme for WCAG compliance
import { validateThemeAccessibility } from '@xala-technologies/ui-system/testing';

describe('Theme Accessibility', () => {
  test('passes WCAG 2.2 AAA contrast requirements', () => {
    const results = validateThemeAccessibility(myBrandTheme);
    
    expect(results.contrastRatio.normal).toBeGreaterThan(7); // AAA requirement
    expect(results.contrastRatio.large).toBeGreaterThan(4.5);
    expect(results.colorBlindnessSupport).toBe(true);
  });
  
  test('Norwegian compliance validation', () => {
    const compliance = validateNorwegianCompliance(myBrandTheme);
    
    expect(compliance.nsmClassificationSupport).toBe(true);
    expect(compliance.wcagLevel).toBe('AAA');
    expect(compliance.languageSupport).toContain('nb-NO');
  });
});
```

### Visual Regression Testing

```typescript
// Automated theme testing
import { chromatic } from '@chromatic-com/storybook';

export default {
  title: 'Themes/All Components',
  parameters: {
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
        'high-contrast': { theme: 'high-contrast' },
        'norwegian-gov': { theme: 'norwegian-gov' },
      },
    },
  },
};

// Test all themes across all components
export const AllThemes = () => (
  <ComponentShowcase />
);
```

---

## 📱 Responsive Theme Adaptation

### Mobile-First Theme Adjustments

```typescript
const responsiveTheme = {
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  
  // Responsive typography
  typography: {
    responsive: {
      h1: {
        mobile: '1.75rem',    // 28px
        tablet: '2.25rem',    // 36px
        desktop: '3rem',      // 48px
      },
      body: {
        mobile: '0.875rem',   // 14px
        tablet: '1rem',       // 16px
        desktop: '1rem',      // 16px
      },
    },
  },
  
  // Responsive spacing
  spacing: {
    responsive: {
      'container-padding': {
        mobile: '1rem',       // 16px
        tablet: '2rem',       // 32px
        desktop: '3rem',      // 48px
      },
      'section-gap': {
        mobile: '2rem',       // 32px
        tablet: '3rem',       // 48px
        desktop: '4rem',      // 64px
      },
    },
  },
};
```

---

## 🚀 Performance Optimization

### Theme Bundle Optimization

```typescript
// Lazy load themes for better performance
const loadTheme = async (themeId: string) => {
  switch (themeId) {
    case 'dark':
      return import('./themes/dark-theme').then(m => m.darkTheme);
    case 'high-contrast':
      return import('./themes/high-contrast-theme').then(m => m.highContrastTheme);
    case 'norwegian-gov':
      return import('./themes/norwegian-gov-theme').then(m => m.norwegianGovTheme);
    default:
      return import('./themes/light-theme').then(m => m.lightTheme);
  }
};

// Use with theme provider
function ThemedApp() {
  const [theme, setTheme] = useState('light');
  const [themeData, setThemeData] = useState(null);

  useEffect(() => {
    loadTheme(theme).then(setThemeData);
  }, [theme]);

  if (!themeData) return <ThemeLoadingSpinner />;

  return (
    <UISystemProvider theme={themeData}>
      <YourApplication />
    </UISystemProvider>
  );
}
```

### CSS Variable Optimization

```css
/* Optimized CSS custom properties */
:root {
  /* Core colors only */
  --color-primary: #6366f1;
  --color-secondary: #e0e7ff;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
}

/* Dark theme override */
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-foreground: #f8fafc;
}

/* High contrast override */
[data-theme="high-contrast"] {
  --color-primary: #000000;
  --color-background: #ffffff;
  --color-foreground: #000000;
}
```

---

## 🔗 Related Documentation

- **[Design Tokens](../tokens/)** - Complete token system documentation
- **[Components](../components/)** - Component theming and customization
- **[Architecture](../architecture/)** - Theme architecture and patterns
- **[Norwegian Compliance](../guides/norwegian-compliance.md)** - Compliance requirements

---

*UI System Theming Guide v2.0 - Advanced theming with Norwegian compliance and accessibility*