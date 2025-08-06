# Base Templates

## Purpose

The base templates directory contains foundational template files that serve as the building blocks for all other templates in the Xaheen CLI. These templates provide consistent structure, Norwegian compliance, and enterprise-grade quality across all generated code.

## Template Files

```
base/
├── base-component.hbs          # Base component template for all platforms
├── base-dashboard.hbs          # Dashboard layout template
├── base-page.hbs              # Base page template
├── dashboard-layout.hbs       # Dashboard layout with Norwegian compliance
└── form-component.hbs         # Form component with GDPR compliance
```

### Key Features

- **Norwegian Compliance**: Built-in NSM classification and GDPR features
- **Accessibility**: WCAG AAA compliance by default
- **Multi-Platform**: Support for React, Vue, Angular, Svelte
- **Enterprise Security**: Security best practices integrated
- **Localization**: Norwegian language support

## Template Structure

### Base Component Template (`base-component.hbs`)

This template provides the foundation for all component generation:

```handlebars
{{#if typescript}}
import React{{#if hasState}}, { useState, useCallback }{{/if}} from 'react';
{{#if hasLocalization}}
import { useTranslation } from 'react-i18next';
{{/if}}
{{#if hasValidation}}
import { z } from 'zod';
{{/if}}
{{#if norwegianFeatures}}
import { useNorwegianValidation } from '@xaheen-ai/norwegian-utils';
{{/if}}

{{#if hasTypes}}
interface {{componentName}}Props {
  {{#each props}}
  readonly {{name}}{{#unless required}}?{{/unless}}: {{type}};
  {{/each}}
  {{#if norwegianFeatures}}
  readonly locale?: 'nb-NO' | 'nn-NO' | 'en-US';
  readonly compliance?: {
    nsm?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
    gdpr?: boolean;
    auditLogging?: boolean;
  };
  {{/if}}
}
{{/if}}

{{#if validation}}
const {{componentName}}Schema = z.object({
  {{#each validationRules}}
  {{name}}: {{rule}},
  {{/each}}
  {{#if norwegianFeatures}}
  personalNumber: z.string().refine(
    (val) => validateNorwegianPersonalNumber(val),
    { message: 'Ugyldig personnummer' }
  ).optional(),
  {{/if}}
});
{{/if}}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
  {{#if norwegianFeatures}}
  locale = 'nb-NO',
  compliance = { nsm: 'OPEN', gdpr: true, auditLogging: false },
  {{/if}}
}) => {
  {{#if hasLocalization}}
  const { t } = useTranslation();
  {{/if}}
  {{#if norwegianFeatures}}
  const { validatePersonalNumber, formatCurrency } = useNorwegianValidation();
  {{/if}}
  {{#if hasState}}
  {{#each stateVariables}}
  const [{{name}}, set{{capitalize name}}] = useState<{{type}}>({{defaultValue}});
  {{/each}}
  {{/if}}

  {{#if hasCallbacks}}
  {{#each callbacks}}
  const {{name}} = useCallback({{implementation}}, [{{dependencies}}]);
  {{/each}}
  {{/if}}

  {{#if compliance.auditLogging}}
  // Audit logging for Norwegian compliance
  useEffect(() => {
    auditLogger.logComponentRender({
      component: '{{componentName}}',
      user: currentUser?.id,
      timestamp: new Date(),
      classification: compliance.nsm
    });
  }, []);
  {{/if}}

  return (
    <div 
      className="{{cssClasses}}"
      {{#if accessibility}}
      role="{{role}}"
      aria-label="{{ariaLabel}}"
      {{#if keyboardSupport}}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {{/if}}
      {{/if}}
      {{#if compliance.nsm}}
      data-classification="{{compliance.nsm}}"
      {{/if}}
    >
      {{#if hasHeader}}
      <header className="component-header">
        <h2 className="component-title">
          {{#if hasLocalization}}
          {t('{{componentName}}.title')}
          {{else}}
          {{title}}
          {{/if}}
        </h2>
        {{#if compliance.nsm !== 'OPEN'}}
        <span className="classification-badge classification-{{lowercase compliance.nsm}}">
          {{compliance.nsm}}
        </span>
        {{/if}}
      </header>
      {{/if}}

      <main className="component-content">
        {{content}}
        {{#if norwegianFeatures}}
        {{#if showPersonalNumberField}}
        <div className="form-field">
          <label htmlFor="personalNumber">
            {{#if hasLocalization}}
            {t('common.personalNumber')}
            {{else}}
            Personnummer
            {{/if}}
          </label>
          <input
            id="personalNumber"
            type="text"
            pattern="[0-9]{11}"
            maxLength="11"
            aria-describedby="personalNumber-help"
            className="personal-number-input"
            onChange={handlePersonalNumberChange}
          />
          <div id="personalNumber-help" className="field-help">
            Format: DDMMÅÅXXXXX (11 siffer)
          </div>
        </div>
        {{/if}}
        {{/if}}
      </main>

      {{#if hasFooter}}
      <footer className="component-footer">
        {{footer}}
        {{#if compliance.gdpr}}
        <div className="gdpr-notice">
          <small>
            {{#if hasLocalization}}
            {t('common.gdprNotice')}
            {{else}}
            Dine personopplysninger behandles i henhold til GDPR.
            {{/if}}
            <a href="/privacy-policy">Les mer</a>
          </small>
        </div>
        {{/if}}
      </footer>
      {{/if}}
    </div>
  );
};

{{#if hasDisplayName}}
{{componentName}}.displayName = '{{componentName}}';
{{/if}}

{{#if hasDefaultProps}}
{{componentName}}.defaultProps = {
  {{#each defaultProps}}
  {{name}}: {{value}},
  {{/each}}
};
{{/if}}

export default {{componentName}};
{{else}}
// JavaScript version
const {{componentName}} = (props) => {
  // Implementation for JavaScript
};

export default {{componentName}};
{{/if}}
```

