# Pagination Component

## Purpose
The `Pagination` component provides navigation for paged content and data tables. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Pagination } from '@xala-technologies/ui-system';

<Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
```

## Props
```typescript
interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showArrows?: boolean;
}
```

## Accessibility
- Uses ARIA roles (`navigation`, `list`, `listitem`, `button`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels and aria-labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.pagination`, `spacing`, `typography`

## Example: Themed Pagination
```typescript
import { useTokens, Pagination } from '@xala-technologies/ui-system';

const ThemedPagination = (props) => {
  const { colors } = useTokens();
  return <Pagination {...props} style={{ color: colors.pagination.text }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only pagination logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
