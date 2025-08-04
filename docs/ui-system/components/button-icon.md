# ButtonIcon Component

## Purpose
The `ButtonIcon` component displays an icon-only button for compact actions in feedback flows. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { ButtonIcon } from '@xala-technologies/ui-system/action-feedback';

<ButtonIcon icon={<SomeIcon />} ariaLabel="Close" onClick={handleClick} />
```

## Props
```typescript
interface ButtonIconProps {
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
- Uses tokens: `colors.button`, `spacing`, `radii`

## Example: Themed ButtonIcon
```typescript
import { useTokens, ButtonIcon } from '@xala-technologies/ui-system/action-feedback';

const ThemedButtonIcon = (props) => {
  const { colors } = useTokens();
  return <ButtonIcon {...props} style={{ background: colors.button.primary }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only icon button logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Button Component](./button-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
