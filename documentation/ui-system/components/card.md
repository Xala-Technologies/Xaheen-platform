# Card Component

## Purpose
The `Card` component is a flexible, composable container for grouping related content, supporting multiple variants and padding options. Fully SSR-compatible and accessible.

## Usage
```typescript
import { Card, Typography, Stack } from '@xala-technologies/ui-system';

<Card variant="elevated" padding="lg">
  <Stack direction="vertical" gap="md">
    <Typography variant="h3">Title</Typography>
    <Typography variant="body">Content</Typography>
    <Typography variant="caption">Footer</Typography>
  </Stack>
</Card>
```

## Props
```typescript
interface CardProps {
  /** Card style */
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  /** Padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Children */
  children: React.ReactNode;
}
```

## Accessibility
- Semantic structure using design system components
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Never hardcode text; use localization for all content

## Theming & Design Tokens
- All styles use tokens: `colors.card`, `spacing`, `typography`

## Example: Themed Card
```typescript
import { useTokens, Card, Typography } from '@xala-technologies/ui-system';

const ThemedCard = (): JSX.Element => {
  const { colors, spacing } = useTokens();
  return (
    <Card 
      variant="elevated" 
      padding="lg"
      style={{ 
        backgroundColor: colors.background.secondary,
        border: `1px solid ${colors.border.primary}`
      }}
    >
      <Typography variant="body">Themed card content</Typography>
    </Card>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only card logic
- Open/Closed: Extend via composition
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
