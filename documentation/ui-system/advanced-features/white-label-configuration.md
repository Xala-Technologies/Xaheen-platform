# White Label Configuration System

The White Label Configuration System in UI System v5 enables complete brand customization through industry-specific templates and custom token overrides, perfect for multi-tenant applications and brand-specific deployments.

## Overview

The white label system provides:
- Pre-built industry templates (Healthcare, Finance, E-commerce, Education, etc.)
- Complete token customization
- Brand asset management
- Typography and color system overrides
- Component variant theming
- Export/import functionality
- Runtime theme switching

## Basic Usage

### Using Pre-built Templates

```typescript
import { UiProvider } from '@xala-technologies/ui-system';
import { healthcareTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

function App() {
  return (
    <UiProvider
      whiteLabelConfig={healthcareTemplate}
      defaultTheme="light"
    >
      {children}
    </UiProvider>
  );
}
```

### Custom White Label Configuration

```typescript
import { WhiteLabelConfig } from '@xala-technologies/ui-system/types';

const customBrandConfig: WhiteLabelConfig = {
  brand: {
    name: 'MedTech Pro',
    logo: '/assets/logo.svg',
    favicon: '/assets/favicon.ico',
    tagline: 'Advanced Healthcare Solutions'
  },
  colors: {
    primary: {
      50: '#e8f4fd',
      100: '#c5e4fb',
      200: '#9ed2f8',
      300: '#76bff5',
      400: '#58b1f3',
      500: '#3aa3f0', // Main brand color
      600: '#349aee',
      700: '#2c8eec',
      800: '#2582e9',
      900: '#186ee5'
    },
    // ... other color overrides
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Playfair Display', 'serif']
    }
  }
};
```

## Available Industry Templates

### 1. Healthcare Template

```typescript
import { healthcareTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

// Features:
// - Calming blue/green palette
// - High contrast for accessibility
// - Clean, clinical aesthetics
// - WCAG AAA compliant
```

### 2. Finance Template

```typescript
import { financeTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

// Features:
// - Trust-building navy/gold palette
// - Professional typography
// - Data visualization optimized
// - Security-focused design
```

### 3. E-commerce Template

```typescript
import { ecommerceTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

// Features:
// - Vibrant, conversion-focused colors
// - Product showcase optimizations
// - Clear CTAs and actions
// - Mobile-first design
```

### 4. Education Template

```typescript
import { educationTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

// Features:
// - Playful yet professional palette
// - Readable typography for learning
// - Interactive component styles
// - Accessibility first
```

### 5. Government Template

```typescript
import { governmentTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

// Features:
// - Official color schemes
// - Maximum accessibility
// - Clear information hierarchy
// - Multi-language support ready
```

## Configuration Structure

### Complete WhiteLabelConfig Interface

```typescript
interface WhiteLabelConfig {
  // Brand identity
  brand: {
    name: string;
    logo?: string;
    logoUrl?: string;
    favicon?: string;
    tagline?: string;
    copyright?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  
  // Color system overrides
  colors: {
    primary: ColorScale;
    secondary?: ColorScale;
    neutral: ColorScale;
    success?: ColorScale;
    warning?: ColorScale;
    danger?: ColorScale;
    info?: ColorScale;
    // Semantic colors
    background?: string;
    foreground?: string;
    muted?: string;
    accent?: string;
    // ... other color tokens
  };
  
  // Typography system
  typography: {
    fontFamily: {
      sans: string | string[];
      serif?: string | string[];
      mono?: string | string[];
      display?: string | string[];
    };
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, number>;
    lineHeight?: Record<string, number>;
    letterSpacing?: Record<string, string>;
  };
  
  // Spacing and sizing
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  borderWidth?: Record<string, string>;
  
  // Effects
  boxShadow?: Record<string, string>;
  opacity?: Record<string, number>;
  
  // Animation
  animation?: {
    duration?: Record<string, string>;
    easing?: Record<string, string>;
    delay?: Record<string, string>;
  };
  
  // Component-specific overrides
  components?: {
    button?: ComponentTokens;
    card?: ComponentTokens;
    input?: ComponentTokens;
    // ... other components
  };
  
  // Theme metadata
  metadata?: {
    version: string;
    author?: string;
    created?: string;
    updated?: string;
    category?: string;
    tags?: string[];
  };
}
```

## Advanced Customization

### 1. Dynamic Brand Loading

```typescript
// Load brand config from API
async function loadBrandConfig(brandId: string): Promise<WhiteLabelConfig> {
  const response = await fetch(`/api/brands/${brandId}/config`);
  return response.json();
}

function DynamicBrandApp({ brandId }: { brandId: string }) {
  const [brandConfig, setBrandConfig] = useState<WhiteLabelConfig | null>(null);
  
  useEffect(() => {
    loadBrandConfig(brandId).then(setBrandConfig);
  }, [brandId]);
  
  if (!brandConfig) return <LoadingScreen />;
  
  return (
    <UiProvider whiteLabelConfig={brandConfig}>
      <App />
    </UiProvider>
  );
}
```

