# DataTable Component

## Purpose
The `DataTable` component displays tabular data with sorting, pagination, and accessibility features. Fully themeable and SSR-compatible.

## Usage
```typescript
import { DataTable } from '@xala-technologies/ui-system';

<DataTable data={tableData} columns={columnDefinitions} pagination={true} />
```

## Props
```typescript
interface DataTableProps<T> {
  /** Data rows */
  data: T[];
  /** Column definitions */
  columns: Array<{ key: string; label: string; render?: (row: T) => React.ReactNode }>;
  /** Enable pagination */
  pagination?: boolean;
}
```

## Accessibility
- Uses semantic `<table>` structure
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All column labels and messages must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `colors.table`, `spacing`, `typography`

## Example: Themed DataTable
```typescript
import { useTokens, DataTable } from '@xala-technologies/ui-system';

const ThemedTable = ({ data, columns }) => {
  const { colors } = useTokens();
  return <DataTable data={data} columns={columns} style={{ background: colors.table.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only table logic
- Open/Closed: Extend via props and render functions
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
