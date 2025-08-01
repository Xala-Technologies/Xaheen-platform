# Breadcrumb Component

## Purpose
The `Breadcrumb` component provides hierarchical navigation links for improved orientation. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Breadcrumb } from '@xala-technologies/ui-system';

<Breadcrumb items={breadcrumbItems} />
```

## Props
```typescript
interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
}
```

## Accessibility
- Uses ARIA roles (`navigation`, `list`, `listitem`)
- Keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.breadcrumb`, `spacing`, `typography`

## Example: Themed Breadcrumb
```typescript
import { useTokens, Breadcrumb } from '@xala-technologies/ui-system';

const ThemedBreadcrumb = ({ items }) => {
  const { colors } = useTokens();
  return <Breadcrumb items={items} style={{ color: colors.breadcrumb.link }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only breadcrumb logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
