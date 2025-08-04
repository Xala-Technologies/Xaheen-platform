# UI System - Testing Guide

## 🧪 Comprehensive Testing Strategy v5.0

This guide provides testing patterns, best practices, and examples for applications built with the **Xala Universal Design System v5.0**, ensuring **Norwegian compliance**, **accessibility standards**, and **production quality**.

---

## 🎯 Testing Philosophy

### Core Testing Principles
- **Accessibility-First Testing** - WCAG 2.2 AAA compliance validation
- **Norwegian Compliance Testing** - NSM, GDPR, language support
- **Component Isolation** - Test components in isolation with proper providers
- **User-Centric Testing** - Test from user perspective, not implementation details
- **Cross-Browser Testing** - Ensure compatibility across all supported browsers

---

## 🚀 Quick Setup

### Test Environment Setup

```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@xala-technologies/ui-system$': '<rootDir>/node_modules/@xala-technologies/ui-system',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

### Test Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

---

## 🧪 Component Testing Patterns

### Basic Component Testing

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UISystemProvider, Button } from '@xala-technologies/ui-system';

expect.extend(toHaveNoViolations);

const renderWithProvider = (ui: React.ReactElement, options = {}) => {
  return render(
    <UISystemProvider
      locale="nb-NO"
      theme="light"
      compliance={{ norwegian: true, wcagLevel: 'WCAG_2_2_AAA' }}
      {...options}
    >
      {ui}
    </UISystemProvider>
  );
};

describe('Button Component', () => {
  test('renders with correct text', () => {
    renderWithProvider(<Button>Lagre</Button>);
    
    expect(screen.getByRole('button', { name: 'Lagre' })).toBeInTheDocument();
  });

  test('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    renderWithProvider(
      <Button onClick={handleClick}>Klikk meg</Button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('supports all variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'];
    
    variants.forEach(variant => {
      const { unmount } = renderWithProvider(
        <Button variant={variant}>Test</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      unmount();
    });
  });

  test('is accessible', async () => {
    const { container } = renderWithProvider(
      <Button aria-label="Lagre dokument">Lagre</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    renderWithProvider(
      <Button onClick={handleClick}>Test</Button>
    );
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard('{Space}');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
```

### Form Component Testing

```typescript
// components/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UISystemProvider } from '@xala-technologies/ui-system';
import { ContactForm } from './ContactForm';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <UISystemProvider locale="nb-NO">
      {ui}
    </UISystemProvider>
  );
};

describe('ContactForm', () => {
  test('renders all form fields', () => {
    renderWithProvider(<ContactForm />);
    
    expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-post/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emne/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/navn er påkrevd/i)).toBeInTheDocument();
    expect(screen.getByText(/e-post er påkrevd/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ContactForm />);
    
    const emailInput = screen.getByLabelText(/e-post/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/ugyldig e-postadresse/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    renderWithProvider(<ContactForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/navn/i), 'Ola Nordmann');
    await user.type(screen.getByLabelText(/e-post/i), 'ola@example.com');
    await user.selectOptions(screen.getByLabelText(/emne/i), 'support');
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ola Nordmann',
        email: 'ola@example.com',
        subject: 'support',
      });
    });
  });
});
```

---

## 🇳🇴 Norwegian Compliance Testing

### GDPR Compliance Testing

