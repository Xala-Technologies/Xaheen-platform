# Stack Component

## Purpose
The `Stack` component provides vertical or horizontal spacing between elements using Flexbox. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Stack, VStack, HStack } from '@xala-technologies/ui-system';

<VStack spacing="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</VStack>
```

## Props
```typescript
interface StackProps {
  /** Direction */
  direction?: 'vertical' | 'horizontal';
  /** Spacing */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
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
import { useTokens, VStack } from '@xala-technologies/ui-system';

const ThemedStack = () => {
  const { spacing } = useTokens();
  return (
    <VStack spacing="lg" style={{ gap: spacing.lg }}>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
    </VStack>
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
