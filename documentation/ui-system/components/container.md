# Container Component

## Purpose
The `Container` component provides a responsive, padded wrapper for page content. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Container } from '@xala-technologies/ui-system';

<Container maxWidth="lg" padding="md" centered>
  <div>Your content here</div>
</Container>
```

## Props
```typescript
interface ContainerProps {
  /** Maximum width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  /** Padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Center content */
  centered?: boolean;
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

const ThemedContainer = ({ children }) => {
  const { spacing } = useTokens();
  return <Container padding="lg" style={{ padding: spacing.lg }}>{children}</Container>;
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
