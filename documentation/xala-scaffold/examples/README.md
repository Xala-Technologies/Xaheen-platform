# Xala Scaffolding System - Examples

This directory contains comprehensive examples demonstrating the capabilities of the Xala Scaffolding System, with focus on Norwegian compliance, multi-language support, and enterprise-grade development patterns.

## 📁 Example Categories

### 🔧 Basic Components
**Location**: `./basic-component/`

Demonstrates fundamental component development with the Xala scaffolding system.

- **`Button.tsx`** - Complete button component with Norwegian compliance
- **`Button.test.tsx`** - Comprehensive test suite with compliance testing

**Features shown**:
- TypeScript strict mode
- SOLID principles implementation
- NSM security classification
- WCAG AAA accessibility
- Multi-language support
- Comprehensive testing patterns
- Audit logging integration

**Generated with**:
```bash
xala-scaffold generate component Button \
  --props "variant:string,size:string,onClick:function" \
  --locale nb-NO \
  --compliance \
  --accessibility \
  --tests
```

### 🇳🇴 Norwegian Compliance
**Location**: `./norwegian-compliance/`

Shows comprehensive Norwegian regulatory compliance implementation.

- **`UserProfileForm.tsx`** - Form with full Norwegian compliance features

**Features shown**:
- NSM security classification (RESTRICTED level)
- GDPR data protection and consent management
- WCAG AAA accessibility standards
- Norwegian language validation
- BankID integration patterns
- Audit logging for sensitive data
- Real-time compliance monitoring

**Compliance standards**:
- **NSM**: Security classification, audit logging, data localization
- **GDPR**: Consent management, data minimization, right to erasure
- **WCAG**: AAA level accessibility, screen reader support
- **Norwegian Services**: BankID, ID-porten integration patterns

### 🌍 Multi-Language Support
**Location**: `./multi-language/`

Demonstrates comprehensive internationalization with Norwegian focus.

- **`LanguageSwitcher.tsx`** - Advanced language switching component

**Features shown**:
- Norwegian Bokmål and Nynorsk support
- RTL support for Arabic
- Dynamic language switching
- Locale-aware formatting (dates, numbers, currency)
- Keyboard navigation and accessibility
- Screen reader announcements
- Audit logging for language changes

**Supported languages**:
- Norwegian Bokmål (nb-NO) - Primary
- Norwegian Nynorsk (nn-NO)
- English (en-US)
- Arabic (ar-SA) with RTL support
- French (fr-FR)

## 🚀 Quick Start

### Running the Examples

1. **Install dependencies**:
```bash
cd examples/
npm install
```

2. **Build examples**:
```bash
npm run build
```

3. **Run tests**:
```bash
npm test
```

4. **Run with compliance checking**:
```bash
npm run test:compliance
```

### Using Examples as Templates

Generate components based on these examples:

```bash
# Generate button based on example
xala-scaffold generate component MyButton \
  --template ./examples/basic-component/Button.tsx \
  --locale nb-NO \
  --compliance

# Generate form based on compliance example  
xala-scaffold generate component MyForm \
  --template ./examples/norwegian-compliance/UserProfileForm.tsx \
  --classification RESTRICTED \
  --locale nb-NO

# Generate language switcher
xala-scaffold generate component MyLanguageSwitcher \
  --template ./examples/multi-language/LanguageSwitcher.tsx \
  --locale nb-NO
```

## 📋 Example Breakdown

### Button Component Example

```typescript
// Key features demonstrated:
interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  readonly size?: 'small' | 'medium' | 'large';
  readonly classification?: NSMClassification;
  // ... other props
}

// Norwegian compliance integration:
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  // Audit logging for NSM compliance
  if (classification !== NSMClassification.OPEN) {
    auditLogger.log({
      action: 'button_click',
      resource: 'Button',
      classification,
      metadata: { variant, size, locale }
    });
  }
  onClick?.(event);
};

// WCAG AAA accessibility:
<button
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  aria-disabled={disabled || loading}
  aria-busy={loading}
  data-nsm-classification={classification}
  lang={locale}
>
```

### Norwegian Compliance Form Example

```typescript
// GDPR consent management:
const gdprConsent = z.object({
  dataProcessing: z.boolean()
    .refine(val => val === true, 'gdpr.consent.required'),
  marketing: z.boolean(),
  analytics: z.boolean(),
});

// Norwegian-specific validation:
const norwegianPersonalIdSchema = z.string()
  .regex(/^\d{11}$/, 'validation.personalId.invalid')
  .refine(validateNorwegianPersonalId);

// NSM classification with audit logging:
auditLogger.log({
  action: 'personal_data_processing_initiated',
  resource: 'UserProfileForm',
  classification: NSMClassification.RESTRICTED,
  metadata: {
    gdprDataCategory,
    consentProvided: data.gdprConsent.dataProcessing
  }
});
```

### Multi-Language Switcher Example

```typescript
// Language configuration:
const SUPPORTED_LANGUAGES = [
  {
    code: 'nb-NO' as LocaleCode,
    name: 'Norsk (Bokmål)',
    nativeName: 'Norsk (Bokmål)',
    flag: '🇳🇴',
    rtl: false,
    primary: true,
  },
  // ... other languages
];

// RTL support:
useEffect(() => {
  document.documentElement.lang = newLocale;
  document.documentElement.dir = selectedLanguage?.rtl ? 'rtl' : 'ltr';
}, [newLocale]);

// Locale-aware formatting:
const formatExampleContent = () => ({
  date: formatDate(now, { year: 'numeric', month: 'long', day: 'numeric' }),
  currency: formatNumber(value, {
    style: 'currency',
    currency: locale.startsWith('nb-') ? 'NOK' : 'USD'
  })
});
```

