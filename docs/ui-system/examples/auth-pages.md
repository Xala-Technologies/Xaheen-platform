# Example: Auth Pages (Sign In, Sign Up, Forgot Password)

Demonstrates compliant, accessible authentication pages using only semantic UI System components and design tokens. No raw HTML, no inline styles, all localization-ready.

---

## 1. Sign In Page
```typescript
import { BasePage, WebLayout, Card, Stack, Typography, Input, Button, Container } from '@xala-technologies/ui-system';

export default function SignInPage() {
  return (
    <BasePage title="Sign In">
      <WebLayout>
        <Container spacing="16">
          <Card variant="elevated" padding="10" radius="xl">
            <Stack gap="8">
              <Typography variant="heading" size="xl">Sign In</Typography>
              <Input label="Email" type="email" required autoComplete="email" size="lg" />
              <Input label="Password" type="password" required autoComplete="current-password" size="lg" />
              <Button label="Sign In" variant="primary" size="lg" />
              <Button label="Forgot Password?" variant="link" size="md" />
            </Stack>
          </Card>
        </Container>
      </WebLayout>
    </BasePage>
  );
}
```

---

## 2. Sign Up Page
```typescript
import { BasePage, WebLayout, Card, Stack, Typography, Input, Button, Container } from '@xala-technologies/ui-system';

export default function SignUpPage() {
  return (
    <BasePage title="Sign Up">
      <WebLayout>
        <Container spacing="16">
          <Card variant="elevated" padding="10" radius="xl">
            <Stack gap="8">
              <Typography variant="heading" size="xl">Sign Up</Typography>
              <Input label="Name" type="text" required autoComplete="name" size="lg" />
              <Input label="Email" type="email" required autoComplete="email" size="lg" />
              <Input label="Password" type="password" required autoComplete="new-password" size="lg" />
              <Button label="Create Account" variant="primary" size="lg" />
              <Button label="Already have an account? Sign In" variant="link" size="md" />
            </Stack>
          </Card>
        </Container>
      </WebLayout>
    </BasePage>
  );
}
```

---

## 3. Forgot Password Page
```typescript
import { BasePage, WebLayout, Card, Stack, Typography, Input, Button, Container } from '@xala-technologies/ui-system';

export default function ForgotPasswordPage() {
  return (
    <BasePage title="Forgot Password">
      <WebLayout>
        <Container spacing="16">
          <Card variant="elevated" padding="10" radius="xl">
            <Stack gap="8">
              <Typography variant="heading" size="xl">Forgot Password</Typography>
              <Input label="Email" type="email" required autoComplete="email" size="lg" />
              <Button label="Send Reset Link" variant="primary" size="lg" />
              <Button label="Back to Sign In" variant="link" size="md" />
            </Stack>
          </Card>
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
- All styling via design tokens (no inline styles, no hardcoded values)
- 8pt grid and sizing standards
- WCAG 2.2 AAA accessibility
- Strict TypeScript, SSR-ready, SOLID principles