### Dashboard Layout Template (`dashboard-layout.hbs`)

Norwegian government-compliant dashboard layout:

```handlebars
{{#if typescript}}
import React from 'react';
import { Outlet } from 'react-router-dom';
{{#if norwegianFeatures}}
import { NorwegianHeader } from '@xaheen-ai/norwegian-components';
import { BankIDAuth } from '@xaheen-ai/bankid-integration';
{{/if}}
{{#if hasNavigation}}
import { NavigationSidebar } from './NavigationSidebar';
{{/if}}
{{#if hasFooter}}
import { GovernmentFooter } from './GovernmentFooter';
{{/if}}

interface DashboardLayoutProps {
  readonly title?: string;
  readonly user?: User;
  {{#if norwegianFeatures}}
  readonly agency?: NorwegianAgency;
  readonly securityLevel?: NSMClassification;
  readonly showClassificationBanner?: boolean;
  {{/if}}
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title = '{{defaultTitle}}',
  user,
  {{#if norwegianFeatures}}
  agency,
  securityLevel = 'OPEN',
  showClassificationBanner = true,
  {{/if}}
}) => {
  return (
    <div className="dashboard-layout" data-testid="dashboard-layout">
      {{#if norwegianFeatures}}
      {{#if showClassificationBanner}}
      <div className="classification-banner classification-{{lowercase securityLevel}}">
        <span className="classification-text">{{securityLevel}}</span>
        {{#if agency}}
        <span className="agency-name">{agency.name}</span>
        {{/if}}
      </div>
      {{/if}}
      
      <NorwegianHeader
        title={title}
        user={user}
        agency={agency}
        showLogout={true}
        showLanguageSwitch={true}
        showAccessibilityTools={true}
      />
      {{else}}
      <header className="dashboard-header">
        <h1 className="dashboard-title">{title}</h1>
        {{#if hasUserMenu}}
        <div className="user-menu">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button className="logout-button">Logg ut</button>
            </div>
          )}
        </div>
        {{/if}}
      </header>
      {{/if}}

      <div className="dashboard-body">
        {{#if hasNavigation}}
        <NavigationSidebar
          {{#if norwegianFeatures}}
          agency={agency}
          userRole={user?.role}
          securityLevel={securityLevel}
          {{/if}}
        />
        {{/if}}

        <main 
          className="dashboard-main"
          role="main"
          aria-label="Hovedinnhold"
        >
          {{#if breadcrumbs}}
          <nav aria-label="Brødsmulesti" className="breadcrumbs">
            {/* Breadcrumb implementation */}
          </nav>
          {{/if}}

          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>

      {{#if hasFooter}}
      <GovernmentFooter
        {{#if norwegianFeatures}}
        agency={agency}
        showContactInfo={true}
        showAccessibilityStatement={true}
        showPrivacyPolicy={true}
        {{/if}}
      />
      {{/if}}
    </div>
  );
};

export default DashboardLayout;
{{/if}}
```

