# UI System - Localization & Internationalization

## 🌍 Multi-Language Support v5.0

The Xala Universal Design System v5.0 provides comprehensive internationalization (i18n) support with built-in **Norwegian government compliance**, **RTL language support**, and **WCAG 2.2 AAA accessibility** for all supported languages.

## 🗣️ Supported Languages

### Primary Languages
- **Norwegian Bokmål (nb-NO)** - Primary language for Norwegian compliance
- **English (en-US)** - International fallback language
- **French (fr-FR)** - European Union compliance
- **Arabic (ar-SA)** - RTL language support with cultural adaptations

### Regional Variants
- **Norwegian Nynorsk (nn-NO)** - Alternative Norwegian variant
- **German (de-DE)** - Central European markets
- **Swedish (sv-SE)** - Nordic region support
- **Danish (da-DK)** - Nordic region support

## 🚀 Quick Setup

### 1. Basic Localization

```typescript
import { UISystemProvider } from '@xala-technologies/ui-system';

function App() {
  return (
    <UISystemProvider
      locale="nb-NO"
      fallbackLocale="en-US"
      compliance={{
        norwegian: true,
        wcagLevel: 'WCAG_2_2_AAA'
      }}
    >
      <YourApp />
    </UISystemProvider>
  );
}
```

### 2. Using Localized Components

```typescript
import { Button, Text, useLocalization } from '@xala-technologies/ui-system';

function LocalizedComponent() {
  const { t, locale, formatDate, formatCurrency } = useLocalization();

  return (
    <div>
      <Text variant="h1">{t('welcome.title')}</Text>
      <Text variant="body">{t('welcome.description')}</Text>
      
      <Button variant="primary">
        {t('actions.getStarted')}
      </Button>
      
      <Text variant="caption">
        {t('system.lastUpdated')}: {formatDate(new Date())}
      </Text>
      
      <Text variant="body">
        {t('pricing.total')}: {formatCurrency(99.99)}
      </Text>
    </div>
  );
}
```

## 🎯 Localization Architecture

### Translation Key Structure

```typescript
// Translation keys follow hierarchical structure
const translationKeys = {
  // Component-specific keys
  'button.save': 'Lagre',
  'button.cancel': 'Avbryt',
  'button.delete': 'Slett',
  'button.edit': 'Rediger',
  
  // Form-related keys
  'form.required': 'Påkrevd',
  'form.optional': 'Valgfri',
  'form.validation.email': 'Ugyldig e-postadresse',
  'form.validation.personalNumber': 'Ugyldig fødselsnummer',
  
  // Norwegian-specific keys
  'norwegian.personalNumber': 'Fødselsnummer',
  'norwegian.organizationNumber': 'Organisasjonsnummer',
  'norwegian.classification.ÅPEN': 'Åpen',
  'norwegian.classification.BEGRENSET': 'Begrenset',
  'norwegian.classification.KONFIDENSIELT': 'Konfidensielt',
  'norwegian.classification.HEMMELIG': 'Hemmelig',
  
  // Status and feedback
  'status.loading': 'Laster...',
  'status.success': 'Vellykket',
  'status.error': 'Feil oppstod',
  'status.warning': 'Advarsel',
  
  // Navigation
  'nav.home': 'Hjem',
  'nav.profile': 'Profil',
  'nav.settings': 'Innstillinger',
  'nav.logout': 'Logg ut',
  
  // Accessibility
  'a11y.closeDialog': 'Lukk dialog',
  'a11y.openMenu': 'Åpne meny',
  'a11y.sortAscending': 'Sorter stigende',
  'a11y.sortDescending': 'Sorter synkende'
};
```

### Language Files Structure

```
src/localization/
├── locales/
│   ├── nb-NO/
│   │   ├── common.json          # Common UI text
│   │   ├── components.json      # Component-specific text
│   │   ├── forms.json           # Form labels and validation
│   │   ├── navigation.json      # Navigation elements
│   │   ├── accessibility.json   # Accessibility labels
│   │   └── norwegian.json       # Norwegian-specific terms
│   ├── en-US/
│   │   ├── common.json
│   │   ├── components.json
│   │   ├── forms.json
│   │   ├── navigation.json
│   │   └── accessibility.json
│   ├── fr-FR/
│   │   └── [same structure]
│   └── ar-SA/
│       └── [same structure with RTL adaptations]
├── hooks/
│   └── useLocalization.ts
├── utils/
│   ├── formatters.ts            # Date, currency, number formatting
│   ├── rtl-helpers.ts           # RTL text direction utilities
│   └── validators.ts            # Locale-specific validation
└── index.ts
```

## 🔧 Localization Hook

### useLocalization Hook

