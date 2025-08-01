# Avatar Component

## Purpose
The `Avatar` component displays user or entity images, initials, or icons. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Avatar } from '@xala-technologies/ui-system';

<Avatar src="/user.jpg" alt="User Name" size="md" />
```

## Props
```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
```

## Accessibility
- Uses `<img>` with `alt` text
- Supports ARIA attributes
- WCAG 2.2 AA compliant

## Localization
- All `alt` text must use localization

## Theming & Design Tokens
- Uses tokens: `colors.avatar`, `spacing`, `typography`

## Example: Themed Avatar
```typescript
import { useTokens, Avatar } from '@xala-technologies/ui-system';

const ThemedAvatar = (props) => {
  const { colors } = useTokens();
  return <Avatar {...props} style={{ background: colors.avatar.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only avatar logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
