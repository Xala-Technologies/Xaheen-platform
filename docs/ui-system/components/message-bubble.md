# MessageBubble Component

## Purpose
The `MessageBubble` component displays chat or message content in a styled bubble. SSR-compatible, accessible, themeable, and localizable.

## Usage
```typescript
import { MessageBubble } from '@xala-technologies/ui-system';

<MessageBubble message={message} sender="user" />
```

## Props
```typescript
interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'system' | 'other';
  timestamp?: string;
}
```

## Accessibility
- Uses ARIA roles (`article`, `status`)
- Screen reader friendly
- WCAG 2.2 AA compliant

## Localization
- All message content and sender labels must use localization

## Theming & Design Tokens
- Uses tokens: `colors.messageBubble`, `spacing`, `typography`

## Example: Themed MessageBubble
```typescript
import { useTokens, MessageBubble } from '@xala-technologies/ui-system';

const ThemedMessageBubble = (props) => {
  const { colors } = useTokens();
  return <MessageBubble {...props} style={{ background: colors.messageBubble.background }} />;
};
```

## SOLID & Code Quality
- Single Responsibility: Only message bubble logic
- Open/Closed: Extend via props
- Strict types, no `any`

## Further Reading
- [Design Tokens Guide](../design-tokens.md)
- [Themes Guide](../themes.md)
- [Accessibility Principles](../architecture.md)
- [Component Index](./README.md)