## 🧪 Testing Examples

### Compliance Testing

```typescript
describe('Norwegian Compliance', () => {
  test('has correct NSM classification', () => {
    const { container } = render(<Button classification={NSMClassification.RESTRICTED} />);
    
    const button = container.querySelector('[data-nsm-classification]');
    expect(button).toHaveAttribute('data-nsm-classification', 'RESTRICTED');
  });
  
  test('logs audit information', async () => {
    const auditLogger = testingUtils.mockGenerator.getMock('auditLogger');
    
    render(<Button classification={NSMClassification.RESTRICTED} onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    
    expect(auditLogger.log).toHaveBeenCalledWith({
      action: 'button_click',
      resource: 'Button',
      classification: NSMClassification.RESTRICTED
    });
  });
});
```

### Accessibility Testing

```typescript
describe('Accessibility (WCAG AAA)', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<Button>Test</Button>);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('supports keyboard navigation', async () => {
    render(<Button onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Performance Testing

```typescript
describe('Performance', () => {
  test('renders within performance budget', async () => {
    const { measureRenderTime } = testingUtils.testHelpers;
    
    const metrics = await measureRenderTime(() => {
      render(<Button>Performance Test</Button>);
    }, 100);
    
    expect(metrics.average).toBeLessThan(16); // 60fps
    expect(metrics.max).toBeLessThan(33); // 30fps worst case
  });
});
```

## 🔗 Integration Examples

### Form Integration

```typescript
// Norwegian compliance form with validation
<form onSubmit={handleSubmit} data-nsm-classification="RESTRICTED">
  <UserProfileForm
    classification={NSMClassification.RESTRICTED}
    onSubmit={handleFormSubmission}
    gdprDataCategory={GDPRDataCategory.PERSONAL}
  />
</form>
```

### Language Integration

```typescript
// Multi-language application setup
<LocaleProvider defaultLocale="nb-NO">
  <div className="app">
    <header>
      <LanguageSwitcher
        variant="dropdown"
        position="top-right"
        onLanguageChange={handleLanguageChange}
      />
    </header>
    
    <main>
      <UserProfileForm locale={currentLocale} />
    </main>
  </div>
</LocaleProvider>
```

### Compliance Integration

```typescript
// Norwegian compliance monitoring
<ComplianceProvider classification={NSMClassification.RESTRICTED}>
  <AuditProvider>
    <GDPRProvider>
      <App />
    </GDPRProvider>
  </AuditProvider>
</ComplianceProvider>
```

## 📖 Best Practices Demonstrated

### 1. TypeScript Strict Mode
- Zero tolerance for `any` types
- Explicit return types for all functions
- Readonly interfaces for props
- Comprehensive type definitions

### 2. Norwegian Compliance
- NSM security classification integration
- GDPR consent management
- WCAG AAA accessibility standards
- Audit logging for sensitive operations

### 3. Multi-Language Support
- Norwegian as primary language
- RTL support for Arabic
- Locale-aware formatting
- Accessible language switching

### 4. Testing Excellence
- 95%+ code coverage
- Compliance testing
- Accessibility testing
- Performance testing
- Integration testing

### 5. Enterprise Patterns
- SOLID principles implementation
- Service-oriented architecture
- Dependency injection
- Error boundary patterns
- Comprehensive logging

## 🔧 Customization

### Extending Examples

1. **Add new compliance features**:
```typescript
// Add new NSM classification level
const handleSecretClassification = () => {
  if (classification === NSMClassification.SECRET) {
    // Implement enhanced security measures
    enableBiometricVerification();
    enableSecureStorage();
  }
};
```

2. **Add new languages**:
```typescript
// Add support for Sami languages
const EXTENDED_LANGUAGES = [
  ...SUPPORTED_LANGUAGES,
  {
    code: 'se-NO' as LocaleCode,
    name: 'Northern Sami',
    nativeName: 'Davvisámegiella',
    flag: '🇳🇴',
    rtl: false,
    indigenous: true,
  }
];
```

3. **Add new validation rules**:
```typescript
// Add D-number validation for Norwegian temporary residents
const norwegianDNumberSchema = z.string()
  .regex(/^[4-7]\d{10}$/, 'validation.dNumber.invalid')
  .refine(validateNorwegianDNumber);
```

## 📚 Additional Resources

- [Developer Guide](../docs/GUIDE.md) - Comprehensive development guide
- [API Reference](../docs/API.md) - Complete API documentation
- [Norwegian Compliance Guide](../docs/NORWEGIAN_COMPLIANCE.md) - Detailed compliance requirements
- [Testing Guide](../docs/TESTING.md) - Testing strategies and patterns

## 🤝 Contributing

To contribute new examples:

1. Create a new directory under the appropriate category
2. Include comprehensive TypeScript implementation
3. Add complete test suite with compliance testing
4. Update this README with your example
5. Ensure Norwegian compliance standards are met
6. Submit pull request with detailed description

## ⚖️ License

These examples are part of the Xala Technologies UI System and are subject to the same licensing terms. See the main project LICENSE file for details.