# useThemeTransition Hook

The `useThemeTransition` hook provides smooth, animated theme switching with customizable CSS transitions. It manages the transition state and provides utilities for creating visually appealing theme changes.

## Import

```typescript
import { useThemeTransition } from '@xala-technologies/ui-system/hooks';
```

## Syntax

```typescript
const {
  transitionTheme,
  isTransitioning,
  transitionState,
  cancelTransition,
  getTransitionStyles
} = useThemeTransition(options);
```

## Parameters

### `options` (optional)
Configuration object for theme transitions:

```typescript
interface ThemeTransitionOptions {
  duration?: number;              // Transition duration in ms (default: 300)
  easing?: string;               // CSS easing function (default: 'ease-in-out')
  properties?: string[];         // CSS properties to transition
  disableTransitions?: boolean;  // Disable transitions entirely
  onTransitionStart?: (from: string, to: string) => void;
  onTransitionEnd?: (theme: string) => void;
}
```

## Return Value

The hook returns an object with:

### `transitionTheme`
```typescript
(theme: string) => Promise<void>
```
Function to transition to a new theme with animation.

### `isTransitioning`
```typescript
boolean
```
Whether a theme transition is currently in progress.

### `transitionState`
```typescript
{
  isTransitioning: boolean;
  fromTheme: string | null;
  toTheme: string | null;
  progress: number; // 0-1
}
```
Detailed transition state information.

### `cancelTransition`
```typescript
() => void
```
Cancel the current transition and immediately apply the target theme.

### `getTransitionStyles`
```typescript
() => React.CSSProperties
```
Get CSS properties to apply transition effects to elements.

## Examples

### Basic Theme Switching

```typescript
function ThemeToggle() {
  const { theme } = useTheme();
  const { transitionTheme, isTransitioning } = useThemeTransition();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    transitionTheme(newTheme);
  };

  return (
    <button 
      onClick={toggleTheme}
      disabled={isTransitioning}
    >
      {isTransitioning ? 'Switching...' : `Switch to ${theme === 'light' ? 'dark' : 'light'}`}
    </button>
  );
}
```

### Custom Transition Configuration

```typescript
function CustomThemeSwitch() {
  const { transitionTheme } = useThemeTransition({
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['background-color', 'color', 'border-color', 'box-shadow'],
    onTransitionStart: (from, to) => {
      console.log(`Starting transition from ${from} to ${to}`);
    },
    onTransitionEnd: (theme) => {
      console.log(`Transition complete: ${theme}`);
    }
  });

  return (
    <div>
      <button onClick={() => transitionTheme('dark')}>Dark Theme</button>
      <button onClick={() => transitionTheme('light')}>Light Theme</button>
      <button onClick={() => transitionTheme('high-contrast')}>High Contrast</button>
    </div>
  );
}
```

### Using Transition Styles

```typescript
function ThemedCard() {
  const { getTransitionStyles } = useThemeTransition({
    duration: 400,
    properties: ['background-color', 'color', 'transform']
  });

  return (
    <div 
      className="p-6 rounded-lg"
      style={getTransitionStyles()}
    >
      <h2>Themed Content</h2>
      <p>This card smoothly transitions when the theme changes.</p>
    </div>
  );
}
```

### Theme Selector with Presets

```typescript
import { themeTransitionPresets } from '@xala-technologies/ui-system/hooks';

function ThemeSelector() {
  const { theme } = useTheme();
  const [transitionPreset, setTransitionPreset] = useState('smooth');
  
  const { transitionTheme, isTransitioning } = useThemeTransition(
    themeTransitionPresets[transitionPreset]
  );

  const themes = ['light', 'dark', 'sepia', 'high-contrast'];

  return (
    <div>
      <select 
        value={transitionPreset} 
        onChange={(e) => setTransitionPreset(e.target.value)}
      >
        <option value="smooth">Smooth</option>
        <option value="instant">Instant</option>
        <option value="bounce">Bounce</option>
        <option value="fade">Fade</option>
      </select>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => transitionTheme(t)}
            disabled={isTransitioning || theme === t}
            className={`p-2 rounded ${theme === t ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Progress Indicator

```typescript
function ThemeTransitionProgress() {
  const { transitionState, transitionTheme } = useThemeTransition({
    duration: 1000
  });

  return (
    <div>
      <button onClick={() => transitionTheme('dark')}>
        Switch Theme
      </button>
      
      {transitionState.isTransitioning && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-full bg-blue-500 rounded transition-all"
              style={{ width: `${transitionState.progress * 100}%` }}
            />
          </div>
          <p className="text-sm mt-2">
            Transitioning from {transitionState.fromTheme} to {transitionState.toTheme}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Transition Presets

The hook comes with built-in transition presets:

```typescript
export const themeTransitionPresets = {
  instant: {
    duration: 0,
    disableTransitions: true
  },
  fast: {
    duration: 150,
    easing: 'ease-out'
  },
  smooth: {
    duration: 300,
    easing: 'ease-in-out',
    properties: ['background-color', 'color', 'border-color', 'box-shadow']
  },
  bounce: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  fade: {
    duration: 400,
    easing: 'ease-in',
    properties: ['opacity', 'background-color', 'color']
  }
};
```

## Best Practices

1. **Disable interactions during transition**
   ```typescript
   <button disabled={isTransitioning}>
     Click me
   </button>
   ```

2. **Handle transition cancellation**
   ```typescript
   useEffect(() => {
     return () => {
       // Cleanup on unmount
       cancelTransition();
     };
   }, [cancelTransition]);
   ```

3. **Optimize transition properties**
   - Only transition necessary properties
   - Avoid transitioning expensive properties like `width` or `height`
   - Use `transform` and `opacity` for best performance

4. **Provide feedback**
   ```typescript
   {isTransitioning && <LoadingSpinner />}
   ```

## SSR Considerations

The hook is SSR-safe and handles hydration properly:

```typescript
// The hook automatically detects SSR environment
// Transitions are disabled on server and during hydration
const { transitionTheme } = useThemeTransition();

// Safe to use in SSR applications
transitionTheme('dark'); // No-op on server
```

## Accessibility

- Respects `prefers-reduced-motion` media query
- Provides ARIA live regions for screen reader announcements
- Maintains focus during transitions
- Supports keyboard navigation

## TypeScript

Full TypeScript support with strict typing:

```typescript
import { ThemeTransitionOptions, TransitionState } from '@xala-technologies/ui-system/types';

const options: ThemeTransitionOptions = {
  duration: 300,
  easing: 'ease-in-out',
  properties: ['background-color', 'color']
};

const { transitionState }: { transitionState: TransitionState } = useThemeTransition(options);
```

## Related Hooks

- [`useTheme`](./useTheme.md) - Access and manage themes
- [`useTokens`](./useTokens.md) - Access design tokens
- [`useSSR`](./useSSR.md) - SSR hydration state