```typescript
import { useLocalization } from '@xala-technologies/ui-system';

function MyComponent() {
  const {
    // Core translation
    t,                    // Main translation function
    locale,               // Current locale (e.g., 'nb-NO')
    setLocale,           // Change locale
    availableLocales,    // List of supported locales
    
    // Formatting functions
    formatDate,          // Locale-aware date formatting
    formatTime,          // Locale-aware time formatting
    formatDateTime,      // Combined date/time formatting
    formatCurrency,      // Currency formatting with Norwegian Kroner support
    formatNumber,        // Number formatting with Norwegian conventions
    formatPercentage,    // Percentage formatting
    
    // Language information
    isRTL,               // True for Arabic and other RTL languages
    direction,           // 'ltr' or 'rtl'
    
    // Norwegian-specific
    formatPersonalNumber, // Format Norwegian personal numbers
    formatOrganizationNumber, // Format Norwegian organization numbers
    
    // Accessibility
    getA11yLabel,        // Get accessibility-specific labels
    
    // Validation
    validateInput        // Locale-specific input validation
  } = useLocalization();

  return (
    <div dir={direction}>
      <Text variant="h1">{t('dashboard.title')}</Text>
      <Text variant="body">
        {t('dashboard.lastLogin')}: {formatDateTime(lastLoginDate)}
      </Text>
      <Text variant="body">
        {t('dashboard.balance')}: {formatCurrency(balance)}
      </Text>
    </div>
  );
}
```

### Translation Function with Parameters

```typescript
// Translation with interpolation
const message = t('welcome.user', { name: 'Ola Nordmann' });
// Norwegian: "Velkommen, Ola Nordmann!"
// English: "Welcome, Ola Nordmann!"

// Translation with pluralization
const itemCount = t('items.count', { count: 5 });
// Norwegian: "5 elementer"
// English: "5 items"

// Translation with rich formatting
const richText = t('legal.gdpr', {
  link: (text) => <a href="/privacy">{text}</a>
});
// Norwegian: "Se vår <a href="/privacy">personvernerklæring</a> for detaljer"
```

## 🇳🇴 Norwegian Localization

### Personal Number Formatting

```typescript
import { PersonalNumberInput, useLocalization } from '@xala-technologies/ui-system';

function NorwegianForm() {
  const { formatPersonalNumber, validatePersonalNumber } = useLocalization();

  return (
    <PersonalNumberInput
      placeholder={t('form.personalNumber.placeholder')}
      label={t('form.personalNumber.label')}
      helperText={t('form.personalNumber.help')}
      formatter={formatPersonalNumber}
      validator={validatePersonalNumber}
      gdprCompliant={true}
      auditTrail={true}
    />
  );
}
```

### Organization Number Support

```typescript
import { OrganizationNumberInput } from '@xala-technologies/ui-system';

function OrganizationForm() {
  const { formatOrganizationNumber, validateOrganizationNumber } = useLocalization();

  return (
    <OrganizationNumberInput
      placeholder={t('form.organizationNumber.placeholder')}
      label={t('form.organizationNumber.label')}
      formatter={formatOrganizationNumber}
      validator={validateOrganizationNumber}
      enableBRREGLookup={true}
    />
  );
}
```

### NSM Classification Labels

```typescript
import { ClassificationIndicator } from '@xala-technologies/ui-system';

function SecureDocument({ classification }) {
  const { t } = useLocalization();

  return (
    <div className="relative">
      <ClassificationIndicator 
        level={classification}
        label={t(`norwegian.classification.${classification}`)}
        position="top-right"
      />
      <DocumentContent />
    </div>
  );
}
```

## 🌐 RTL Language Support

### Arabic Language Implementation

```typescript
// Arabic language file (ar-SA/common.json)
{
  "welcome.title": "مرحباً بك في نظامنا",
  "welcome.description": "نظام تصميم متطور للتطبيقات المؤسسية",
  "actions.getStarted": "ابدأ الآن",
  "actions.learnMore": "اعرف المزيد",
  "navigation.home": "الرئيسية",
  "navigation.settings": "الإعدادات",
  "navigation.profile": "الملف الشخصي"
}
```

### RTL Component Behavior

```typescript
import { Stack, Button, Text } from '@xala-technologies/ui-system';

function RTLComponent() {
  const { isRTL, direction } = useLocalization();

  return (
    <div dir={direction}>
      <Stack 
        direction="horizontal" 
        gap="md" 
        justify={isRTL ? 'start' : 'end'} // Adjust alignment for RTL
      >
        <Button variant="outline">
          {t('actions.cancel')}
        </Button>
        <Button variant="primary">
          {t('actions.save')}
        </Button>
      </Stack>
      
      <Text 
        variant="body" 
        align={isRTL ? 'right' : 'left'}
        className={isRTL ? 'font-arabic' : ''}
      >
        {t('content.description')}
      </Text>
    </div>
  );
}
```

### CSS RTL Support

