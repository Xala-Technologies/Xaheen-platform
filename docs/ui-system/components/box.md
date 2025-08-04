# Box Component

## Purpose
The `Box` component is a low-level layout primitive for spacing, backgrounds, and simple wrappers. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Box } from '@xala-technologies/ui-system';

<Box padding="md" background="neutral.100">Content</Box>
```

## Props
```typescript
interface BoxProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: string;
  borderRadius?: string;
  children: React.ReactNode;
}
```

## Accessibility
- Semantic wrapper, screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `spacing`, `colors`, `radii`

## Example: Themed Box
```typescript
import { useTokens, Box } from '@xala-technologies/ui-system';

const ThemedBox = ({ children }) => {
  const { spacing } = useTokens();
  return <Box padding="lg" style={{ padding: spacing.lg }}>{children}</Box>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only box logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
