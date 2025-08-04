# Code Quality Hook

This hook enforces the strict TypeScript and React standards defined in CLAUDE.md.

## TypeScript Requirements

**ALL generated code MUST follow these TypeScript patterns:**

- **STRICT TypeScript only** - NO `any` types permitted
- **Explicit return types** for ALL components: `: JSX.Element`
- **Readonly interfaces** for ALL props
- **Proper error handling** with typed errors
- **Strict prop types** with default values

## React Component Structure

**ALL generated components MUST follow these patterns:**

- **ONLY React functional components** - NO class components
- **Modern React hooks** (useState, useEffect, useCallback, useMemo)
- **Component composition** over inheritance
- **Proper prop destructuring** with defaults
- **Error boundaries** for complex components

## Validation Rules

Before any code generation or modification:

1. **TypeScript Strict Mode**: All code must compile without errors in strict mode
2. **Interface Validation**: All props interfaces must use `readonly` modifier
3. **Component Structure**: Must use functional components with forwardRef
4. **Hook Compliance**: Must follow React hooks rules and patterns
5. **Error Handling**: Must include try-catch blocks where appropriate

## Enforcement Actions

If code doesn't meet standards:
- Reject the generation/modification
- Provide specific error messages
- Suggest corrections based on CLAUDE.md patterns
- Reference specific examples from the documentation

## Examples

✅ **CORRECT Pattern:**
```typescript
interface ComponentNameProps {
  readonly title: string;
  readonly onClick?: () => void;
}

export const ComponentName = ({
  title,
  onClick
}: ComponentNameProps): JSX.Element => {
  try {
    return (
      <Container className="p-8 rounded-xl shadow-lg">
        <Text variant="h2">{title}</Text>
      </Container>
    );
  } catch (error) {
    console.error('Component error:', error);
    return <div className="text-red-500">Error rendering component</div>;
  }
};
```

❌ **FORBIDDEN Pattern:**
```typescript
// NO class components
class MyComponent extends React.Component { }

// NO any types
const data: any = props;

// NO inline styles
<div style={{ padding: '16px' }}>
```