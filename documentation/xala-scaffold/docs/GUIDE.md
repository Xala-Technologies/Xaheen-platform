# Xala Scaffolding System - Developer Guide

Comprehensive developer guide for building enterprise-grade Norwegian-compliant applications using the Xala Scaffolding System.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Norwegian Compliance](#norwegian-compliance)
- [Multi-Language Development](#multi-language-development)
- [Component Generation](#component-generation)
- [Testing Strategy](#testing-strategy)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
TypeScript >= 5.0.0
React >= 18.0.0
```

### Installation & Setup

```bash
# 1. Install the scaffolding tool
npm install -g @xala/scaffold

# 2. Verify installation
xala-scaffold --version

# 3. Initialize your first project
xala-scaffold init my-norwegian-app \
  --type nextjs \
  --locale nb-NO \
  --classification OPEN \
  --template enterprise

# 4. Navigate to project
cd my-norwegian-app

# 5. Install dependencies
npm install

# 6. Start development server
npm run dev
```

### Project Structure

The scaffolding tool generates a well-organized project structure:

```
my-norwegian-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (Header, Footer, etc.)
│   │   └── forms/          # Form components with validation
│   ├── pages/              # Next.js pages or React Router pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and business logic
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── locales/            # Translation files
│   └── compliance/         # Norwegian compliance utilities
├── public/
│   ├── locales/            # Public translation files
│   └── assets/             # Static assets
├── __tests__/              # Test files
├── docs/                   # Project documentation
├── xala.config.json        # Xala configuration
├── norwegian-compliance.json # Norwegian compliance config
└── package.json
```

## Architecture Overview

### SOLID Principles Implementation

The scaffolding system enforces SOLID principles throughout the generated code:

#### Single Responsibility Principle (SRP)

```typescript
// ❌ Violates SRP - handles multiple concerns
class UserComponent {
  fetchUser() { /* API logic */ }
  validateUser() { /* validation logic */ }
  renderUser() { /* UI logic */ }
}

// ✅ Follows SRP - single responsibility per class
class UserService {
  async fetchUser(id: string): Promise<User> {
    // Only handles API communication
  }
}

class UserValidator {
  validateUser(user: User): ValidationResult {
    // Only handles validation
  }
}

class UserComponent {
  render(): JSX.Element {
    // Only handles UI rendering
  }
}
```

#### Open/Closed Principle (OCP)

```typescript
// Base component that's closed for modification but open for extension
export abstract class BaseComponent<T> {
  abstract render(props: T): JSX.Element;
  
  protected logRender(componentName: string): void {
    logger.debug(`Rendering ${componentName}`);
  }
}

// Extension without modifying the base
export class UserProfile extends BaseComponent<UserProfileProps> {
  render(props: UserProfileProps): JSX.Element {
    this.logRender('UserProfile');
    return <div>{/* User profile UI */}</div>;
  }
}
```

#### Liskov Substitution Principle (LSP)

```typescript
// Base interface that all implementations must honor
interface DataService<T> {
  async fetch(id: string): Promise<T>;
  async save(item: T): Promise<void>;
}

// All implementations are substitutable
class APIDataService<T> implements DataService<T> {
  async fetch(id: string): Promise<T> {
    // API implementation
  }
  
  async save(item: T): Promise<void> {
    // API save implementation
  }
}

class LocalStorageDataService<T> implements DataService<T> {
  async fetch(id: string): Promise<T> {
    // LocalStorage implementation
  }
  
  async save(item: T): Promise<void> {
    // LocalStorage save implementation
  }
}
```

#### Interface Segregation Principle (ISP)

```typescript
// ❌ Fat interface - clients depend on methods they don't use
interface UserOperations {
  create(user: User): Promise<void>;
  read(id: string): Promise<User>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  sendEmail(user: User): Promise<void>;
  validateNorwegianId(id: string): boolean;
}

// ✅ Segregated interfaces - focused responsibilities
interface UserCRUD {
  create(user: User): Promise<void>;
  read(id: string): Promise<User>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

interface UserNotification {
  sendEmail(user: User): Promise<void>;
}

interface NorwegianValidation {
  validateNorwegianId(id: string): boolean;
}
```

#### Dependency Inversion Principle (DIP)

```typescript
// High-level module depends on abstraction
class UserController {
  constructor(
    private userService: DataService<User>,
    private validator: UserValidator,
    private notifier: UserNotification
  ) {}
  
  async createUser(userData: CreateUserRequest): Promise<void> {
    const validation = this.validator.validate(userData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    const user = await this.userService.save(userData);
    await this.notifier.sendWelcomeEmail(user);
  }
}

// Dependency injection setup
const container = new DIContainer();
container.register('userService', () => new APIDataService<User>());
container.register('validator', () => new UserValidator());
container.register('notifier', () => new EmailNotificationService());
```

### Service-Oriented Architecture

The generated applications use a service-oriented architecture:

```typescript
// Service base class
export abstract class BaseService {
  protected abstract serviceName: string;
  protected logger: Logger;
  
  constructor() {
    this.logger = new Logger(this.serviceName);
  }
  
  abstract initialize(): Promise<void>;
  abstract dispose(): Promise<void>;
}

// Concrete service implementation
export class UserService extends BaseService {
  protected serviceName = 'UserService';
  
  constructor(
    private dataService: DataService<User>,
    private complianceService: NorwegianComplianceService
  ) {
    super();
  }
  
  async initialize(): Promise<void> {
    await this.dataService.initialize();
    await this.complianceService.initialize();
    this.logger.info('UserService initialized');
  }
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate Norwegian compliance
    const complianceCheck = await this.complianceService.validatePersonalData(userData);
    if (!complianceCheck.isCompliant) {
      throw new ComplianceError(complianceCheck.violations);
    }
    
    return await this.dataService.create(userData);
  }
}
```

## Norwegian Compliance

### NSM Security Classification

The scaffolding system supports all NSM security levels:

#### OPEN Classification

```typescript
// No special security requirements
const config: NSMSecurityRequirements = {
  classification: NSMClassification.OPEN,
  requiresAuthentication: false,
  requiresEncryption: false,
  requiresAuditLogging: false,
  allowedLocations: ['NO', 'EU', 'Global']
};

// Generated component
export const PublicComponent: React.FC = () => {
  return (
    <div data-nsm-classification="OPEN">
      {/* Public content */}
    </div>
  );
};
```

#### RESTRICTED Classification

```typescript
const config: NSMSecurityRequirements = {
  classification: NSMClassification.RESTRICTED,
  requiresAuthentication: true,
  requiresAuditLogging: true,
  allowedLocations: ['NO', 'EU'],
  requiredSecurityHeaders: [
    'X-Frame-Options',
    'X-Content-Type-Options', 
    'Strict-Transport-Security'
  ]
};

// Generated component with auth check
export const RestrictedComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const auditLogger = useAuditLogger();
  
  useEffect(() => {
    if (isAuthenticated) {
      auditLogger.log({
        action: 'component_access',
        resource: 'RestrictedComponent',
        classification: 'RESTRICTED',
        userId: user.id
      });
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <AuthenticationRequired />;
  }
  
  return (
    <div data-nsm-classification="RESTRICTED">
      {/* Restricted content */}
    </div>
  );
};
```

#### CONFIDENTIAL & SECRET Classifications

```typescript
const config: NSMSecurityRequirements = {
  classification: NSMClassification.CONFIDENTIAL,
  requiresAuthentication: true,
  requiresAuthorization: true,
  requiresEncryption: true,
  requiresAuditLogging: true,
  requiresDataLocalization: true, // Norway only
  allowedLocations: ['NO'],
  minimumPasswordComplexity: {
    minLength: 12,
    requireSpecialChars: true,
    maxAge: 90 // days
  }
};

// Generated component with full security
export const ConfidentialComponent: React.FC<ConfidentialProps> = ({ data }) => {
  const { hasPermission } = useAuthorization();
  const auditLogger = useAuditLogger();
  const encryption = useEncryption();
  
  useEffect(() => {
    auditLogger.log({
      action: 'confidential_access',
      resource: 'ConfidentialComponent',
      classification: 'CONFIDENTIAL',
      dataSize: JSON.stringify(data).length,
      encryptionUsed: true
    });
  }, [data]);
  
  if (!hasPermission('confidential_access')) {
    return <AccessDenied />;
  }
  
  const decryptedData = encryption.decrypt(data);
  
  return (
    <div 
      data-nsm-classification="CONFIDENTIAL"
      data-encrypted="true"
      data-location-restricted="NO"
    >
      {/* Confidential content */}
    </div>
  );
};
```

### GDPR Implementation

#### Consent Management

```typescript
// Generated GDPR consent component
export const GDPRConsentManager: React.FC = () => {
  const { t } = useTranslation();
  const [consent, setConsent] = useState<GDPRConsent>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });
  
  const handleConsentChange = (category: keyof GDPRConsent, value: boolean) => {
    const newConsent = { ...consent, [category]: value };
    setConsent(newConsent);
    
    // Store consent with timestamp and version
    localStorage.setItem('gdpr-consent', JSON.stringify({
      ...newConsent,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('gdpr-consent-changed', {
      detail: newConsent
    }));
  };
  
  return (
    <div className="gdpr-consent-manager" role="dialog" aria-labelledby="consent-title">
      <h2 id="consent-title">{t('gdpr.consent.title')}</h2>
      
      <div className="consent-categories">
        <ConsentCategory
          id="necessary"
          title={t('gdpr.consent.necessary.title')}
          description={t('gdpr.consent.necessary.description')}
          required={true}
          checked={consent.necessary}
          onChange={(value) => handleConsentChange('necessary', value)}
        />
        
        <ConsentCategory
          id="analytics"
          title={t('gdpr.consent.analytics.title')}
          description={t('gdpr.consent.analytics.description')}
          checked={consent.analytics}
          onChange={(value) => handleConsentChange('analytics', value)}
        />
        
        <ConsentCategory
          id="marketing"
          title={t('gdpr.consent.marketing.title')}
          description={t('gdpr.consent.marketing.description')}
          checked={consent.marketing}
          onChange={(value) => handleConsentChange('marketing', value)}
        />
      </div>
    </div>
  );
};
```

#### Data Subject Rights

```typescript
// Generated data deletion service
export class DataDeletionService {
  constructor(
    private apiClient: APIClient,
    private auditLogger: AuditLogger
  ) {}
  
  async requestDataDeletion(request: DataDeletionRequest): Promise<string> {
    const requestId = crypto.randomUUID();
    
    // Log deletion request for audit trail
    await this.auditLogger.log({
      action: 'data_deletion_requested',
      userId: request.userId,
      categories: request.categories,
      requestId,
      timestamp: new Date().toISOString(),
      classification: 'PERSONAL_DATA'
    });
    
    // Submit deletion request to API
    const response = await this.apiClient.post('/api/gdpr/delete', {
      requestId,
      userId: request.userId,
      categories: request.categories,
      reason: request.reason
    });
    
    return requestId;
  }
  
  async getDataExport(userId: string): Promise<PersonalDataExport> {
    await this.auditLogger.log({
      action: 'data_export_requested',
      userId,
      timestamp: new Date().toISOString()
    });
    
    const data = await this.apiClient.get(`/api/gdpr/export/${userId}`);
    
    return {
      exportId: crypto.randomUUID(),
      userId,
      data: data.personalData,
      exportedAt: new Date().toISOString(),
      format: 'JSON',
      checksum: this.calculateChecksum(data.personalData)
    };
  }
}
```

### WCAG AAA Accessibility

#### Form Components

```typescript
// Generated accessible form component
export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  type = 'text',
  required = false,
  error,
  helperText,
  value,
  onChange,
  ...props
}) => {
  const { t } = useTranslation();
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="form-field">
      <label 
        htmlFor={id}
        className={`form-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && (
          <span className="required-indicator" aria-label={t('form.required')}>
            *
          </span>
        )}
      </label>
      
      <input
        id={id}
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      
      {helperText && (
        <div id={helperId} className="form-helper-text">
          {helperText}
        </div>
      )}
      
      {error && (
        <div 
          id={errorId} 
          className="form-error-text"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

#### Navigation Components

```typescript
// Generated accessible navigation
export const AccessibleNavigation: React.FC<NavigationProps> = ({ items, currentPath }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  
  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Skip navigation link
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  };
  
  return (
    <>
      {/* Skip navigation for screen readers */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={skipToMain}
      >
        {t('navigation.skipToMain')}
      </a>
      
      <nav 
        ref={navRef}
        className="main-navigation"
        role="navigation"
        aria-label={t('navigation.main')}
        onKeyDown={handleKeyDown}
      >
        <button
          className="nav-toggle"
          aria-expanded={isOpen}
          aria-controls="nav-menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">
            {isOpen ? t('navigation.close') : t('navigation.open')}
          </span>
          <MenuIcon />
        </button>
        
        <ul 
          id="nav-menu"
          className={`nav-menu ${isOpen ? 'open' : ''}`}
          role="menubar"
        >
          {items.map((item, index) => (
            <li key={item.id} role="none">
              <a
                href={item.href}
                className={`nav-link ${currentPath === item.href ? 'current' : ''}`}
                role="menuitem"
                aria-current={currentPath === item.href ? 'page' : undefined}
                tabIndex={isOpen ? 0 : -1}
              >
                {t(item.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};
```

## Multi-Language Development

### Locale Configuration

```typescript
// Generated locale configuration
export const localeConfig = {
  defaultLocale: 'nb-NO' as LocaleCode,
  supportedLocales: [
    'nb-NO', // Norwegian Bokmål (primary)
    'nn-NO', // Norwegian Nynorsk
    'en-US', // English
    'ar-SA', // Arabic (RTL)
    'fr-FR'  // French
  ] as LocaleCode[],
  fallbackLocale: 'en-US' as LocaleCode,
  
  // RTL support
  rtlLocales: ['ar-SA'] as LocaleCode[],
  
  // Number formatting
  numberFormats: {
    'nb-NO': {
      currency: { style: 'currency', currency: 'NOK' },
      decimal: { minimumFractionDigits: 2 },
      percent: { style: 'percent' }
    },
    'ar-SA': {
      currency: { style: 'currency', currency: 'SAR' },
      decimal: { minimumFractionDigits: 2 },
      percent: { style: 'percent' }
    }
  },
  
  // Date formatting
  dateFormats: {
    'nb-NO': {
      short: { day: 'numeric', month: 'numeric', year: 'numeric' },
      long: { day: 'numeric', month: 'long', year: 'numeric' }
    },
    'ar-SA': {
      short: { day: 'numeric', month: 'numeric', year: 'numeric' },
      long: { day: 'numeric', month: 'long', year: 'numeric' }
    }
  }
};
```

### Translation Management

```typescript
// Generated translation hook
export const useTranslation = (namespace?: string) => {
  const { locale, setLocale } = useContext(LocaleContext);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  // Load translations for current locale
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        let translationData: Record<string, string>;
        
        if (namespace) {
          // Load namespaced translations
          translationData = await import(`@/locales/${locale}/${namespace}.json`);
        } else {
          // Load main translations
          translationData = await import(`@/locales/${locale}/common.json`);
        }
        
        setTranslations(translationData.default || translationData);
      } catch (error) {
        console.warn(`Failed to load translations for ${locale}${namespace ? `/${namespace}` : ''}:`, error);
        
        // Fallback to default locale
        if (locale !== 'en-US') {
          try {
            const fallbackData = await import(`@/locales/en-US/${namespace || 'common'}.json`);
            setTranslations(fallbackData.default || fallbackData);
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
          }
        }
      }
    };
    
    loadTranslations();
  }, [locale, namespace]);
  
  // Translation function with interpolation
  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    
    // Handle missing translations
    if (!translations[key]) {
      console.warn(`Missing translation for key: ${key} in locale: ${locale}`);
    }
    
    // Interpolate values
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        translation = translation.replace(
          new RegExp(`{{${placeholder}}}`, 'g'),
          String(value)
        );
      });
    }
    
    return translation;
  }, [translations, locale]);
  
  // Pluralization support
  const tn = useCallback((key: string, count: number, values?: Record<string, string | number>): string => {
    const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
    return t(pluralKey, { count, ...values });
  }, [t]);
  
  // Format numbers according to locale
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  }, [locale]);
  
  // Format dates according to locale
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [locale]);
  
  return {
    t,
    tn,
    locale,
    setLocale,
    formatNumber,
    formatDate,
    isRTL: localeConfig.rtlLocales.includes(locale)
  };
};
```

### RTL Support Implementation

```typescript
// Generated RTL utility
export class RTLSupport {
  private static readonly RTL_LOCALES = ['ar-SA'];
  
