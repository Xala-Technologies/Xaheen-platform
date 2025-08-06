/**
 * Tooltip Component Stories
 * Showcasing hover information display with full positioning and accessibility
 * WCAG AAA compliant examples with Norwegian text and keyboard navigation
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  SimpleTooltip, 
  RichTooltip, 
  KeyboardTooltip, 
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  useTooltip,
  useAccessibleTooltip 
} from '../registry/components/tooltip/tooltip';
import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  Cog6ToothIcon,
  UserIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof SimpleTooltip> = {
  title: 'Components/Tooltip',
  component: SimpleTooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional tooltip component for hover information display with WCAG AAA compliance, full keyboard navigation, and multiple positioning options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Tooltip position relative to trigger',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Tooltip alignment',
    },
    variant: {
      control: 'select',
      options: ['default', 'inverse', 'warning', 'error', 'success', 'info'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tooltip size',
    },
    delayDuration: {
      control: 'number',
      min: 0,
      max: 2000,
      description: 'Delay before showing (ms)',
    },
    showArrow: {
      control: 'boolean',
      description: 'Show pointing arrow',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable tooltip',
    },
  },
} satisfies Meta<typeof SimpleTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    content: 'Dette er en grunnleggende tooltip med nyttig informasjon.',
    children: (
      <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Hold musen over meg
      </button>
    ),
  },
};

export const WithVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <SimpleTooltip content="Standard tooltip" variant="default">
        <button className="h-12 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
          Standard
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Invers tooltip med mørk bakgrunn" variant="inverse">
        <button className="h-12 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
          Invers
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Suksess tooltip" variant="success">
        <button className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Suksess
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Advarsel tooltip" variant="warning">
        <button className="h-12 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
          Advarsel
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Feil tooltip" variant="error">
        <button className="h-12 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Feil
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Info tooltip" variant="info">
        <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Info
        </button>
      </SimpleTooltip>
    </div>
  ),
};

// Positioning Examples
export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-12">
      <div className="space-y-8">
        <div className="text-center">
          <SimpleTooltip content="Tooltip øverst" side="top" align="center">
            <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Øverst
            </button>
          </SimpleTooltip>
        </div>
        
        <div className="flex justify-between items-center">
          <SimpleTooltip content="Tooltip til venstre" side="left" align="center">
            <button className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Venstre
            </button>
          </SimpleTooltip>
          
          <SimpleTooltip content="Tooltip til høyre" side="right" align="center">
            <button className="h-12 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Høyre
            </button>
          </SimpleTooltip>
        </div>
        
        <div className="text-center">
          <SimpleTooltip content="Tooltip nederst" side="bottom" align="center">
            <button className="h-12 px-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Nederst
            </button>
          </SimpleTooltip>
        </div>
      </div>
      
      <div className="space-y-8">
        <h4 className="text-base font-semibold">Alignment varianter</h4>
        
        <div className="space-y-4">
          <SimpleTooltip content="Start alignment" side="right" align="start">
            <button className="h-12 px-6 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
              Høyre - start
            </button>
          </SimpleTooltip>
          
          <SimpleTooltip content="Center alignment" side="right" align="center">
            <button className="h-12 px-6 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
              Høyre - senter
            </button>
          </SimpleTooltip>
          
          <SimpleTooltip content="End alignment" side="right" align="end">
            <button className="h-12 px-6 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
              Høyre - slutt
            </button>
          </SimpleTooltip>
        </div>
      </div>
    </div>
  ),
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-6">
      <SimpleTooltip 
        content="Liten tooltip" 
        size="sm"
      >
        <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Liten
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip 
        content="Medium tooltip med mer tekst" 
        size="md"
      >
        <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Medium
        </button>
      </SimpleTooltip>
      
      <SimpleTooltip 
        content="Stor tooltip med enda mer detaljert tekst som viser hvordan større innhold håndteres" 
        size="lg"
      >
        <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Stor
        </button>
      </SimpleTooltip>
    </div>
  ),
};

// Rich Tooltip Examples
export const RichTooltips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <RichTooltip
        title="Brukerinformasjon"
        description="Vis detaljert informasjon om den valgte brukeren inkludert roller og tilganger."
        icon={<UserIcon className="h-4 w-4" />}
      >
        <button className="h-12 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Med ikon og beskrivelse
        </button>
      </RichTooltip>
      
      <RichTooltip
        title="Slett dokument"
        description="Denne handlingen kan ikke angres. Dokumentet vil bli permanent fjernet."
        variant="error"
        actions={[
          { label: 'Avbryt', onClick: () => {} },
          { label: 'Slett', onClick: () => {}, variant: 'destructive' }
        ]}
      >
        <button className="h-12 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Med handlinger
        </button>
      </RichTooltip>
      
      <RichTooltip
        title="Systemstatus"
        description="Alle tjenester kjører normalt. Siste oppdatering for 5 minutter siden."
        variant="success"
        footer="Status oppdateres automatisk"
        icon={<CheckCircleIcon className="h-4 w-4" />}
      >
        <button className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Med footer
        </button>
      </RichTooltip>
    </div>
  ),
};

// Keyboard Shortcuts
export const KeyboardTooltips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <KeyboardTooltip
        label="Lagre dokument"
        shortcut="Ctrl+S"
        description="Lagre aktiv fil til disk"
      >
        <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-mono">
          Lagre
        </button>
      </KeyboardTooltip>
      
      <KeyboardTooltip
        label="Kopier"
        shortcut={['Ctrl+C', 'Cmd+C']}
        description="Kopier valgt innhold til utklippstavle"
      >
        <button className="h-12 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-mono">
          Kopier
        </button>
      </KeyboardTooltip>
      
      <KeyboardTooltip
        label="Åpne innstillinger"
        shortcut="Ctrl+,"
      >
        <button className="h-12 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </KeyboardTooltip>
    </div>
  ),
};

// Interactive Controls
export const InteractiveTooltips: Story = {
  render: () => <InteractiveDemo />,
};

const InteractiveDemo: React.FC = (): JSX.Element => {
  const [isControlled, setIsControlled] = useState(false);
  const { isOpen, open, close, toggle } = useTooltip();
  
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <SimpleTooltip 
          content="Denne tooltip-en er alltid synlig når du holder musen over"
          open={isControlled ? isOpen : undefined}
          onOpenChange={isControlled ? undefined : undefined}
        >
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {isControlled ? 'Kontrollert tooltip' : 'Normal tooltip'}
          </button>
        </SimpleTooltip>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => setIsControlled(!isControlled)}
          className="h-10 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
        >
          {isControlled ? 'Gjør ukontrollert' : 'Gjør kontrollert'}
        </button>
        
        {isControlled && (
          <>
            <button onClick={open} className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Åpne
            </button>
            <button onClick={close} className="h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Lukk
            </button>
            <button onClick={toggle} className="h-10 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Toggle
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Advanced Usage
export const AdvancedUsage: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Avanserte eksempler</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-3">Med tilpasset forsinkelse</h4>
            <div className="flex gap-4">
              <SimpleTooltip 
                content="Øyeblikkelig tooltip (ingen forsinkelse)" 
                delayDuration={0}
              >
                <button className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Ingen forsinkelse
                </button>
              </SimpleTooltip>
              
              <SimpleTooltip 
                content="Lang forsinkelse (1 sekund)" 
                delayDuration={1000}
              >
                <button className="h-12 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  1s forsinkelse
                </button>
              </SimpleTooltip>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">Uten pil</h4>
            <SimpleTooltip 
              content="Ren tooltip uten pekende pil" 
              showArrow={false}
            >
              <button className="h-12 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Ingen pil
              </button>
            </SimpleTooltip>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">Deaktivert tooltip</h4>
            <SimpleTooltip 
              content="Dette vil ikke vises" 
              disabled
            >
              <button className="h-12 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                Deaktivert tooltip
              </button>
            </SimpleTooltip>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => <AccessibilityDemo />,
};

const AccessibilityDemo: React.FC = (): JSX.Element => {
  const { tooltipId, triggerProps, contentProps } = useAccessibleTooltip();
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">WCAG AAA Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-3">Tastaturnavigasjon</h4>
            <div className="flex gap-4">
              <SimpleTooltip content="Tab til meg og trykk Space eller Enter for å aktivere tooltip">
                <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Fokus med Tab
                </button>
              </SimpleTooltip>
              
              <SimpleTooltip content="Bruk Escape-tasten for å lukke tooltip">
                <button className="h-12 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  Escape for å lukke
                </button>
              </SimpleTooltip>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">Skjermleserstøtte</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger 
                  {...triggerProps}
                  className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Skjermleserveznlig knapp
                </TooltipTrigger>
                <TooltipContent {...contentProps}>
                  Denne tooltip-en har riktig ARIA-merking for skjermlesere
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3">Høy kontrast</h4>
            <div className="flex gap-4">
              <SimpleTooltip 
                content="Høy kontrast tooltip som oppfyller WCAG AAA krav" 
                variant="inverse"
              >
                <button className="h-12 px-4 bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-white">
                  Høy kontrast
                </button>
              </SimpleTooltip>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Full tastaturnavigasjon med Tab, Enter, Space og Escape</li>
            <li>• ARIA-merking med <code>role="tooltip"</code> og <code>aria-describedby</code></li>
            <li>• Skjermleserstøtte med riktige live regions</li>
            <li>• Høy kontrast (WCAG AAA nivå)</li>
            <li>• Fokusindikatorer som oppfyller kontrastkrav</li>
            <li>• Semantiske HTML-elementer</li>
            <li>• Respekterer prefers-reduced-motion for animasjoner</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Enterprise Scenarios
export const EnterpriseScenarios: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bedriftsscenarier</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-base font-medium">Dokumenthåndtering</h4>
            
            <div className="flex gap-3">
              <SimpleTooltip 
                content="Last opp PDF, Word eller Excel filer (maks 10MB)"
                variant="info"
              >
                <button className="h-10 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <DocumentIcon className="h-5 w-5" />
                </button>
              </SimpleTooltip>
              
              <RichTooltip
                title="Signatur påkrevd"
                description="Dette dokumentet må signeres digitalt før det kan sendes til Altinn."
                variant="warning"
                icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                actions={[
                  { label: 'Signer nå', onClick: () => {} }
                ]}
              >
                <button className="h-10 px-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Signatur
                </button>
              </RichTooltip>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-medium">BankID integrasjon</h4>
            
            <div className="flex gap-3">
              <KeyboardTooltip
                label="BankID pålogging"
                shortcut="Ctrl+L"
                description="Start BankID autentiseringsprosess"
              >
                <button className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  BankID
                </button>
              </KeyboardTooltip>
              
              <SimpleTooltip 
                content="Automatisk utlogging om 15 minutter ved inaktivitet"
                variant="info"
                side="bottom"
              >
                <span className="h-10 px-3 bg-gray-200 text-gray-700 rounded-lg flex items-center text-sm">
                  Sesjon: 45min
                </span>
              </SimpleTooltip>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-base font-medium mb-4">Altinn rapportering</h4>
          
          <div className="flex gap-4">
            <SimpleTooltip 
              content="Send månedsrapport til Skatteetaten via Altinn"
              variant="info"
            >
              <button className="h-12 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Send til Altinn
              </button>
            </SimpleTooltip>
            
            <RichTooltip
              title="Frist nærmer seg"
              description="Rapporten må sendes innen 3 dager for å unngå gebyr."
              variant="warning"
              icon={<ExclamationTriangleIcon className="h-4 w-4" />}
              footer="Siste frist: 15. mars 2024"
            >
              <button className="h-12 px-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Månedsskjema
              </button>
            </RichTooltip>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive Playground
export const Playground: Story = {
  args: {
    content: 'Tilpass denne tooltip-en med kontrollpanelet',
    side: 'top',
    align: 'center',
    variant: 'default',
    size: 'md',
    delayDuration: 200,
    showArrow: true,
    disabled: false,
    children: (
      <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Interaktiv tooltip
      </button>
    ),
  },
};