# Example: Forum Page

This page demonstrates a forum UI using only semantic UI System components, supporting accessibility, theming, and localization.

---

## Scenario
A public forum with threads, search, and post actions.

---

## Example Code
```typescript
import { BasePage, WebLayout, Navigation, Card, Stack, Typography, Input, Button, Pagination, Badge, Container } from '@xala-technologies/ui-system';

export default function ForumPage() {
  return (
    <BasePage title="Forum">
      <WebLayout>
        <Navigation items={forumNavItems} />
        <Container>
          <Stack gap="lg">
            <Typography variant="h1">Forum</Typography>
            <Stack direction="row" gap="md">
              <Input placeholder="Search threads..." />
              <Button label="New Thread" onClick={handleNewThread} />
            </Stack>
            <Stack gap="md">
              {threads.map(thread => (
                <Card key={thread.id}>
                  <Stack gap="sm">
                    <Typography variant="h2">{thread.title}</Typography>
                    <Typography variant="body">{thread.snippet}</Typography>
                    <Badge label={thread.replyCount + ' replies'} variant="info" />
                  </Stack>
                </Card>
              ))}
            </Stack>
            <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
          </Stack>
        </Container>
      </WebLayout>
    </BasePage>
  );
}
```

---

## Compliance Checklist
- No raw HTML, all semantic components
- All user-facing text localizable
- Design tokens for all styling
- Accessibility and keyboard navigation
- SOLID, strict types, SSR-ready
