# Alert (Action Feedback) Component

## Purpose
The `Alert` component in action-feedback provides user feedback for critical, warning, info, or success messages. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { Alert } from '@xala-technologies/ui-system/action-feedback';

<Alert type="success" message="Operation completed" />
```

## Props
```typescript
interface AlertProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
  actions?: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`alert`)
- Focus management and screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All messages and actions must use localization

## Theming & Design Tokens
- Uses tokens: `colors.alert`, `spacing`, `typography`

## Example: Themed Alert
```typescript
import { useTokens, Alert } from '@xala-technologies/ui-system/action-feedback';

const ThemedAlert = (props) => {
  const { colors } = useTokens();
  return <Alert {...props} style={{ background: colors.alert[props.type] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