```typescript
// compliance/gdpr.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UISystemProvider, PersonalNumberInput } from '@xala-technologies/ui-system';

describe('GDPR Compliance', () => {
  test('personal number input includes GDPR notice', () => {
    render(
      <UISystemProvider locale="nb-NO">
        <PersonalNumberInput
          label="Fødselsnummer"
          gdprCompliant={true}
          auditTrail={true}
        />
      </UISystemProvider>
    );
    
    expect(screen.getByText(/personopplysninger/i)).toBeInTheDocument();
    expect(screen.getByText(/gdpr/i)).toBeInTheDocument();
  });

  test('audit trail is enabled for sensitive data', async () => {
    const mockAuditLog = jest.fn();
    
    render(
      <UISystemProvider 
        locale="nb-NO"
        auditLogger={mockAuditLog}
      >
        <PersonalNumberInput
          label="Fødselsnummer"
          gdprCompliant={true}
          auditTrail={true}
        />
      </UISystemProvider>
    );
    
    const input = screen.getByLabelText(/fødselsnummer/i);
    await userEvent.type(input, '12345678901');
    
    expect(mockAuditLog).toHaveBeenCalledWith({
      action: 'personal_data_input',
      component: 'PersonalNumberInput',
      timestamp: expect.any(Date),
      gdprCompliant: true,
    });
  });

  test('consent tracking works correctly', async () => {
    const onConsentChange = jest.fn();
    
    render(
      <UISystemProvider locale="nb-NO">
        <ConsentCheckbox
          label="Jeg samtykker til behandling av personopplysninger"
          onConsentChange={onConsentChange}
        />
      </UISystemProvider>
    );
    
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    
    expect(onConsentChange).toHaveBeenCalledWith({
      consented: true,
      timestamp: expect.any(Date),
      type: 'data_processing',
    });
  });
});
```

### NSM Classification Testing

```typescript
// compliance/nsm.test.tsx
import { render, screen } from '@testing-library/react';
import { UISystemProvider, ClassificationIndicator } from '@xala-technologies/ui-system';

describe('NSM Classification', () => {
  const classifications = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];

  test.each(classifications)('displays %s classification correctly', (level) => {
    render(
      <UISystemProvider locale="nb-NO">
        <ClassificationIndicator level={level} />
      </UISystemProvider>
    );
    
    expect(screen.getByText(level)).toBeInTheDocument();
    
    // Check for proper color coding
    const indicator = screen.getByText(level);
    expect(indicator).toHaveClass(`nsm-${level.toLowerCase()}`);
  });

  test('classification affects document access controls', () => {
    const { rerender } = render(
      <UISystemProvider locale="nb-NO">
        <SecureDocument classification="ÅPEN">
          <div>Public content</div>
        </SecureDocument>
      </UISystemProvider>
    );
    
    expect(screen.getByText('Public content')).toBeInTheDocument();
    
    rerender(
      <UISystemProvider locale="nb-NO">
        <SecureDocument classification="HEMMELIG">
          <div>Secret content</div>
        </SecureDocument>
      </UISystemProvider>
    );
    
    // Should require additional authentication for secret content
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
    expect(screen.getByText(/tilgang krever godkjenning/i)).toBeInTheDocument();
  });
});
```

### WCAG Accessibility Testing

```typescript
// accessibility/wcag.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UISystemProvider } from '@xala-technologies/ui-system';
import { CompleteApplication } from '../components/CompleteApplication';

expect.extend(toHaveNoViolations);

describe('WCAG 2.2 AAA Compliance', () => {
  test('complete application meets accessibility standards', async () => {
    const { container } = render(
      <UISystemProvider
        locale="nb-NO"
        compliance={{ wcagLevel: 'WCAG_2_2_AAA' }}
      >
        <CompleteApplication />
      </UISystemProvider>
    );
    
    const results = await axe(container, {
      rules: {
        // Enable all WCAG 2.2 AAA rules
        'color-contrast-enhanced': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'consistent-identification': { enabled: true },
      },
    });
    
    expect(results).toHaveNoViolations();
  });

  test('keyboard navigation works throughout the app', async () => {
    const user = userEvent.setup();
    
    render(
      <UISystemProvider locale="nb-NO">
        <CompleteApplication />
      </UISystemProvider>
    );
    
    // Tab through all interactive elements
    await user.tab();
    expect(document.activeElement).toHaveAttribute('role', 'button');
    
    await user.tab();
    expect(document.activeElement).toHaveAttribute('role', 'link');
    
    // Should be able to navigate to all interactive elements
    const interactiveElements = screen.getAllByRole(/button|link|textbox|combobox|checkbox/);
    
    for (let i = 0; i < interactiveElements.length; i++) {
      await user.tab();
      expect(document.activeElement).toBeVisible();
    }
  });

  test('screen reader announcements work correctly', async () => {
    const mockAnnounce = jest.fn();
    
    render(
      <UISystemProvider 
        locale="nb-NO"
        screenReaderAnnouncer={mockAnnounce}
      >
        <DynamicStatusComponent />
      </UISystemProvider>
    );
    
    // Trigger status change
    await userEvent.click(screen.getByRole('button', { name: /oppdater status/i }));
    
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Status oppdatert til fullført',
      'polite'
    );
  });
});
```

