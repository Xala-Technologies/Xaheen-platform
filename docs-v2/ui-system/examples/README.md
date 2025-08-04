# UI System - Code Examples

## 🎯 Real-World Implementation Examples

This section provides comprehensive, production-ready examples using the **Xala Universal Design System v5.0** with proper **Norwegian compliance**, **CVA architecture**, and **accessibility standards**.

---

## 📋 Example Categories

### 🏢 Business Applications
- **[Dashboard Analytics](./dashboard-analytics.md)** - Executive dashboard with KPIs and charts
- **[Admin Panel](./admin-panel.md)** - User management and system administration
- **[Project Management](./project-management.md)** - Task boards and project tracking
- **[E-commerce Store](./ecommerce-store.md)** - Product catalog and shopping cart

### 📄 Forms & Data Entry
- **[User Registration](./user-registration.md)** - GDPR-compliant user signup
- **[Contact Forms](./contact-forms.md)** - Customer support and inquiry forms
- **[Norwegian Forms](./norwegian-forms.md)** - Personal number and government forms
- **[Multi-step Wizard](./multi-step-wizard.md)** - Complex form workflows

### 🎨 UI Patterns
- **[Landing Pages](./landing-pages.md)** - Marketing and promotional pages
- **[Authentication](./authentication.md)** - Login, signup, and password reset
- **[Data Tables](./data-tables.md)** - Sortable, filterable data displays
- **[Modal Dialogs](./modal-dialogs.md)** - Confirmation and content modals

### 🇳🇴 Norwegian Compliance
- **[NSM Classification](./nsm-classification.md)** - Security classified documents
- **[GDPR Forms](./gdpr-forms.md)** - Data protection compliant forms
- **[Government Portal](./government-portal.md)** - Norwegian government website

---

## 🚀 Quick Examples

### Simple Dashboard Card

```typescript
import { Card, Stack, Text, Badge, Button } from '@xala-technologies/ui-system';

function MetricCard({ title, value, change, trend }) {
  const { t, formatNumber } = useLocalization();

  return (
    <Card variant="elevated" padding="lg">
      <Stack direction="vertical" gap="md">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text variant="caption" color="muted-foreground">
            {title}
          </Text>
          <Badge variant={trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'secondary'}>
            {change > 0 ? '+' : ''}{change}%
          </Badge>
        </Stack>
        
        <Text variant="h2">{formatNumber(value)}</Text>
        
        <Button variant="ghost" size="sm">
          {t('dashboard.viewDetails')}
        </Button>
      </Stack>
    </Card>
  );
}
```

### Norwegian Personal Number Form

```typescript
import { Stack, PersonalNumberInput, Button, Alert, Text } from '@xala-technologies/ui-system';

function PersonalDataForm() {
  const { t } = useLocalization();

  return (
    <Stack direction="vertical" gap="lg">
      <Alert variant="info">
        <Text variant="body">{t('gdpr.dataProcessing.notice')}</Text>
      </Alert>
      
      <PersonalNumberInput
        label={t('form.personalNumber.label')}
        placeholder={t('form.personalNumber.placeholder')}
        helperText={t('form.personalNumber.gdprNotice')}
        gdprCompliant={true}
        auditTrail={true}
        required
      />
      
      <Button variant="primary" type="submit">
        {t('form.submit')}
      </Button>
    </Stack>
  );
}
```

### Accessible Data Table

```typescript
import { Table, Stack, Text, Button, Input, Select } from '@xala-technologies/ui-system';

function UserTable({ users }) {
  const { t } = useLocalization();

  return (
    <Stack direction="vertical" gap="lg">
      <Stack direction="horizontal" gap="md" justify="space-between">
        <Text variant="h2">{t('users.title')}</Text>
        <Button variant="primary">
          {t('users.addNew')}
        </Button>
      </Stack>
      
      <Stack direction="horizontal" gap="md">
        <Input
          placeholder={t('users.search.placeholder')}
          className="flex-1"
        />
        <Select
          placeholder={t('users.filter.role')}
          options={[
            { value: 'admin', label: t('roles.admin') },
            { value: 'user', label: t('roles.user') },
            { value: 'guest', label: t('roles.guest') }
          ]}
        />
      </Stack>
      
      <Table
        data={users}
        columns={[
          {
            key: 'name',
            header: t('users.table.name'),
            sortable: true
          },
          {
            key: 'email',
            header: t('users.table.email'),
            sortable: true
          },
          {
            key: 'role',
            header: t('users.table.role'),
            render: (value) => t(`roles.${value}`)
          },
          {
            key: 'actions',
            header: t('users.table.actions'),
            render: (_, user) => (
              <Stack direction="horizontal" gap="sm">
                <Button variant="ghost" size="sm">
                  {t('actions.edit')}
                </Button>
                <Button variant="ghost" size="sm">
                  {t('actions.delete')}
                </Button>
              </Stack>
            )
          }
        ]}
        aria-label={t('users.table.ariaLabel')}
      />
    </Stack>
  );
}
```

### Mobile-Responsive Navigation

```typescript
import { Stack, Button, Logo, useMediaQuery } from '@xala-technologies/ui-system';

function Navigation() {
  const { t } = useLocalization();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Stack direction="vertical" gap="md" padding="md">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" aria-label={t('nav.toggleMenu')}>
            ☰
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="horizontal" justify="space-between" align="center" padding="md">
      <Logo size="md" />
      
      <Stack direction="horizontal" gap="md">
        <Button variant="ghost">{t('nav.home')}</Button>
        <Button variant="ghost">{t('nav.products')}</Button>
        <Button variant="ghost">{t('nav.about')}</Button>
        <Button variant="ghost">{t('nav.contact')}</Button>
      </Stack>
      
      <Stack direction="horizontal" gap="sm">
        <Button variant="outline" size="sm">
          {t('auth.login')}
        </Button>
        <Button variant="primary" size="sm">
          {t('auth.signup')}
        </Button>
      </Stack>
    </Stack>
  );
}
```

