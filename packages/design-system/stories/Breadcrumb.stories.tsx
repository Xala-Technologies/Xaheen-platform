/**
 * Breadcrumb Component Stories
 * Navigation path display with auto-collapse and accessibility
 * WCAG AAA compliant examples with Norwegian localization
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  AdvancedBreadcrumb,
  type AdvancedBreadcrumbProps,
} from '../registry/components/breadcrumb/breadcrumb';

const meta: Meta<typeof AdvancedBreadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: AdvancedBreadcrumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional breadcrumb navigation component with auto-collapse functionality, WCAG AAA compliance, and Norwegian localization support. Features professional touch targets (44px+).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 3, max: 10 },
      description: 'Maximum items to show before collapsing'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant with professional touch targets'
    },
    variant: {
      control: 'select',
      options: ['default', 'subtle', 'prominent'],
      description: 'Visual style variant'
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for breadcrumb navigation'
    }
  }
} satisfies Meta<typeof AdvancedBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample breadcrumb data
const simpleBreadcrumbs = [
  { label: 'Hjem', href: '/' },
  { label: 'Produkter', href: '/products' },
  { label: 'Dashboard', isActive: true }
];

const longBreadcrumbs = [
  { label: 'Hjem', href: '/' },
  { label: 'Administrasjon', href: '/admin' },
  { label: 'Brukere', href: '/admin/users' },
  { label: 'Roller', href: '/admin/users/roles' },
  { label: 'Tillatelser', href: '/admin/users/roles/permissions' },
  { label: 'Rediger tillatelse', isActive: true }
];

const enterpriseBreadcrumbs = [
  { label: 'Portal', href: '/portal' },
  { label: 'Altinn', href: '/portal/altinn' },
  { label: 'Skjemaer', href: '/portal/altinn/forms' },
  { label: 'Næringsoppgave', href: '/portal/altinn/forms/business' },
  { label: 'RF-1030', isActive: true }
];

const ecommerceBreadcrumbs = [
  { label: 'Butikk', href: '/shop' },
  { label: 'Elektronikk', href: '/shop/electronics' },
  { label: 'Datamaskiner', href: '/shop/electronics/computers' },
  { label: 'Bærbare', href: '/shop/electronics/computers/laptops' },
  { label: 'MacBook Pro 16"', isActive: true }
];

// Basic Examples
export const Default: Story = {
  args: {
    items: simpleBreadcrumbs,
    size: 'md',
    variant: 'default',
    ariaLabel: 'Navigasjonssti'
  }
};

export const WithCustomSeparator: Story = {
  render: () => (
    <AdvancedBreadcrumb
      items={simpleBreadcrumbs}
      separator={<span className="text-muted-foreground">/</span>}
      ariaLabel="Navigasjonssti med egendefinert separator"
    />
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Small (sm)</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          size="sm"
          ariaLabel="Liten navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Medium (md) - Standard</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          size="md"
          ariaLabel="Medium navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (lg) - Professional</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          size="lg"
          ariaLabel="Stor navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Style Variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Default</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          variant="default"
          ariaLabel="Standard navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Subtle</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          variant="subtle"
          ariaLabel="Diskret navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Prominent</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          variant="prominent"
          ariaLabel="Fremtredende navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Auto-collapse Feature
export const AutoCollapse: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
          Normal sti (ingen kollaps)
        </h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          maxItems={5}
          ariaLabel="Normal navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
          Lang sti (kollaps med maxItems=5)
        </h3>
        <AdvancedBreadcrumb
          items={longBreadcrumbs}
          maxItems={5}
          ariaLabel="Kollapsbar navigasjonssti"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
          Meget lang sti (kollaps med maxItems=3)
        </h3>
        <AdvancedBreadcrumb
          items={longBreadcrumbs}
          maxItems={3}
          ariaLabel="Sterkt kollapsbar navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Enterprise Examples
export const EnterpriseExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Altinn Portal</h3>
        <AdvancedBreadcrumb
          items={enterpriseBreadcrumbs}
          maxItems={5}
          variant="prominent"
          size="lg"
          ariaLabel="Altinn portal navigasjonssti"
        />
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Systemadministrasjon', href: '/admin' },
            { label: 'Brukerhåndtering', href: '/admin/users' },
            { label: 'Rolle: SuperAdmin', isActive: true }
          ]}
          variant="default"
          size="md"
          ariaLabel="Admin panel navigasjonssti"
        />
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">BankID Integrasjon</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Tjenester', href: '/services' },
            { label: 'BankID', href: '/services/bankid' },
            { label: 'Autentisering', href: '/services/bankid/auth' },
            { label: 'Høyt sikkerhetsnivå', isActive: true }
          ]}
          variant="prominent"
          size="lg"
          ariaLabel="BankID integrasjon navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// E-commerce Example
export const EcommerceExample: Story = {
  render: () => (
    <div className="p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Produktkatalogi</h3>
      <AdvancedBreadcrumb
        items={ecommerceBreadcrumbs}
        maxItems={4}
        separator={<span className="text-muted-foreground">›</span>}
        size="md"
        ariaLabel="Produktkatalog navigasjonssti"
      />
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Custom Separators
export const CustomSeparators: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Chevron Right (Standard)</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          ariaLabel="Chevron separator"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Forward Slash</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          separator={<span className="text-muted-foreground text-sm">/</span>}
          ariaLabel="Skråstrek separator"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Greater Than</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          separator={<span className="text-muted-foreground text-sm">›</span>}
          ariaLabel="Større enn separator"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Bullet Point</h3>
        <AdvancedBreadcrumb
          items={simpleBreadcrumbs}
          separator={<span className="text-muted-foreground text-sm">•</span>}
          ariaLabel="Punkt separator"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Interactive Actions
export const InteractiveActions: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = React.useState('/products/dashboard');
    
    const handleBreadcrumbClick = (item: { label: string; href?: string }) => {
      if (item.href) {
        setCurrentPath(item.href);
        console.log('Navigating to:', item.href);
      }
    };
    
    const pathToBreadcrumbs = (path: string) => {
      const segments = path.split('/').filter(Boolean);
      const breadcrumbs = [{ label: 'Hjem', href: '/' }];
      
      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: index === segments.length - 1 ? undefined : currentPath,
          isActive: index === segments.length - 1
        });
      });
      
      return breadcrumbs;
    };
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Gjeldende sti:</p>
          <code className="text-sm bg-background px-2 py-1 rounded">{currentPath}</code>
        </div>
        
        <AdvancedBreadcrumb
          items={pathToBreadcrumbs(currentPath).map(item => ({
            ...item,
            onClick: () => handleBreadcrumbClick(item)
          }))}
          size="lg"
          ariaLabel="Interaktiv navigasjonssti"
        />
        
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => setCurrentPath('/admin/users/roles')}
          >
            Admin/Brukere/Roller
          </button>
          <button
            className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            onClick={() => setCurrentPath('/products/analytics/reports')}
          >
            Produkter/Analyse/Rapporter
          </button>
          <button
            className="px-3 py-2 text-sm bg-outline border rounded hover:bg-accent"
            onClick={() => setCurrentPath('/')}
          >
            Tilbakestill
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Responsive Behavior
export const ResponsiveBehavior: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="max-w-sm border rounded-lg p-4">
        <h4 className="font-medium mb-4">Mobil (max-w-sm)</h4>
        <AdvancedBreadcrumb
          items={longBreadcrumbs}
          maxItems={3}
          size="sm"
          ariaLabel="Mobil navigasjonssti"
        />
      </div>
      
      <div className="max-w-md border rounded-lg p-4">
        <h4 className="font-medium mb-4">Nettbrett (max-w-md)</h4>
        <AdvancedBreadcrumb
          items={longBreadcrumbs}
          maxItems={4}
          size="md"
          ariaLabel="Nettbrett navigasjonssti"
        />
      </div>
      
      <div className="max-w-4xl border rounded-lg p-4">
        <h4 className="font-medium mb-4">Desktop (max-w-4xl)</h4>
        <AdvancedBreadcrumb
          items={longBreadcrumbs}
          maxItems={7}
          size="lg"
          ariaLabel="Desktop navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Norwegian Localization
export const NorwegianLocalization: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Norsk Offentlig Sektor</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Hjem', href: '/' },
            { label: 'Min Side', href: '/profile' },
            { label: 'Skatteopplysninger', href: '/profile/tax' },
            { label: 'Forskuddsskatt 2024', isActive: true }
          ]}
          homeLabel="Hjem"
          moreLabel="Mer"
          ariaLabel="Navigasjonssti for skatteopplysninger"
          variant="prominent"
          size="lg"
        />
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Helsevesenet</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Helsenorge', href: '/' },
            { label: 'Mine Tjenester', href: '/services' },
            { label: 'Fastlege', href: '/services/gp' },
            { label: 'Timebestilling', href: '/services/gp/booking' },
            { label: 'Velg tidspunkt', isActive: true }
          ]}
          maxItems={4}
          homeLabel="Helsenorge"
          moreLabel="Flere"
          ariaLabel="Navigasjonssti for timebestilling"
          variant="default"
          size="md"
        />
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Banktjenester</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Nettbank', href: '/' },
            { label: 'Mine Kontoer', href: '/accounts' },
            { label: 'Brukskonto', href: '/accounts/checking' },
            { label: 'Kontoutskrift', href: '/accounts/checking/statement' },
            { label: 'Oktober 2024', isActive: true }
          ]}
          maxItems={4}
          homeLabel="Nettbank"
          moreLabel="Flere"
          ariaLabel="Navigasjonssti for kontoutskrift"
          variant="subtle"
          size="md"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Accessibility Features Demo
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✅ WCAG AAA kompatibel</li>
          <li>✅ Profesjonelle berøringsmål (44px+)</li>
          <li>✅ Skjermleser støtte med aria-current="page"</li>
          <li>✅ Tastaturnavigasjon</li>
          <li>✅ Høy kontrast støtte</li>
          <li>✅ Semantisk HTML med nav element</li>
          <li>✅ Beskrivende ARIA etiketter</li>
          <li>✅ Focus indikatorer</li>
        </ul>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tastatursnarveier:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Tab</kbd> - Naviger mellom lenker</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd> - Aktivere lenke</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Space</kbd> - Aktivere lenke</li>
        </ul>
      </div>
      
      <AdvancedBreadcrumb
        items={longBreadcrumbs}
        maxItems={5}
        size="lg"
        variant="prominent"
        ariaLabel="Tilgjengelig navigasjonssti med full WCAG AAA støtte"
      />
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Complex Navigation Structure
export const ComplexNavigation: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Dyp navigasjonsstruktur</h3>
        <AdvancedBreadcrumb
          items={[
            { label: 'Portal', href: '/' },
            { label: 'Organisasjon', href: '/org' },
            { label: 'Avdelinger', href: '/org/departments' },
            { label: 'IT-avdelingen', href: '/org/departments/it' },
            { label: 'Team', href: '/org/departments/it/teams' },
            { label: 'Utviklingsteam', href: '/org/departments/it/teams/dev' },
            { label: 'Prosjekter', href: '/org/departments/it/teams/dev/projects' },
            { label: 'Design System', href: '/org/departments/it/teams/dev/projects/ds' },
            { label: 'Komponenter', href: '/org/departments/it/teams/dev/projects/ds/components' },
            { label: 'Navigation', isActive: true }
          ]}
          maxItems={5}
          size="md"
          ariaLabel="Dyp organisasjonsstruktur navigasjonssti"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Interactive Playground
export const Playground: Story = {
  args: {
    items: longBreadcrumbs,
    maxItems: 5,
    size: 'md',
    variant: 'default',
    homeLabel: 'Hjem',
    moreLabel: 'Mer',
    ariaLabel: 'Interaktiv navigasjonssti playground'
  }
};