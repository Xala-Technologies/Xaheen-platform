# AlertIcon Component

## Purpose
The `AlertIcon` component displays an icon appropriate for the alert type (success, info, warning, error). SSR-compatible and themeable.

## Usage
```typescript
import { AlertIcon } from '@xala-technologies/ui-system/action-feedback';

<AlertIcon type="error" />
```

## Props
```typescript
interface AlertIconProps {
  type: 'success' | 'info' | 'warning' | 'error';
}
```

## Accessibility
- Decorative only, uses `aria-hidden`
- WCAG 2.2 AA compliant

## Localization
- Not applicable (icon only)

## Theming & Design Tokens
- Uses tokens: `colors.alert`, `spacing`

## Example: Themed AlertIcon
```typescript
import { useTokens, AlertIcon } from '@xala-technologies/ui-system/action-feedback';

const ThemedAlertIcon = ({ type }) => {
  const { colors } = useTokens();
  return <AlertIcon type={type} style={{ color: colors.alert[type] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert icon logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Alert Component](./alert-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
