# Radio Component

## Purpose
The `Radio` component provides a themeable, accessible radio button for forms and selections. SSR-compatible and localizable.

## Usage
```typescript
import { Radio } from '@xala-technologies/ui-system';

<Radio checked={isSelected} onChange={setSelected} label="Option" />
```

## Props
```typescript
interface RadioProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name?: string;
  disabled?: boolean;
}
```

## Accessibility
- Uses `<input type="radio">` with ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Label must use localization

## Theming & Design Tokens
- Uses tokens: `colors.radio`, `spacing`, `typography`

## Example: Themed Radio
```typescript
import { useTokens, Radio } from '@xala-technologies/ui-system';

const ThemedRadio = (props) => {
  const { colors } = useTokens();
  return <Radio {...props} style={{ accentColor: colors.radio.selected }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only radio logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