---

## 🎨 Visual Regression Testing

### Storybook + Chromatic Setup

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    'storybook-addon-designs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

### Component Stories with Testing

```typescript
// components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from '@xala-technologies/ui-system';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button component with CVA variants and Norwegian compliance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Lagre',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
        'high-contrast': { theme: 'high-contrast' },
        'norwegian-gov': { theme: 'norwegian-gov' },
      },
    },
  },
};

export const InteractionTest: Story = {
  args: {
    variant: 'primary',
    children: 'Klikk meg',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test initial state
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    
    // Test hover state
    await userEvent.hover(button);
    expect(button).toHaveClass('hover:bg-primary/90');
    
    // Test click interaction
    await userEvent.click(button);
    
    // Test keyboard interaction
    await userEvent.tab();
    expect(button).toHaveFocus();
    
    await userEvent.keyboard('{Enter}');
  },
};
```

---

## 🚀 Performance Testing

### Component Performance Testing

```typescript
// performance/component-performance.test.tsx
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { UISystemProvider, DataTable } from '@xala-technologies/ui-system';

describe('Component Performance', () => {
  test('DataTable renders large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'user',
    }));

    const startTime = performance.now();
    
    const { container } = render(
      <UISystemProvider>
        <DataTable 
          data={largeDataset}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
          ]}
          virtualized={true}
        />
      </UISystemProvider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in under 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Should only render visible rows (not all 10000)
    const visibleRows = container.querySelectorAll('[role="row"]');
    expect(visibleRows.length).toBeLessThan(50);
  });

  test('theme switching is performant', async () => {
    const { rerender } = render(
      <UISystemProvider theme="light">
        <ComplexApplicationComponent />
      </UISystemProvider>
    );
    
    const startTime = performance.now();
    
    rerender(
      <UISystemProvider theme="dark">
        <ComplexApplicationComponent />
      </UISystemProvider>
    );
    
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    // Theme switch should be under 50ms
    expect(switchTime).toBeLessThan(50);
  });
});
```

### Bundle Size Testing

```typescript
// performance/bundle-size.test.ts
import { bundleAnalyzer } from './test-utils/bundle-analyzer';

describe('Bundle Size', () => {
  test('core bundle is under size limit', async () => {
    const bundleSize = await bundleAnalyzer.getCoreSize();
    
    // Core bundle should be under 50KB gzipped
    expect(bundleSize.gzipped).toBeLessThan(50 * 1024);
  });

  test('tree shaking works correctly', async () => {
    const bundleWithOneComponent = await bundleAnalyzer.analyze(`
      import { Button } from '@xala-technologies/ui-system';
      export default function App() {
        return <Button>Test</Button>;
      }
    `);
    
    const bundleWithAllComponents = await bundleAnalyzer.analyze(`
      import * as UISystem from '@xala-technologies/ui-system';
      export default function App() {
        return <UISystem.Button>Test</UISystem.Button>;
      }
    `);
    
    // Bundle with one component should be significantly smaller
    const sizeRatio = bundleWithOneComponent.size / bundleWithAllComponents.size;
    expect(sizeRatio).toBeLessThan(0.1); // Should be less than 10% of full bundle
  });
});
```

