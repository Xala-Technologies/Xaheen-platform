# Drawer Component

## Purpose
The `Drawer` component displays content in a panel that slides from the edge of the screen. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Drawer } from '@xala-technologies/ui-system';

<Drawer open={isOpen} onClose={closeDrawer}>Content</Drawer>
```

## Props
```typescript
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

## Accessibility
- Uses ARIA roles (`dialog`, `region`)
- Focus trap and keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- All user-facing text must use localization

## Theming & Design Tokens
- Uses tokens: `colors.drawer`, `spacing`, `radii`, `typography`

## Example: Themed Drawer
```typescript
import { useTokens, Drawer } from '@xala-technologies/ui-system';

const ThemedDrawer = ({ open, onClose, children }) => {
  const { colors } = useTokens();
  return <Drawer open={open} onClose={onClose} style={{ background: colors.drawer.background }}>{children}</Drawer>;
};
```

## SOLID & Code Quality
- Single Responsibility: Only drawer logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
