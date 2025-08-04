# ToastIcon Component

## Purpose
The `ToastIcon` component displays the appropriate icon for a Toast's type (success, info, warning, error). SSR-compatible and themeable.

## Usage
```typescript
import { ToastIcon } from '@xala-technologies/ui-system/action-feedback';

<ToastIcon type="success" />
```

## Props
```typescript
interface ToastIconProps {
  type: 'success' | 'info' | 'warning' | 'error';
}
```

## Accessibility
- Decorative only, uses `aria-hidden`
- WCAG 2.2 AA compliant

## Localization
- Not applicable (icon only)

## Theming & Design Tokens
- Uses tokens: `colors.toast`, `spacing`

## Example: Themed ToastIcon
```typescript
import { useTokens, ToastIcon } from '@xala-technologies/ui-system/action-feedback';

const ThemedToastIcon = ({ type }) => {
  const { colors } = useTokens();
  return <ToastIcon type={type} style={{ color: colors.toast[type] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only toast icon logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Toast Component](./toast-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