### 2. Runtime Brand Switching

```typescript
import { useWhiteLabel } from '@xala-technologies/ui-system/hooks';

function BrandSwitcher() {
  const { currentConfig, setWhiteLabelConfig } = useWhiteLabel();
  
  const handleBrandChange = async (brandId: string) => {
    const newConfig = await loadBrandConfig(brandId);
    setWhiteLabelConfig(newConfig);
  };
  
  return (
    <select onChange={(e) => handleBrandChange(e.target.value)}>
      <option value="default">Default Brand</option>
      <option value="healthcare">Healthcare</option>
      <option value="finance">Finance</option>
      <option value="custom">Custom Brand</option>
    </select>
  );
}
```

### 3. Component-Level Customization

```typescript
const customBrandConfig: WhiteLabelConfig = {
  // ... base config
  components: {
    button: {
      variants: {
        primary: {
          base: {
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
            borderRadius: '9999px', // Fully rounded
          },
          hover: {
            backgroundColor: 'var(--brand-primary-dark)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        },
        secondary: {
          base: {
            backgroundColor: 'transparent',
            color: 'var(--brand-primary)',
            border: '2px solid var(--brand-primary)'
          }
        }
      },
      sizes: {
        sm: { padding: '8px 16px', fontSize: '14px' },
        md: { padding: '12px 24px', fontSize: '16px' },
        lg: { padding: '16px 32px', fontSize: '18px' }
      }
    },
    card: {
      variants: {
        elevated: {
          base: {
            backgroundColor: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '16px'
          }
        }
      }
    }
  }
};
```

### 4. Multi-Tenant Configuration

```typescript
// Multi-tenant setup with subdomain detection
function MultiTenantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  
  useEffect(() => {
    const subdomain = window.location.hostname.split('.')[0];
    const tenantConfig = getTenantConfig(subdomain);
    setConfig(tenantConfig);
  }, []);
  
  if (!config) return <LoadingScreen />;
  
  return (
    <UiProvider whiteLabelConfig={config}>
      {children}
    </UiProvider>
  );
}

// Tenant configuration mapping
const tenantConfigs: Record<string, WhiteLabelConfig> = {
  'acme': acmeConfig,
  'medicorp': medicorpConfig,
  'edutech': edutechConfig,
  // ... other tenants
};

function getTenantConfig(subdomain: string): WhiteLabelConfig {
  return tenantConfigs[subdomain] || defaultConfig;
}
```

## Creating Custom Templates

### 1. Template Builder

```typescript
import { createWhiteLabelTemplate } from '@xala-technologies/ui-system/utils';

const myCustomTemplate = createWhiteLabelTemplate({
  name: 'Modern SaaS',
  baseTemplate: 'default', // Start from existing template
  overrides: {
    colors: {
      primary: generateColorScale('#6366f1'), // Indigo
      secondary: generateColorScale('#ec4899'), // Pink
    },
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif']
      }
    },
    borderRadius: {
      DEFAULT: '8px',
      lg: '12px',
      xl: '16px'
    }
  }
});
```

### 2. Color Scale Generator

```typescript
import { generateColorScale } from '@xala-technologies/ui-system/utils';

// Generate a full color scale from a single color
const brandPrimary = generateColorScale('#0070f3', {
  name: 'primary',
  steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  adjustments: {
    50: { lightness: 95 },
    900: { lightness: 20, saturation: -10 }
  }
});
```

### 3. Template Validation

```typescript
import { validateWhiteLabelConfig } from '@xala-technologies/ui-system/utils';

const validation = validateWhiteLabelConfig(myCustomTemplate);

if (!validation.valid) {
  console.error('Template validation failed:', validation.errors);
} else {
  console.log('Template is valid!');
}
```

## Import/Export Functionality

### 1. Export Configuration

```typescript
import { exportWhiteLabelConfig } from '@xala-technologies/ui-system/utils';

function ExportBrandConfig() {
  const { currentConfig } = useWhiteLabel();
  
  const handleExport = () => {
    const configJson = exportWhiteLabelConfig(currentConfig, {
      format: 'json',
      prettify: true,
      includeMetadata: true
    });
    
    // Download as file
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConfig.brand.name}-theme.json`;
    a.click();
  };
  
  return <button onClick={handleExport}>Export Brand Config</button>;
}
```

### 2. Import Configuration

```typescript
import { importWhiteLabelConfig } from '@xala-technologies/ui-system/utils';

