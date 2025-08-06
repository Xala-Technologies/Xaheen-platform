/**
 * Radio Group Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RadioGroup, RadioGroupItem } from '../registry/components/radio-group/radio-group';
import { Label } from '../registry/components/label/label';

const meta: Meta<typeof RadioGroup> = {
  title: 'Form/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell radioknapp-gruppe for enkeltvalg med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation of the radio group'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the radio buttons'
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
      description: 'Visual variant of the radio buttons'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire radio group'
    },
    required: {
      control: 'boolean',
      description: 'Mark the radio group as required'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <Label>Velg betalingsmetode</Label>
      <RadioGroup defaultValue="card">
        <RadioGroupItem value="card">
          Kort
        </RadioGroupItem>
        <RadioGroupItem value="paypal">
          PayPal
        </RadioGroupItem>
        <RadioGroupItem value="bank">
          Bankoverføring
        </RadioGroupItem>
      </RadioGroup>
    </div>
  )
};

export const WithHelperText: Story = {
  render: () => (
    <RadioGroup 
      defaultValue="basic"
      helperText="Velg den planen som passer best for dine behov"
    >
      <RadioGroupItem value="basic">
        Grunnleggende plan
      </RadioGroupItem>
      <RadioGroupItem value="pro">
        Profesjonell plan
      </RadioGroupItem>
      <RadioGroupItem value="enterprise">
        Bedriftsplan
      </RadioGroupItem>
    </RadioGroup>
  )
};

export const Required: Story = {
  render: () => (
    <div className="space-y-4">
      <Label required>Velg leveringsmåte</Label>
      <RadioGroup required>
        <RadioGroupItem value="standard">
          Standard levering (3-5 dager)
        </RadioGroupItem>
        <RadioGroupItem value="express">
          Ekspresslevering (1-2 dager)
        </RadioGroupItem>
        <RadioGroupItem value="overnight">
          Neste dag levering
        </RadioGroupItem>
      </RadioGroup>
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Størrelser</h3>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Liten størrelse</Label>
            <RadioGroup size="sm" defaultValue="option1">
              <RadioGroupItem value="option1">Alternativ 1</RadioGroupItem>
              <RadioGroupItem value="option2">Alternativ 2</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Medium størrelse (standard)</Label>
            <RadioGroup size="md" defaultValue="option1">
              <RadioGroupItem value="option1">Alternativ 1</RadioGroupItem>
              <RadioGroupItem value="option2">Alternativ 2</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Stor størrelse</Label>
            <RadioGroup size="lg" defaultValue="option1">
              <RadioGroupItem value="option1">Alternativ 1</RadioGroupItem>
              <RadioGroupItem value="option2">Alternativ 2</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Ekstra stor størrelse</Label>
            <RadioGroup size="xl" defaultValue="option1">
              <RadioGroupItem value="option1">Alternativ 1</RadioGroupItem>
              <RadioGroupItem value="option2">Alternativ 2</RadioGroupItem>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
};

// Orientation
export const Orientations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Vertikal orientering (standard)</h3>
        <RadioGroup orientation="vertical" defaultValue="vertical1">
          <RadioGroupItem value="vertical1">Første alternativ</RadioGroupItem>
          <RadioGroupItem value="vertical2">Andre alternativ</RadioGroupItem>
          <RadioGroupItem value="vertical3">Tredje alternativ</RadioGroupItem>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Horisontal orientering</h3>
        <RadioGroup orientation="horizontal" defaultValue="horizontal1">
          <RadioGroupItem value="horizontal1">Ja</RadioGroupItem>
          <RadioGroupItem value="horizontal2">Nei</RadioGroupItem>
          <RadioGroupItem value="horizontal3">Vet ikke</RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  )
};

// Variant Colors
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Fargvarianter</h3>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Standard variant</Label>
            <RadioGroup variant="default" defaultValue="default1">
              <RadioGroupItem value="default1">Standard valg</RadioGroupItem>
              <RadioGroupItem value="default2">Alternativ valg</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Suksess variant</Label>
            <RadioGroup variant="success" defaultValue="success1">
              <RadioGroupItem value="success1">Anbefalt valg</RadioGroupItem>
              <RadioGroupItem value="success2">Alternativt valg</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Advarsel variant</Label>
            <RadioGroup variant="warning" defaultValue="warning1">
              <RadioGroupItem value="warning1">Forsiktig valg</RadioGroupItem>
              <RadioGroupItem value="warning2">Alternativt valg</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Destruktiv variant</Label>
            <RadioGroup variant="destructive" defaultValue="destructive1">
              <RadioGroupItem value="destructive1">Slett alle data</RadioGroupItem>
              <RadioGroupItem value="destructive2">Avbryt operasjon</RadioGroupItem>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
};

// States
export const States: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Normal tilstand</Label>
          <RadioGroup defaultValue="normal1">
            <RadioGroupItem value="normal1">Valgt alternativ</RadioGroupItem>
            <RadioGroupItem value="normal2">Ikke valgt alternativ</RadioGroupItem>
          </RadioGroup>
        </div>
        
        <div>
          <Label className="mb-2 block">Deaktivert gruppe</Label>
          <RadioGroup disabled defaultValue="disabled1">
            <RadioGroupItem value="disabled1">Deaktivert og valgt</RadioGroupItem>
            <RadioGroupItem value="disabled2">Deaktivert og ikke valgt</RadioGroupItem>
          </RadioGroup>
        </div>
        
        <div>
          <Label className="mb-2 block">Blandet tilstander</Label>
          <RadioGroup defaultValue="mixed1">
            <RadioGroupItem value="mixed1">Aktivt valg</RadioGroupItem>
            <RadioGroupItem value="mixed2" disabled>Deaktivert alternativ</RadioGroupItem>
            <RadioGroupItem value="mixed3">Aktivt alternativ</RadioGroupItem>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
};

// NSM Classification
export const NSMClassification: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">NSM Sikkerhetsklassifisering</h3>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Åpen informasjon</Label>
            <RadioGroup nsmClassification="OPEN" defaultValue="open1">
              <RadioGroupItem value="open1">Offentlig tilgjengelig</RadioGroupItem>
              <RadioGroupItem value="open2">Åpen deling</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Begrenset tilgang</Label>
            <RadioGroup nsmClassification="RESTRICTED" defaultValue="restricted1">
              <RadioGroupItem value="restricted1">Kun autorisert personell</RadioGroupItem>
              <RadioGroupItem value="restricted2">Begrenset distribusjon</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Konfidensiell informasjon</Label>
            <RadioGroup nsmClassification="CONFIDENTIAL" defaultValue="confidential1">
              <RadioGroupItem value="confidential1">Høy sikkerhet</RadioGroupItem>
              <RadioGroupItem value="confidential2">Kontrollert tilgang</RadioGroupItem>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Hemmelig informasjon</Label>
            <RadioGroup nsmClassification="SECRET" defaultValue="secret1">
              <RadioGroupItem value="secret1">Strengt sikkerhetsnivå</RadioGroupItem>
              <RadioGroupItem value="secret2">Maksimal beskyttelse</RadioGroupItem>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
};

// Real World Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="max-w-2xl space-y-10">
      {/* Survey Question */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Kundetilfredshet</h3>
        <p className="text-sm text-muted-foreground">
          Hvor fornøyd er du med våre tjenester?
        </p>
        <RadioGroup name="satisfaction">
          <RadioGroupItem value="very-satisfied">
            Meget fornøyd
          </RadioGroupItem>
          <RadioGroupItem value="satisfied">
            Fornøyd
          </RadioGroupItem>
          <RadioGroupItem value="neutral">
            Nøytral
          </RadioGroupItem>
          <RadioGroupItem value="dissatisfied">
            Misfornøyd
          </RadioGroupItem>
          <RadioGroupItem value="very-dissatisfied">
            Meget misfornøyd
          </RadioGroupItem>
        </RadioGroup>
      </div>

      {/* Subscription Plan */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Abonnementplan</h3>
        <RadioGroup name="subscription" variant="success" defaultValue="pro">
          <RadioGroupItem value="basic">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Grunnleggende - 99 kr/mnd</div>
                <div className="text-sm text-muted-foreground">Opp til 5 prosjekter</div>
              </div>
            </div>
          </RadioGroupItem>
          <RadioGroupItem value="pro">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Profesjonell - 199 kr/mnd</div>
                <div className="text-sm text-muted-foreground">Opp til 25 prosjekter + prioritert support</div>
              </div>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Anbefalt</span>
            </div>
          </RadioGroupItem>
          <RadioGroupItem value="enterprise">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Bedrift - 499 kr/mnd</div>
                <div className="text-sm text-muted-foreground">Ubegrensede prosjekter + dedikert support</div>
              </div>
            </div>
          </RadioGroupItem>
        </RadioGroup>
      </div>

      {/* Notification Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Varslingsfrekvens</h3>
        <p className="text-sm text-muted-foreground">
          Hvor ofte vil du motta e-postvarsler?
        </p>
        <RadioGroup 
          name="notifications" 
          orientation="horizontal"
          defaultValue="weekly"
        >
          <RadioGroupItem value="daily">Daglig</RadioGroupItem>
          <RadioGroupItem value="weekly">Ukentlig</RadioGroupItem>
          <RadioGroupItem value="monthly">Månedlig</RadioGroupItem>
          <RadioGroupItem value="never">Aldri</RadioGroupItem>
        </RadioGroup>
      </div>

      {/* Shipping Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Leveringsmuligheter</h3>
        <RadioGroup name="shipping" required>
          <RadioGroupItem value="standard">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Standard levering</div>
                <div className="text-sm text-muted-foreground">5-7 virkedager</div>
              </div>
              <div className="text-sm font-medium">Gratis</div>
            </div>
          </RadioGroupItem>
          <RadioGroupItem value="express">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Ekspresslevering</div>
                <div className="text-sm text-muted-foreground">2-3 virkedager</div>
              </div>
              <div className="text-sm font-medium">99 kr</div>
            </div>
          </RadioGroupItem>
          <RadioGroupItem value="overnight">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">Neste dag levering</div>
                <div className="text-sm text-muted-foreground">1 virkedag</div>
              </div>
              <div className="text-sm font-medium">199 kr</div>
            </div>
          </RadioGroupItem>
        </RadioGroup>
      </div>

      {/* Agreement Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avtale type</h3>
        <RadioGroup name="agreement" variant="warning" required>
          <RadioGroupItem value="monthly">
            Månedlig avtale - kan avsluttes når som helst
          </RadioGroupItem>
          <RadioGroupItem value="annual">
            <div>
              <div className="font-medium">Årlig avtale - spar 20%</div>
              <div className="text-sm text-muted-foreground">
                Bindingstid på 12 måneder
              </div>
            </div>
          </RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  )
};

// Form Integration
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      contactMethod: 'email',
      priority: 'normal',
      category: ''
    });

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Kontaktskjema</h3>
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" required>Navn</Label>
                <input 
                  id="name"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="Ditt navn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Bedrift</Label>
                <input 
                  id="company"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="Bedriftsnavn (valgfritt)"
                />
              </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-3">
              <Label required>Ønsket kontaktmåte</Label>
              <RadioGroup 
                value={formData.contactMethod}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, contactMethod: value }))
                }
                required
              >
                <RadioGroupItem value="email">
                  E-post - Vi svarer innen 24 timer
                </RadioGroupItem>
                <RadioGroupItem value="phone">
                  Telefon - Vi ringer deg tilbake
                </RadioGroupItem>
                <RadioGroupItem value="meeting">
                  Møte - Vi setter opp et videomøte
                </RadioGroupItem>
              </RadioGroup>
            </div>

            {/* Priority Level */}
            <div className="space-y-3">
              <Label>Prioritet</Label>
              <RadioGroup 
                orientation="horizontal"
                variant="warning"
                value={formData.priority}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <RadioGroupItem value="low">Lav</RadioGroupItem>
                <RadioGroupItem value="normal">Normal</RadioGroupItem>
                <RadioGroupItem value="high">Høy</RadioGroupItem>
                <RadioGroupItem value="urgent">Haster</RadioGroupItem>
              </RadioGroup>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label required>Kategori</Label>
              <RadioGroup 
                value={formData.category}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
                required
              >
                <RadioGroupItem value="support">
                  Teknisk support
                </RadioGroupItem>
                <RadioGroupItem value="sales">
                  Salg og prisforespørsel
                </RadioGroupItem>
                <RadioGroupItem value="feedback">
                  Tilbakemelding
                </RadioGroupItem>
                <RadioGroupItem value="partnership">
                  Partnerskap
                </RadioGroupItem>
                <RadioGroupItem value="other">
                  Annet
                </RadioGroupItem>
              </RadioGroup>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" required>Melding</Label>
              <textarea 
                id="message"
                className="flex min-h-24 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                placeholder="Beskriv din henvendelse..."
                required
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Valgte innstillinger: 
              {' ' + formData.contactMethod + ', ' + formData.priority + ', ' + formData.category}
            </div>
          </form>
        </div>
      </div>
    );
  }
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold mb-3">Tastaturnavigasjon</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Bruk piltaster for å navigere, mellomrom/enter for å velge
            </p>
            <RadioGroup defaultValue="keyboard1">
              <RadioGroupItem value="keyboard1">
                Tab/Shift+Tab for å gå inn/ut av gruppen
              </RadioGroupItem>
              <RadioGroupItem value="keyboard2">
                Piltaster (opp/ned/venstre/høyre) for navigasjon
              </RadioGroupItem>
              <RadioGroupItem value="keyboard3">
                Mellomrom eller Enter for å velge
              </RadioGroupItem>
            </RadioGroup>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Skjermleser-støtte</h4>
            <RadioGroup 
              aria-label="Tilgjengelighetsfunksjoner for skjermlesere"
              defaultValue="screenreader1"
            >
              <RadioGroupItem value="screenreader1">
                ARIA radiogroup rolle for gruppering
              </RadioGroupItem>
              <RadioGroupItem value="screenreader2">
                Automatisk annonsering av valgt element
              </RadioGroupItem>
              <RadioGroupItem value="screenreader3">
                Støtte for aria-describedby og hjelpetekst
              </RadioGroupItem>
            </RadioGroup>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Visuell tilgjengelighet</h4>
            <RadioGroup 
              size="lg"
              defaultValue="visual1"
            >
              <RadioGroupItem value="visual1">
                Høy kontrast for bedre synlighet
              </RadioGroupItem>
              <RadioGroupItem value="visual2">
                Tydelige fokusindikatorer
              </RadioGroupItem>
              <RadioGroupItem value="visual3">
                Store berøringsmål (minimum 44px)
              </RadioGroupItem>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1">Første alternativ</RadioGroupItem>
      <RadioGroupItem value="option2">Andre alternativ</RadioGroupItem>
      <RadioGroupItem value="option3">Tredje alternativ</RadioGroupItem>
    </RadioGroup>
  ),
  args: {
    orientation: 'vertical',
    size: 'md',
    variant: 'default',
    defaultValue: 'option1',
    helperText: 'Velg ett alternativ fra listen'
  }
};