# ClassificationIndicator Component

## Purpose
The `ClassificationIndicator` component visually marks content with a classification (e.g., confidential, internal). SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { ClassificationIndicator } from '@xala-technologies/ui-system/action-feedback';

<ClassificationIndicator level="confidential" label="Confidential" />
```

## Props
```typescript
interface ClassificationIndicatorProps {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  label: string;
}
```

## Accessibility
- Uses ARIA roles (`status`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Label must use localization

## Theming & Design Tokens
- Uses tokens: `colors.classificationIndicator`, `spacing`, `typography`

## Example: Themed ClassificationIndicator
```typescript
import { useTokens, ClassificationIndicator } from '@xala-technologies/ui-system/action-feedback';

const ThemedClassificationIndicator = (props) => {
  const { colors } = useTokens();
  return <ClassificationIndicator {...props} style={{ background: colors.classificationIndicator[props.level] }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only classification logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
