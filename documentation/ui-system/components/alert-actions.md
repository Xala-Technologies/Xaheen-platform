# AlertActions Component

## Purpose
The `AlertActions` component provides a container for action buttons within an Alert. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { AlertActions } from '@xala-technologies/ui-system/action-feedback';

<AlertActions>
  <Button onClick={handleOk}>OK</Button>
  <Button onClick={handleCancel}>Cancel</Button>
</AlertActions>
```

## Props
```typescript
interface AlertActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}
```

## Accessibility
- Uses ARIA roles (`group`)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All button labels must use localization

## Theming & Design Tokens
- Uses tokens: `spacing`, `colors.alert`, `typography`

## Example: Themed AlertActions
```typescript
import { useTokens, AlertActions } from '@xala-technologies/ui-system/action-feedback';

const ThemedAlertActions = ({ children }) => {
  const { spacing } = useTokens();
  return <AlertActions style={{ gap: spacing.md }}>{children}</AlertActions>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only alert actions logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Alert Component](./alert-action-feedback.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
