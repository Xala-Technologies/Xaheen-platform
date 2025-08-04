# Alert Component

## Purpose
The `Alert` component displays important feedback messages, such as success, error, warning, or info. It is accessible, themeable, and SSR-compatible.

## Usage
```typescript
import { Alert } from '@xala-technologies/ui-system';

<Alert variant="info" dismissible>
  This is an informational alert.
</Alert>
```

## Props
```typescript
interface AlertProps {
  /** Visual style */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Dismiss button */
  dismissible?: boolean;
  /** ARIA label */
  ariaLabel?: string;
  /** Content */
  children: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`alert`, `status`)
- Keyboard dismissible
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All content and ARIA labels must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.alert`, `spacing`, `typography`

## Example: Themed Alert
```typescript
import { useTokens, Alert } from '@xala-technologies/ui-system';

const ThemedAlert = () => {
  const { colors } = useTokens();
  return <Alert style={{ background: colors.alert.info }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
