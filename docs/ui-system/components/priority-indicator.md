# PriorityIndicator Component

## Purpose
The `PriorityIndicator` component visually marks content or actions with a priority level (e.g., high, medium, low). SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { PriorityIndicator } from '@xala-technologies/ui-system/action-feedback';

<PriorityIndicator level="high" label="High Priority" />
```

## Props
```typescript
interface PriorityIndicatorProps {
  level: 'high' | 'medium' | 'low';
  label: string;
}
```

## Accessibility
- Uses ARIA roles (`status`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Label must use localization

## Theming & Design Tokens
- Uses tokens: `colors.priorityIndicator`, `spacing`, `typography`

## Example: Themed PriorityIndicator
```typescript
import { useTokens, PriorityIndicator } from '@xala-technologies/ui-system/action-feedback';

const ThemedPriorityIndicator = (props) => {
  const { colors } = useTokens();
  return <PriorityIndicator {...props} style={{ background: colors.priorityIndicator[props.level] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only priority logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
