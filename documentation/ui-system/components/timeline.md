# Timeline Component

## Purpose
The `Timeline` component displays a sequence of events or steps in chronological order. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Timeline } from '@xala-technologies/ui-system';

<Timeline events={events} />
```

## Props
```typescript
interface TimelineEvent {
  id: string;
  label: string;
  timestamp?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
}
```

## Accessibility
- Uses ARIA roles (`list`, `listitem`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All labels and timestamps must use localization

## Theming & Design Tokens
- Uses tokens: `colors.timeline`, `spacing`, `typography`

## Example: Themed Timeline
```typescript
import { useTokens, Timeline } from '@xala-technologies/ui-system';

const ThemedTimeline = ({ events }) => {
  const { colors } = useTokens();
  return <Timeline events={events} style={{ background: colors.timeline.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only timeline logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
