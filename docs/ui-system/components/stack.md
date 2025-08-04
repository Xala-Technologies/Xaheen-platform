# Stack Component

## Purpose
The `Stack` component provides vertical or horizontal spacing between elements using Flexbox. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Stack, Card } from '@xala-technologies/ui-system';

<Stack direction="vertical" gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>
```

## Props
```typescript
interface StackProps {
  /** Direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap between items */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  /** Children */
  children: React.ReactNode;
}
```

## Accessibility
- Semantic, screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All content must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `spacing`, `colors.stack`, `typography`

## Example: Themed Stack
```typescript
import { useTokens, Stack, Card } from '@xala-technologies/ui-system';

const ThemedStack = (): JSX.Element => {
  const { spacing } = useTokens();
  return (
    <Stack 
      direction="vertical" 
      gap="lg" 
      style={{ padding: spacing.md }}
    >
      <Card>Item 1</Card>
      <Card>Item 2</Card>
    </Stack>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only stack logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
