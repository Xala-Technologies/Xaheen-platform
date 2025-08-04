# ScrollArea Component

## Purpose
The `ScrollArea` component provides a styled, themeable scroll container with custom scrollbars. SSR-compatible and accessible.

## Usage
```typescript
import { ScrollArea } from '@xala-technologies/ui-system';

<ScrollArea style={{ height: 200 }}>Content</ScrollArea>
```

## Props
```typescript
interface ScrollAreaProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
```

## Accessibility
- Uses ARIA roles (`region`)
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `colors.scrollArea`, `spacing`, `radii`

## Example: Themed ScrollArea
```typescript
import { useTokens, ScrollArea } from '@xala-technologies/ui-system';

const ThemedScrollArea = ({ children }) => {
  const { colors } = useTokens();
  return <ScrollArea style={{ background: colors.scrollArea.background }}>{children}</ScrollArea>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only scroll area logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
