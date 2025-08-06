/**
 * Dropdown Menu Component Stories
 * Context menus and dropdowns with NSM classifications and accessibility
 * WCAG AAA compliant examples with Norwegian localization
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  type DropdownMenuContentProps,
} from '../registry/components/dropdown-menu/dropdown-menu';

// Create a wrapper component for Storybook
interface DropdownMenuDemoProps extends DropdownMenuContentProps {
  readonly triggerText?: string;
  readonly triggerVariant?: 'default' | 'outline' | 'secondary';
  readonly children: React.ReactNode;
}

const DropdownMenuDemo: React.FC<DropdownMenuDemoProps> = ({ 
  triggerText = 'Åpne meny',
  triggerVariant = 'outline',
  children,
  ...contentProps 
}) => {
  const triggerClasses = {
    default: 'h-12 px-4 bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'h-12 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'h-12 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${triggerClasses[triggerVariant]}`}>
          {triggerText}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...contentProps}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const meta: Meta<typeof DropdownMenuDemo> = {
  title: 'Navigation/DropdownMenu',
  component: DropdownMenuDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional dropdown menu component with context menus, NSM security classifications, keyboard navigation, and WCAG AAA compliance. Features professional touch targets (40px+).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size variant with professional touch targets'
    },
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'nsmOpen', 'nsmRestricted', 'nsmConfidential', 'nsmSecret'],
      description: 'Visual style variant including NSM classifications'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side for dropdown placement'
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment relative to trigger'
    },
    triggerText: {
      control: 'text',
      description: 'Text for trigger button'
    },
    triggerVariant: {
      control: 'select',
      options: ['default', 'outline', 'secondary'],
      description: 'Trigger button variant'
    }
  }
} satisfies Meta<typeof DropdownMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    triggerText: 'Åpne meny',
    size: 'md',
    variant: 'default'
  },
  render: (args) => (
    <DropdownMenuDemo {...args}>
      <DropdownMenuItem>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profil
      </DropdownMenuItem>
      <DropdownMenuItem>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Innstillinger
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logg ut
      </DropdownMenuItem>
    </DropdownMenuDemo>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Small (sm)</h3>
        <DropdownMenuDemo triggerText="Liten meny" size="sm">
          <DropdownMenuItem size="sm">Profil</DropdownMenuItem>
          <DropdownMenuItem size="sm">Innstillinger</DropdownMenuItem>
          <DropdownMenuItem size="sm" variant="destructive">Logg ut</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Medium (md) - Standard</h3>
        <DropdownMenuDemo triggerText="Medium meny" size="md">
          <DropdownMenuItem size="md">Profil</DropdownMenuItem>
          <DropdownMenuItem size="md">Innstillinger</DropdownMenuItem>
          <DropdownMenuItem size="md" variant="destructive">Logg ut</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (lg) - Professional</h3>
        <DropdownMenuDemo triggerText="Stor meny" size="lg">
          <DropdownMenuItem size="lg">Profil</DropdownMenuItem>
          <DropdownMenuItem size="lg">Innstillinger</DropdownMenuItem>
          <DropdownMenuItem size="lg" variant="destructive">Logg ut</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Extra Large (xl) - Premium</h3>
        <DropdownMenuDemo triggerText="Ekstra stor meny" size="xl">
          <DropdownMenuItem size="xl">Profil</DropdownMenuItem>
          <DropdownMenuItem size="xl">Innstillinger</DropdownMenuItem>
          <DropdownMenuItem size="xl" variant="destructive">Logg ut</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
    </div>
  )
};

// NSM Security Classifications
export const NSMClassifications: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-4 text-green-700">ÅPEN (OPEN)</h3>
        <DropdownMenuDemo triggerText="Åpen informasjon" nsmClassification="OPEN">
          <DropdownMenuItem>Offentlige dokumenter</DropdownMenuItem>
          <DropdownMenuItem>Generell informasjon</DropdownMenuItem>
          <DropdownMenuItem>Pressemelding</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-yellow-700">BEGRENSET (RESTRICTED)</h3>
        <DropdownMenuDemo triggerText="Begrenset tilgang" nsmClassification="RESTRICTED">
          <DropdownMenuItem>Interne retningslinjer</DropdownMenuItem>
          <DropdownMenuItem>Organisasjonsdata</DropdownMenuItem>
          <DropdownMenuItem>Avdelingsinformasjon</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-red-700">KONFIDENSIELL (CONFIDENTIAL)</h3>
        <DropdownMenuDemo triggerText="Konfidensiell" nsmClassification="CONFIDENTIAL">
          <DropdownMenuItem>Personopplysninger</DropdownMenuItem>
          <DropdownMenuItem>Forretningshemmeligheter</DropdownMenuItem>
          <DropdownMenuItem>Sikkerhetsinformasjon</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4 text-gray-800">HEMMELIG (SECRET)</h3>
        <DropdownMenuDemo triggerText="Høy sikkerhet" nsmClassification="SECRET">
          <DropdownMenuItem>Klassifiserte dokumenter</DropdownMenuItem>
          <DropdownMenuItem>Sikkerhetskritisk info</DropdownMenuItem>
          <DropdownMenuItem>Administrativ tilgang</DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Complex Menu with Submenus
export const ComplexMenu: Story = {
  render: () => (
    <DropdownMenuDemo triggerText="Kompleks meny" size="lg" variant="elevated">
      <DropdownMenuLabel size="lg">Bruker: Ola Nordmann</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuItem size="lg">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
        Dashboard
        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
      </DropdownMenuItem>
      
      <DropdownMenuSub>
        <DropdownMenuSubTrigger size="lg">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profil
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent size="lg">
          <DropdownMenuItem size="lg">Se profil</DropdownMenuItem>
          <DropdownMenuItem size="lg">Rediger profil</DropdownMenuItem>
          <DropdownMenuItem size="lg">Personvern</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem size="lg">BankID verifisering</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      
      <DropdownMenuSub>
        <DropdownMenuSubTrigger size="lg">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Innstillinger
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent size="lg">
          <DropdownMenuItem size="lg">Generelt</DropdownMenuItem>
          <DropdownMenuItem size="lg">Sikkerhet</DropdownMenuItem>
          <DropdownMenuItem size="lg">Varsler</DropdownMenuItem>
          <DropdownMenuItem size="lg">Språk</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem size="lg">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Hjelp og support
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem size="lg" variant="destructive">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logg ut
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuDemo>
  )
};

// Checkbox Items
export const CheckboxItems: Story = {
  render: () => {
    const [checkedItems, setCheckedItems] = React.useState({
      notifications: true,
      marketing: false,
      updates: true
    });

    return (
      <DropdownMenuDemo triggerText="Preferanser" size="md">
        <DropdownMenuLabel>Varsler</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={checkedItems.notifications}
          onCheckedChange={(checked) => 
            setCheckedItems(prev => ({ ...prev, notifications: checked }))
          }
        >
          E-postvarsler
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={checkedItems.marketing}
          onCheckedChange={(checked) => 
            setCheckedItems(prev => ({ ...prev, marketing: checked }))
          }
        >
          Markedsføring
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={checkedItems.updates}
          onCheckedChange={(checked) => 
            setCheckedItems(prev => ({ ...prev, updates: checked }))
          }
        >
          Produktoppdateringer
        </DropdownMenuCheckboxItem>
      </DropdownMenuDemo>
    );
  }
};

// Radio Group Items
export const RadioItems: Story = {
  render: () => {
    const [theme, setTheme] = React.useState('system');

    return (
      <DropdownMenuDemo triggerText="Tema" size="md">
        <DropdownMenuLabel>Velg tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Lyst tema
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="dark">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Mørkt tema
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="system">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuDemo>
    );
  }
};

// Placement Variants
export const Placement: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <DropdownMenuDemo triggerText="Topp" side="top">
        <DropdownMenuItem>Element 1</DropdownMenuItem>
        <DropdownMenuItem>Element 2</DropdownMenuItem>
        <DropdownMenuItem>Element 3</DropdownMenuItem>
      </DropdownMenuDemo>
      
      <DropdownMenuDemo triggerText="Høyre" side="right">
        <DropdownMenuItem>Element 1</DropdownMenuItem>
        <DropdownMenuItem>Element 2</DropdownMenuItem>
        <DropdownMenuItem>Element 3</DropdownMenuItem>
      </DropdownMenuDemo>
      
      <DropdownMenuDemo triggerText="Bunn" side="bottom">
        <DropdownMenuItem>Element 1</DropdownMenuItem>
        <DropdownMenuItem>Element 2</DropdownMenuItem>
        <DropdownMenuItem>Element 3</DropdownMenuItem>
      </DropdownMenuDemo>
      
      <DropdownMenuDemo triggerText="Venstre" side="left">
        <DropdownMenuItem>Element 1</DropdownMenuItem>
        <DropdownMenuItem>Element 2</DropdownMenuItem>
        <DropdownMenuItem>Element 3</DropdownMenuItem>
      </DropdownMenuDemo>
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
        <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
        <DropdownMenuDemo triggerText="Administrator" size="lg" nsmClassification="RESTRICTED">
          <DropdownMenuLabel size="lg">Admin: Super Admin</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem size="lg">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Brukerhåndtering
          </DropdownMenuItem>
          
          <DropdownMenuItem size="lg">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Systemstatus
          </DropdownMenuItem>
          
          <DropdownMenuItem size="lg">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Rapporter
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem size="lg">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Sikkerhet
          </DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Altinn Integrasjon</h3>
        <DropdownMenuDemo triggerText="Altinn tjenester" size="md" nsmClassification="CONFIDENTIAL">
          <DropdownMenuLabel>Offentlige tjenester</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <div className="h-4 w-4 mr-2 bg-blue-600 rounded" />
            Skatteopplysninger
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <div className="h-4 w-4 mr-2 bg-green-600 rounded" />
            Folkeregisteret
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <div className="h-4 w-4 mr-2 bg-orange-600 rounded" />
            Næringsoppgave
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem variant="success">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            BankID verifisert
          </DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Banktjenester</h3>
        <DropdownMenuDemo triggerText="Mine kontoer" size="md">
          <DropdownMenuLabel>Ola Nordmann</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Brukskonto - 12 345,67 kr
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Sparekonto - 85 432,10 kr
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            BSU - 234 567,89 kr
          </DropdownMenuItem>
        </DropdownMenuDemo>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded'
  }
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tastatursnarveier:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Space / Enter</kbd> - Åpne/lukke meny</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">↑ ↓</kbd> - Naviger gjennom elementer</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Home / End</kbd> - Første/siste element</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Esc</kbd> - Lukk meny</li>
          <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd> - Aktivere element</li>
        </ul>
      </div>
      
      <DropdownMenuDemo triggerText="Test tastaturnavigasjon" size="lg">
        <DropdownMenuLabel size="lg">Navigér med tastaturet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem size="lg">Element 1 - Bruk piltastene</DropdownMenuItem>
        <DropdownMenuItem size="lg">Element 2 - Trykk Enter</DropdownMenuItem>
        <DropdownMenuItem size="lg">Element 3 - Trykk Esc for å lukke</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem size="lg" variant="destructive">Destruktiv handling</DropdownMenuItem>
      </DropdownMenuDemo>
    </div>
  )
};

// Accessibility Features Demo
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✅ WCAG AAA kompatibel</li>
          <li>✅ Profesjonelle berøringsmål (40px+)</li>
          <li>✅ Skjermleser støtte</li>
          <li>✅ Tastaturnavigasjon</li>
          <li>✅ Høy kontrast støtte</li>
          <li>✅ Focus fangst i åpen meny</li>
          <li>✅ ARIA roller og etiketter</li>
          <li>✅ Automatisk fokushåndtering</li>
        </ul>
      </div>
      
      <DropdownMenuDemo 
        triggerText="Tilgjengelig meny" 
        size="lg" 
        aria-label="Meny med full tilgjengelighet støtte"
      >
        <DropdownMenuLabel size="lg">Brukerhandlinger</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem size="lg">Profil (skjermleser vennlig)</DropdownMenuItem>
        <DropdownMenuItem size="lg">Innstillinger (tastaturnavigasjon)</DropdownMenuItem>
        <DropdownMenuItem size="lg">Hjelp (støtter høy kontrast)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem size="lg" variant="destructive">Logg ut (tydelig fokus)</DropdownMenuItem>
      </DropdownMenuDemo>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    triggerText: 'Interaktiv meny',
    triggerVariant: 'outline',
    size: 'md',
    variant: 'default',
    side: 'bottom',
    align: 'start'
  },
  render: (args) => (
    <DropdownMenuDemo {...args}>
      <DropdownMenuLabel>Playground meny</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Handling 1</DropdownMenuItem>
      <DropdownMenuItem>Handling 2</DropdownMenuItem>
      <DropdownMenuItem variant="destructive">Destruktiv handling</DropdownMenuItem>
    </DropdownMenuDemo>
  )
};