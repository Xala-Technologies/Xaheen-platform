# TreeView Component

## Purpose
The `TreeView` component displays hierarchical data as an expandable tree. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { TreeView } from '@xala-technologies/ui-system';

<TreeView data={treeData} onSelect={handleSelect} />
```

## Props
```typescript
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (id: string) => void;
  expandedIds?: string[];
}
```

## Accessibility
- Uses ARIA roles (`tree`, `treeitem`, `group`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.treeView`, `spacing`, `typography`

## Example: Themed TreeView
```typescript
import { useTokens, TreeView } from '@xala-technologies/ui-system';

const ThemedTreeView = ({ data }) => {
  const { colors } = useTokens();
  return <TreeView data={data} style={{ background: colors.treeView.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only tree view logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