  static isRTLLocale(locale: string): boolean {
    return this.RTL_LOCALES.includes(locale);
  }
  
  static flipCSSProperty(property: string, value: string): { property: string; value: string } {
    const rtlMapping: Record<string, string> = {
      'margin-left': 'margin-right',
      'margin-right': 'margin-left',
      'padding-left': 'padding-right',
      'padding-right': 'padding-left',
      'left': 'right',
      'right': 'left',
      'text-align': this.flipTextAlign(value),
      'float': this.flipFloat(value),
      'border-left': 'border-right',
      'border-right': 'border-left'
    };
    
    return {
      property: rtlMapping[property] || property,
      value: rtlMapping[property] ? value : rtlMapping[value] || value
    };
  }
  
  static convertTailwindClasses(classes: string, locale: string): string {
    if (!this.isRTLLocale(locale)) {
      return classes;
    }
    
    const rtlMap: Record<string, string> = {
      'ml-': 'mr-',
      'mr-': 'ml-',
      'pl-': 'pr-',
      'pr-': 'pl-',
      'left-': 'right-',
      'right-': 'left-',
      'text-left': 'text-right',
      'text-right': 'text-left',
      'float-left': 'float-right',
      'float-right': 'float-left'
    };
    
    let convertedClasses = classes;
    
    Object.entries(rtlMap).forEach(([ltr, rtl]) => {
      const ltrRegex = new RegExp(`\\b${ltr.replace('-', '-?')}`, 'g');
      const rtlRegex = new RegExp(`\\b${rtl.replace('-', '-?')}`, 'g');
      
      // Temporary replacement to avoid double conversion
      convertedClasses = convertedClasses.replace(ltrRegex, `__TEMP__${rtl}`);
      convertedClasses = convertedClasses.replace(rtlRegex, ltr);
      convertedClasses = convertedClasses.replace(/__TEMP__/g, '');
    });
    
    return convertedClasses;
  }
  
