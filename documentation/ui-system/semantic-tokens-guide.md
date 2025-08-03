# Semantic Token Usage Guide - CVA Pattern

## Overview

This guide explains how design tokens are accessed through **semantic Tailwind CSS classes** in the CVA pattern, replacing the deprecated `useTokens()` hook approach.

## Key Principles

- **No direct token access** - Use semantic Tailwind classes instead
- **CSS custom properties** handle the token mapping automatically
- **CVA variants** provide consistent component styling
- **Static classes** enable better performance and optimization

## Token Architecture

### CSS Custom Properties Layer
```css
/* Design tokens are defined as CSS custom properties */
:root {
  --primary: 220 100% 50%;
  --primary-foreground: 0 0% 98%;
  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220.9 39.3% 11%;
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220.9 39.3% 11%;
  /* ... */
}
```

### Tailwind Configuration Layer
```javascript
// tailwind.config.js maps classes to CSS custom properties
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
      }
    }
  }
}
```

### Semantic Class Layer
```typescript
// Components use semantic classes
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
```

## Color Token Mapping

### Primary Colors
| Semantic Class | CSS Custom Property | Usage |
|----------------|-------------------|--------|
| `bg-primary` | `var(--primary)` | Primary brand color backgrounds |
| `text-primary` | `var(--primary)` | Primary brand color text |
| `text-primary-foreground` | `var(--primary-foreground)` | Text on primary backgrounds |
| `border-primary` | `var(--primary)` | Primary brand color borders |

### Secondary Colors
| Semantic Class | CSS Custom Property | Usage |
|----------------|-------------------|--------|
| `bg-secondary` | `var(--secondary)` | Secondary color backgrounds |
| `text-secondary-foreground` | `var(--secondary-foreground)` | Text on secondary backgrounds |
| `hover:bg-secondary/80` | `var(--secondary)` with 80% opacity | Secondary hover states |

### State Colors
| Semantic Class | CSS Custom Property | Usage |
|----------------|-------------------|--------|
| `bg-destructive` | `var(--destructive)` | Error/danger states |
| `bg-success` | `var(--success)` | Success states |
| `bg-warning` | `var(--warning)` | Warning states |
| `text-destructive-foreground` | `var(--destructive-foreground)` | Text on error backgrounds |

### Surface Colors
| Semantic Class | CSS Custom Property | Usage |
|----------------|-------------------|--------|
| `bg-background` | `var(--background)` | Main page background |
| `bg-card` | `var(--card)` | Card/surface backgrounds |
| `bg-popover` | `var(--popover)` | Popover/dropdown backgrounds |
| `text-foreground` | `var(--foreground)` | Primary text color |
| `text-muted-foreground` | `var(--muted-foreground)` | Secondary text color |

### Border Colors
| Semantic Class | CSS Custom Property | Usage |
|----------------|-------------------|--------|
| `border-border` | `var(--border)` | Default border color |
| `border-input` | `var(--input-border)` | Input field borders |
| `border-ring` | `var(--ring)` | Focus ring borders |

## Spacing Token Mapping

### Padding Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `p-1` | 4px | Extra small padding |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Small-medium padding |
| `p-4` | 16px | Medium padding |
| `p-6` | 24px | Large padding |
| `p-8` | 32px | Extra large padding |
| `p-12` | 48px | XXL padding |

### Margin Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `m-1` | 4px | Extra small margin |
| `m-2` | 8px | Small margin |
| `m-4` | 16px | Medium margin |
| `m-6` | 24px | Large margin |
| `m-8` | 32px | Extra large margin |

### Gap Classes (for Flexbox/Grid)
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `gap-1` | 4px | Extra small gap |
| `gap-2` | 8px | Small gap |
| `gap-4` | 16px | Medium gap |
| `gap-6` | 24px | Large gap |
| `space-y-4` | 16px vertical | Vertical spacing between children |

## Typography Token Mapping

