# Button Component

## Purpose
The `Button` component is a semantic, accessible, and themeable action trigger for user interactions. It supports multiple variants, sizes, and states, and is fully SSR-compatible.

## Usage
```typescript
import { Button } from '@xala-technologies/ui-system';

<Button variant="primary" size="md" disabled={false}>
  Click Me
</Button>
```

## Props
```typescript
interface ButtonProps {
  /** Button visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Button click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button content */
  children: React.ReactNode;
}
```

## Accessibility
- Uses `<button>` element with proper ARIA roles
- Supports keyboard navigation and focus management
- States (loading, disabled) are announced to screen readers
- Compliant with WCAG 2.2 AA

## Localization
- Never hardcode button text; always use the localization system
- Supports English (fallback), Norwegian Bokmål, French, Arabic

## Theming & Design Tokens
- All styling uses design tokens via `useTokens`
- Colors: `colors.primary`, `colors.secondary`, etc.
- Spacing: `spacing.sm`, `spacing.md`, `spacing.lg`
- Typography: `typography.button`

## Example: Themed Button
```typescript
import { useTokens, Button } from '@xala-technologies/ui-system';

const ThemedButton = () => {
  const { colors, spacing } = useTokens();
  return (
    <Button style={{ backgroundColor: colors.primary[500], padding: spacing.md }}>
      Themed
    </Button>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only handles button logic and rendering
- Open/Closed: Extend via props and composition, not inheritance
- Strict TypeScript types, no `any`
- File/function length and complexity limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
