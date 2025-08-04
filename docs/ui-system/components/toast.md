# Toast Component

## Purpose
The `Toast` component provides transient feedback messages for user actions, such as success or error notifications. Fully accessible, themeable, and SSR-compatible.

## Usage
```typescript
import { Toast } from '@xala-technologies/ui-system';

<Toast variant="success" message="Operation completed successfully" duration={3000} />
```

## Props
```typescript
interface ToastProps {
  /** Visual style */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Message (localized) */
  message: string;
  /** Duration in ms */
  duration?: number;
  /** Dismiss handler */
  onDismiss?: () => void;
}
```

## Accessibility
- Uses ARIA live regions (`aria-live`)
- Auto-dismiss with manual override
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All messages must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.toast`, `spacing`, `typography`

## Example: Themed Toast
```typescript
import { useTokens, Toast } from '@xala-technologies/ui-system';

const ThemedToast = () => {
  const { colors } = useTokens();
  return <Toast variant="info" message="Info" style={{ background: colors.toast.info }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only toast logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
