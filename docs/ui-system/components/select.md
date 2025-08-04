# Select Component

## Purpose
The `Select` component provides a dropdown menu for selecting a value from a list. Fully accessible, themeable, SSR-compatible, and localizable.

## Usage
```typescript
import { Select } from '@xala-technologies/ui-system';

<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  placeholder="Choose an option"
/>
```

## Props
```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  /** Options list */
  options: SelectOption[];
  /** Placeholder text (localized) */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
}
```

## Accessibility
- Uses ARIA roles (`listbox`, `option`)
- Keyboard navigation and screen reader support
- WCAG 2.2 AA compliant

## Localization
- All labels and placeholder must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.select`, `spacing`, `typography`

## Example: Themed Select
```typescript
import { useTokens, Select } from '@xala-technologies/ui-system';

const ThemedSelect = ({ options, value, onChange }) => {
  const { colors } = useTokens();
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      style={{ background: colors.select.background }}
    />
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only select logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
