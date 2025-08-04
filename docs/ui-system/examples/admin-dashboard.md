# Example: Admin Dashboard Page

This page demonstrates how to build a compliant, accessible admin dashboard using only semantic UI System components (no raw HTML, no hardcoded styles).

---

## Scenario
A dashboard for administrators with navigation, stats, data table, and quick actions.

---

## Example Code
```typescript
import { BasePage, AdminLayout, Navigation, Card, DataTable, ActionBar, Badge, Typography, Container, Grid, Stack } from '@xala-technologies/ui-system';

export default function AdminDashboard() {
  return (
    <BasePage title="Admin Dashboard">
      <AdminLayout>
        <Navigation items={adminNavItems} />
        <Container>
          <Typography variant="h1">Dashboard</Typography>
          <Grid columns={3} gap="lg">
            <Card><Stack gap="sm"><Typography variant="h2">Users</Typography><Badge label="1,204" variant="success" /></Stack></Card>
            <Card><Stack gap="sm"><Typography variant="h2">Revenue</Typography><Badge label="$12,340" variant="info" /></Stack></Card>
            <Card><Stack gap="sm"><Typography variant="h2">Errors</Typography><Badge label="5" variant="danger" /></Stack></Card>
          </Grid>
          <ActionBar actions={dashboardActions} />
          <DataTable columns={userColumns} data={userRows} />
        </Container>
      </AdminLayout>
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
