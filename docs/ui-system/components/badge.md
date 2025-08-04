# Badge Component

## Purpose
The `Badge` component displays small status descriptors or counts. It is accessible, themeable, and SSR-compatible.

## Usage
```typescript
import { Badge } from '@xala-technologies/ui-system';

<Badge variant="success" size="md">Active</Badge>
```

## Props
```typescript
interface BadgeProps {
  /** Visual style */
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Content */
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
- Uses tokens: `colors.badge`, `spacing`, `typography`

## Example: Themed Badge
```typescript
import { useTokens, Badge } from '@xala-technologies/ui-system';

const ThemedBadge = () => {
  const { colors } = useTokens();
  return <Badge variant="info" style={{ background: colors.badge.info }}>Info</Badge>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only badge logic
- Open/Closed: Extend via props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
