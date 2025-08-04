# Tooltip Component

## Purpose
The `Tooltip` component provides contextual information on hover or focus. Fully accessible, themeable, and SSR-compatible.

## Usage
```typescript
import { Tooltip } from '@xala-technologies/ui-system';

<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

## Props
```typescript
interface TooltipProps {
  /** Tooltip content (localized) */
  content: string;
  /** Placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Children */
  children: React.ReactNode;
}
```

## Accessibility
- Uses ARIA attributes (`aria-describedby`, etc.)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All content must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.tooltip`, `spacing`, `typography`

## Example: Themed Tooltip
```typescript
import { useTokens, Tooltip } from '@xala-technologies/ui-system';

const ThemedTooltip = ({ children }) => {
  const { colors } = useTokens();
  return <Tooltip content="Info" style={{ background: colors.tooltip.background }}>{children}</Tooltip>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only tooltip logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
