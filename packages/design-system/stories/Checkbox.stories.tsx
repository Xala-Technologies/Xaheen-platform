/**
 * Checkbox Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox, CheckboxGroup, CheckboxCard } from '../registry/components/checkbox/checkbox';
import { Label } from '../registry/components/label/label';
import { HeartIcon, StarIcon, ShieldCheckIcon, BellIcon, CogIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Checkbox> = {
  title: 'Form/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell avkrysningsboks-komponent med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the checkbox'
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning'],
      description: 'Visual variant of the checkbox'
    },
    shape: {
      control: 'select',
      options: ['square', 'rounded', 'circle'],
      description: 'Shape of the checkbox'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable checkbox'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate state'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    label: 'Aksepter vilkår'
  }
};

export const WithDescription: Story = {
  args: {
    label: 'Motta nyhetsbrev',
    description: 'Få de siste oppdateringene og nyhetene direkte i innboksen din'
  }
};

export const Required: Story = {
  args: {
    label: 'Jeg godkjenner vilkårene',
    required: true,
    description: 'Du må godkjenne vilkårene for å fortsette'
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Størrelser</h3>
        <div className="space-y-4">
          <Checkbox 
            size="sm" 
            label="Liten størrelse (16px)" 
            description="Kompakt størrelse for tette oppsett"
          />
          <Checkbox 
            size="md" 
            label="Medium størrelse (20px)" 
            description="Standard størrelse for de fleste bruksområder"
          />
          <Checkbox 
            size="lg" 
            label="Stor størrelse (24px) - Anbefalt" 
            description="Profesjonell størrelse med god synlighet"
          />
          <Checkbox 
            size="xl" 
            label="Ekstra stor størrelse (28px)" 
            description="Premium størrelse for viktige valg"
          />
        </div>
      </div>
    </div>
  )
};

// Shape Variants
export const Shapes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Former</h3>
        <div className="space-y-4">
          <Checkbox 
            shape="square" 
            label="Firkantet form" 
            description="Klassisk firkantet avkrysningsboks"
          />
          <Checkbox 
            shape="rounded" 
            label="Avrundet form (standard)" 
            description="Moderne avrundet design"
          />
          <Checkbox 
            shape="circle" 
            label="Sirkulær form" 
            description="Sirkelformet for spesiell bruk"
          />
        </div>
      </div>
    </div>
  )
};

// State Variants
export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Grunnleggende tilstander</h3>
          <div className="space-y-3">
            <Checkbox label="Ikke valgt" />
            <Checkbox label="Valgt" defaultChecked />
            <Checkbox label="Ubestemt tilstand" indeterminate />
            <Checkbox label="Deaktivert" disabled />
            <Checkbox label="Deaktivert og valgt" disabled defaultChecked />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Validering tilstander</h3>
          <div className="space-y-3">
            <Checkbox 
              label="Normal tilstand" 
              description="Standard avkrysningsboks"
            />
            <Checkbox 
              label="Feil tilstand" 
              error
              errorMessage="Dette feltet er påkrevd"
            />
            <Checkbox 
              label="Suksess tilstand" 
              variant="success"
              defaultChecked
              description="Gyldig valg"
            />
            <Checkbox 
              label="Advarsel tilstand" 
              variant="warning"
              description="Vær oppmerksom på dette valget"
            />
          </div>
        </div>
      </div>
    </div>
  )
};

// Variant Colors
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Fargvarianter</h3>
        <div className="space-y-4">
          <Checkbox 
            variant="default" 
            label="Standard variant" 
            defaultChecked
            description="Standard blå farge"
          />
          <Checkbox 
            variant="success" 
            label="Suksess variant" 
            defaultChecked
            description="Grønn farge for positive handlinger"
          />
          <Checkbox 
            variant="warning" 
            label="Advarsel variant" 
            defaultChecked
            description="Gul farge for advarsler"
          />
          <Checkbox 
            variant="destructive" 
            label="Destruktiv variant" 
            defaultChecked
            description="Rød farge for kritiske handlinger"
          />
        </div>
      </div>
    </div>
  )
};

// NSM Classification
export const NSMClassification: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">NSM Sikkerhetsklassifisering</h3>
        <div className="space-y-4">
          <Checkbox 
            nsmClassification="OPEN"
            label="Åpen informasjon"
            description="Kan deles offentlig uten begrensninger"
            defaultChecked
          />
          <Checkbox 
            nsmClassification="RESTRICTED"
            label="Begrenset tilgang"
            description="Kun for autorisert personell"
            defaultChecked
          />
          <Checkbox 
            nsmClassification="CONFIDENTIAL"
            label="Konfidensiell informasjon"
            description="Høyt sikkerhetsnivå påkrevd"
            defaultChecked
          />
          <Checkbox 
            nsmClassification="SECRET"
            label="Hemmelig informasjon"
            description="Strengt sikkerhetsnivå"
            defaultChecked
          />
        </div>
      </div>
    </div>
  )
};

// Checkbox Groups
export const Groups: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertikal gruppe</h3>
        <CheckboxGroup
          label="Velg dine interesser"
          description="Du kan velge flere alternativer"
        >
          <Checkbox value="tech" label="Teknologi" description="Nyheter om teknologi og innovasjon" />
          <Checkbox value="business" label="Næringsliv" description="Forretningsnyheter og markedsanalyser" />
          <Checkbox value="sports" label="Sport" description="Sportsresultater og nyheter" />
          <Checkbox value="culture" label="Kultur" description="Kulturelle arrangementer og anmeldelser" />
        </CheckboxGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Horisontal gruppe</h3>
        <CheckboxGroup
          orientation="horizontal"
          label="Prioritet"
          description="Velg viktighetsgrad"
        >
          <Checkbox value="low" label="Lav" />
          <Checkbox value="medium" label="Medium" />
          <Checkbox value="high" label="Høy" />
          <Checkbox value="critical" label="Kritisk" />
        </CheckboxGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Gruppe med feil</h3>
        <CheckboxGroup
          label="Påkrevd valg"
          description="Du må velge minst ett alternativ"
          required
          error
          errorMessage="Vennligst velg minst ett alternativ"
        >
          <Checkbox value="option1" label="Alternativ 1" />
          <Checkbox value="option2" label="Alternativ 2" />
          <Checkbox value="option3" label="Alternativ 3" />
        </CheckboxGroup>
      </div>
    </div>
  )
};

// Checkbox Cards
export const CheckboxCards: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Avkrysningskort</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CheckboxCard
            icon={<HeartIcon className="h-6 w-6" />}
            title="Favoritt"
            subtitle="Legg til favoritter"
            label="Marker som favoritt"
            description="Dette vil lagre elementet i favorittlisten din"
          />
          <CheckboxCard
            icon={<StarIcon className="h-6 w-6" />}
            title="Vurdering"
            subtitle="Gi en vurdering"
            label="Anbefal til andre"
            description="Del din positive opplevelse"
          />
          <CheckboxCard
            icon={<BellIcon className="h-6 w-6" />}
            title="Varsler"
            subtitle="Aktiver varsler"
            label="Motta varsler"
            description="Få beskjed om oppdateringer"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tjenestekort</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxCard
            icon={<ShieldCheckIcon className="h-6 w-6" />}
            title="Premium sikkerhet"
            subtitle="Utvidet beskyttelse"
            label="Aktiver premium sikkerhet"
            description="Avanserte sikkerhetsfunksjoner og overvåking"
            nsmClassification="RESTRICTED"
          />
          <CheckboxCard
            icon={<CogIcon className="h-6 w-6" />}
            title="Avanserte innstillinger"
            subtitle="Ekspertmodus"
            label="Aktiver avanserte funksjoner"
            description="Tilgang til ekspertinnstillinger og konfigurasjon"
          />
        </div>
      </div>
    </div>
  )
};

// Form Integration
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      terms: false,
      newsletter: false,
      notifications: [],
      privacy: false
    });

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Registreringsskjema</h3>
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" required>Fornavn</Label>
                <input 
                  id="firstName"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="Ola"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" required>Etternavn</Label>
                <input 
                  id="lastName"
                  className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                  placeholder="Nordmann"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required>E-postadresse</Label>
              <input 
                id="email"
                type="email"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                placeholder="ola.nordmann@example.com"
                required
              />
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Varslingsinnstillinger</h4>
              <CheckboxGroup
                label="Velg hvordan du vil motta varsler"
                description="Du kan endre disse innstillingene senere"
              >
                <Checkbox 
                  value="email" 
                  label="E-post varsler" 
                  description="Motta oppdateringer via e-post"
                />
                <Checkbox 
                  value="sms" 
                  label="SMS varsler" 
                  description="Motta viktige meldinger via SMS"
                />
                <Checkbox 
                  value="push" 
                  label="Push-varsler" 
                  description="Motta varsler i nettleseren"
                />
              </CheckboxGroup>
            </div>

            {/* Newsletter */}
            <Checkbox
              label="Motta nyhetsbrev"
              description="Få månedlige oppdateringer og nyheter (du kan melde deg av når som helst)"
              checked={formData.newsletter}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, newsletter: checked as boolean }))
              }
            />

            {/* Required Agreements */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-base font-semibold">Nødvendige avtaler</h4>
              
              <Checkbox
                label="Jeg godkjenner vilkårene og betingelsene"
                description="Du må godkjenne våre vilkår for å opprette en konto"
                required
                error={!formData.terms}
                errorMessage={!formData.terms ? "Du må godkjenne vilkårene" : undefined}
                checked={formData.terms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, terms: checked as boolean }))
                }
              />
              
              <Checkbox
                label="Jeg godkjenner personvernreglene"
                description="Vi respekterer ditt personvern og følger GDPR"
                required
                error={!formData.privacy}
                errorMessage={!formData.privacy ? "Du må godkjenne personvernreglene" : undefined}
                checked={formData.privacy}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, privacy: checked as boolean }))
                }
              />
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
            <div className="space-y-3">
              <Checkbox label="Tab for å fokusere" description="Bruk Tab-tasten for å navigere mellom avkrysningsbokser" />
              <Checkbox label="Space for å velge/fjerne" description="Bruk mellomrom for å endre valget" />
              <Checkbox label="Enter for å aktivere" description="Enter-tasten fungerer også for aktivering" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Skjermleser-støtte</h4>
            <div className="space-y-3">
              <Checkbox 
                label="ARIA-etiketter"
                description="Alle avkrysningsbokser har riktige ARIA-etiketter"
                aria-label="Avkrysningsboks med ARIA-etikett"
              />
              <Checkbox 
                label="Tilstandsindikasjon"
                description="Skjermlesere annonserer valgt/ikke valgt tilstand"
                defaultChecked
              />
              <Checkbox 
                label="Feilmeldinger"
                description="Feilmeldinger leses opp automatisk"
                error
                errorMessage="Eksempel på feilmelding som leses opp"
              />
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Visuell tilgjengelighet</h4>
            <div className="space-y-3">
              <Checkbox 
                label="Høy kontrast"
                description="Designet for å møte WCAG AA kontrastkrav"
                size="lg"
              />
              <Checkbox 
                label="Fokusindikator"
                description="Tydelig fokusring for tastaturnavigasjon"
              />
              <Checkbox 
                label="Store berøringsmål"
                description="Minimum 44px berøringsmål for mobile enheter"
                size="xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    label: 'Interaktiv avkrysningsboks',
    description: 'Dette er en interaktiv avkrysningsboks du kan tilpasse',
    size: 'lg',
    variant: 'default',
    shape: 'rounded'
  }
};