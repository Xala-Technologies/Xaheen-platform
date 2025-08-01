# Grid Component

## Purpose
The `Grid` component provides a responsive, semantic grid layout for arranging content. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Grid, GridItem } from '@xala-technologies/ui-system';

<Grid columns={3} gap="md">
  <GridItem span={2}>Main Content</GridItem>
  <GridItem>Sidebar</GridItem>
</Grid>
```

## Props
```typescript
interface GridProps {
  /** Number of columns */
  columns?: number;
  /** Gap between items */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Children */
  children: React.ReactNode;
}

interface GridItemProps {
  /** Column span */
  span?: number;
  /** Children */
  children: React.ReactNode;
}
```

## Accessibility
- Semantic structure
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All content must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `spacing`, `colors.grid`, `typography`

## Example: Themed Grid
```typescript
import { useTokens, Grid, GridItem } from '@xala-technologies/ui-system';

const ThemedGrid = () => {
  const { spacing } = useTokens();
  return (
    <Grid columns={2} gap="lg" style={{ gap: spacing.lg }}>
      <GridItem>Main</GridItem>
      <GridItem>Side</GridItem>
    </Grid>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only grid logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
