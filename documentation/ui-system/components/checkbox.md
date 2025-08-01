# Checkbox Component

## Purpose
The `Checkbox` component provides a themeable, accessible checkbox input for forms and selections. SSR-compatible and localizable.

## Usage
```typescript
import { Checkbox } from '@xala-technologies/ui-system';

<Checkbox checked={isChecked} onChange={setChecked} label="Accept terms" />
```

## Props
```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}
```

## Accessibility
- Uses `<input type="checkbox">` with ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Label must use localization

## Theming & Design Tokens
- Uses tokens: `colors.checkbox`, `spacing`, `typography`

## Example: Themed Checkbox
```typescript
import { useTokens, Checkbox } from '@xala-technologies/ui-system';

const ThemedCheckbox = (props) => {
  const { colors } = useTokens();
  return <Checkbox {...props} style={{ accentColor: colors.checkbox.checked }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only checkbox logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
