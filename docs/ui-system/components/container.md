# Container Component

## Purpose
The `Container` component provides a responsive, padded wrapper for page content. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Container, Typography } from '@xala-technologies/ui-system';

<Container size="lg" padding="md">
  <Typography variant="body">Your content here</Typography>
</Container>
```

## Props
```typescript
interface ContainerProps {
  /** Container size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
- Uses tokens: `spacing`, `colors.container`, `typography`

## Example: Themed Container
```typescript
import { useTokens, Container } from '@xala-technologies/ui-system';

interface ThemedContainerProps {
  children: React.ReactNode;
}

const ThemedContainer = ({ children }: ThemedContainerProps): JSX.Element => {
  const { spacing, colors } = useTokens();
  return (
    <Container 
      size="lg" 
      padding="lg" 
      style={{ 
        backgroundColor: colors.background.secondary,
        margin: spacing.md 
      }}
    >
      {children}
    </Container>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only container logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
