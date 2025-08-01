# CommandPalette Component

## Purpose
The `CommandPalette` component provides a searchable command menu for quick navigation and actions. SSR-compatible, accessible, and themeable.

## Usage
```typescript
import { CommandPalette } from '@xala-technologies/ui-system';

<CommandPalette commands={commands} onCommand={handleCommand} />
```

## Props
```typescript
interface Command {
  id: string;
  label: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
  onCommand: (commandId: string) => void;
  placeholder?: string;
}
```

## Accessibility
- Uses ARIA roles (`dialog`, `listbox`, `option`)
- Keyboard navigation and screen reader accessible
- WCAG 2.2 AA compliant

## Localization
- All labels and placeholder must use localization

## Theming & Design Tokens
- Uses tokens: `colors.commandPalette`, `spacing`, `typography`

## Example: Themed CommandPalette
```typescript
import { useTokens, CommandPalette } from '@xala-technologies/ui-system';

const ThemedCommandPalette = (props) => {
  const { colors } = useTokens();
  return <CommandPalette {...props} style={{ background: colors.commandPalette.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only command palette logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
