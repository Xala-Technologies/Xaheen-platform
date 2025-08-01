# DesktopSidebar Component

## Purpose
The `DesktopSidebar` component provides a navigation and control panel for desktop platforms. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { DesktopSidebar } from '@xala-technologies/ui-system/platform/desktop';

<DesktopSidebar items={sidebarItems} />
```

## Props
```typescript
interface DesktopSidebarProps {
  items: Array<{ label: string; href: string; icon?: React.ReactNode }>;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
}
```

## Accessibility
- Uses semantic roles and ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.platform.desktopSidebar`, `spacing`, `typography`

## Example: Themed DesktopSidebar
```typescript
import { useTokens, DesktopSidebar } from '@xala-technologies/ui-system/platform/desktop';

const ThemedSidebar = ({ items }) => {
  const { colors } = useTokens();
  return <DesktopSidebar items={items} style={{ background: colors.platform.desktopSidebar }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only sidebar logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Platform Components](./platform.md)
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
