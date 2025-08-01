# Example: Chat / Messaging (Advanced)

A real-time chat UI using only semantic UI System components and design tokens. No forbidden styling patterns.

---

## Scenario
A chat interface with message bubbles, input, and user avatars. All spacing, color, and sizing from tokens.

---

## Example Code
```typescript
import { BasePage, WebLayout, Navbar, Stack, Typography, Input, Button, MessageBubble, Avatar, Container, ScrollArea } from '@xala-technologies/ui-system';

export default function ChatPage() {
  return (
    <BasePage title="Chat">
      <WebLayout>
        <Navbar variant="chat" />
        <Container spacing="16">
          <Typography variant="heading" size="2xl">Chat Room</Typography>
          <ScrollArea>
            <Stack gap="6">
              {messages.map(msg => (
                <Stack key={msg.id} direction="row" gap="4">
                  <Avatar src={msg.avatar} alt={msg.user} size="md" />
                  <MessageBubble message={msg.text} sender={msg.user} timestamp={msg.time} />
                </Stack>
              ))}
            </Stack>
          </ScrollArea>
          <Stack direction="row" gap="4">
            <Input placeholder="Type your message..." size="lg" />
            <Button label="Send" variant="primary" size="lg" />
          </Stack>
        </Container>
      </WebLayout>
    </BasePage>
  );
}
```

---

## Compliance Checklist
- All spacing, radius, and color via design tokens (no inline styles, no hardcoded values)
- No raw HTML or direct className for styling
- 8pt grid and sizing standards
- WCAG 2.2 AAA accessibility
- SOLID, strict types, SSR-ready