```css
/* RTL-aware CSS classes */
.btn-group {
  display: flex;
  gap: 1rem;
}

/* RTL-specific styles */
[dir="rtl"] .btn-group {
  flex-direction: row-reverse;
}

[dir="rtl"] .text-input {
  text-align: right;
}

[dir="rtl"] .dropdown-menu {
  left: auto;
  right: 0;
}

/* Arabic font support */
[lang="ar"] {
  font-family: 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
  line-height: 1.6; /* Better line spacing for Arabic */
}
```

## 💰 Currency and Number Formatting

### Norwegian Kroner (NOK) Support

```typescript
function PricingComponent() {
  const { formatCurrency, formatNumber } = useLocalization();

  return (
    <div>
      <Text variant="h2">
        {formatCurrency(1299.99, 'NOK')}
        {/* Norwegian: "1 299,99 kr" */}
        {/* English: "NOK 1,299.99" */}
      </Text>
      
      <Text variant="body">
        {t('pricing.savings')}: {formatNumber(15.5, { style: 'percent' })}
        {/* Norwegian: "15,5 %" */}
        {/* English: "15.5%" */}
      </Text>
      
      <Text variant="caption">
        {t('pricing.includesVAT')}: {formatCurrency(324.998, 'NOK', { precision: 2 })}
        {/* Norwegian: "325,00 kr" (rounded) */}
      </Text>
    </div>
  );
}
```

### Date and Time Formatting

```typescript
function DateTimeComponent() {
  const { formatDate, formatTime, formatDateTime } = useLocalization();
  const now = new Date();

  return (
    <div>
      <Text variant="body">
        {t('system.date')}: {formatDate(now)}
        {/* Norwegian: "4. august 2024" */}
        {/* English: "August 4, 2024" */}
        {/* Arabic: "٤ أغسطس ٢٠٢٤" */}
      </Text>
      
      <Text variant="body">
        {t('system.time')}: {formatTime(now)}
        {/* Norwegian: "14:30" */}
        {/* English: "2:30 PM" */}
      </Text>
      
      <Text variant="caption">
        {t('system.lastUpdated')}: {formatDateTime(now, 'relative')}
        {/* Norwegian: "for 2 minutter siden" */}
        {/* English: "2 minutes ago" */}
      </Text>
    </div>
  );
}
```

## 🎛️ Dynamic Language Switching

### Language Switcher Component  

```typescript
import { Select, Stack, Text } from '@xala-technologies/ui-system';

function LanguageSwitcher() {
  const { locale, setLocale, availableLocales, t } = useLocalization();

  const languageOptions = [
    { value: 'nb-NO', label: 'Norsk Bokmål', flag: '🇳🇴' },
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { value: 'ar-SA', label: 'العربية', flag: '🇸🇦' }
  ].filter(lang => availableLocales.includes(lang.value));

  return (
    <Stack direction="horizontal" gap="sm" align="center">
      <Text variant="label">{t('settings.language')}</Text>
      <Select
        value={locale}
        onValueChange={setLocale}
        options={languageOptions.map(lang => ({
          value: lang.value,
          label: (
            <Stack direction="horizontal" gap="sm" align="center">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </Stack>
          )
        }))}
        variant="outline"
        size="sm"
      />
    </Stack>
  );
}
```

### Persisting Language Preferences

```typescript
// hooks/use-language-persistence.ts
'use client';

import { useEffect } from 'react';
import { useLocalization } from '@xala-technologies/ui-system';

export function useLanguagePersistence() {
  const { locale, setLocale } = useLocalization();

  useEffect(() => {
    // Load saved language from localStorage
    const savedLocale = localStorage.getItem('ui-system-locale');
    if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Save language changes
    localStorage.setItem('ui-system-locale', locale);
    
    // Update HTML lang attribute
    document.documentElement.lang = locale;
    
    // Update HTML dir attribute for RTL languages
    const rtlLocales = ['ar-SA', 'he-IL', 'fa-IR'];
    document.documentElement.dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);
}

// Usage in app
function App() {
  useLanguagePersistence();
  
  return <YourAppContent />;
}
```

## 🧪 Testing Localization

### Translation Testing

```typescript
// __tests__/localization.test.tsx
import { render, screen } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

describe('Localization', () => {
  test('displays Norwegian text correctly', () => {
    render(
      <UISystemProvider locale="nb-NO">
        <Button>{t('actions.save')}</Button>
      </UISystemProvider>
    );

    expect(screen.getByText('Lagre')).toBeInTheDocument();
  });

  test('displays English fallback when translation missing', () => {
    render(
      <UISystemProvider locale="nb-NO" fallbackLocale="en-US">
        <Button>{t('missing.key')}</Button>
      </UISystemProvider>
    );

    expect(screen.getByText('Missing Key')).toBeInTheDocument(); // English fallback
  });

  test('handles RTL languages correctly', () => {
    render(
      <UISystemProvider locale="ar-SA">
        <div>{t('welcome.title')}</div>
      </UISystemProvider>
    );

    const element = screen.getByText('مرحباً بك في نظامنا');
    expect(element.closest('[dir="rtl"]')).toBeInTheDocument();
  });
});
```

