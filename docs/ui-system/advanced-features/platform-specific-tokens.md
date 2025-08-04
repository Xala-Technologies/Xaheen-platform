# Platform-Specific Token Adjustments

The Platform-Specific Token System in UI System v5 provides intelligent token adaptation based on the user's platform, ensuring optimal visual consistency and native feel across different devices and operating systems.

## Overview

The platform token system provides:
- Automatic platform detection
- Platform-specific token overrides
- Responsive breakpoint adjustments
- Native UI pattern matching
- Performance optimizations per platform
- Accessibility enhancements
- Cross-platform testing utilities

## Platform Detection

### Automatic Detection

```typescript
import { usePlatform } from '@xala-technologies/ui-system/hooks';

function PlatformAwareComponent() {
  const platform = usePlatform();
  
  console.log(platform);
  // {
  //   os: 'ios' | 'android' | 'windows' | 'macos' | 'linux',
  //   type: 'mobile' | 'tablet' | 'desktop' | 'tv',
  //   browser: 'chrome' | 'safari' | 'firefox' | 'edge',
  //   touchEnabled: boolean,
  //   viewport: { width: number, height: number },
  //   pixelRatio: number
  // }
  
  return (
    <div>
      <p>Platform: {platform.os}</p>
      <p>Device: {platform.type}</p>
      <p>Touch: {platform.touchEnabled ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Manual Configuration

```typescript
<UiProvider
  platformConfig={{
    forcePlatform: 'ios', // Override detection
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024,
    desktopBreakpoint: 1440,
    tvBreakpoint: 1920
  }}
>
  {children}
</UiProvider>
```

## Platform Token Definitions

### 1. Mobile Platforms

```typescript
// iOS-specific tokens
const iosTokens = {
  spacing: {
    touchTarget: '44px', // iOS HIG minimum
    listItemHeight: '44px',
    tabBarHeight: '49px',
    navigationBarHeight: '44px'
  },
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'SF Pro Display', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'monospace']
    },
    fontSize: {
      // iOS Dynamic Type scale
      xs: '11px',
      sm: '13px',
      base: '17px', // iOS default
      lg: '20px',
      xl: '22px'
    }
  },
  animation: {
    duration: {
      fast: '200ms',
      normal: '350ms', // iOS standard
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // iOS easing
    }
  },
  effects: {
    blur: {
      subtle: 'blur(10px)',
      medium: 'blur(20px)',
      strong: 'blur(30px)'
    },
    vibrancy: {
      light: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(0, 0, 0, 0.7)'
    }
  }
};

// Android-specific tokens
const androidTokens = {
  spacing: {
    touchTarget: '48px', // Material Design minimum
    listItemHeight: '56px',
    appBarHeight: '56px',
    fabSize: '56px'
  },
  typography: {
    fontFamily: {
      sans: ['Roboto', 'system-ui', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace']
    },
    fontSize: {
      // Material Design type scale
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px'
    }
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms', // Material standard
      slow: '450ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material easing
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)'
    }
  },
  elevation: {
    // Material elevation levels
    0: 'none',
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
  }
};
```

### 2. Desktop Platforms

```typescript
// Windows-specific tokens
const windowsTokens = {
  spacing: {
    windowControls: '138px', // Space for min/max/close
    taskbarHeight: '40px',
    contextMenuPadding: '2px'
  },
  typography: {
    fontFamily: {
      sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      mono: ['Cascadia Code', 'Consolas', 'monospace']
    }
  },
  colors: {
    accent: '#0078d4', // Windows blue
    systemGray: {
      light: '#f3f3f3',
      medium: '#e5e5e5',
      dark: '#737373'
    }
  },
  effects: {
    acrylic: {
      light: 'rgba(255, 255, 255, 0.6)',
      dark: 'rgba(31, 31, 31, 0.6)'
    },
    mica: {
      light: 'rgba(243, 243, 243, 0.8)',
      dark: 'rgba(32, 32, 32, 0.8)'
    }
  }
};

