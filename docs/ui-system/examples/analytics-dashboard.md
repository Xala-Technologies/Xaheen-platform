# Example: Analytics Dashboard (Advanced)

Demonstrates a fully accessible analytics dashboard using only semantic UI System components, enhanced design tokens, and no forbidden styling patterns.

---

## Scenario
A dashboard for data analysts with charts, stats, filters, and summary cards. All spacing, sizing, radius, and color are from design tokens. No inline styles or hardcoded values.

---

## Example Code
```typescript
import { BasePage, AdminLayout, Navbar, Card, Stack, Typography, Badge, Button, Grid, Container, TabsIndividual } from '@xala-technologies/ui-system';

export default function AnalyticsDashboard() {
  return (
    <BasePage title="Analytics Dashboard">
      <AdminLayout>
        <Navbar variant="admin" />
        <Container spacing="16">
          <Typography variant="heading" size="3xl">Analytics Overview</Typography>
          <Stack gap="8">
            <Grid columns={4} gap="8">
              <Card variant="elevated" padding="8" radius="xl" shadow="lg">
                <Stack gap="4">
                  <Typography variant="body" size="lg">Total Users</Typography>
                  <Badge label="12,340" variant="primary" />
                </Stack>
              </Card>
              <Card variant="elevated" padding="8" radius="xl" shadow="lg">
                <Stack gap="4">
                  <Typography variant="body" size="lg">Revenue</Typography>
                  <Badge label="$98,765" variant="success" />
                </Stack>
              </Card>
              <Card variant="elevated" padding="8" radius="xl" shadow="lg">
                <Stack gap="4">
                  <Typography variant="body" size="lg">Conversion</Typography>
                  <Badge label="2.4%" variant="info" />
                </Stack>
              </Card>
              <Card variant="elevated" padding="8" radius="xl" shadow="lg">
                <Stack gap="4">
                  <Typography variant="body" size="lg">Active Sessions</Typography>
                  <Badge label="1,234" variant="warning" />
                </Stack>
              </Card>
            </Grid>
            <TabsIndividual tabs={[
              {
                id: 'traffic',
                label: 'Traffic',
                content: <Card variant="elevated" padding="10" radius="2xl" shadow="xl"><Typography variant="body" size="lg">[Traffic Chart]</Typography></Card>
              },
              {
                id: 'sales',
                label: 'Sales',
                content: <Card variant="elevated" padding="10" radius="2xl" shadow="xl"><Typography variant="body" size="lg">[Sales Chart]</Typography></Card>
              }
            ]} />
          </Stack>
        </Container>
      </AdminLayout>
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
