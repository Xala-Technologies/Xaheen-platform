# DatePicker Component

## Purpose
The `DatePicker` component allows users to select a date from a calendar popover. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { DatePicker } from '@xala-technologies/ui-system';

<DatePicker value={selectedDate} onChange={setDate} />
```

## Props
```typescript
interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  disabled?: boolean;
}
```

## Accessibility
- Uses ARIA roles (`dialog`, `grid`, `gridcell`)
- Keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- Month and day names localized
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.datePicker`, `spacing`, `typography`

## Example: Themed DatePicker
```typescript
import { useTokens, DatePicker } from '@xala-technologies/ui-system';

const ThemedDatePicker = ({ value, onChange }) => {
  const { colors } = useTokens();
  return <DatePicker value={value} onChange={onChange} style={{ background: colors.datePicker.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only date picker logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