## Norwegian Compliance Features

### NSM Classification Integration

All base templates include NSM classification support:

```handlebars
{{#if compliance.nsm}}
<div className="nsm-classification" data-classification="{{compliance.nsm}}">
  <span className="classification-label">{{compliance.nsm}}</span>
  {{#if compliance.nsm !== 'OPEN'}}
  <span className="handling-instructions">
    {{#if compliance.nsm === 'RESTRICTED'}}
    Begrenset tilgang - Kun autorisert personell
    {{else if compliance.nsm === 'CONFIDENTIAL'}}
    Konfidensiell - Særskilt tilgangskontroll påkrevd
    {{else if compliance.nsm === 'SECRET'}}
    Hemmelig - Kun personer med godkjenning
    {{/if}}
  </span>
  {{/if}}
</div>
{{/if}}
```

### GDPR Compliance

Built-in GDPR compliance features:

```handlebars
{{#if compliance.gdpr}}
<div className="gdpr-compliance">
  {{#if hasPersonalData}}
  <div className="consent-tracking" data-consent-id="{{consentId}}">
    <input type="hidden" name="consentTimestamp" value="{{consentTimestamp}}" />
    <input type="hidden" name="consentVersion" value="{{consentVersion}}" />
  </div>
  {{/if}}
  
  <div className="privacy-notice">
    <p>
      Dine personopplysninger behandles i henhold til 
      <a href="/privacy-policy">personvernerklæringen</a>.
      Du har rett til innsyn, retting og sletting av dine opplysninger.
    </p>
  </div>
  
  {{#if hasDataSubjectRights}}
  <div className="data-subject-rights">
    <button type="button" className="data-access-request">
      Be om tilgang til mine data
    </button>
    <button type="button" className="data-deletion-request">
      Be om sletting av mine data
    </button>
  </div>
  {{/if}}
</div>
{{/if}}
```

### Accessibility Features

WCAG AAA compliance built into all templates:

```handlebars
{{#if accessibility}}
<div 
  className="accessible-component"
  role="{{accessibility.role}}"
  aria-label="{{accessibility.label}}"
  {{#if accessibility.describedBy}}
  aria-describedby="{{accessibility.describedBy}}"
  {{/if}}
  {{#if accessibility.hasKeyboardSupport}}
  tabIndex="0"
  onKeyDown="{{accessibility.keyHandler}}"
  {{/if}}
>
  {{#if accessibility.hasScreenReaderSupport}}
  <span className="sr-only">{{accessibility.screenReaderText}}</span>
  {{/if}}
  
  {{#if accessibility.hasHighContrast}}
  <div className="high-contrast-mode">
    {/* High contrast version */}
  </div>
  {{/if}}
  
  {{#if accessibility.hasTextToSpeech}}
  <button className="text-to-speech" aria-label="Les opp innhold">
    🔊
  </button>
  {{/if}}
</div>
{{/if}}
```

