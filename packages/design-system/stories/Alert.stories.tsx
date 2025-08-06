/**
 * Alert Component Stories
 * Showcasing all variants, sizes, and states with Norwegian text
 * WCAG AAA compliant examples with full accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription, AlertSuccess, AlertError, AlertWarning, AlertInfo } from '../registry/components/alert/alert';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Professional alert component for status messages and notifications with WCAG AAA compliance and Norwegian localization support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'warning', 'success', 'info', 'nsmOpen', 'nsmRestricted', 'nsmConfidential', 'nsmSecret'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    dismissible: {
      control: 'boolean',
      description: 'Allow alert to be dismissed',
    },
    icon: {
      control: 'boolean',
      description: 'Show or hide icon',
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification',
    },
    ariaLive: {
      control: 'select',
      options: ['polite', 'assertive', 'off'],
      description: 'ARIA live region announcement level',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Auto focus important alerts',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: (
      <div>
        <AlertTitle>Standard informasjon</AlertTitle>
        <AlertDescription>
          Dette er et standard informasjonsvarsling med ikon og lukknapp.
        </AlertDescription>
      </div>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <div>
        <AlertTitle>Vellykket operasjon</AlertTitle>
        <AlertDescription>
          Endringene dine er lagret og vil tre i kraft umiddelbart.
        </AlertDescription>
      </div>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <div>
        <AlertTitle>Advarsel</AlertTitle>
        <AlertDescription>
          Kontroller informasjonen før du fortsetter. Denne handlingen kan ikke angres.
        </AlertDescription>
      </div>
    ),
  },
};

export const Error: Story = {
  args: {
    variant: 'destructive',
    children: (
      <div>
        <AlertTitle>Feil oppstod</AlertTitle>
        <AlertDescription>
          Kunne ikke fullføre operasjonen. Kontroller nettverksforbindelsen og prøv igjen.
        </AlertDescription>
      </div>
    ),
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: (
      <div>
        <AlertTitle>Viktig informasjon</AlertTitle>
        <AlertDescription>
          Systemoppgradering er planlagt til i morgen kl. 02:00-04:00. Tjenestene kan være utilgjengelige.
        </AlertDescription>
      </div>
    ),
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert size="sm" variant="info">
        <AlertTitle size="sm">Liten størrelse</AlertTitle>
        <AlertDescription size="sm">
          Kompakt varsling for begrenset plass.
        </AlertDescription>
      </Alert>
      
      <Alert size="md" variant="warning">
        <AlertTitle size="md">Medium størrelse (standard)</AlertTitle>
        <AlertDescription size="md">
          Standard størrelse for de fleste bruksområder.
        </AlertDescription>
      </Alert>
      
      <Alert size="lg" variant="success">
        <AlertTitle size="lg">Stor størrelse</AlertTitle>
        <AlertDescription size="lg">
          Fremhevet varsling for viktige meldinger som krever oppmerksomhet.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

// Dismissible Alerts
export const DismissibleAlerts: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      { id: 1, variant: 'success' as const, title: 'Lagret', desc: 'Endringene er lagret.' },
      { id: 2, variant: 'warning' as const, title: 'Advarsel', desc: 'Kontroller informasjonen.' },
      { id: 3, variant: 'destructive' as const, title: 'Feil', desc: 'Noe gikk galt.' },
    ]);

    const removeAlert = (id: number) => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <Alert 
            key={alert.id} 
            variant={alert.variant} 
            dismissible 
            onDismiss={() => removeAlert(alert.id)}
          >
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.desc}</AlertDescription>
          </Alert>
        ))}
        {alerts.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Alle varslinger er lukket. Oppdater siden for å se dem igjen.
          </div>
        )}
      </div>
    );
  },
};

// Custom Icons
export const CustomIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="success" icon={<CheckCircleIcon className="h-5 w-5" />}>
        <AlertTitle>Med tilpasset ikon</AlertTitle>
        <AlertDescription>Eksplisitt CheckCircle ikon.</AlertDescription>
      </Alert>
      
      <Alert variant="warning" icon={false}>
        <AlertTitle>Uten ikon</AlertTitle>
        <AlertDescription>Varsling uten ikon for ren tekst.</AlertDescription>
      </Alert>
      
      <Alert variant="info" icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }>
        <AlertTitle>Helt tilpasset ikon</AlertTitle>
        <AlertDescription>Brukerdefinert SVG-ikon.</AlertDescription>
      </Alert>
    </div>
  ),
};

// NSM Security Classifications
export const NSMClassifications: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">NSM Sikkerhetskategorier</h3>
        
        <div className="space-y-4">
          <Alert nsmClassification="OPEN">
            <AlertTitle>Åpen informasjon</AlertTitle>
            <AlertDescription>
              Denne informasjonen kan deles offentlig uten restriksjoner.
            </AlertDescription>
          </Alert>
          
          <Alert nsmClassification="RESTRICTED">
            <AlertTitle>Begrenset tilgang</AlertTitle>
            <AlertDescription>
              Informasjonen er begrenset til autoriserte personer eller organisasjoner.
            </AlertDescription>
          </Alert>
          
          <Alert nsmClassification="CONFIDENTIAL">
            <AlertTitle>Konfidensiell informasjon</AlertTitle>
            <AlertDescription>
              Høy grad av beskyttelse påkrevd. Utilsiktet spredning kan skade nasjonale interesser.
            </AlertDescription>
          </Alert>
          
          <Alert nsmClassification="SECRET" autoFocus>
            <AlertTitle>Hemmelig informasjon</AlertTitle>
            <AlertDescription>
              Høyeste sikkerhetsnivå. Spredning kan forårsake alvorlig skade på nasjonale interesser.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  ),
};

// Convenience Components
export const ConvenienceComponents: Story = {
  render: () => (
    <div className="space-y-4">
      <AlertSuccess dismissible>
        <AlertTitle>AlertSuccess komponent</AlertTitle>
        <AlertDescription>Bruk AlertSuccess for rask implementering av suksessvarslinger.</AlertDescription>
      </AlertSuccess>
      
      <AlertError dismissible>
        <AlertTitle>AlertError komponent</AlertTitle>
        <AlertDescription>Bruk AlertError for feilmeldinger.</AlertDescription>
      </AlertError>
      
      <AlertWarning dismissible>
        <AlertTitle>AlertWarning komponent</AlertTitle>
        <AlertDescription>Bruk AlertWarning for advarsler.</AlertDescription>
      </AlertWarning>
      
      <AlertInfo dismissible>
        <AlertTitle>AlertInfo komponent</AlertTitle>
        <AlertDescription>Bruk AlertInfo for informative meldinger.</AlertDescription>
      </AlertInfo>
    </div>
  ),
};

// Accessibility Demonstrations
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">WCAG AAA Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-4">
          <Alert variant="destructive" ariaLive="assertive" autoFocus>
            <AlertTitle>Kritisk feil</AlertTitle>
            <AlertDescription>
              Denne meldingen bruker assertive live region og auto-fokus for umiddelbar oppmerksomhet.
            </AlertDescription>
          </Alert>
          
          <Alert variant="info" ariaLive="polite">
            <AlertTitle>Høflig meddelelse</AlertTitle>
            <AlertDescription>
              Denne meldingen bruker polite live region for å ikke avbryte brukerens arbeid.
            </AlertDescription>
          </Alert>
          
          <Alert dismissible variant="warning" ariaLive="off">
            <AlertTitle>Stille varsling</AlertTitle>
            <AlertDescription>
              Denne meldingen annonseres ikke automatisk (ariaLive="off"). Bruk Escape-tasten for å lukke.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Riktige ARIA-roller (alert/status)</li>
            <li>• Live regions for skjermlesere</li>
            <li>• Fokusbehandling for kritiske varsler</li>
            <li>• Escape-tast for lukkbare varsler</li>
            <li>• Semantiske HTML-elementer</li>
            <li>• NSM-klassifisering for skjermlesere</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

// Complex Content
export const ComplexContent: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="warning" dismissible>
        <AlertTitle>Systemoppgradering</AlertTitle>
        <AlertDescription>
          <div className="space-y-3">
            <p>Planlagt vedlikehold vil påvirke følgende tjenester:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Brukerautentisering (BankID)</li>
              <li>Dokumentlagring og -henting</li>
              <li>Altinn-integrasjon</li>
              <li>Rapportering</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <button className="text-sm font-medium text-yellow-700 hover:text-yellow-800 underline">
                Les mer
              </button>
              <button className="text-sm font-medium text-yellow-700 hover:text-yellow-800 underline">
                Abonner på oppdateringer
              </button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      <Alert variant="info" size="lg">
        <AlertTitle as="h2">GDPR-samtykke</AlertTitle>
        <AlertDescription>
          <div className="space-y-3">
            <p>Vi har oppdatert våre personvernregler i henhold til GDPR.</p>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Viktige endringer:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Utvidet informasjon om databehandling</li>
                <li>• Nye rettigheter for brukere</li>
                <li>• Oppdaterte kontaktopplysninger til personvernombud</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  ),
};

// Enterprise Scenarios
export const EnterpriseScenarios: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bedriftsscenarier</h3>
        
        <div className="space-y-4">
          <Alert variant="success" nsmClassification="OPEN" dismissible>
            <AlertTitle>Altinn-rapportering fullført</AlertTitle>
            <AlertDescription>
              Årsrapporten er sendt til Altinn og kvittering er mottatt (referanse: ALT-2024-001234).
            </AlertDescription>
          </Alert>
          
          <Alert variant="warning" nsmClassification="RESTRICTED">
            <AlertTitle>BankID-sesjon utløper snart</AlertTitle>
            <AlertDescription>
              Din BankID-sesjon utløper om 5 minutter. Lagre arbeidet ditt for å unngå tap av data.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive" nsmClassification="CONFIDENTIAL" autoFocus>
            <AlertTitle>Sikkerhetsbrud oppdaget</AlertTitle>
            <AlertDescription>
              Uautorisert tilgangslogger registrert. Kontakt IT-avdelingen umiddelbart.
            </AlertDescription>
          </Alert>
          
          <Alert variant="info" size="lg">
            <AlertTitle>Ny funksjonalitet tilgjengelig</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Elektronisk signering er nå tilgjengelig for følgende dokumenttyper:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <span className="text-xs bg-background px-2 py-1 rounded border">Kontrakter</span>
                  <span className="text-xs bg-background px-2 py-1 rounded border">Avtaler</span>
                  <span className="text-xs bg-background px-2 py-1 rounded border">Rapporter</span>
                  <span className="text-xs bg-background px-2 py-1 rounded border">Attestasjoner</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  ),
};

// Interactive Playground
export const Playground: Story = {
  args: {
    variant: 'info',
    size: 'md',
    dismissible: true,
    icon: true,
    ariaLive: 'polite',
    autoFocus: false,
    children: (
      <div>
        <AlertTitle>Interaktiv varsling</AlertTitle>
        <AlertDescription>
          Endre egenskapene i kontrollpanelet for å teste forskjellige konfigurasjoner.
        </AlertDescription>
      </div>
    ),
  },
};