### Font Size Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `text-xs` | 12px | Extra small text |
| `text-sm` | 14px | Small text (body secondary) |
| `text-base` | 16px | Base text (body primary) |
| `text-lg` | 18px | Large text (small headings) |
| `text-xl` | 20px | Extra large text |
| `text-2xl` | 24px | 2XL text (main headings) |
| `text-3xl` | 30px | 3XL text (large headings) |

### Font Weight Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Button text, small headings |
| `font-bold` | 700 | Main headings |

### Line Height Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `leading-none` | 1 | Tight line height |
| `leading-tight` | 1.25 | Tight line height |
| `leading-normal` | 1.5 | Normal body text |
| `leading-relaxed` | 1.625 | Relaxed reading text |

## Shadow Token Mapping

### Shadow Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle shadow |
| `shadow` | 0 1px 3px rgba(0,0,0,0.1) | Default shadow |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Medium shadow |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Large shadow |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | Extra large shadow |

## Border Radius Token Mapping

### Radius Classes
| Semantic Class | Token Value | Usage |
|----------------|-------------|--------|
| `rounded-sm` | 2px | Small radius |
| `rounded` | 4px | Default radius |
| `rounded-md` | 6px | Medium radius |
| `rounded-lg` | 8px | Large radius |
| `rounded-xl` | 12px | Extra large radius |
| `rounded-2xl` | 16px | 2XL radius |
| `rounded-full` | 9999px | Circular |

## Responsive Token Usage

### Responsive Prefixes
```typescript
// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* 16px on mobile, 24px on tablet, 32px on desktop */}
</div>

// Responsive typography
<h1 className="text-lg md:text-xl lg:text-2xl">
  {/* 18px on mobile, 20px on tablet, 24px on desktop */}
</h1>

// Responsive colors (less common)
<div className="bg-secondary md:bg-primary">
  {/* Secondary on mobile, primary on tablet+ */}
</div>
```

## Opacity Modifiers

### Color Opacity
```typescript
// Using opacity modifiers with semantic colors
<div className="bg-primary/90">        {/* 90% opacity */}
<div className="bg-primary/75">        {/* 75% opacity */}
<div className="bg-primary/50">        {/* 50% opacity */}
<div className="text-primary/60">      {/* 60% opacity text */}
<div className="border-primary/30">    {/* 30% opacity border */}
```

## State Modifiers

### Interactive States
```typescript
// Hover states
<button className="bg-primary hover:bg-primary/90">
<button className="text-secondary hover:text-secondary/80">
<button className="border-input hover:border-primary">

// Focus states
<input className="border-input focus:border-primary focus:ring-2 focus:ring-primary/20">

// Active states
<button className="bg-primary active:bg-primary/95">

// Disabled states
<button className="disabled:opacity-50 disabled:cursor-not-allowed">
```

## Dark Mode Support

### Automatic Dark Mode
```typescript
// Classes automatically adapt to dark mode via CSS custom properties
<div className="bg-background text-foreground">
  {/* Light: white background, dark text */}
  {/* Dark: dark background, light text */}
</div>

<Card className="bg-card border-border">
  {/* Automatically adapts border and background for dark mode */}
</Card>
```

## Component-Specific Token Usage

### Button Variants
```typescript
// Primary button using semantic tokens
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring">

// Secondary button
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">

// Destructive button
<Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
```

### Card Variants
```typescript
// Default card
<Card className="bg-card text-card-foreground border-border shadow-sm">

// Elevated card
<Card className="bg-card text-card-foreground shadow-md hover:shadow-lg">

// Interactive card
<Card className="bg-card hover:bg-accent hover:text-accent-foreground cursor-pointer">
```

### Input Variants
```typescript
// Default input
<Input className="bg-background border-input text-foreground placeholder:text-muted-foreground">

// Error state input
<Input className="bg-background border-destructive text-foreground focus:border-destructive focus:ring-destructive/20">

// Success state input
<Input className="bg-background border-success text-foreground focus:border-success focus:ring-success/20">
```

