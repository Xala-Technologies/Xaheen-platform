/**
 * Navigation Menu Component Stories
 * Showcasing navigation systems with accessibility and Norwegian localization
 * WCAG AAA compliant examples with professional touch targets
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  AdvancedNavigationMenu,
  type NavigationItem,
  type AdvancedNavigationMenuProps,
} from '../registry/components/navigation-menu/navigation-menu';

const meta: Meta<typeof AdvancedNavigationMenu> = {
  title: 'Navigation/NavigationMenu',
  component: AdvancedNavigationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional navigation menu component with dropdown support, keyboard navigation, and WCAG AAA compliance. Features professional touch targets (44px+) and Norwegian localization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Navigation orientation'
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
      description: 'Accessible label for navigation'
    }
  }
} satisfies Meta<typeof AdvancedNavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample navigation data
const mainNavigationItems: readonly NavigationItem[] = [
  {
    label: 'Hjem',
    href: '/',
    description: 'Gå til startsiden'
  },
  {
    label: 'Produkter',
    description: 'Se alle våre produkter',
    children: [
      {
        label: 'Dashboards',
        href: '/products/dashboards',
        description: 'Interaktive dashboards for datavisualisering',
        icon: <div className="h-4 w-4 bg-blue-500 rounded" />
      },
      {
        label: 'Rapporter',
        href: '/products/reports',
        description: 'Avanserte rapporteringsverktøy',
        icon: <div className="h-4 w-4 bg-green-500 rounded" />
      },
      {
        label: 'Analyse',
        href: '/products/analytics',
        description: 'Dyp dataanalyse og innsikt',
        icon: <div className="h-4 w-4 bg-purple-500 rounded" />
      },
      {
        label: 'API',
        href: '/products/api',
        description: 'Kraftige integrasjons-APIer',
        icon: <div className="h-4 w-4 bg-orange-500 rounded" />,
        badge: 'Ny'
      }
    ]
  },
  {
    label: 'Tjenester',
    description: 'Våre profesjonelle tjenester',
    children: [
      {
        label: 'Konsultasjon',
        href: '/services/consulting',
        description: 'Ekspert konsultasjon og rådgivning'
      },
      {
        label: 'Support',
        href: '/services/support',
        description: '24/7 teknisk support',
        badge: 'Premium'
      },
      {
        label: 'Opplæring',
        href: '/services/training',
        description: 'Omfattende opplæringsprogrammer'
      }
    ]
  },
  {
    label: 'Om oss',
    href: '/about',
    description: 'Lær mer om vårt selskap'
  },
  {
    label: 'Kontakt',
    href: '/contact',
    description: 'Ta kontakt med oss',
    badge: '24/7'
  }
];

const enterpriseNavigationItems: readonly NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <div className="h-4 w-4 bg-blue-600 rounded" />
  },
  {
    label: 'Administrasjon',
    icon: <div className="h-4 w-4 bg-gray-600 rounded" />,
    children: [
      {
        label: 'Brukere',
        href: '/admin/users',
        description: 'Administrer brukere og tilganger',
        icon: <div className="h-3 w-3 bg-green-600 rounded-full" />
      },
      {
        label: 'Roller',
        href: '/admin/roles',
        description: 'Konfigurer roller og rettigheter',
        icon: <div className="h-3 w-3 bg-purple-600 rounded-full" />
      },
      {
        label: 'Sikkerhet',
        href: '/admin/security',
        description: 'Sikkerhetsinnstillinger og logger',
        icon: <div className="h-3 w-3 bg-red-600 rounded-full" />,
        badge: 'Kritisk'
      }
    ]
  },
  {
    label: 'Rapporter',
    icon: <div className="h-4 w-4 bg-orange-600 rounded" />,
    children: [
      {
        label: 'Salgsrapporter',
        href: '/reports/sales',
        description: 'Detaljerte salgsanalyser'
      },
      {
        label: 'Brukerstatistikk',
        href: '/reports/users',
        description: 'Brukerengasjement og aktivitet'
      },
      {
        label: 'Systemytelse',
        href: '/reports/performance',
        description: 'Systemytelse og oppetid'
      }
    ]
  },
  {
    label: 'Innstillinger',
    href: '/settings',
    icon: <div className="h-4 w-4 bg-gray-500 rounded" />
  }
];

// Basic Examples
export const Default: Story = {
  args: {
    items: mainNavigationItems,
    orientation: 'horizontal',
    size: 'md',
    variant: 'default',
    ariaLabel: 'Hovednavigasjon'
  }
};

export const Vertical: Story = {
  args: {
    items: mainNavigationItems,
    orientation: 'vertical',
    size: 'md',
    variant: 'default',
    ariaLabel: 'Vertikal navigasjon'
  },
  parameters: {
    layout: 'padded'
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Small (sm)</h3>
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          size="sm"
          ariaLabel="Liten navigasjon"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Medium (md) - Standard</h3>
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          size="md"
          ariaLabel="Medium navigasjon"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (lg) - Professional</h3>
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          size="lg"
          ariaLabel="Stor navigasjon"
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
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          variant="default"
          ariaLabel="Standard navigasjon"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Subtle</h3>
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          variant="subtle"
          ariaLabel="Diskret navigasjon"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Prominent</h3>
        <AdvancedNavigationMenu
          items={mainNavigationItems.slice(0, 3)}
          variant="prominent"
          ariaLabel="Fremtredende navigasjon"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Enterprise Navigation
export const EnterpriseNavigation: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Admin Panel Navigasjon</h3>
        <AdvancedNavigationMenu
          items={enterpriseNavigationItems}
          variant="prominent"
          size="lg"
          ariaLabel="Admin navigasjon"
          onItemClick={(item) => {
            console.log('Navigating to:', item.label, item.href);
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// With Badges and Icons
export const WithBadgesAndIcons: Story = {
  args: {
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      },
      {
        label: 'Meldinger',
        href: '/messages',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>,
        badge: '12'
      },
      {
        label: 'Varsler',
        href: '/notifications',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>,
        badge: 'Ny'
      }
    ],
    size: 'lg',
    variant: 'default',
    ariaLabel: 'Navigasjon med ikoner og merker'
  }
};

// Disabled States
export const DisabledStates: Story = {
  args: {
    items: [
      {
        label: 'Tilgjengelig',
        href: '/available'
      },
      {
        label: 'Deaktivert',
        href: '/disabled',
        disabled: true
      },
      {
        label: 'Med undermeny',
        children: [
          {
            label: 'Tilgjengelig element',
            href: '/available-child'
          },
          {
            label: 'Deaktivert element',
            href: '/disabled-child',
            disabled: true
          }
        ]
      }
    ],
    ariaLabel: 'Navigasjon med deaktiverte elementer'
  }
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tastatursnarveier:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Tab</kbd> - Naviger mellom elementer</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter / Space</kbd> - Åpne dropdown eller aktivere lenke</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Esc</kbd> - Lukk dropdown</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">→ ↓</kbd> - Naviger ned i dropdown</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">← ↑</kbd> - Naviger opp i dropdown</li>
        </ul>
      </div>
      
      <AdvancedNavigationMenu
        items={mainNavigationItems}
        size="lg"
        ariaLabel="Tastaturnavigasjon demo"
      />
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Mobile Responsive Demo
export const MobileResponsive: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="max-w-sm mx-auto border rounded-lg p-4">
        <h4 className="font-medium mb-4">Mobil visning</h4>
        <AdvancedNavigationMenu
          items={mainNavigationItems}
          orientation="vertical"
          size="lg"
          ariaLabel="Mobil navigasjon"
        />
      </div>
      
      <div className="max-w-4xl mx-auto border rounded-lg p-4">
        <h4 className="font-medium mb-4">Desktop visning</h4>
        <AdvancedNavigationMenu
          items={mainNavigationItems}
          orientation="horizontal"
          size="lg"
          ariaLabel="Desktop navigasjon"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Norwegian Enterprise Example
export const NorwegianEnterprise: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Norsk Offentlig Sektor</h3>
        <AdvancedNavigationMenu
          items={[
            {
              label: 'Altinn',
              icon: <div className="h-4 w-4 bg-blue-700 rounded" />,
              children: [
                {
                  label: 'Skjemaer',
                  href: '/altinn/forms',
                  description: 'Tilgjengelige digitale skjemaer'
                },
                {
                  label: 'Meldinger',
                  href: '/altinn/messages',
                  description: 'Meldinger fra offentlige etater',
                  badge: '3'
                },
                {
                  label: 'Fullmakter',
                  href: '/altinn/authorizations',
                  description: 'Administrer fullmakter'
                }
              ]
            },
            {
              label: 'BankID',
              href: '/bankid',
              icon: <div className="h-4 w-4 bg-red-600 rounded" />
            },
            {
              label: 'Brønnøysund',
              href: '/brreg',
              icon: <div className="h-4 w-4 bg-green-600 rounded" />
            },
            {
              label: 'Support',
              href: '/support',
              badge: 'Åpen'
            }
          ]}
          variant="prominent"
          size="lg"
          ariaLabel="Norsk offentlig sektor navigasjon"
        />
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Finanstjenester</h3>
        <AdvancedNavigationMenu
          items={[
            {
              label: 'Kontoer',
              icon: <div className="h-4 w-4 bg-blue-600 rounded" />,
              children: [
                {
                  label: 'Brukskonto',
                  href: '/accounts/checking',
                  description: 'Din daglige bankkonto'
                },
                {
                  label: 'Sparekonto',
                  href: '/accounts/savings',
                  description: 'Høyrentesparekonto'
                },
                {
                  label: 'BSU',
                  href: '/accounts/bsu',
                  description: 'Boligsparing for ungdom'
                }
              ]
            },
            {
              label: 'Lån',
              href: '/loans',
              icon: <div className="h-4 w-4 bg-orange-600 rounded" />,
              badge: 'Søk nå'
            },
            {
              label: 'Forsikring',
              href: '/insurance',
              icon: <div className="h-4 w-4 bg-purple-600 rounded" />
            },
            {
              label: 'Pensjon',
              href: '/pension',
              icon: <div className="h-4 w-4 bg-gray-600 rounded" />
            }
          ]}
          variant="default"
          size="lg"
          ariaLabel="Finanstjenester navigasjon"
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
          <li>✅ Skjermleser støtte</li>
          <li>✅ Tastaturnavigasjon</li>
          <li>✅ Høy kontrast støtte</li>
          <li>✅ Focus indikatorer</li>
          <li>✅ Semantisk HTML</li>
          <li>✅ ARIA etiketter</li>
        </ul>
      </div>
      
      <AdvancedNavigationMenu
        items={mainNavigationItems}
        size="lg"
        variant="prominent"
        ariaLabel="Tilgjengelig navigasjon med full WCAG AAA støtte"
      />
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Interactive Playground
export const Playground: Story = {
  args: {
    items: mainNavigationItems,
    orientation: 'horizontal',
    size: 'lg',
    variant: 'default',
    ariaLabel: 'Interaktiv navigasjon playground'
  }
};