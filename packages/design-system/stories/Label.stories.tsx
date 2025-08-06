/**
 * Label Component Stories
 * Showcasing all variants, sizes, and features with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  Label, 
  LabelGroup, 
  FloatingLabel, 
  LabelWithIcon, 
  FieldLabel,
  LabelRequired,
  LabelOptional,
  LabelError,
  LabelSuccess,
  LabelMuted
} from '../registry/components/label/label';
import { Input } from '../registry/components/input/input';
import { UserIcon, EnvelopeIcon, PhoneIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Label> = {
  title: 'Form/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell etikett-komponent for skjemafelt med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the label text'
    },
    variant: {
      control: 'select',
      options: ['default', 'muted', 'destructive', 'success', 'warning', 'info'],
      description: 'Visual variant of the label'
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight of the label'
    },
    required: {
      control: 'boolean',
      description: 'Show required indicator'
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state styling'
    },
    optional: {
      control: 'boolean',
      description: 'Show optional indicator'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Navn',
    htmlFor: 'default-input'
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="default-input" placeholder="Skriv inn ditt navn" />
    </div>
  )
};

export const Required: Story = {
  args: {
    children: 'E-postadresse',
    htmlFor: 'required-input',
    required: true
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="required-input" type="email" placeholder="din@epost.no" required />
    </div>
  )
};

export const Optional: Story = {
  args: {
    children: 'Telefonnummer',
    htmlFor: 'optional-input',
    optional: true
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="optional-input" type="tel" placeholder="+47 XXX XX XXX" />
    </div>
  )
};

export const WithHelpText: Story = {
  args: {
    children: 'Passord',
    htmlFor: 'help-input',
    helpText: 'Minimum 8 tegn, inkluder tall og spesialtegn',
    required: true
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="help-input" type="password" placeholder="Ditt passord" />
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Størrelser</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label size="sm" htmlFor="small-input">
              Liten størrelse (12px)
            </Label>
            <Input id="small-input" placeholder="Liten etikett" />
          </div>
          
          <div className="space-y-2">
            <Label size="md" htmlFor="medium-input">
              Medium størrelse (14px) - Standard
            </Label>
            <Input id="medium-input" placeholder="Medium etikett" />
          </div>
          
          <div className="space-y-2">
            <Label size="lg" htmlFor="large-input">
              Stor størrelse (16px)
            </Label>
            <Input id="large-input" placeholder="Stor etikett" />
          </div>
          
          <div className="space-y-2">
            <Label size="xl" htmlFor="xl-input">
              Ekstra stor størrelse (18px)
            </Label>
            <Input id="xl-input" placeholder="Ekstra stor etikett" />
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
          <div className="space-y-2">
            <Label variant="default" htmlFor="default-variant">
              Standard variant
            </Label>
            <Input id="default-variant" placeholder="Standard farge" />
          </div>
          
          <div className="space-y-2">
            <Label variant="muted" htmlFor="muted-variant">
              Dempet variant
            </Label>
            <Input id="muted-variant" placeholder="Dempet farge" />
          </div>
          
          <div className="space-y-2">
            <Label variant="success" htmlFor="success-variant">
              Suksess variant
            </Label>
            <Input id="success-variant" placeholder="Suksess farge" />
          </div>
          
          <div className="space-y-2">
            <Label variant="warning" htmlFor="warning-variant">
              Advarsel variant
            </Label>
            <Input id="warning-variant" placeholder="Advarsel farge" />
          </div>
          
          <div className="space-y-2">
            <Label variant="destructive" htmlFor="error-variant">
              Feil variant
            </Label>
            <Input id="error-variant" placeholder="Feil farge" />
          </div>
          
          <div className="space-y-2">
            <Label variant="info" htmlFor="info-variant">
              Info variant
            </Label>
            <Input id="info-variant" placeholder="Info farge" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Font Weights
export const Weights: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Skriftvekter</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label weight="normal" htmlFor="normal-weight">
              Normal vekt
            </Label>
            <Input id="normal-weight" placeholder="Normal skriftvekt" />
          </div>
          
          <div className="space-y-2">
            <Label weight="medium" htmlFor="medium-weight">
              Medium vekt (standard)
            </Label>
            <Input id="medium-weight" placeholder="Medium skriftvekt" />
          </div>
          
          <div className="space-y-2">
            <Label weight="semibold" htmlFor="semibold-weight">
              Halvfet vekt
            </Label>
            <Input id="semibold-weight" placeholder="Halvfet skriftvekt" />
          </div>
          
          <div className="space-y-2">
            <Label weight="bold" htmlFor="bold-weight">
              Fet vekt
            </Label>
            <Input id="bold-weight" placeholder="Fet skriftvekt" />
          </div>
        </div>
      </div>
    </div>
  )
};

// States
export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="normal-state">Normal tilstand</Label>
          <Input id="normal-state" placeholder="Normal etikett" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="required-state" required>Påkrevd felt</Label>
          <Input id="required-state" placeholder="Påkrevd felt" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="optional-state" optional>Valgfritt felt</Label>
          <Input id="optional-state" placeholder="Valgfritt felt" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="disabled-state" disabled>Deaktivert felt</Label>
          <Input id="disabled-state" placeholder="Deaktivert felt" disabled />
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="tooltip-state" 
            tooltip="Dette er en hjelpende tooltip som forklarer feltet"
          >
            Med tooltip
          </Label>
          <Input id="tooltip-state" placeholder="Hover over etiketten for tooltip" />
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
          <div className="space-y-2">
            <Label 
              nsmClassification="OPEN" 
              htmlFor="nsm-open"
              helpText="Kan deles offentlig uten begrensninger"
            >
              Åpen informasjon
            </Label>
            <Input id="nsm-open" placeholder="Offentlig tilgjengelig data" />
          </div>
          
          <div className="space-y-2">
            <Label 
              nsmClassification="RESTRICTED" 
              htmlFor="nsm-restricted"
              helpText="Kun for autorisert personell"
            >
              Begrenset tilgang
            </Label>
            <Input id="nsm-restricted" placeholder="Begrenset informasjon" />
          </div>
          
          <div className="space-y-2">
            <Label 
              nsmClassification="CONFIDENTIAL" 
              htmlFor="nsm-confidential"
              helpText="Høyt sikkerhetsnivå påkrevd"
            >
              Konfidensiell informasjon
            </Label>
            <Input id="nsm-confidential" placeholder="Konfidensiell data" />
          </div>
          
          <div className="space-y-2">
            <Label 
              nsmClassification="SECRET" 
              htmlFor="nsm-secret"
              helpText="Strengt sikkerhetsnivå"
            >
              Hemmelig informasjon
            </Label>
            <Input id="nsm-secret" placeholder="Hemmelig data" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Label Groups
export const LabelGroups: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertikal gruppe</h3>
        <LabelGroup orientation="vertical" spacing="normal">
          <div className="space-y-2">
            <Label htmlFor="group-name">Navn</Label>
            <Input id="group-name" placeholder="Ditt navn" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-email">E-post</Label>
            <Input id="group-email" type="email" placeholder="din@epost.no" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-phone">Telefon</Label>
            <Input id="group-phone" type="tel" placeholder="+47 XXX XX XXX" />
          </div>
        </LabelGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Horisontal gruppe</h3>
        <LabelGroup orientation="horizontal" spacing="normal">
          <div className="space-y-2">
            <Label htmlFor="horizontal-first" size="sm">Fornavn</Label>
            <Input id="horizontal-first" placeholder="Fornavn" className="w-32" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horizontal-last" size="sm">Etternavn</Label>
            <Input id="horizontal-last" placeholder="Etternavn" className="w-32" />
          </div>
        </LabelGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Ulike avstander</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Tett avstand</h4>
            <LabelGroup orientation="vertical" spacing="tight">
              <Label>Kompakt etikett 1</Label>
              <Label>Kompakt etikett 2</Label>
              <Label>Kompakt etikett 3</Label>
            </LabelGroup>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Normal avstand</h4>
            <LabelGroup orientation="vertical" spacing="normal">
              <Label>Normal etikett 1</Label>
              <Label>Normal etikett 2</Label>
              <Label>Normal etikett 3</Label>
            </LabelGroup>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Løs avstand</h4>
            <LabelGroup orientation="vertical" spacing="loose">
              <Label>Romslig etikett 1</Label>
              <Label>Romslig etikett 2</Label>
              <Label>Romslig etikett 3</Label>
            </LabelGroup>
          </div>
        </div>
      </div>
    </div>
  )
};

// Floating Labels
export const FloatingLabels: Story = {
  render: () => {
    const [values, setValues] = React.useState({
      floating1: '',
      floating2: '',
      floating3: ''
    });
    
    const [focused, setFocused] = React.useState({
      floating1: false,
      floating2: false,
      floating3: false
    });

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Flytende etiketter</h3>
          <div className="space-y-6">
            <div className="relative">
              <Input
                id="floating1"
                value={values.floating1}
                onChange={(e) => setValues(prev => ({ ...prev, floating1: e.target.value }))}
                onFocus={() => setFocused(prev => ({ ...prev, floating1: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, floating1: false }))}
                placeholder=" "
                className="pt-6"
              />
              <FloatingLabel
                htmlFor="floating1"
                focused={focused.floating1}
                hasValue={!!values.floating1}
                className="top-4"
              >
                Navn
              </FloatingLabel>
            </div>
            
            <div className="relative">
              <Input
                id="floating2"
                type="email"
                value={values.floating2}
                onChange={(e) => setValues(prev => ({ ...prev, floating2: e.target.value }))}
                onFocus={() => setFocused(prev => ({ ...prev, floating2: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, floating2: false }))}
                placeholder=" "
                className="pt-6"
              />
              <FloatingLabel
                htmlFor="floating2"
                focused={focused.floating2}
                hasValue={!!values.floating2}
                className="top-4"
                required
              >
                E-postadresse
              </FloatingLabel>
            </div>
            
            <div className="relative">
              <Input
                id="floating3"
                type="tel"
                value={values.floating3}
                onChange={(e) => setValues(prev => ({ ...prev, floating3: e.target.value }))}
                onFocus={() => setFocused(prev => ({ ...prev, floating3: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, floating3: false }))}
                placeholder=" "
                className="pt-6"
              />
              <FloatingLabel
                htmlFor="floating3"
                focused={focused.floating3}
                hasValue={!!values.floating3}
                className="top-4"
                optional
              >
                Telefonnummer
              </FloatingLabel>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Labels with Icons
export const LabelsWithIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Etiketter med ikoner</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <LabelWithIcon 
              htmlFor="icon-name" 
              icon={<UserIcon className="h-4 w-4" />}
              iconPosition="left"
            >
              Navn
            </LabelWithIcon>
            <Input id="icon-name" placeholder="Ditt navn" />
          </div>
          
          <div className="space-y-2">
            <LabelWithIcon 
              htmlFor="icon-email" 
              icon={<EnvelopeIcon className="h-4 w-4" />}
              iconPosition="left"
              required
            >
              E-postadresse
            </LabelWithIcon>
            <Input id="icon-email" type="email" placeholder="din@epost.no" />
          </div>
          
          <div className="space-y-2">
            <LabelWithIcon 
              htmlFor="icon-phone" 
              icon={<PhoneIcon className="h-4 w-4" />}
              iconPosition="left"
              optional
            >
              Telefonnummer
            </LabelWithIcon>
            <Input id="icon-phone" type="tel" placeholder="+47 XXX XX XXX" />
          </div>
          
          <div className="space-y-2">
            <LabelWithIcon 
              htmlFor="icon-right" 
              icon={<InformationCircleIcon className="h-4 w-4" />}
              iconPosition="right"
              tooltip="Dette feltet har ekstra informasjon"
            >
              Med høyre ikon
            </LabelWithIcon>
            <Input id="icon-right" placeholder="Felt med informasjonsikon" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Field Labels
export const FieldLabels: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Feltetiketter med feilhåndtering</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel 
              fieldId="field-normal"
              description="Normal feltbeskrivelase"
            >
              Normalt felt
            </FieldLabel>
            <Input id="field-normal" placeholder="Normal verdi" />
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              fieldId="field-error"
              error="Dette feltet inneholder en feil"
              required
            >
              Felt med feil
            </FieldLabel>
            <Input id="field-error" placeholder="Ugyldig verdi" />
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              fieldId="field-help"
              helpText="Utvidet hjelpetekst for dette feltet"
              description="Grunnleggende beskrivelse"
            >
              Felt med hjelpetekst
            </FieldLabel>
            <Input id="field-help" placeholder="Verdi med hjelp" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Label Variants for Convenience
export const ConvenienceVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Ferdigdefinerte etiketter</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <LabelRequired htmlFor="required-convenience">Påkrevd felt</LabelRequired>
            <Input id="required-convenience" placeholder="Dette feltet er påkrevd" />
          </div>
          
          <div className="space-y-2">
            <LabelOptional htmlFor="optional-convenience">Valgfritt felt</LabelOptional>
            <Input id="optional-convenience" placeholder="Dette feltet er valgfritt" />
          </div>
          
          <div className="space-y-2">
            <LabelError htmlFor="error-convenience">Felt med feil</LabelError>
            <Input id="error-convenience" placeholder="Dette feltet har en feil" />
          </div>
          
          <div className="space-y-2">
            <LabelSuccess htmlFor="success-convenience">Vellykket felt</LabelSuccess>
            <Input id="success-convenience" placeholder="Dette feltet er gyldig" />
          </div>
          
          <div className="space-y-2">
            <LabelMuted htmlFor="muted-convenience">Dempet felt</LabelMuted>
            <Input id="muted-convenience" placeholder="Dette feltet er mindre viktig" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Complex Form Example
export const ComplexFormExample: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Komplekst skjema med alle etikettyper</h3>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <LabelWithIcon 
                htmlFor="complex-first" 
                icon={<UserIcon className="h-4 w-4" />}
                required
              >
                Fornavn
              </LabelWithIcon>
              <Input id="complex-first" placeholder="Ditt fornavn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complex-last" required>Etternavn</Label>
              <Input id="complex-last" placeholder="Ditt etternavn" />
            </div>
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              fieldId="complex-email"
              required
              description="Primær e-postadresse for kommunikasjon"
            >
              E-postadresse
            </FieldLabel>
            <Input 
              id="complex-email" 
              type="email" 
              placeholder="din@epost.no"
              leadingIcon={<EnvelopeIcon className="h-5 w-5" />}
            />
          </div>
          
          <div className="space-y-2">
            <Label 
              htmlFor="complex-phone" 
              optional
              helpText="Norsk mobilnummer for SMS-varsler"
              tooltip="Vi sender kun viktige varsler via SMS"
            >
              Telefonnummer
            </Label>
            <Input 
              id="complex-phone" 
              norwegianFormat="phone"
              leadingIcon={<PhoneIcon className="h-5 w-5" />}
            />
          </div>
          
          <div className="space-y-2">
            <Label 
              htmlFor="complex-org"
              size="lg"
              weight="semibold"
              nsmClassification="RESTRICTED"
              helpText="Organisasjonsnummer fra Brønnøysundregistrene"
            >
              Organisasjonsnummer
            </Label>
            <Input 
              id="complex-org" 
              norwegianFormat="organizationNumber"
              placeholder="123 456 789"
            />
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              fieldId="complex-message"
              required
              description="Beskriv din henvendelse i detalj"
              helpText="Minimum 50 tegn påkrevd"
            >
              Melding
            </FieldLabel>
            <textarea 
              id="complex-message"
              rows={4}
              className="flex min-h-24 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
              placeholder="Skriv din melding her..."
            />
          </div>
          
          <LabelGroup orientation="vertical" spacing="tight">
            <Label variant="muted" size="sm">
              Alle felt merket med * er påkrevd
            </Label>
            <Label variant="muted" size="sm">
              Vi behandler dine data i henhold til personvernreglene
            </Label>
          </LabelGroup>
        </form>
      </div>
    </div>
  )
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold mb-3">Riktig etikettering</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessibility-explicit">
                  Eksplisitt koblet etikett
                </Label>
                <Input 
                  id="accessibility-explicit" 
                  placeholder="Bruker htmlFor og id"
                  aria-describedby="explicit-help"
                />
                <p id="explicit-help" className="text-sm text-muted-foreground">
                  Etiketten er eksplisitt koblet til feltet med htmlFor og id
                </p>
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="accessibility-required"
                  required
                  tooltip="Dette feltet må fylles ut"
                >
                  Påkrevd felt med tooltip
                </Label>
                <Input 
                  id="accessibility-required" 
                  placeholder="Påkrevd informasjon"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">ARIA-støtte</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="accessibility-described"
                  helpText="Denne hjelpeteksten leses opp av skjermlesere"
                >
                  Felt med ARIA-beskrivelse
                </Label>
                <Input 
                  id="accessibility-described" 
                  placeholder="Felt med utvidet beskrivelse"
                  aria-describedby="accessibility-described-help"
                />
              </div>
              
              <div className="space-y-2">
                <FieldLabel 
                  fieldId="accessibility-error"
                  error="Dette feltet inneholder en feil som kunngjøres til skjermlesere"
                  required
                >
                  Felt med feilmelding
                </FieldLabel>
                <Input 
                  id="accessibility-error" 
                  placeholder="Ugyldig verdi"
                  aria-invalid="true"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Visuell tilgjengelighet</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="accessibility-contrast"
                  size="lg"
                  weight="semibold"
                >
                  Høy kontrast og lesbarhet
                </Label>
                <Input 
                  id="accessibility-contrast" 
                  placeholder="Godt synlig tekst"
                />
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="accessibility-disabled"
                  disabled
                >
                  Deaktivert felt med riktig styling
                </Label>
                <Input 
                  id="accessibility-disabled" 
                  placeholder="Deaktivert felt"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Tilgjengelighetsfunksjoner:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Eksplisitt kobling mellom etiketter og felter (htmlFor/id)</li>
              <li>ARIA-attributter for utvidet beskrivelse</li>
              <li>Riktig annonsering av påkrevde felt</li>
              <li>Feilmeldinger kunngjøres til skjermlesere</li>
              <li>Tooltips og hjelpetekst med riktig semantikk</li>
              <li>Høy kontrast og lesbare skriftstørrelser</li>
              <li>Konsistent visuell hierarki</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    children: 'Interaktiv etikett',
    htmlFor: 'playground-input',
    size: 'md',
    variant: 'default',
    weight: 'medium',
    required: false,
    disabled: false,
    optional: false,
    helpText: 'Hjelpetekst for etiketten'
  },
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} />
      <Input id="playground-input" placeholder="Tilpass etiketten ovenfor" />
    </div>
  )
};