# Accordion Component

## Purpose
The `Accordion` component provides collapsible sections for content organization. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { Accordion } from '@xala-technologies/ui-system';

<Accordion items={accordionItems} />
```

## Props
```typescript
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  onChange?: (openId: string) => void;
}
```

## Accessibility
- Uses ARIA roles (`region`, `button`, `tabpanel`)
- Keyboard navigation
- WCAG 2.2 AA compliant

## Localization
- All titles and content must use localization

## Theming & Design Tokens
- Uses tokens: `colors.accordion`, `spacing`, `typography`

## Example: Themed Accordion
```typescript
import { useTokens, Accordion } from '@xala-technologies/ui-system';

const ThemedAccordion = ({ items }) => {
  const { colors } = useTokens();
  return <Accordion items={items} style={{ background: colors.accordion.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only accordion logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
