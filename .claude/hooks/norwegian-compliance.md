# Norwegian Compliance Hook

This hook ensures all generated code meets Norwegian government and enterprise compliance requirements.

## NSM Classification Requirements

All generated code must include proper NSM (Norwegian Security Model) classification:

- **OPEN**: Public interfaces and general components
- **RESTRICTED**: Internal business components with basic security
- **CONFIDENTIAL**: Sensitive data components with enhanced security
- **SECRET**: Maximum security components with access controls

## Compliance Validation Rules

1. **NSM Classification**: All components must have `nsmClassification` prop
2. **GDPR Compliance**: Data handling components must include consent management
3. **Norwegian Locale**: All text must support Norwegian localization (`nb-NO`)
4. **Altinn Design System**: Government interfaces must use Altinn compatibility
5. **WCAG AAA**: All components must meet accessibility standards
6. **Audit Trails**: Sensitive operations must include logging capabilities

## Required Component Features

### Security Classification
```typescript
export interface ComponentProps {
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

// Usage in component
<div data-nsm-classification={nsmClassification}>
```

### Norwegian Localization
```typescript
import { t } from '@xala-technologies/ui-system/i18n';

// All text must use translation functions
<Text>{t('component.title', { defaultValue: 'Default Text' })}</Text>
```

### GDPR Compliance
```typescript
// Data collection components must include consent
{requiresConsent && (
  <GDPRConsent
    purpose="data-collection"
    onConsent={handleConsent}
    locale="nb-NO"
  />
)}
```

### Accessibility Compliance
```typescript
// All interactive elements must have ARIA labels
<Button
  aria-label={t('button.action', { defaultValue: 'Perform action' })}
  onClick={handleAction}
>
  {t('button.text', { defaultValue: 'Action' })}
</Button>
```

## Enforcement Actions

Before generating any component:

1. **Validate Classification**: Ensure appropriate NSM level is specified
2. **Check Localization**: Verify all text uses translation functions
3. **Audit Accessibility**: Validate ARIA labels and keyboard navigation
4. **Review Security**: Check for data handling and access controls
5. **Verify Compliance**: Ensure GDPR and Norwegian standards are met

## Norwegian Government Standards

Components for government use must include:

- **BankID Integration**: Authentication components
- **Vipps Payment**: Payment processing components  
- **Altinn Document Handling**: Document management components
- **Norwegian Phone/Postal Code Validation**: Form validation patterns
- **RTL Text Support**: For Arabic compliance requirements

## Error Handling

If compliance requirements are not met:
- Block code generation
- Provide specific compliance error messages
- Reference Norwegian standards documentation
- Suggest compliant alternatives

## Example Compliant Component

```typescript
interface GovernmentFormProps {
  readonly nsmClassification: 'RESTRICTED' | 'CONFIDENTIAL';
  readonly requiresConsent?: boolean;
  readonly locale?: string;
}

export const GovernmentForm = ({
  nsmClassification = 'RESTRICTED',
  requiresConsent = true,
  locale = 'nb-NO'
}: GovernmentFormProps): JSX.Element => {
  return (
    <Container 
      data-nsm-classification={nsmClassification}
      lang={locale}
      role="form"
      aria-labelledby="form-title"
    >
      <Text id="form-title" variant="h1">
        {t('form.government.title', { defaultValue: 'Government Form' })}
      </Text>
      
      {requiresConsent && (
        <GDPRConsent
          purpose="government-service"
          onConsent={handleConsent}
          locale={locale}
        />
      )}
      
      {/* Form content with Norwegian compliance */}
    </Container>
  );
};
```