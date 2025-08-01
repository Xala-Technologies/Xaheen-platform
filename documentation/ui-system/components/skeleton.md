# Skeleton Component

## Purpose
The `Skeleton` component displays a placeholder for loading content. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Skeleton } from '@xala-technologies/ui-system';

<Skeleton width={200} height={20} />
```

## Props
```typescript
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'rect' | 'circle';
}
```

## Accessibility
- Uses ARIA roles (`status`, `progressbar`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Not applicable (decorative only)

## Theming & Design Tokens
- Uses tokens: `colors.skeleton`, `spacing`, `radii`

## Example: Themed Skeleton
```typescript
import { useTokens, Skeleton } from '@xala-technologies/ui-system';

const ThemedSkeleton = (props) => {
  const { colors } = useTokens();
  return <Skeleton {...props} style={{ background: colors.skeleton.base }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only skeleton logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
