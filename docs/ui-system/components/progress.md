# Progress Component

## Purpose
The `Progress` component displays linear or circular progress indicators for loading states. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Progress } from '@xala-technologies/ui-system';

<Progress value={progressValue} max={100} />
```

## Props
```typescript
interface ProgressProps {
  value: number;
  max: number;
  label?: string;
  type?: 'linear' | 'circular';
}
```

## Accessibility
- Uses ARIA roles (`progressbar`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.progress`, `spacing`, `typography`

## Example: Themed Progress
```typescript
import { useTokens, Progress } from '@xala-technologies/ui-system';

const ThemedProgress = (props) => {
  const { colors } = useTokens();
  return <Progress {...props} style={{ color: colors.progress.bar }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only progress logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
