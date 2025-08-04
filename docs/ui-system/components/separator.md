# Separator Component

## Purpose
The `Separator` component visually separates content or groups of elements, similar to Divider but for smaller UI contexts. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Separator } from '@xala-technologies/ui-system';

<Separator orientation="horizontal" />
```

## Props
```typescript
interface SeparatorProps {
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
- Uses tokens: `colors.separator`, `spacing`

## Example: Themed Separator
```typescript
import { useTokens, Separator } from '@xala-technologies/ui-system';

const ThemedSeparator = () => {
  const { colors } = useTokens();
  return <Separator color={colors.separator.default} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only separator logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
