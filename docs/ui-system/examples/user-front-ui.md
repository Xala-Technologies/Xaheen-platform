# Example: User Front UI (Search, Grid, List)

This page demonstrates a user-facing UI with search, grid layout, and list layout using only semantic UI System components.

---

## Scenario
A user dashboard with search, grid of cards, and a switchable list layout.

---

## Example Code
```typescript
import { BasePage, WebLayout, Navigation, Input, Button, Grid, Card, Stack, Typography, Container, TabsIndividual } from '@xala-technologies/ui-system';

export default function UserFrontUI() {
  return (
    <BasePage title="User Home">
      <WebLayout>
        <Navigation items={userNavItems} />
        <Container>
          <Stack gap="lg">
            <Typography variant="h1">Welcome</Typography>
            <Stack direction="row" gap="md">
              <Input placeholder="Search..." />
              <Button label="Search" onClick={handleSearch} />
            </Stack>
            <TabsIndividual tabs={[
              {
                id: 'grid',
                label: 'Grid',
                content: (
                  <Grid columns={4} gap="md">
                    {items.map(item => (
                      <Card key={item.id}><Typography variant="h2">{item.title}</Typography></Card>
                    ))}
                  </Grid>
                )
              },
              {
                id: 'list',
                label: 'List',
                content: (
                  <Stack gap="md">
                    {items.map(item => (
                      <Card key={item.id}><Typography variant="h2">{item.title}</Typography></Card>
                    ))}
                  </Stack>
                )
              }
            ]} />
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
