# BottomNavigation Component

## Purpose
The `BottomNavigation` component provides a mobile-friendly navigation bar for primary actions. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { BottomNavigation } from '@xala-technologies/ui-system/platform/mobile';

<BottomNavigation items={navItems} />
```

## Props
```typescript
interface BottomNavigationProps {
  items: Array<{ label: string; href: string; icon?: React.ReactNode }>;
  activeIndex?: number;
  onChange?: (index: number) => void;
}
```

## Accessibility
- Uses `<nav>` and ARIA roles
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.platform.bottomNavigation`, `spacing`, `typography`

## Example: Themed BottomNavigation
```typescript
import { useTokens, BottomNavigation } from '@xala-technologies/ui-system/platform/mobile';

const ThemedBottomNav = ({ items }) => {
  const { colors } = useTokens();
  return <BottomNavigation items={items} style={{ background: colors.platform.bottomNavigation }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only bottom navigation logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Platform Components](./platform.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