---

## 🔧 Testing Utilities

### Custom Render Helper

```typescript
// test/utils/render-helpers.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { UISystemProvider } from '@xala-technologies/ui-system';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  theme?: string;
  compliance?: {
    norwegian?: boolean;
    wcagLevel?: 'WCAG_2_1_AA' | 'WCAG_2_2_AAA';
  };
}

export function renderWithProvider(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    locale = 'nb-NO',
    theme = 'light',
    compliance = { norwegian: true, wcagLevel: 'WCAG_2_2_AAA' },
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <UISystemProvider
        locale={locale}
        theme={theme}
        compliance={compliance}
      >
        {children}
      </UISystemProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Custom matchers for Norwegian compliance
export const norwegianMatchers = {
  toBeNorwegianCompliant: (received: HTMLElement) => {
    const hasLangAttribute = received.getAttribute('lang')?.startsWith('nb');
    const hasProperDateFormat = /\d{1,2}\.\s?\w+\s?\d{4}/.test(received.textContent || '');
    
    return {
      pass: hasLangAttribute && hasProperDateFormat,
      message: () => `Expected element to be Norwegian compliant`,
    };
  },
  
  toHaveNSMClassification: (received: HTMLElement, expectedLevel: string) => {
    const hasClassification = received.querySelector(`[data-nsm-level="${expectedLevel}"]`);
    
    return {
      pass: !!hasClassification,
      message: () => `Expected element to have NSM classification: ${expectedLevel}`,
    };
  },
};
```

### Mock Services

```typescript
// test/mocks/services.ts
export const mockLocalizationService = {
  t: jest.fn((key: string, params?: Record<string, any>) => {
    const translations: Record<string, string> = {
      'actions.save': 'Lagre',
      'actions.cancel': 'Avbryt',
      'form.required': 'Påkrevd',
      'form.email.invalid': 'Ugyldig e-postadresse',
    };
    
    let translation = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }
    
    return translation;
  }),
  
  formatDate: jest.fn((date: Date) => {
    return new Intl.DateTimeFormat('nb-NO').format(date);
  }),
  
  formatCurrency: jest.fn((amount: number, currency = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
    }).format(amount);
  }),
};

export const mockThemeService = {
  theme: 'light',
  setTheme: jest.fn(),
  colorMode: 'light',
  setColorMode: jest.fn(),
  availableThemes: [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'high-contrast', name: 'High Contrast' },
  ],
};
```

---

## 📊 Test Coverage & Quality Gates

### Coverage Requirements

```javascript
// jest.config.js - Coverage thresholds
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/components/': {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98,
    },
    './src/compliance/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
```

### Quality Gates Script

```bash
#!/bin/bash
# scripts/quality-gates.sh

echo "Running quality gates..."

# Run tests with coverage
npm run test:coverage

# Check coverage thresholds
if [ $? -ne 0 ]; then
  echo "❌ Test coverage below threshold"
  exit 1
fi

# Run accessibility tests
npm run test:a11y

if [ $? -ne 0 ]; then
  echo "❌ Accessibility tests failed"
  exit 1
fi

# Run Norwegian compliance tests
npm run test:compliance

if [ $? -ne 0 ]; then
  echo "❌ Norwegian compliance tests failed"
  exit 1
fi

# Run visual regression tests
npm run test:visual

if [ $? -ne 0 ]; then
  echo "❌ Visual regression tests failed"
  exit 1
fi

echo "✅ All quality gates passed"
```

---

## 🔗 Related Documentation

- **[Component Library](../components/)** - Component testing examples
- **[Norwegian Compliance](../guides/norwegian-compliance.md)** - Compliance testing requirements
- **[Accessibility Guide](../guides/accessibility.md)** - WCAG testing patterns
- **[Performance Guide](../guides/performance.md)** - Performance testing strategies

---

*UI System Testing Guide v2.0 - Comprehensive testing for Norwegian-compliant applications*