// macOS-specific tokens
const macosTokens = {
  spacing: {
    windowControls: '72px', // Traffic lights
    menuBarHeight: '24px',
    sidebarWidth: '200px'
  },
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'SF Pro Display', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'monospace']
    }
  },
  effects: {
    vibrancy: {
      sidebar: 'var(--vibrancy-sidebar)',
      window: 'var(--vibrancy-window)',
      menu: 'var(--vibrancy-menu)'
    },
    backdrop: {
      blur: 'saturate(180%) blur(20px)'
    }
  }
};
```

### 3. Web Platform

```typescript
// Progressive Web App tokens
const pwaTokens = {
  spacing: {
    safeAreaInset: {
      top: 'env(safe-area-inset-top)',
      right: 'env(safe-area-inset-right)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)'
    },
    installBanner: '60px'
  },
  colors: {
    themeColor: '#0070f3',
    backgroundColor: '#ffffff'
  },
  manifest: {
    display: 'standalone',
    orientation: 'portrait',
    startUrl: '/'
  }
};
```

## Implementation

### 1. Platform-Specific Components

```typescript
import { PlatformView } from '@xala-technologies/ui-system/components';

function CrossPlatformButton({ onPress, children }) {
  return (
    <PlatformView>
      {/* iOS Implementation */}
      <PlatformView.IOS>
        <TouchableOpacity 
          style={styles.iosButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.iosButtonText}>{children}</Text>
        </TouchableOpacity>
      </PlatformView.IOS>
      
      {/* Android Implementation */}
      <PlatformView.Android>
        <TouchableRipple
          style={styles.androidButton}
          onPress={onPress}
          rippleColor="rgba(0, 0, 0, 0.12)"
        >
          <Text style={styles.androidButtonText}>{children}</Text>
        </TouchableRipple>
      </PlatformView.Android>
      
      {/* Web Implementation */}
      <PlatformView.Web>
        <button 
          className="web-button"
          onClick={onPress}
        >
          {children}
        </button>
      </PlatformView.Web>
    </PlatformView>
  );
}
```

### 2. Responsive Token System

```typescript
import { useResponsiveTokens } from '@xala-technologies/ui-system/hooks';

function ResponsiveComponent() {
  const tokens = useResponsiveTokens();
  
  // Tokens automatically adjust based on viewport
  return (
    <div style={{
      padding: tokens.spacing.container, // 16px mobile, 24px tablet, 32px desktop
      fontSize: tokens.typography.fontSize.body, // 14px mobile, 16px desktop
      gap: tokens.spacing.gap // 8px mobile, 16px desktop
    }}>
      <h1 style={{ fontSize: tokens.typography.fontSize.heading }}>
        Responsive Heading
      </h1>
    </div>
  );
}
```

### 3. Platform Token Overrides

```typescript
const platformTokens = {
  base: baseTokens,
  overrides: {
    ios: {
      spacing: { touchTarget: '44px' },
      animation: { duration: { default: '350ms' } }
    },
    android: {
      spacing: { touchTarget: '48px' },
      animation: { duration: { default: '300ms' } }
    },
    desktop: {
      spacing: { touchTarget: '32px' },
      animation: { duration: { default: '200ms' } }
    }
  }
};

// Usage
<UiProvider tokens={platformTokens}>
  {children}
</UiProvider>
```

## Advanced Features

### 1. Feature Detection

```typescript
import { useFeatureDetection } from '@xala-technologies/ui-system/hooks';

function FeatureAwareComponent() {
  const features = useFeatureDetection();
  
  return (
    <div>
      {features.touchEvents && (
        <SwipeableList />
      )}
      
      {features.pointerEvents && (
        <HoverCard />
      )}
      
      {features.webGL && (
        <Canvas3D />
      )}
      
      {features.serviceWorker && (
        <OfflineIndicator />
      )}
    </div>
  );
}
```

### 2. Performance Optimizations

```typescript
// Platform-specific performance settings
const performanceConfig = {
  mobile: {
    animations: {
      reduced: true, // Simpler animations
      gpu: true,     // Force GPU acceleration
      willChange: ['transform', 'opacity']
    },
    images: {
      lazy: true,
      format: 'webp',
      sizes: [320, 640, 750]
    }
  },
  desktop: {
    animations: {
      reduced: false,
      gpu: true,
      willChange: ['transform', 'opacity', 'filter']
    },
    images: {
      lazy: true,
      format: 'avif',
      sizes: [1920, 2560, 3840]
    }
  }
};
```

### 3. Native Bridge Integration

```typescript
// React Native integration
import { NativeModules } from 'react-native';