  private static flipTextAlign(value: string): string {
    const mapping: Record<string, string> = {
      'left': 'right',
      'right': 'left'
    };
    return mapping[value] || value;
  }
  
  private static flipFloat(value: string): string {
    const mapping: Record<string, string> = {
      'left': 'right',
      'right': 'left'
    };
    return mapping[value] || value;
  }
}

// Generated RTL-aware component
export const RTLAwareComponent: React.FC<RTLAwareProps> = ({ children, className }) => {
  const { locale, isRTL } = useTranslation();
  
  const rtlClassName = useMemo(() => {
    if (!className) return '';
    return isRTL ? RTLSupport.convertTailwindClasses(className, locale) : className;
  }, [className, isRTL, locale]);
  
  return (
    <div 
      className={rtlClassName}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={locale}
    >
      {children}
    </div>
  );
};
```

## Component Generation

### Basic Component Generation

```bash
# Generate a simple component
xala-scaffold generate component Button \
  --props "variant:string,size:string,onClick:function" \
  --locale nb-NO

# Generate with Norwegian compliance
xala-scaffold generate component UserProfile \
  --props "user:User,editable:boolean" \
  --locale nb-NO \
  --classification RESTRICTED \
  --compliance \
  --accessibility \
  --tests
```

Generated component structure:

```typescript
// src/components/UserProfile/UserProfile.tsx
import React, { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { User } from '@/types/user';

interface UserProfileProps {
  readonly user: User;
  readonly editable?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  editable = false
}) => {
  const { t } = useTranslation();
  const auditLogger = useAuditLogger();
  
  useEffect(() => {
    // Log component access for RESTRICTED classification
    auditLogger.log({
      action: 'component_access',
      resource: 'UserProfile',
      classification: 'RESTRICTED',
      userId: user.id,
      timestamp: new Date().toISOString()
    });
  }, [user.id]);
  
  return (
    <div 
      className="user-profile p-6 bg-white rounded-lg shadow-md"
      data-nsm-classification="RESTRICTED"
      data-testid="user-profile"
      role="region"
      aria-labelledby="profile-title"
    >
      <h2 id="profile-title" className="text-xl font-semibold mb-4">
        {t('userProfile.title')}
      </h2>
      
      <div className="profile-content">
        <div className="profile-field">
          <label className="text-sm font-medium text-gray-700">
            {t('userProfile.name')}
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {user.firstName} {user.lastName}
          </p>
        </div>
        
        <div className="profile-field">
          <label className="text-sm font-medium text-gray-700">
            {t('userProfile.email')}
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {user.email}
          </p>
        </div>
        
        {editable && (
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('userProfile.edit')}
          >
            {t('userProfile.editButton')}
          </button>
        )}
      </div>
    </div>
  );
};
```

### Advanced Component Generation

```bash
# Generate form component with validation
xala-scaffold generate component ContactForm \
  --type form \
  --validation zod \
  --locale nb-NO \
  --accessibility \
  --compliance \
  --api-integration
