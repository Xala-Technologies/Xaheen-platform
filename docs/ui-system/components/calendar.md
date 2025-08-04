# Calendar Component

## Purpose
The `Calendar` component displays dates and supports date selection. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Calendar } from '@xala-technologies/ui-system';

<Calendar value={selectedDate} onChange={setDate} />
```

## Props
```typescript
interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}
```

## Accessibility
- Uses ARIA roles (`grid`, `gridcell`)
- Keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- Month and day names localized
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.calendar`, `spacing`, `typography`

## Example: Themed Calendar
```typescript
import { useTokens, Calendar } from '@xala-technologies/ui-system';

const ThemedCalendar = ({ value, onChange }) => {
  const { colors } = useTokens();
  return <Calendar value={value} onChange={onChange} style={{ background: colors.calendar.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only calendar logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
