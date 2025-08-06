# Platform Test Suite

Comprehensive testing suite for the Xaheen Design System's universal component platform implementations.

## Overview

This test suite ensures that all components work consistently across **10 supported platforms** with full accessibility compliance, performance optimization, and platform-specific feature support.

### Supported Platforms

| Platform | Type | Key Features | Tests |
|----------|------|--------------|-------|
| **React** | Web Framework | Virtual DOM, Hooks, JSX | ✅ Core Components |
| **Vue** | Web Framework | Composition API, Reactivity | ✅ Core Components |
| **Angular** | Web Framework | Dependency Injection, RxJS | ✅ Core Components |
| **Svelte** | Web Framework | Compile-time optimization | ✅ Core Components |
| **React Native** | Mobile Framework | Native mobile components | ✅ Mobile-specific |
| **Radix** | Headless Library | Unstyled primitives | ✅ Accessibility |
| **Headless UI** | Headless Library | Focus/state management | ✅ Advanced A11Y |
| **Vanilla** | Web Components | Shadow DOM, Custom Elements | ✅ Native Web APIs |
| **Electron** | Desktop | Native OS integration | ✅ Desktop features |
| **Ionic** | Mobile Hybrid | Cross-platform mobile | ✅ Mobile gestures |

## Test Structure

```
tests/
├── index.ts                      # Test suite configuration
├── test-utils.ts                 # Shared testing utilities
├── platform-compatibility.test.ts # Cross-platform compatibility
├── electron-platform.test.ts     # Electron-specific tests
├── vanilla-platform.test.ts      # Web Components tests
├── ionic-platform.test.ts        # Ionic mobile tests
├── headless-ui-platform.test.ts  # Headless UI tests
└── README.md                     # This file
```

## Test Categories

### 1. **Component Rendering** 
- ✅ Basic rendering with default props
- ✅ Custom className application
- ✅ Children content rendering
- ✅ Variant and size combinations
- ✅ State management (loading, disabled)

### 2. **Platform-Specific Features**
- **Electron**: Native menus, keyboard shortcuts, window controls, haptic feedback
- **Ionic**: Mobile gestures, haptic feedback, platform adaptation
- **Vanilla**: Shadow DOM, custom elements, form participation
- **Headless UI**: Polymorphic rendering, focus management, data attributes

### 3. **Accessibility Compliance**
- ✅ WCAG AA/AAA compliance (platform dependent)
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA attributes
- ✅ High contrast mode support

### 4. **Event Handling**
- ✅ Click events
- ✅ Keyboard events (Enter, Space, Tab, Escape)
- ✅ Touch events (mobile platforms)
- ✅ Gesture recognition (Ionic)
- ✅ Custom event dispatching

### 5. **Theme Integration**
- ✅ CSS custom properties
- ✅ Platform-specific theming systems
- ✅ Dark/light mode support
- ✅ Token conversion
- ✅ Responsive design

### 6. **Performance**
- ✅ Render time benchmarks
- ✅ Bundle size tracking
- ✅ Memory usage monitoring
- ✅ Event listener cleanup
- ✅ State change efficiency

## Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure all platform dependencies are available
pnpm install @ionic/react @headlessui/react electron
```

### Run All Tests

```bash
# Run complete test suite
pnpm test

# Run with coverage
pnpm test --coverage

# Run in watch mode
pnpm test --watch
```

### Run Platform-Specific Tests

```bash
# Electron platform tests
pnpm test electron-platform

# Ionic platform tests  
pnpm test ionic-platform

# Vanilla Web Components tests
pnpm test vanilla-platform

# Headless UI tests
pnpm test headless-ui-platform

# Cross-platform compatibility
pnpm test platform-compatibility
```

### Run Component-Specific Tests

```bash
# Test button across all platforms
pnpm test --grep "Button"

# Test accessibility across all platforms
pnpm test --grep "Accessibility"

# Test performance benchmarks
pnpm test --grep "Performance"
```

## Test Configuration

The test suite uses a comprehensive configuration matrix defined in `index.ts`:

```typescript
const TEST_CONFIG = {
  platforms: [
    'react', 'vue', 'angular', 'svelte', 'react-native',
    'radix', 'headless-ui', 'vanilla', 'electron', 'ionic'
  ],
  coreComponents: ['button', 'input', 'card', 'select', 'textarea'],
  performanceThresholds: {
    renderTime: { /* platform-specific ms limits */ },
    bundleSize: { /* platform-specific KB limits */ }
  },
  accessibilityLevels: { /* WCAG compliance per platform */ }
}
```

## Test Utilities

### Mock Environments

Each platform has dedicated mock setups:

```typescript
// Electron mocks
setupElectronEnvironment() // Mocks electronAPI
cleanupElectronEnvironment()

