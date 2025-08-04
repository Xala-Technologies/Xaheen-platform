# Typography Component

## Purpose
The `Typography` component provides semantic, themeable text elements for headings, paragraphs, and inline text. SSR-compatible and accessible.

## Usage
```typescript
import { Typography } from '@xala-technologies/ui-system';

<Typography variant="h1">Heading</Typography>
```

## Props
```typescript
interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  children: React.ReactNode;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}
```

## Accessibility
- Uses semantic HTML tags (no raw div/span)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- Content must use localization where applicable

## Theming & Design Tokens
- Uses tokens: `colors.typography`, `typography`, `spacing`

## Example: Themed Typography
```typescript
import { useTokens, Typography } from '@xala-technologies/ui-system';

interface ThemedTypographyProps {
  children: React.ReactNode;
}

const ThemedTypography = ({ children }: ThemedTypographyProps): JSX.Element => {
  const { colors } = useTokens();
  return (
    <Typography 
      variant="body" 
      style={{ color: colors.text.primary }}
    >
      {children}
    </Typography>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only typography logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
