# TimePicker Component

## Purpose
The `TimePicker` component allows users to select a time value, supporting both 12h and 24h formats. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { TimePicker } from '@xala-technologies/ui-system';

<TimePicker value={selectedTime} onChange={setTime} />
```

## Props
```typescript
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  format?: '12h' | '24h';
  disabled?: boolean;
  locale?: string;
}
```

## Accessibility
- Uses ARIA roles (`spinbutton`, `listbox`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels and time strings must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.timePicker`, `spacing`, `typography`

## Example: Themed TimePicker
```typescript
import { useTokens, TimePicker } from '@xala-technologies/ui-system';

const ThemedTimePicker = (props) => {
  const { colors } = useTokens();
  return <TimePicker {...props} style={{ background: colors.timePicker.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only time picker logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