// Ionic mocks  
setupIonicEnvironment() // Mocks Haptics API
cleanupIonicEnvironment()

// Vanilla mocks
setupVanillaEnvironment() // Mocks customElements
cleanupVanillaEnvironment()
```

### Accessibility Helpers

```typescript
// Test keyboard navigation
await accessibilityTestHelpers.testKeyboardNavigation(element)

// Verify ARIA attributes
accessibilityTestHelpers.testAriaAttributes(element, expectedAttrs)

// Test focus management
await accessibilityTestHelpers.testFocusManagement(element)
```

### Performance Helpers

```typescript
// Benchmark render time
await performanceTestHelpers.testRenderPerformance(component, threshold)

// Test memory usage
performanceTestHelpers.testMemoryUsage(component)

// Validate bundle size
performanceTestHelpers.testBundleSize(modulePath, expectedKB)
```

### Common Test Patterns

```typescript
// Test component variants
commonTestPatterns.testVariants(Component, variantConfigs)

// Test component props
commonTestPatterns.testProps(Component, propTests)

// Test event handling
commonTestPatterns.testEventHandling(Component, eventTests)
```

## Platform-Specific Test Details

### Electron Platform Tests

**File**: `electron-platform.test.ts`

**Key Features Tested**:
- ✅ Native context menus (`nativeContextMenu`)
- ✅ Global keyboard shortcuts (`shortcut` prop)
- ✅ Platform-specific styling (macOS, Windows, Linux)
- ✅ Sound feedback (`soundFeedback`)
- ✅ Electron API integration
- ✅ Window controls (minimize, maximize, close)

**Example Test**:
```typescript
it('should handle native context menu', async () => {
  const contextMenuItems = [
    { label: 'Copy', onClick: vi.fn(), shortcut: 'Ctrl+C' }
  ];

  render(
    <ElectronButton nativeContextMenu contextMenuItems={contextMenuItems}>
      Right-click me
    </ElectronButton>
  );

  await user.pointer({ keys: '[MouseRight]', target: button });
  expect(mockElectronAPI.showContextMenu).toHaveBeenCalled();
});
```

### Vanilla Platform Tests

**File**: `vanilla-platform.test.ts`

**Key Features Tested**:
- ✅ Custom element registration
- ✅ Shadow DOM creation and isolation
- ✅ Form participation and validation
- ✅ CSS parts for theming
- ✅ Custom event dispatching
- ✅ Attribute/property synchronization

**Example Test**:
```typescript
it('should create shadow DOM', () => {
  expect(buttonElement.shadowRoot).toBeDefined();
  expect(buttonElement.shadowRoot).not.toBeNull();
});

