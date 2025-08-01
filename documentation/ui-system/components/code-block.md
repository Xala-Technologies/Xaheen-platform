# CodeBlock Component

## Purpose
The `CodeBlock` component displays syntax-highlighted code snippets. SSR-compatible, accessible, themeable, and supports copy-to-clipboard.

## Usage
```typescript
import { CodeBlock } from '@xala-technologies/ui-system';

<CodeBlock language="typescript" code={`const x = 1;`} />
```

## Props
```typescript
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
}
```

## Accessibility
- Uses `<pre>` and `<code>` with ARIA attributes
- Keyboard and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- Copy button and tooltips must use localization

## Theming & Design Tokens
- Uses tokens: `colors.codeBlock`, `spacing`, `typography`

## Example: Themed CodeBlock
```typescript
import { useTokens, CodeBlock } from '@xala-technologies/ui-system';

const ThemedCodeBlock = (props) => {
  const { colors } = useTokens();
  return <CodeBlock {...props} style={{ background: colors.codeBlock.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only code block logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
