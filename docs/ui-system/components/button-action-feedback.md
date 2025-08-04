# Button (Action Feedback) Component

## Purpose
The `Button` component in action-feedback provides a styled, accessible button for use within feedback and modal flows. SSR-compatible, themeable, and localizable.

## Usage
```typescript
import { Button } from '@xala-technologies/ui-system/action-feedback';

<Button onClick={handleClick} label="OK" />
```

## Props
```typescript
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}
```

## Accessibility
- Uses `<button>` with ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Label must use localization

## Theming & Design Tokens
- Uses tokens: `colors.button`, `spacing`, `typography`, `radii`

## Example: Themed Button
```typescript
import { useTokens, Button } from '@xala-technologies/ui-system/action-feedback';

const ThemedButton = (props) => {
  const { colors } = useTokens();
  return <Button {...props} style={{ background: colors.button[props.variant || 'primary'] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only button logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [ButtonConfirmation Component](./button-confirmation.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