## Migration Examples

### Before: useTokens Hook
```typescript
// ❌ OLD: Runtime token access
import { useTokens } from '@xala-technologies/ui-system';

const OldButton = ({ variant, children }) => {
  const { colors, spacing, typography } = useTokens();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[600],
          color: colors.primary.foreground,
          padding: `${spacing.sm} ${spacing.md}`
        };
      default:
        return {};
    }
  };
  
  return (
    <button style={getVariantStyles()}>
      {children}
    </button>
  );
};
```

### After: Semantic Classes
```typescript
// ✅ NEW: Semantic Tailwind classes
const NewButton = ({ variant, children }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground px-4 py-2 hover:bg-secondary/80';
      default:
        return 'bg-primary text-primary-foreground px-4 py-2';
    }
  };
  
  return (
    <button className={getVariantClasses()}>
      {children}
    </button>
  );
};
```

## Best Practices

### ✅ DO
- Use semantic color classes (`bg-primary`, `text-foreground`)
- Combine classes for state variants (`hover:bg-primary/90`)
- Use opacity modifiers for subtle variations (`bg-primary/10`)
- Apply responsive prefixes (`md:p-6`, `lg:text-xl`)
- Leverage state modifiers (`focus:ring-2`, `disabled:opacity-50`)

### ❌ DON'T
- Use arbitrary values (`bg-[#ff0000]`, `p-[13px]`)
- Mix semantic classes with hardcoded values
- Use non-semantic color names (`bg-blue-500` instead of `bg-primary`)
- Access tokens directly in JavaScript
- Create complex style objects in components

## Performance Benefits

### Bundle Size
- **Static classes**: Included only if used (tree-shaking)
- **CSS custom properties**: Single source of truth for tokens
- **No runtime calculations**: All styling computed at build time

### Runtime Performance
- **No JavaScript execution** for styling
- **CSS-only state changes** (hover, focus, etc.)
- **Browser-optimized** class application
- **Cached styles** across components

## Troubleshooting

### Common Issues

**Issue**: "Class not working in dark mode"
**Solution**: Ensure you're using semantic classes (`bg-background` not `bg-white`)

**Issue**: "Custom color not available"
**Solution**: Add color to CSS custom properties and Tailwind config

**Issue**: "Spacing not consistent"
**Solution**: Use standard spacing scale classes (`p-4`, `m-6`) not arbitrary values

**Issue**: "Hover state not working"
**Solution**: Combine hover modifier with semantic class (`hover:bg-primary/90`)

## Advanced Patterns

### Custom Component with Semantic Tokens
```typescript
import { cva } from 'class-variance-authority';

const alertVariants = cva(
  // Base classes with semantic tokens
  'rounded-lg border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20 [&>svg]:text-destructive',
        success: 'bg-success/10 text-success border-success/20 [&>svg]:text-success',
        warning: 'bg-warning/10 text-warning border-warning/20 [&>svg]:text-warning'
      }
    }
  }
);
```

### Theme-Aware Conditional Classes
```typescript
const getStatusClasses = (status: 'idle' | 'loading' | 'success' | 'error') => {
  const baseClasses = 'px-3 py-1 rounded text-sm font-medium';
  
  switch (status) {
    case 'success':
      return `${baseClasses} bg-success/10 text-success border border-success/20`;
    case 'error':
      return `${baseClasses} bg-destructive/10 text-destructive border border-destructive/20`;
    case 'loading':
      return `${baseClasses} bg-muted text-muted-foreground border border-border`;
    default:
      return `${baseClasses} bg-background text-foreground border border-border`;
  }
};
```

## Further Reading

- [CVA Pattern Guide](./architecture/component-architecture.md)
- [Migration from useTokens](./migration/README.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

This semantic token system provides a performant, maintainable, and type-safe way to access design tokens without runtime overhead, replacing the deprecated `useTokens()` hook pattern.