## Usage Examples

### Generating a Norwegian Government Form

```bash
xaheen generate component UserRegistrationForm \
  --template=base-component \
  --platform=react \
  --typescript=true \
  --norwegian-features=true \
  --compliance-nsm=RESTRICTED \
  --compliance-gdpr=true \
  --accessibility=wcag-aaa \
  --localization=nb-NO,nn-NO,en-US
```

### Custom Template Variables

```json
{
  "componentName": "CitizenPortalForm",
  "typescript": true,
  "norwegianFeatures": true,
  "compliance": {
    "nsm": "RESTRICTED",
    "gdpr": true,
    "auditLogging": true
  },
  "props": [
    {
      "name": "personalNumber",
      "type": "string",
      "required": true,
      "validation": "norwegianPersonalNumber"
    },
    {
      "name": "onSubmit",
      "type": "(data: FormData) => void",
      "required": true
    }
  ],
  "integrations": ["bankid", "altinn"],
  "accessibility": {
    "wcagLevel": "AAA",
    "screenReaderSupport": true,
    "keyboardSupport": true,
    "highContrast": true
  }
}
```

## Template Inheritance

Base templates support inheritance and composition:

```handlebars
{{!-- Extending base-component.hbs --}}
{{> base-component}}

{{!-- Additional Norwegian-specific features --}}
{{#if extends.norwegianFeatures}}
<div className="norwegian-extensions">
  {{#if bankidIntegration}}
  <BankIDLoginButton />
  {{/if}}
  
  {{#if altinnIntegration}}
  <AltinnServiceStatus />
  {{/if}}
  
  {{#if folkeregisteretLookup}}
  <AddressLookup />
  {{/if}}
</div>
{{/if}}
```

## Testing Templates

All base templates include test generation:

```handlebars
{{#if generateTests}}
import { render, screen, fireEvent } from '@testing-library/react';
import { {{componentName}} } from './{{componentName}}';

describe('{{componentName}}', () => {
  const defaultProps = {
    {{#each props}}
    {{name}}: {{testValue}},
    {{/each}}
  };

  it('should render with Norwegian compliance', () => {
    render(<{{componentName}} {...defaultProps} compliance={{ nsm: 'RESTRICTED' }} />);
    
    expect(screen.getByText('RESTRICTED')).toBeInTheDocument();
    expect(screen.getByLabelText(/personnummer/i)).toBeInTheDocument();
  });

  it('should be accessible', async () => {
    const { container } = render(<{{componentName}} {...defaultProps} />);
    
    // Test keyboard navigation
    const focusableElement = screen.getByRole('button');
    focusableElement.focus();
    expect(focusableElement).toHaveFocus();
    
    // Test screen reader support
    expect(screen.getByLabelText(/hovedinnhold/i)).toBeInTheDocument();
  });

  {{#if norwegianFeatures}}
  it('should validate Norwegian personal numbers', () => {
    render(<{{componentName}} {...defaultProps} />);
    
    const personalNumberInput = screen.getByLabelText(/personnummer/i);
    fireEvent.change(personalNumberInput, { target: { value: '12345678901' } });
    
    expect(personalNumberInput).toHaveValue('12345678901');
    // Add validation testing
  });
  {{/if}}
});
{{/if}}
```

## Contributing

### Template Development Guidelines

1. **Norwegian First**: Always include Norwegian language support
2. **Compliance**: Ensure NSM and GDPR compliance
3. **Accessibility**: Implement WCAG AAA standards
4. **Security**: Include security best practices
5. **Testing**: Generate comprehensive tests
6. **Documentation**: Include clear usage examples
7. **Flexibility**: Support multiple platforms and configurations

### Adding New Base Templates

1. Create template file with `.hbs` extension
2. Include Norwegian compliance features
3. Add accessibility support
4. Implement proper TypeScript types
5. Include test generation
6. Document template variables
7. Add usage examples