function ImportBrandConfig() {
  const { setWhiteLabelConfig } = useWhiteLabel();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const configText = await file.text();
    
    try {
      const config = importWhiteLabelConfig(configText, {
        validate: true,
        merge: false
      });
      
      setWhiteLabelConfig(config);
      console.log('Brand config imported successfully!');
    } catch (error) {
      console.error('Failed to import config:', error);
    }
  };
  
  return (
    <input 
      type="file" 
      accept=".json"
      onChange={handleFileUpload}
    />
  );
}
```

## Best Practices

### 1. Color Accessibility

```typescript
// Ensure color contrast meets WCAG standards
const accessibleTemplate: WhiteLabelConfig = {
  colors: {
    primary: {
      500: '#0066cc', // Main color
      // Ensure text on primary-500 background is readable
      contrast: '#ffffff', // White text on primary
    },
    // Use color contrast analyzer
    text: {
      primary: '#111827', // High contrast on white
      secondary: '#6b7280', // AA compliant
      disabled: '#9ca3af' // Still readable
    }
  }
};
```

### 2. Performance Optimization

```typescript
// Lazy load heavy brand assets
const brandConfig: WhiteLabelConfig = {
  brand: {
    name: 'Heavy Brand',
    logo: '/assets/logo.svg', // Use SVG for scalability
    // Lazy load large assets
    heroImage: () => import('/assets/hero.webp')
  },
  // Use system fonts for performance
  typography: {
    fontFamily: {
      sans: ['system-ui', '-apple-system', 'sans-serif']
    }
  }
};
```

### 3. Responsive Configurations

```typescript
// Define responsive token values
const responsiveConfig: WhiteLabelConfig = {
  spacing: {
    'container-padding': 'clamp(1rem, 5vw, 3rem)',
    'section-gap': 'clamp(2rem, 10vw, 6rem)'
  },
  typography: {
    fontSize: {
      'hero': 'clamp(2.5rem, 5vw, 4rem)',
      'heading': 'clamp(1.5rem, 3vw, 2.5rem)'
    }
  }
};
```

## Testing White Label Configurations

### 1. Visual Regression Testing

```typescript
import { renderWithWhiteLabel } from '@xala-technologies/ui-system/test-utils';

describe('White Label Configurations', () => {
  it('renders correctly with healthcare template', () => {
    const { container } = renderWithWhiteLabel(
      <App />,
      { whiteLabelConfig: healthcareTemplate }
    );
    
    expect(container).toMatchSnapshot();
  });
});
```

### 2. Accessibility Testing

```typescript
import { axe } from '@axe-core/react';

test('white label config meets accessibility standards', async () => {
  const { container } = renderWithWhiteLabel(
    <App />,
    { whiteLabelConfig: customBrandConfig }
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Migration Guide

### From v4 to v5

```typescript
// v4 (Theme-based)
<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>

// v5 (White Label Config)
<UiProvider whiteLabelConfig={customBrandConfig}>
  <App />
</UiProvider>
```

### Converting existing themes

```typescript
import { migrateThemeToWhiteLabel } from '@xala-technologies/ui-system/utils';

const oldTheme = {
  colors: {
    primary: '#0070f3',
    secondary: '#ff0080'
  },
  fonts: {
    body: 'Inter, sans-serif'
  }
};

const whiteLabelConfig = migrateThemeToWhiteLabel(oldTheme, {
  brandName: 'My Brand',
  generateScales: true
});
```

## Future Integration: Localization

While localization is maintained as a separate system in the UI System, future versions may integrate locale-specific token overrides with white-label configurations:

### Potential Integration Points

1. **Locale-Specific Typography**
   ```typescript
   // Future: Locale-aware white label config
   const futureWhiteLabelConfig = {
     // ... base config
     localeOverrides: {
       'ar': {
         typography: {
           fontFamily: { sans: ['Arabic Font', 'system-ui'] },
           textDirection: 'rtl'
         }
       },
       'zh': {
         typography: {
           fontSize: { base: '16px' } // Larger for CJK
         }
       }
     }
   };
   ```

2. **Brand + Locale Combinations**
   - Healthcare brand with Norwegian-specific adjustments
   - Finance brand with Arabic RTL layout tokens
   - Education brand with locale-specific spacing

3. **Dynamic Token Loading**
   - Load locale-specific token overrides on demand
   - Merge with white-label base configuration
   - Maintain performance with lazy loading

**Note**: Currently, localization is handled by the separate `useLocalization` hook. See the [Localization Guide](../localization.md) for text translation needs.

## Next Steps

- [Token Serialization](./token-serialization.md)
- [Platform-Specific Tokens](./platform-specific-tokens.md)
- [Token Versioning](./token-versioning.md)