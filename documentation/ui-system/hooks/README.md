# Hooks Index

This document lists and describes all custom hooks available in the Xala UI System v5.0.0, with links to detailed guides for each.

---

## Core Provider Hooks

### Context Hooks (from UiProvider)
- **[useUi](./useUi.md)** 🆕: Access the complete UI context including theme, tokens, platform, and layout
- **[useTokens](./useTokens.md)**: Access current theme's design tokens (colors, spacing, typography, etc.)
- **[useTheme](./useTheme.md)** 🆕: Access and manage the current theme with setters
- **[usePlatform](./usePlatform.md)** 🆕: Detect current platform (web/mobile/desktop) and device type
- **[useLayout](./useLayout.md)** 🆕: Access and manage the current layout configuration
- **[useWhiteLabel](./useWhiteLabel.md)** 🆕: Access white label configuration for custom branding
- **[useSSR](./useSSR.md)** 🆕: Check SSR hydration state and server/client environment

### Utility Hooks
- **[useLocalization](./useLocalization.md)**: Access and switch the current locale, translate keys
- **[useThemeTransition](./useThemeTransition.md)** 🆕: Smooth theme switching with CSS transitions
- **[useComponent](./useComponent.md)** 🆕: Component-specific token resolution with variants
- **[useComponentVariant](./useComponentVariant.md)** 🆕: Resolve component variant tokens

### Media & Responsive Hooks
- **[useMediaQuery](./useMediaQuery.md)** 🆕: Responsive media query detection
- **[useResponsive](./useResponsive.md)** 🆕: Responsive value selection based on breakpoints
- **[useBreakpoint](./useBreakpoint.md)** 🆕: Current breakpoint detection

### Performance Hooks
- **[useDebounce](./useDebounce.md)** 🆕: Debounce values and callbacks
- **[useDebouncedCallback](./useDebouncedCallback.md)** 🆕: Create debounced callback functions
- **[useThrottle](./useThrottle.md)** 🆕: Throttle values for performance
- **[useLoadingTimeout](./useLoadingTimeout.md)** 🆕: Loading state management with timeouts

---

## Hook Categories

### 1. Provider Hooks
Hooks that connect to the UiProvider context and provide access to global UI state.

### 2. Token & Theme Hooks
Hooks for accessing and manipulating design tokens and themes.

### 3. Responsive Hooks
Hooks for building responsive interfaces that adapt to different screen sizes.

### 4. Utility Hooks
General-purpose hooks for common UI patterns and performance optimizations.

---

## Usage Example

```typescript
import { 
  useTokens, 
  useTheme, 
  useThemeTransition,
  useResponsive,
  useDebounce 
} from '@xala-technologies/ui-system/hooks';

function MyComponent() {
  // Access design tokens
  const tokens = useTokens();
  
  // Theme management
  const { theme, setTheme } = useTheme();
  const { transitionTheme } = useThemeTransition();
  
  // Responsive values
  const fontSize = useResponsive({
    base: tokens.typography.fontSize.sm,
    md: tokens.typography.fontSize.base,
    lg: tokens.typography.fontSize.lg
  });
  
  // Performance optimization
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  return (
    <div style={{ fontSize, color: tokens.colors.primary[500] }}>
      {/* Component content */}
    </div>
  );
}
```

---

All hooks are:
- ✅ Strictly typed with TypeScript
- ✅ SSR-compatible with hydration safety
- ✅ Following SOLID principles
- ✅ Accessible and compliant with Norwegian standards
- ✅ Optimized for performance
- ✅ Fully documented with examples
