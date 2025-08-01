# TabsIndividual Component

## Purpose
The `TabsIndividual` component provides a set of individually controlled tabs for content navigation. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { TabsIndividual } from '@xala-technologies/ui-system';

<TabsIndividual tabs={tabItems} />
```

## Props
```typescript
interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsIndividualProps {
  tabs: TabItem[];
  defaultActiveId?: string;
  onTabChange?: (tabId: string) => void;
}
```

## Accessibility
- Uses ARIA roles (`tablist`, `tab`, `tabpanel`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.tabs`, `spacing`, `typography`

## Example: Themed TabsIndividual
```typescript
import { useTokens, TabsIndividual } from '@xala-technologies/ui-system';

const ThemedTabs = ({ tabs }) => {
  const { colors } = useTokens();
  return <TabsIndividual tabs={tabs} style={{ background: colors.tabs.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only tabs logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
