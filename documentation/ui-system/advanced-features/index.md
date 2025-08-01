# Advanced Features Documentation

Welcome to the comprehensive documentation for UI System v5's advanced features. This section covers the sophisticated capabilities that make our token system enterprise-ready and future-proof.

## 📚 Documentation Overview

### Core Systems

1. **[Theme Switching with Transitions](./theme-switching.md)**
   - Smooth CSS transitions between themes
   - Prefers-color-scheme detection
   - Local storage persistence
   - SSR-safe implementation
   - Custom transition timing and easing

2. **[White Label Configuration](./white-label-configuration.md)**
   - Industry-specific templates
   - Complete brand customization
   - Multi-tenant support
   - Runtime theme switching
   - Import/export functionality

3. **[Token Serialization](./token-serialization.md)**
   - Multiple format support (JSON, YAML, TOML, Binary)
   - Compression and optimization
   - Format conversion utilities
   - Cross-platform compatibility
   - Incremental updates

4. **[Token Versioning](./token-versioning.md)**
   - Semantic versioning support
   - Version history tracking
   - Breaking change detection
   - Migration utilities
   - Rollback capabilities

5. **[Token Diffing](./token-diffing.md)**
   - Deep object comparison
   - Visual diff generation
   - Change categorization
   - Impact analysis
   - Merge conflict resolution

6. **[Platform-Specific Tokens](./platform-specific-tokens.md)**
   - Automatic platform detection
   - Native UI pattern matching
   - Responsive breakpoint adjustments
   - Performance optimizations
   - Cross-platform testing

## 🚀 Quick Start Guide

### Setting Up Advanced Features

```typescript
import { UiProvider } from '@xala-technologies/ui-system';
import { healthcareTemplate } from '@xala-technologies/ui-system/config/white-label-templates';

function App() {
  return (
    <UiProvider
      // White label configuration
      whiteLabelConfig={healthcareTemplate}
      
      // Theme transitions
      themeTransitionConfig={{
        duration: 300,
        easing: 'ease-out',
        respectMotionPreference: true
      }}
      
      // Platform-specific adjustments
      platformConfig={{
        mobileBreakpoint: 768,
        enablePlatformDetection: true
      }}
      
      // Version management
      tokenVersion="2.0.0"
      
      // Enable all advanced features
      enableAdvancedFeatures={true}
    >
      {children}
    </UiProvider>
  );
}
```

## 🎯 Feature Matrix

| Feature | Purpose | Key Benefits |
|---------|---------|--------------|
| **Theme Switching** | Smooth visual transitions | Enhanced UX, reduced jarring |
| **White Label** | Brand customization | Multi-tenant, brand consistency |
| **Serialization** | Import/export tokens | Tool integration, sharing |
| **Versioning** | Change management | Safe updates, rollbacks |
| **Diffing** | Change detection | Impact analysis, debugging |
| **Platform Tokens** | Native feel | Cross-platform consistency |

## 💡 Common Use Cases

### 1. Enterprise Multi-Brand Setup

```typescript
// Corporate brand family
const brands = {
  main: mainBrandConfig,
  subsidiary1: subsidiary1Config,
  subsidiary2: subsidiary2Config
};

// Dynamic brand switching
function BrandSelector() {
  const { setWhiteLabelConfig } = useWhiteLabel();
  
  return (
    <select onChange={(e) => setWhiteLabelConfig(brands[e.target.value])}>
      <option value="main">Main Brand</option>
      <option value="subsidiary1">Subsidiary 1</option>
      <option value="subsidiary2">Subsidiary 2</option>
    </select>
  );
}
```

### 2. Design System Evolution

```typescript
// Track token changes over time
const evolution = await analyzeTokenEvolution({
  from: 'v1.0.0',
  to: 'v2.0.0',
  repository: './tokens'
});

// Generate migration guide
const guide = createMigrationGuide(evolution);

// Validate backwards compatibility
const compatibility = validateCompatibility(evolution);
```

### 3. Cross-Platform Application

```typescript
// Platform-aware component
function AdaptiveButton({ onPress, children }) {
  const platform = usePlatform();
  const tokens = useTokens();
  
  return (
    <Button
      style={{
        minHeight: tokens.spacing.touchTarget,
        ...platform.styles.button
      }}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
```

## 🔧 Configuration Examples

### Complete Advanced Configuration

