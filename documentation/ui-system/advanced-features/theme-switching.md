# Theme Switching with Transitions

The UI System v5 provides a sophisticated theme switching mechanism with smooth CSS transitions, ensuring a polished user experience when changing between themes.

## Overview

The theme switching system supports:
- Smooth CSS transitions between themes
- Prefers-color-scheme detection
- Local storage persistence
- SSR-safe implementation
- Custom transition timing and easing
- Per-element transition control
- Reduced motion support

## Basic Usage

### Simple Theme Toggle

```typescript
import { useTheme } from '@xala-technologies/ui-system/hooks';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### With Transition Hook

```typescript
import { useThemeTransition } from '@xala-technologies/ui-system/hooks';

function AdvancedThemeToggle() {
  const { 
    theme, 
    setTheme, 
    isTransitioning,
    transitionDuration 
  } = useThemeTransition();
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  return (
    <div>
      <select 
        value={theme} 
        onChange={(e) => handleThemeChange(e.target.value)}
        disabled={isTransitioning}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="high-contrast">High Contrast</option>
      </select>
      {isTransitioning && <span>Transitioning...</span>}
    </div>
  );
}
```

## Configuration

### Provider Configuration

```typescript
<UiProvider
  defaultTheme="light"
  themeTransitionConfig={{
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['background-color', 'color', 'border-color', 'box-shadow'],
    enableTransitions: true,
    respectMotionPreference: true
  }}
>
  {children}
</UiProvider>
```

### Transition Configuration Options

```typescript
interface ThemeTransitionConfig {
  // Transition duration in milliseconds
  duration?: number;
  
  // CSS easing function
  easing?: string;
  
  // Properties to transition (default: all color-related)
  properties?: string[];
  
  // Enable/disable transitions globally
  enableTransitions?: boolean;
  
  // Respect prefers-reduced-motion
  respectMotionPreference?: boolean;
  
  // Custom transition classes
  transitionClasses?: {
    entering?: string;
    entered?: string;
    exiting?: string;
    exited?: string;
  };
}
```

## Advanced Features

### 1. Custom Transition Timing

```typescript
import { useThemeTransition } from '@xala-technologies/ui-system/hooks';

function CustomTransitionExample() {
  const { setThemeWithTransition } = useThemeTransition();
  
  const handleThemeChange = (theme: string) => {
    setThemeWithTransition(theme, {
      duration: 500,
      easing: 'ease-in-out',
      onTransitionStart: () => console.log('Theme transition started'),
      onTransitionEnd: () => console.log('Theme transition completed')
    });
  };
  
  return (
    <button onClick={() => handleThemeChange('dark')}>
      Switch to Dark (500ms transition)
    </button>
  );
}
```

### 2. Per-Component Transitions

```typescript
import { withThemeTransition } from '@xala-technologies/ui-system/hoc';

const TransitionCard = withThemeTransition(Card, {
  duration: 200,
  properties: ['background-color', 'border-color'],
  className: 'theme-transition-card'
});

// Usage
<TransitionCard variant="elevated">
  This card has custom transition settings