### Accessibility Testing with Localization

```typescript
// __tests__/a11y-localization.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

expect.extend(toHaveNoViolations);

describe('Accessibility with Localization', () => {
  test('maintains WCAG compliance across languages', async () => {
    const languages = ['nb-NO', 'en-US', 'fr-FR', 'ar-SA'];
    
    for (const locale of languages) {
      const { container } = render(
        <UISystemProvider locale={locale}>
          <Button aria-label={t('a11y.saveDocument')}>
            {t('actions.save')}
          </Button>
        </UISystemProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });
});
```

## 📝 Adding New Languages

### 1. Create Language Files

```bash
# Create new locale directory
mkdir src/localization/locales/de-DE

# Copy English files as template
cp -r src/localization/locales/en-US/* src/localization/locales/de-DE/

# Translate all JSON files
```

### 2. Update Language Configuration

```typescript
// src/localization/config.ts
export const SUPPORTED_LOCALES = [
  'nb-NO', // Norwegian Bokmål
  'en-US', // English (US)
  'fr-FR', // French (France)
  'ar-SA', // Arabic (Saudi Arabia)
  'de-DE', // German (Germany) - NEW
  'sv-SE', // Swedish (Sweden) - NEW
] as const;

export const RTL_LOCALES = ['ar-SA', 'he-IL'] as const;

export const LOCALE_CONFIG = {
  'de-DE': {
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    isRTL: false
  }
};
```

### 3. Add Formatting Rules

```typescript
// src/localization/formatters/de-DE.ts
export const germanFormatters = {
  currency: (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount);
  },
  
  date: (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  },
  
  number: (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  }
};
```

## 🔐 Compliance & Security

### GDPR Compliance

```typescript
// Localized GDPR consent
function GDPRConsent() {
  const { t, locale } = useLocalization();

  return (
    <Alert variant="info">
      <AlertTitle>{t('gdpr.consent.title')}</AlertTitle>
      <AlertDescription>
        {t('gdpr.consent.description', {
          privacyLink: (text) => (
            <a href={`/privacy?lang=${locale}`} className="underline">
              {text}
            </a>
          )
        })}
      </AlertDescription>
    </Alert>
  );
}
```

### Norwegian Personal Data Handling

```typescript
// Localized personal data forms
function PersonalDataForm() {
  const { t, formatPersonalNumber } = useLocalization();

  return (
    <form>
      <PersonalNumberInput
        label={t('form.personalNumber.label')}
        placeholder={t('form.personalNumber.placeholder')}
        helperText={t('form.personalNumber.gdprNotice')}
        gdprCompliant={true}
        auditTrail={true}
        formatter={formatPersonalNumber}
      />
      
      <Text variant="caption" color="muted-foreground">
        {t('gdpr.dataProcessing.notice')}
      </Text>
    </form>
  );
}
```

## 🚀 Best Practices

### 1. Translation Key Organization

```typescript
// ✅ GOOD: Hierarchical, descriptive keys
'form.validation.email.required'
'nav.user.profile.settings'
'modal.confirmation.delete.title'

// ❌ BAD: Flat, unclear keys
'emailReq'
'userSettings'
'deleteTitle'
```

### 2. Avoiding Hard-coded Text

```typescript
// ✅ GOOD: All text localized
<Button variant="primary">
  {t('actions.save')}
</Button>

// ❌ BAD: Hard-coded English text
<Button variant="primary">
  Save
</Button>
```

### 3. Context-Aware Translations

```typescript
// ✅ GOOD: Context-specific keys
'button.save.document'    // "Lagre dokument" 
'button.save.settings'    // "Lagre innstillinger"
'button.save.draft'       // "Lagre utkast"

// ❌ BAD: Generic keys without context
'button.save'             // Ambiguous in Norwegian
```

### 4. Accessibility Considerations

```typescript
// ✅ GOOD: Localized accessibility labels
<Button aria-label={t('a11y.button.save.document')}>
  <SaveIcon />
</Button>

// Screen reader will announce in user's language
```

## 🔗 Related Documentation

- **[Component Library](../components/)** - Localized component usage
- **[Norwegian Compliance](../compliance/)** - NSM, GDPR, WCAG requirements
- **[Accessibility Guide](../accessibility/)** - Multi-language accessibility
- **[Theming Guide](../theming/)** - Theme customization per locale

---

*UI System Localization Guide v2.0 - Comprehensive internationalization with Norwegian compliance*