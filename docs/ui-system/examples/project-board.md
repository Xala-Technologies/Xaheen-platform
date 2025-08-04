# Example: Project Management Board (Advanced)

A Kanban-style project board with columns, cards, drag-and-drop, and status indicators. All styling via design tokens, no forbidden patterns.

---

## Scenario
A board for managing project tasks, using only semantic components and tokens.

---

## Example Code
```typescript
import { BasePage, WebLayout, Navbar, Card, Stack, Typography, Badge, Button, Grid, Container } from '@xala-technologies/ui-system';

export default function ProjectBoard() {
  return (
    <BasePage title="Project Board">
      <WebLayout>
        <Navbar variant="project" />
        <Container spacing="20">
          <Typography variant="heading" size="2xl">Project Board</Typography>
          <Grid columns={4} gap="8">
            {columns.map(col => (
              <Stack key={col.id} gap="6">
                <Typography variant="heading" size="lg">{col.title}</Typography>
                {col.tasks.map(task => (
                  <Card key={task.id} variant="elevated" padding="8" radius="lg" shadow="md">
                    <Stack gap="4">
                      <Typography variant="body" size="md">{task.title}</Typography>
                      <Badge label={task.status} variant={task.statusVariant} />
                      <Button label="View" variant="primary" size="md" />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ))}
          </Grid>
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
