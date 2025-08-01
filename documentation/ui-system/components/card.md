# Card Component

## Purpose
The `Card` component is a flexible, composable container for grouping related content, supporting multiple variants and padding options. Fully SSR-compatible and accessible.

## Usage
```typescript
import { Card, CardHeader, CardContent, CardFooter } from '@xala-technologies/ui-system';

<Card variant="elevated" padding="lg">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
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
import { useTokens, Card } from '@xala-technologies/ui-system';

const ThemedCard = () => {
  const { colors } = useTokens();
  return <Card style={{ background: colors.card.background }} />;
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