---

## 🎨 Advanced Pattern Examples

### Theme-Aware Component

```typescript
import { Card, Stack, Text, Button, useTheme } from '@xala-technologies/ui-system';

function ThemedFeatureCard({ feature }) {
  const { t } = useLocalization();
  const { theme } = useTheme();

  return (
    <Card 
      variant={theme === 'dark' ? 'elevated' : 'outline'} 
      padding="xl"
    >
      <Stack direction="vertical" gap="lg" align="center">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-accent' : 'bg-muted'}`}>
          {feature.icon}
        </div>
        
        <Stack direction="vertical" gap="md" align="center">
          <Text variant="h3" align="center">
            {t(`features.${feature.key}.title`)}
          </Text>
          <Text variant="body" align="center" color="muted-foreground">
            {t(`features.${feature.key}.description`)}
          </Text>
        </Stack>
        
        <Button variant="primary">
          {t(`features.${feature.key}.action`)}
        </Button>
      </Stack>
    </Card>
  );
}
```

### Norwegian Government Portal Component

```typescript
import { 
  Container, 
  Section, 
  Stack, 
  Text, 
  Card, 
  ClassificationIndicator,
  Button 
} from '@xala-technologies/ui-system';

function GovernmentServiceCard({ service, classification = 'ÅPEN' }) {
  const { t } = useLocalization();

  return (
    <div className="relative">
      <ClassificationIndicator 
        level={classification}
        label={t(`nsm.classification.${classification}`)}
        position="top-right"
      />
      
      <Card variant="elevated" padding="lg">
        <Stack direction="vertical" gap="md">
          <Stack direction="horizontal" gap="md" align="center">
            <div className="p-2 bg-primary rounded-md text-primary-foreground">
              {service.icon}
            </div>
            <Stack direction="vertical" gap="xs">
              <Text variant="h4">{service.name}</Text>
              <Text variant="caption" color="muted-foreground">
                {t(`services.category.${service.category}`)}
              </Text>
            </Stack>
          </Stack>
          
          <Text variant="body">{service.description}</Text>
          
          <Stack direction="horizontal" gap="sm" justify="space-between">
            <Text variant="caption" color="muted-foreground">
              {t('services.processingTime')}: {service.processingTime}
            </Text>
            <Button variant="primary" size="sm">
              {t('services.startApplication')}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
```

### Accessible Form with Validation

```typescript
import { 
  Stack, 
  Input, 
  Select, 
  Button, 
  Alert, 
  Text,
  useFormValidation 
} from '@xala-technologies/ui-system';

function AccessibleContactForm() {
  const { t } = useLocalization();
  const { errors, validateField, isValid } = useFormValidation({
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    subject: { required: true },
    message: { required: true, minLength: 10 }
  });

  return (
    <form role="form" aria-labelledby="contact-form-title">
      <Stack direction="vertical" gap="lg">
        <Text id="contact-form-title" variant="h2">
          {t('contact.form.title')}
        </Text>
        
        {errors.form && (
          <Alert variant="destructive" role="alert">
            <Text variant="body">{errors.form}</Text>
          </Alert>
        )}
        
        <fieldset>
          <legend className="sr-only">{t('contact.form.personalInfo')}</legend>
          
          <Stack direction="vertical" gap="md">
            <Input
              id="contact-name"
              label={t('form.name.label')}
              placeholder={t('form.name.placeholder')}
              error={errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              onBlur={(e) => validateField('name', e.target.value)}
              required
            />
            
            <Input
              id="contact-email"
              type="email"
              label={t('form.email.label')}
              placeholder={t('form.email.placeholder')}
              error={errors.email}
              aria-describedby={errors.email ? 'email-error' : 'email-help'}
              onBlur={(e) => validateField('email', e.target.value)}
              required
            />
            <Text id="email-help" variant="caption" color="muted-foreground">
              {t('form.email.help')}
            </Text>
          </Stack>
        </fieldset>
        
        <fieldset>
          <legend className="sr-only">{t('contact.form.message')}</legend>
          
          <Stack direction="vertical" gap="md">
            <Select
              id="contact-subject"
              label={t('form.subject.label')}
              placeholder={t('form.subject.placeholder')}
              options={[
                { value: 'support', label: t('contact.subject.support') },
                { value: 'sales', label: t('contact.subject.sales') },
                { value: 'general', label: t('contact.subject.general') }
              ]}
              error={errors.subject}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              onValueChange={(value) => validateField('subject', value)}
              required
            />
            
            <textarea
              id="contact-message"
              rows={4}
              placeholder={t('form.message.placeholder')}
              aria-label={t('form.message.label')}
              aria-describedby={errors.message ? 'message-error' : 'message-help'}
              className="w-full p-3 border border-input rounded-md"
              onBlur={(e) => validateField('message', e.target.value)}
              required
            />
            <Text id="message-help" variant="caption" color="muted-foreground">
              {t('form.message.help')}
            </Text>
          </Stack>
        </fieldset>
        
        <Button 
          variant="primary" 
          type="submit" 
          disabled={!isValid}
          className="w-full"
        >
          {t('form.submit')}
        </Button>
      </Stack>
    </form>
  );
}
```

---

## 🔗 Related Resources

- **[Component Library](../components/)** - Complete component documentation
- **[Design Tokens](../tokens/)** - Token system reference
- **[AI Integration](../ai-integration/)** - AI-powered development guide
- **[Testing Guide](../testing/)** - Testing patterns and examples

---

*UI System Examples v2.0 - Production-ready code examples with Norwegian compliance*