const platformBridge = {
  ios: {
    hapticFeedback: (type: 'light' | 'medium' | 'heavy') => {
      NativeModules.HapticFeedback?.trigger(type);
    },
    statusBar: (style: 'light' | 'dark') => {
      NativeModules.StatusBar?.setStyle(style);
    }
  },
  android: {
    vibrate: (duration: number) => {
      NativeModules.Vibration?.vibrate(duration);
    },
    navigationBar: (color: string) => {
      NativeModules.NavigationBar?.setColor(color);
    }
  }
};
```

### 4. Accessibility Enhancements

```typescript
const accessibilityTokens = {
  ios: {
    voiceOver: {
      announceDelay: '100ms',
      focusRingWidth: '2px',
      focusRingColor: '#007AFF'
    }
  },
  android: {
    talkBack: {
      announceDelay: '150ms',
      focusIndicatorWidth: '3px',
      focusIndicatorColor: '#4CAF50'
    }
  },
  desktop: {
    screenReader: {
      announceDelay: '50ms',
      focusOutlineWidth: '2px',
      focusOutlineStyle: 'dotted'
    }
  }
};
```

## Platform Testing

### 1. Cross-Platform Test Suite

```typescript
import { renderOnPlatform } from '@xala-technologies/ui-system/test-utils';

describe('Cross-platform rendering', () => {
  const platforms = ['ios', 'android', 'web'];
  
  platforms.forEach(platform => {
    it(`renders correctly on ${platform}`, () => {
      const { container } = renderOnPlatform(
        <App />,
        { platform }
      );
      
      expect(container).toMatchSnapshot(`app-${platform}`);
    });
  });
});
```

### 2. Platform-Specific Assertions

```typescript
import { expectPlatformStyles } from '@xala-technologies/ui-system/test-utils';

test('touch targets meet platform guidelines', () => {
  const { getByRole } = renderOnPlatform(<Button />, { platform: 'ios' });
  const button = getByRole('button');
  
  expectPlatformStyles(button).toHaveMinHeight('44px'); // iOS minimum
});

test('material elevation on Android', () => {
  const { getByTestId } = renderOnPlatform(<Card />, { platform: 'android' });
  const card = getByTestId('card');
  
  expectPlatformStyles(card).toHaveBoxShadow(
    expect.stringContaining('rgba(0,0,0,0.23)')
  );
});
```

### 3. Responsive Testing

```typescript
import { testResponsiveTokens } from '@xala-technologies/ui-system/test-utils';