</TransitionCard>
```

### 3. Transition Stages

```typescript
function ThemeTransitionStages() {
  const { 
    theme,
    transitionStage,
    setTheme 
  } = useThemeTransition();
  
  return (
    <div className={`transition-container ${transitionStage}`}>
      {transitionStage === 'entering' && <div>Applying new theme...</div>}
      {transitionStage === 'entered' && <div>Theme applied!</div>}
      
      <button onClick={() => setTheme('dark')}>
        Change Theme
      </button>
    </div>
  );
}
```

### 4. CSS Implementation

```css
/* Base transition styles */
:root {
  --theme-transition-duration: 300ms;
  --theme-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Apply transitions to theme-aware properties */
* {
  transition-property: background-color, color, border-color, box-shadow;
  transition-duration: var(--theme-transition-duration);
  transition-timing-function: var(--theme-transition-easing);
}

/* Disable transitions during theme change */
.theme-transitioning * {
  transition: none !important;
}

/* Smooth color transitions */
.theme-transition {
  transition: 
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    color var(--theme-transition-duration) var(--theme-transition-easing),
    border-color var(--theme-transition-duration) var(--theme-transition-easing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-easing);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation Examples

### 1. Theme Switcher Component

```typescript
import { useTheme, useThemeTransition } from '@xala-technologies/ui-system/hooks';
import { Button } from '@xala-technologies/ui-system';

export function ThemeSwitcher() {
  const { theme, availableThemes } = useTheme();
  const { setThemeWithTransition, isTransitioning } = useThemeTransition();
  
  return (
    <div className="theme-switcher">
      {availableThemes.map((t) => (
        <Button
          key={t.id}
          variant={theme === t.id ? 'primary' : 'outline'}
          onClick={() => setThemeWithTransition(t.id)}
          disabled={isTransitioning}
        >
          {t.name}
        </Button>
      ))}
    </div>
  );
}
```

### 2. Animated Theme Preview

```typescript
function ThemePreview() {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { setThemeWithTransition } = useThemeTransition();
  
  const handleMouseEnter = (themeId: string) => {
    setPreviewTheme(themeId);
  };
  
  const handleMouseLeave = () => {
    setPreviewTheme(null);
  };
  
  const handleClick = (themeId: string) => {
    setThemeWithTransition(themeId, {
      duration: 400,
      onTransitionEnd: () => {
        console.log(`Switched to ${themeId} theme`);
      }
    });
  };
  
  return (
    <div className="theme-previews">
      {['light', 'dark', 'high-contrast'].map((t) => (
        <div
          key={t}
          className={`theme-preview ${previewTheme === t ? 'preview-active' : ''}`}
          onMouseEnter={() => handleMouseEnter(t)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(t)}
          data-theme={previewTheme === t ? t : theme}
        >
          <h3>{t} Theme</h3>
          <p>Preview this theme</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. System Theme Sync

```typescript
function SystemThemeSync() {
  const { setTheme } = useTheme();
  const { setThemeWithTransition } = useThemeTransition();
  
  useEffect(() => {
    // Initial theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeWithTransition(e.matches ? 'dark' : 'light', {
        duration: 600,
        easing: 'ease-out'
      });
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme, setThemeWithTransition]);
  
  return null;
}
```

## Best Practices

### 1. Performance Optimization

```typescript
// Limit transition properties for xaheen performance
const transitionConfig = {
  properties: [
    'background-color',
    'color',
    'border-color'
    // Avoid expensive properties like 'all'
  ],
  duration: 200 // Keep it snappy
};
```

### 2. Accessibility Considerations

```typescript
function AccessibleThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { isTransitioning } = useThemeTransition();
  
  return (
    <div role="group" aria-label="Theme selection">
      <button
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Switch to light theme"
        disabled={isTransitioning}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Switch to dark theme"
        disabled={isTransitioning}
      >
        Dark
      </button>
    </div>
  );
}
```

### 3. Preventing Flash of Unstyled Content

```typescript
// In your _document.tsx or index.html
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const theme = localStorage.getItem('ui-theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.backgroundColor = 
        theme === 'dark' ? '#111827' : '#ffffff';
    })();
  `
}} />
```

## Transition Patterns

### 1. Fade Transition

```css
.theme-fade-transition {
  position: relative;
}

.theme-fade-transition::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--ui-color-background);
  opacity: 0;
  transition: opacity var(--theme-transition-duration);
  pointer-events: none;
}

.theme-transitioning .theme-fade-transition::before {
  opacity: 1;
}
```

### 2. Slide Transition

```css
.theme-slide-transition {
  transition: transform var(--theme-transition-duration);
}

.theme-transitioning.slide-out {
  transform: translateX(-100%);
}

.theme-transitioning.slide-in {
  transform: translateX(0);
}
```

### 3. Scale Transition

```css
.theme-scale-transition {
  transition: transform var(--theme-transition-duration);
  transform-origin: center;
}

.theme-transitioning .theme-scale-transition {
  transform: scale(0.98);
}
```

## Troubleshooting

### Common Issues

1. **Flickering during transition**
   - Ensure consistent CSS specificity
   - Use `will-change` sparingly
   - Check for conflicting transitions

2. **Transitions not working**
   - Verify transition configuration
   - Check browser support
   - Ensure CSS is loaded

3. **Performance issues**
   - Limit transition properties
   - Use transform instead of position changes
   - Enable GPU acceleration with `translateZ(0)`

### Debug Mode

```typescript
<UiProvider
  themeTransitionConfig={{
    debug: true, // Logs transition events
    onTransitionStart: (theme) => console.log('Starting transition to', theme),
    onTransitionEnd: (theme) => console.log('Completed transition to', theme)
  }}
>
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (14+)
- Mobile browsers: Full support

For older browsers, transitions gracefully degrade to instant theme changes.

## Next Steps

- [White Label Configuration](./white-label-configuration.md)
- [Token Serialization](./token-serialization.md)
- [Platform-Specific Tokens](./platform-specific-tokens.md)