```typescript
const advancedConfig = {
  // White label setup
  whiteLabel: {
    template: 'healthcare',
    overrides: {
      colors: { primary: '#0066cc' },
      typography: { fontFamily: { sans: 'Inter' } }
    }
  },
  
  // Theme transitions
  transitions: {
    enabled: true,
    duration: 250,
    properties: ['color', 'background-color', 'border-color']
  },
  
  // Versioning
  versioning: {
    current: '2.0.0',
    compatibility: '^2.0.0',
    autoMigrate: true
  },
  
  // Platform detection
  platforms: {
    detect: true,
    overrides: {
      ios: { spacing: { touchTarget: '44px' } },
      android: { spacing: { touchTarget: '48px' } }
    }
  },
  
  // Serialization
  serialization: {
    format: 'json',
    compression: true,
    validation: 'strict'
  }
};
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   ```typescript
   // Load advanced features on demand
   const { WhiteLabelManager } = await import('./advanced/white-label');
   ```

2. **Caching**
   ```typescript
   // Cache token computations
   const tokenCache = new Map();
   ```

3. **Debouncing**
   ```typescript
   // Debounce theme switches
   const debouncedSetTheme = debounce(setTheme, 100);
   ```

## 🧪 Testing Advanced Features

### Comprehensive Test Suite

```typescript
import { 
  testThemeTransitions,
  testWhiteLabelConfig,
  testTokenVersioning,
  testPlatformDetection 
} from '@xala-technologies/ui-system/test-utils';

describe('Advanced Features', () => {
  test('theme transitions work smoothly', async () => {
    const result = await testThemeTransitions({
      from: 'light',
      to: 'dark',
      duration: 300
    });
    expect(result.smooth).toBe(true);
  });
  
  test('white label applies correctly', () => {
    const result = testWhiteLabelConfig(customConfig);
    expect(result.valid).toBe(true);
  });
  
  test('version compatibility maintained', () => {
    const result = testTokenVersioning({
      from: '1.0.0',
      to: '1.1.0'
    });
    expect(result.compatible).toBe(true);
  });
  
  test('platform detection accurate', () => {
    const result = testPlatformDetection();
    expect(result.platform).toBeDefined();
  });
});
```

## 🚨 Common Pitfalls

1. **Over-customization**
   - Keep modifications minimal and purposeful
   - Test across all platforms

2. **Version conflicts**
   - Always test migrations
   - Maintain compatibility matrices

3. **Performance impact**
   - Monitor transition performance
   - Optimize platform-specific code

## 🌐 Localization

Localization (i18n) is maintained as a **separate system** from the token transformation pipeline:

- **Current Implementation**: Basic `useLocalization` hook for text translations
- **Supported Languages**: English, Norwegian Bokmål, French, Arabic
- **Documentation**: [Localization Guide](../localization.md) and [useLocalization Hook](../hooks/useLocalization.md)

### Why Separate?

1. **Different Concerns**: Tokens handle visual design; localization handles content
2. **Independent Evolution**: Each system can evolve without affecting the other
3. **Clear Boundaries**: Easier to understand and maintain

### Future Integration Possibilities

While currently separate, future versions may introduce:
- Locale-specific token overrides (typography for RTL languages)
- Platform + locale combinations
- White label + locale configurations

## 📖 Related Documentation

- [Token Transformers](../token-transformers/) - Core transformation pipeline
- [Component Documentation](../components/) - Component-specific tokens
- [Getting Started](../getting-started.md) - Basic setup guide
- [Architecture](../v5-architecture.md) - System architecture
- [Localization Guide](../localization.md) - Text translation system

## 🆘 Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Transitions flickering | Check CSS specificity and `will-change` |
| Platform detection fails | Verify user agent and feature detection |
| Version migration errors | Run validation before migration |
| White label not applying | Check config structure and overrides |

## 🎓 Learning Path

1. Start with [Theme Switching](./theme-switching.md) for visual polish
2. Move to [White Label Configuration](./white-label-configuration.md) for branding
3. Learn [Token Versioning](./token-versioning.md) for change management
4. Master [Token Diffing](./token-diffing.md) for debugging
5. Implement [Platform-Specific Tokens](./platform-specific-tokens.md) for native feel

## 💬 Community and Support

- **GitHub Discussions**: Share your advanced feature implementations
- **Discord**: Join our community for real-time help
- **Examples Repository**: See advanced features in action

---

**Note**: These advanced features are designed for enterprise-scale applications. For simpler use cases, the basic token system may be sufficient.