test('tokens respond to viewport changes', () => {
  const results = testResponsiveTokens({
    viewports: [320, 768, 1024, 1440],
    tokens: ['spacing.container', 'typography.fontSize.heading']
  });
  
  expect(results).toEqual({
    320: { 'spacing.container': '16px', 'typography.fontSize.heading': '24px' },
    768: { 'spacing.container': '24px', 'typography.fontSize.heading': '32px' },
    1024: { 'spacing.container': '32px', 'typography.fontSize.heading': '40px' },
    1440: { 'spacing.container': '40px', 'typography.fontSize.heading': '48px' }
  });
});
```

## Platform Deployment

### 1. Build Configuration

```typescript
// webpack.config.js
module.exports = {
  // Platform-specific bundles
  entry: {
    'app.ios': './src/index.ios.js',
    'app.android': './src/index.android.js',
    'app.web': './src/index.web.js'
  },
  
  // Platform-specific optimizations
  optimization: {
    splitChunks: {
      cacheGroups: {
        iosVendor: {
          test: /[\\/]node_modules[\\/].*ios/,
          name: 'vendor.ios',
          chunks: 'all'
        },
        androidVendor: {
          test: /[\\/]node_modules[\\/].*android/,
          name: 'vendor.android',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 2. Platform Detection Script

```html
<!-- index.html -->
<script>
  // Early platform detection for optimal loading
  (function() {
    const ua = navigator.userAgent;
    const platform = /iPhone|iPad|iPod/.test(ua) ? 'ios' :
                    /Android/.test(ua) ? 'android' :
                    /Windows/.test(ua) ? 'windows' :
                    /Mac/.test(ua) ? 'macos' : 'web';
    
    document.documentElement.setAttribute('data-platform', platform);
    
    // Load platform-specific styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/styles/${platform}.css`;
    document.head.appendChild(link);
  })();
</script>
```

## Best Practices

### 1. Progressive Enhancement

```typescript
// Start with base functionality, enhance for platforms
function EnhancedComponent() {
  const platform = usePlatform();
  const [enhanced, setEnhanced] = useState(false);
  
  useEffect(() => {
    // Progressive enhancement after mount
    if (platform.touchEnabled) {
      import('./TouchEnhancements').then(module => {
        module.enhance();
        setEnhanced(true);
      });
    }
  }, [platform]);
  
  return (
    <div className={enhanced ? 'enhanced' : 'base'}>
      {/* Core functionality works everywhere */}
    </div>
  );
}
```

### 2. Platform Feature Flags

```typescript
const features = {
  ios: {
    swipeToDelete: true,
    pullToRefresh: true,
    hapticFeedback: true
  },
  android: {
    swipeToDelete: true,
    pullToRefresh: true,
    floatingActionButton: true
  },
  web: {
    rightClick: true,
    hover: true,
    keyboardShortcuts: true
  }
};

function useFeatureFlag(feature: string): boolean {
  const platform = usePlatform();
  return features[platform.os]?.[feature] ?? false;
}
```

### 3. Performance Budgets

```typescript
const performanceBudgets = {
  mobile: {
    bundleSize: 150, // KB
    firstPaint: 1500, // ms
    interactive: 3000 // ms
  },
  desktop: {
    bundleSize: 300, // KB
    firstPaint: 1000, // ms
    interactive: 2000 // ms
  }
};
```

## Migration Guide

### From Fixed to Platform-Adaptive

```typescript
// Before: Fixed values
const styles = {
  button: {
    height: '40px',
    fontSize: '16px'
  }
};

// After: Platform-adaptive
const styles = {
  button: {
    height: tokens.spacing.touchTarget, // 44px iOS, 48px Android, 36px web
    fontSize: tokens.typography.fontSize.base // Platform-optimized
  }
};
```

## Future Integration: Localization

Platform-specific tokens currently focus on visual and interaction patterns. Text content and translations are handled by the separate localization system. However, future integration possibilities include:

### Platform + Locale Combinations

1. **Mobile Platform Localization**
   ```typescript
   // Future: Platform and locale aware tokens
   const platformLocaleTokens = {
     'ios-ar': {
       typography: {
         textAlign: 'right',
         fontFamily: { sans: ['-apple-system-arabic', 'Arial'] }
       }
     },
     'android-zh': {
       typography: {
         fontSize: { base: '16px' }, // Larger for Chinese on mobile
         lineHeight: { base: 1.6 }
       }
     }
   };
   ```

2. **Locale-Specific Platform Adjustments**
   - Touch target sizes for different language text lengths
   - Platform-specific font stacks per locale
   - RTL layout adjustments for mobile vs desktop

3. **Content Adaptation**
   - Platform-specific copy (handled by localization)
   - Locale-aware spacing for text expansion
   - Dynamic layout adjustments based on text length

**Note**: Text translations and copy variations are managed through the `useLocalization` hook. See the [Localization Guide](../localization.md) for implementation details.

## Next Steps

- [Testing Token Systems](./testing-tokens.md)
- [Token Migration Strategies](./token-migration.md)
- [Performance Optimization](./performance-tokens.md)