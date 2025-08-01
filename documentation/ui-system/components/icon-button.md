# IconButton Component

## Purpose
The `IconButton` component is a button displaying only an icon, used for compact actions. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { IconButton } from '@xala-technologies/ui-system';

<IconButton icon={<SomeIcon />} ariaLabel="Close" onClick={handleClick} />
```

## Props
```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
}
```

## Accessibility
- Uses `<button>` with `aria-label`
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- `ariaLabel` must use localization

## Theming & Design Tokens
- Uses tokens: `colors.iconButton`, `spacing`, `radii`

## Example: Themed IconButton
```typescript
import { useTokens, IconButton } from '@xala-technologies/ui-system';

const ThemedIconButton = (props) => {
  const { colors } = useTokens();
  return <IconButton {...props} style={{ background: colors.iconButton.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only icon button logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