```

Generated form component:

```typescript
// src/components/ContactForm/ContactForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { AccessibleFormField } from '@/components/ui/AccessibleFormField';
import { GDPRConsentCheckbox } from '@/components/compliance/GDPRConsentCheckbox';

// Validation schema with Norwegian-specific validation
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'contactForm.validation.nameMinLength')
    .max(100, 'contactForm.validation.nameMaxLength'),
  email: z.string()
    .email('contactForm.validation.emailInvalid'),
  phone: z.string()
    .regex(/^(\+47)?[2-9]\d{7}$/, 'contactForm.validation.phoneInvalid')
    .optional(),
  message: z.string()
    .min(10, 'contactForm.validation.messageMinLength')
    .max(1000, 'contactForm.validation.messageMaxLength'),
  gdprConsent: z.boolean()
    .refine(val => val === true, 'contactForm.validation.gdprRequired')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  readonly onSubmit: (data: ContactFormData) => Promise<void>;
  readonly classification?: NSMClassification;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  classification = NSMClassification.OPEN
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });
  
  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      reset();
      
      // Show success message
      // Implementation would include toast/notification
      
    } catch (error) {
      console.error('Form submission failed:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)}
      className="contact-form max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md"
      data-nsm-classification={classification}
      noValidate
    >
      <h2 className="text-xl font-semibold mb-6">
        {t('contactForm.title')}
      </h2>
      
      <div className="space-y-4">
        <AccessibleFormField
          id="name"
          label={t('contactForm.name.label')}
          type="text"
          required
          error={errors.name?.message ? t(errors.name.message) : undefined}
          helperText={t('contactForm.name.helper')}
          {...register('name')}
        />
        
        <AccessibleFormField
          id="email"
          label={t('contactForm.email.label')}
          type="email"
          required
          error={errors.email?.message ? t(errors.email.message) : undefined}
          helperText={t('contactForm.email.helper')}
          {...register('email')}
        />
        
        <AccessibleFormField
          id="phone"
          label={t('contactForm.phone.label')}
          type="tel"
          error={errors.phone?.message ? t(errors.phone.message) : undefined}
          helperText={t('contactForm.phone.helper')}
          {...register('phone')}
        />
        
        <AccessibleFormField
          id="message"
          label={t('contactForm.message.label')}
          type="textarea"
          required
          error={errors.message?.message ? t(errors.message.message) : undefined}
          helperText={t('contactForm.message.helper')}
          {...register('message')}
        />
        
        <GDPRConsentCheckbox
          id="gdprConsent"
          required
          error={errors.gdprConsent?.message ? t(errors.gdprConsent.message) : undefined}
          {...register('gdprConsent')}
        />
      </div>
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('contactForm.submit.label')}
        >
          {isSubmitting ? t('contactForm.submitting') : t('contactForm.submit')}
        </button>
      </div>
    </form>
  );
};
```

## Testing Strategy

### Generated Test Files

The scaffolding system automatically generates comprehensive test files:

```typescript
// src/components/UserProfile/__tests__/UserProfile.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UserProfile } from '../UserProfile';
import { setupNorwegianComplianceTesting } from '@xala/scaffold/testing';

