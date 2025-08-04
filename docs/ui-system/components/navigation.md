# Navigation Component

## Purpose
The `Navigation` component group provides accessible, themeable navigation structures, including menus, breadcrumbs, and navigation bars. SSR-compatible and localizable.

## Usage
```typescript
import { Navigation } from '@xala-technologies/ui-system';

<Navigation items={navItems} />
```

## Props
```typescript
interface NavigationProps {
  /** Navigation items */
  items: Array<{ label: string; href: string; icon?: React.ReactNode }>;
  /** ARIA label */
  ariaLabel?: string;
}
```

## Accessibility
- Uses semantic roles (`navigation`, `menu`, `listitem`)
- Keyboard navigation and ARIA attributes
- Supports focus management
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.navigation`, `spacing`, `typography`

## Example: Themed Navigation
```typescript
import { useTokens, Navigation } from '@xala-technologies/ui-system';

const ThemedNavigation = ({ items }) => {
  const { colors } = useTokens();
  return <Navigation items={items} style={{ background: colors.navigation.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only navigation logic
- Open/Closed: Extend via props and composition
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
