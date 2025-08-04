# Divider Component

## Purpose
The `Divider` component visually separates content areas. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Divider } from '@xala-technologies/ui-system';

<Divider orientation="horizontal" />
```

## Props
```typescript
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: string;
  color?: string;
}
```

## Accessibility
- Uses `<hr>` or `<div>` with ARIA attributes
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Not applicable (decorative only)

## Theming & Design Tokens
- Uses tokens: `colors.divider`, `spacing`

## Example: Themed Divider
```typescript
import { useTokens, Divider } from '@xala-technologies/ui-system';

const ThemedDivider = () => {
  const { colors } = useTokens();
  return <Divider color={colors.divider.default} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only divider logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