expect.extend(toHaveNoViolations);

describe('UserProfile', () => {
  let testingUtils: any;
  
  beforeAll(async () => {
    testingUtils = await setupNorwegianComplianceTesting({
      classification: 'RESTRICTED',
      locale: 'nb-NO'
    });
  });
  
  afterAll(async () => {
    await testingUtils.cleanup();
  });
  
  const mockUser = {
    id: '123',
    firstName: 'Ola',
    lastName: 'Nordmann',
    email: 'ola@example.no'
  };
  
  describe('Rendering', () => {
    test('renders user information correctly', () => {
      render(<UserProfile user={mockUser} />);
      
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Ola Nordmann')).toBeInTheDocument();
      expect(screen.getByText('ola@example.no')).toBeInTheDocument();
    });
    
    test('shows edit button when editable is true', () => {
      render(<UserProfile user={mockUser} editable={true} />);
      
      const editButton = screen.getByRole('button', { name: /rediger/i });
      expect(editButton).toBeInTheDocument();
    });
    
    test('hides edit button when editable is false', () => {
      render(<UserProfile user={mockUser} editable={false} />);
      
      const editButton = screen.queryByRole('button', { name: /rediger/i });
      expect(editButton).not.toBeInTheDocument();
    });
  });
  
  describe('Norwegian Compliance', () => {
    test('has correct NSM classification', () => {
      const { container } = render(<UserProfile user={mockUser} />);
      
      const profileElement = container.querySelector('[data-nsm-classification]');
      expect(profileElement).toHaveAttribute('data-nsm-classification', 'RESTRICTED');
    });
    
    test('logs audit information', () => {
      const auditLogger = testingUtils.mockGenerator.getMock('auditLogger');
      
      render(<UserProfile user={mockUser} />);
      
      expect(auditLogger.log).toHaveBeenCalledWith({
        action: 'component_access',
        resource: 'UserProfile',
        classification: 'RESTRICTED',
        userId: mockUser.id,
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(<UserProfile user={mockUser} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('has proper ARIA attributes', () => {
      render(<UserProfile user={mockUser} />);
      
      const profile = screen.getByRole('region');
      expect(profile).toHaveAttribute('aria-labelledby', 'profile-title');
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'profile-title');
    });
    
    test('has proper Norwegian language attributes', () => {
      const { container } = render(<UserProfile user={mockUser} />);
      
      // Check that language is properly set
      expect(document.documentElement).toHaveAttribute('lang', 'nb-NO');
    });
  });
  
  describe('Performance', () => {
    test('renders within performance budget', async () => {
      const { measureRenderTime } = testingUtils.testHelpers;
      
      const metrics = await measureRenderTime(() => {
        render(<UserProfile user={mockUser} />);
      }, 100);
      
      expect(metrics.average).toBeLessThan(16); // 60fps
      expect(metrics.max).toBeLessThan(33); // 30fps worst case
    });
  });
  
  describe('Localization', () => {
    test('displays text in Norwegian Bokmål', () => {
      render(<UserProfile user={mockUser} />);
      
      // Test for Norwegian-specific text
      expect(screen.getByText(/profil/i)).toBeInTheDocument();
    });
    
    test('handles missing translations gracefully', () => {
      // Test with missing translation key
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(<UserProfile user={mockUser} />);
      
      // Should not crash and should warn about missing translations
      // Implementation would test specific missing keys
      
      consoleSpy.mockRestore();
    });
  });
});
```

### Integration Tests

```typescript
// src/components/UserProfile/__tests__/UserProfile.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { UserProfile } from '../UserProfile';
import { AuthProvider } from '@/providers/AuthProvider';
import { LocaleProvider } from '@/providers/LocaleProvider';

const server = setupServer(
  rest.post('/api/audit', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile Integration', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        <LocaleProvider defaultLocale="nb-NO">
          {component}
        </LocaleProvider>
      </AuthProvider>
    );
  };
  
  test('integrates with audit logging service', async () => {
    const mockUser = {
      id: '123',
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola@example.no'
    };
    
    renderWithProviders(<UserProfile user={mockUser} />);
    
    // Wait for audit log API call
    await waitFor(() => {
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
    
    // Check that audit API was called
    // Implementation would verify API calls
  });
  
  test('integrates with localization system', () => {
    const mockUser = {
      id: '123',
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola@example.no'
    };
    
    renderWithProviders(<UserProfile user={mockUser} />);
    
    // Test that Norwegian translations are loaded and displayed
    expect(screen.getByText(/brukerprofil/i)).toBeInTheDocument();
  });
});
```

## Migration Guide

### From Lovable.dev

```bash
# Migrate Lovable.dev project to Xala
xala-scaffold migrate \
  --from lovable \
  --to xala \
  --input ./lovable-project \
  --output ./xala-project \
  --preserve-structure \
  --compliance-level RESTRICTED \
  --locale nb-NO
```

The migration process:

1. **Component Analysis**: Analyzes existing React components
2. **Props Extraction**: Extracts component props and converts to TypeScript interfaces
3. **Style Migration**: Converts to Tailwind CSS classes with Norwegian design tokens
4. **Compliance Addition**: Adds Norwegian compliance attributes and functionality
5. **Accessibility Enhancement**: Improves accessibility to WCAG AAA standards
6. **Localization**: Adds multi-language support
7. **Testing Generation**: Creates comprehensive test files

### From Bolt.new

```bash
# Migrate Bolt.new project to Xala
xala-scaffold migrate \
  --from bolt \
  --to xala \
  --input ./bolt-project \
  --output ./xala-project \
  --compliance-level CONFIDENTIAL \
  --locale nb-NO \
  --preserve-api
```

## Best Practices

### Component Development

1. **Always use TypeScript strict mode**
2. **Follow SOLID principles**
3. **Implement proper error boundaries**
4. **Use semantic HTML elements**
5. **Ensure WCAG AAA compliance**
6. **Add comprehensive tests**
7. **Support multiple languages**
8. **Implement Norwegian compliance**

### Performance Optimization

1. **Use React.memo for expensive components**
2. **Implement proper code splitting**
3. **Optimize bundle size**
4. **Use efficient state management**
5. **Implement proper caching strategies**

### Security Best Practices

1. **Follow NSM security guidelines**
2. **Implement proper authentication**
3. **Use HTTPS everywhere**
4. **Sanitize user inputs**
5. **Implement proper audit logging**

## Troubleshooting

### Common Issues

#### 1. Translation Keys Not Found

```bash
# Check translation files
ls src/locales/nb-NO/

# Regenerate translations
xala-scaffold generate translations --locale nb-NO

# Validate translation completeness
xala-scaffold validate --translations
```

#### 2. Compliance Validation Failures

```bash
# Check compliance configuration
cat norwegian-compliance.json

# Run compliance check
xala-scaffold validate --compliance --classification RESTRICTED --fix

# Generate compliance report
xala-scaffold validate --compliance --report
```

#### 3. Accessibility Issues

```bash
# Run accessibility validation
xala-scaffold validate --accessibility --wcag AAA

# Generate accessibility report
xala-scaffold validate --accessibility --report

# Fix common accessibility issues
xala-scaffold validate --accessibility --fix
```

#### 4. Test Failures

```bash
# Run specific test suite
xala-scaffold test --component UserProfile

# Run with debugging
xala-scaffold test --component UserProfile --debug

# Update test fixtures
xala-scaffold test generate-fixtures --component UserProfile --update
```

### Getting Help

- Check the [full documentation](./README.md)
- View [example projects](../examples/)
- Review [API reference](./API.md)
- Contact support: support@xala.no

---

This guide provides comprehensive information for developing with the Xala Scaffolding System. For more specific topics, refer to the individual documentation files in the `docs/` directory.