it('should use CSS parts for styling', () => {
  const shadowButton = buttonElement.shadowRoot.querySelector('button[part="button"]');
  expect(shadowButton).toBeDefined();
});
```

### Ionic Platform Tests

**File**: `ionic-platform.test.ts`

**Key Features Tested**:
- ✅ Haptic feedback integration
- ✅ Mobile gesture support
- ✅ Platform adaptation (iOS/Android)
- ✅ Ionic component integration
- ✅ Touch target optimization
- ✅ FAB, Segment, and Tab variants

**Example Test**:
```typescript
it('should trigger haptic feedback on click', async () => {
  render(<IonicButton haptic="medium">Haptic Button</IonicButton>);
  
  await user.click(screen.getByRole('button'));
  expect(mockHaptics.impact).toHaveBeenCalledWith({ style: 'medium' });
});
```

### Headless UI Platform Tests

**File**: `headless-ui-platform.test.ts`

**Key Features Tested**:
- ✅ Polymorphic rendering (`render` prop)
- ✅ Data attribute styling patterns
- ✅ Focus management
- ✅ State management patterns
- ✅ Composition with other Headless UI components
- ✅ Toggle, Menu, and Group variants

**Example Test**:
```typescript
it('should render as different elements', () => {
  render(<HeadlessButton render="a" href="/home">Link</HeadlessButton>);
  
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', '/home');
});
```

## Performance Benchmarks

### Render Time Thresholds (milliseconds)

| Platform | Target | Threshold |
|----------|--------|-----------|
| Vanilla | 10ms | Fastest (no framework) |
| Svelte | 14ms | Compile-time optimized |
| React | 16ms | Standard 60fps budget |
| Headless UI | 16ms | React-based |
| Vue | 18ms | Reactive updates |
| Radix | 18ms | Unstyled primitives |
| Electron | 20ms | Desktop overhead |
| Angular | 22ms | Change detection |
| Ionic | 25ms | Mobile optimization |
| React Native | 30ms | Bridge overhead |

### Bundle Size Thresholds (KB gzipped)

| Platform | Target | Reason |
|----------|--------|--------|
| Vanilla | 5kb | No framework dependencies |
| Svelte | 10kb | Compiler output |
| Headless UI | 12kb | Minimal runtime |
| React | 15kb | React + component |
| Radix | 16kb | Primitive components |
| Vue | 18kb | Vue runtime |
| React Native | 20kb | Platform abstractions |
| Electron | 25kb | Desktop APIs |
| Angular | 30kb | Framework features |
| Ionic | 35kb | Mobile framework |

## Accessibility Compliance

### WCAG Levels by Platform

| Platform | Level | Reason |
|----------|-------|--------|
| **Headless UI** | AAA | Accessibility-first design |
| **Vanilla** | AAA | Direct Web API control |
| **Radix** | AAA | Built for accessibility |
| **React** | AA | Standard compliance |
| **Vue** | AA | Framework accessibility |
| **Angular** | AA | Enterprise standard |
| **Svelte** | AA | Modern framework |
| **Electron** | AA | Desktop accessibility APIs |
| **Ionic** | AA | Mobile accessibility |
| **React Native** | A | Mobile limitations |

### Accessibility Test Coverage

- ✅ **Keyboard Navigation**: Tab, Enter, Space, Arrow keys
- ✅ **Screen Readers**: ARIA labels, descriptions, live regions  
- ✅ **Focus Management**: Visible indicators, logical order
- ✅ **Color Contrast**: High contrast mode support
- ✅ **Motor Disabilities**: Touch targets, reduced motion
- ✅ **Cognitive Disabilities**: Clear labeling, error messages

## Contributing

### Adding New Platform Tests

1. **Create platform test file**:
   ```typescript
   // tests/new-platform.test.ts
   import { platformTestRunner } from './test-utils';
   
   platformTestRunner.runNewPlatformTests(() => {
     describe('NewPlatform Component', () => {
       // Your tests here
     });
   });
   ```

2. **Add platform to configuration**:
   ```typescript
   // tests/index.ts
   const TEST_CONFIG = {
     platforms: [...existing, 'new-platform'],
     // Add performance thresholds, accessibility levels, etc.
   }
   ```

3. **Create platform-specific mocks**:
   ```typescript
   // tests/test-utils.ts
   export const setupNewPlatformEnvironment = () => {
     // Platform-specific setup
   };
   ```

### Adding New Component Tests

1. **Add to core components** (if universal):
   ```typescript
   coreComponents: [...existing, 'new-component']
   ```

2. **Add to platform components** (if platform-specific):
   ```typescript
   platformComponents: {
     'platform-name': [...existing, 'new-component']
   }
   ```

3. **Create component test suite**:
   ```typescript
   describe('NewComponent', () => {
     commonTestPatterns.testVariants(NewComponent, variants);
     commonTestPatterns.testProps(NewComponent, props);
     commonTestPatterns.testEventHandling(NewComponent, events);
   });
   ```

## Continuous Integration

### Test Pipeline

```yaml
# .github/workflows/test.yml
- name: Run Platform Tests
  run: |
    pnpm test:platforms
    pnpm test:accessibility  
    pnpm test:performance
    pnpm test:compatibility
```

### Coverage Requirements

- **Code Coverage**: ≥ 90%
- **Platform Coverage**: 100% (all platforms tested)
- **Component Coverage**: 100% (all components tested)  
- **Feature Coverage**: ≥ 95% (platform-specific features)
- **Accessibility Coverage**: 100% (WCAG compliance)

## Troubleshooting

### Common Issues

**1. Platform-specific dependencies not found**
```bash
# Install missing dependencies
pnpm install @ionic/react @headlessui/react electron
```

**2. Tests timeout on CI**
```bash
# Increase timeout for slower environments
pnpm test --timeout 10000
```

**3. Mock API failures**
```typescript
// Ensure proper cleanup
afterEach(() => {
  cleanupAllEnvironments();
});
```

**4. Accessibility test failures**
```typescript
// Check ARIA attribute expectations
expect(element).toHaveAttribute('aria-label');
expect(element).toHaveAttribute('role', 'button');
```

### Performance Issues

**1. Slow test execution**
- Use `--parallel` flag for concurrent test execution
- Implement test sharding for large test suites
- Use `--bail` to stop on first failure during development

**2. Memory leaks in tests**
- Ensure proper cleanup in `afterEach` hooks
- Mock heavy dependencies
- Use `--detectLeaks` flag to identify leaks

## License

MIT License - See [LICENSE](../../../../LICENSE) for details.

---

**🚀 Happy Testing!** This comprehensive test suite ensures rock-solid reliability across all platforms while maintaining excellent developer experience.