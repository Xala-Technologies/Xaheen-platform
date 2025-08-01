# Form Component

## Purpose
The `Form` component provides a semantic, accessible wrapper for form fields and handles submission logic. SSR-compatible, themeable, and extensible for validation and custom flows.

## Usage
```typescript
import { Form, Input, Button } from '@xala-technologies/ui-system';

<Form onSubmit={handleSubmit}>
  <Input name="email" placeholder="Email" />
  <Button type="submit">Submit</Button>
</Form>
```

## Props
```typescript
interface FormProps {
  /** Submit handler */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Children */
  children: React.ReactNode;
}
```

## Accessibility
- Uses `<form>` element with proper roles
- Keyboard and screen reader accessible
- Supports validation states
- WCAG 2.2 AA compliant

## Localization
- All field labels, placeholders, and messages must use localization
- Supports EN, NB, FR, AR

## Theming & Design Tokens
- Uses tokens: `spacing`, `colors.form`, `typography`

## Example: Themed Form
```typescript
import { useTokens, Form, Input } from '@xala-technologies/ui-system';

const ThemedForm = ({ onSubmit }) => {
  const { spacing } = useTokens();
  return (
    <Form onSubmit={onSubmit} style={{ padding: spacing.md }}>
      <Input name="email" />
    </Form>
  );
};
```

## SOLID & Code Quality
- Single Responsibility: Only form logic
- Open/Closed: Extend via children and props
- Strict types, no `any`
- Complexity and length limits enforced

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
