# Toast (Action Feedback) Component

## Purpose
The `Toast` component provides transient, non-blocking feedback for user actions. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { Toast } from '@xala-technologies/ui-system/action-feedback';

<Toast type="info" message="Saved successfully" />
```

## Props
```typescript
interface ToastProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  duration?: number;
  onClose?: () => void;
}
```

## Accessibility
- Uses ARIA roles (`status`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All messages must use localization

## Theming & Design Tokens
- Uses tokens: `colors.toast`, `spacing`, `typography`

## Example: Themed Toast
```typescript
import { useTokens, Toast } from '@xala-technologies/ui-system/action-feedback';

const ThemedToast = (props) => {
  const { colors } = useTokens();
  return <Toast {...props} style={{ background: colors.toast[props.type] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only toast logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
