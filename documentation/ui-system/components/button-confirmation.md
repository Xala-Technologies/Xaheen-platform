# ButtonConfirmation Component

## Purpose
The `ButtonConfirmation` component provides a button that requires user confirmation before executing its action. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { ButtonConfirmation } from '@xala-technologies/ui-system/action-feedback';

<ButtonConfirmation onConfirm={handleConfirm} label="Delete" confirmLabel="Are you sure?" />
```

## Props
```typescript
interface ButtonConfirmationProps {
  onConfirm: () => void;
  label: string;
  confirmLabel: string;
  disabled?: boolean;
}
```

## Accessibility
- Uses ARIA roles (`button`, `alertdialog`)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.button`, `spacing`, `typography`

## Example: Themed ButtonConfirmation
```typescript
import { useTokens, ButtonConfirmation } from '@xala-technologies/ui-system/action-feedback';

const ThemedButtonConfirmation = (props) => {
  const { colors } = useTokens();
  return <ButtonConfirmation {...props} style={{ background: colors.button.danger }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only confirmation logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Button Component](./button.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
