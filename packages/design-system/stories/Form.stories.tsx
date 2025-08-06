/**
 * Form Component Stories
 * Showcasing all layouts, variants, and validation states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  Form, 
  FormField, 
  FormLabel, 
  FormDescription, 
  FormMessage, 
  FormControl, 
  FormGroup, 
  FormSection,
  useNorwegianValidation 
} from '../registry/components/form/form';
import { Input } from '../registry/components/input/input';
import { Textarea } from '../registry/components/textarea/textarea';
import { Checkbox, CheckboxGroup } from '../registry/components/checkbox/checkbox';
import { RadioGroup, RadioGroupItem } from '../registry/components/radio-group/radio-group';
import { Switch } from '../registry/components/switch/switch';
import { Slider } from '../registry/components/slider/slider';

const meta: Meta<typeof Form> = {
  title: 'Form/Form',
  component: Form,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell skjemakomponent med norsk lokalisering, validering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal', 'inline', 'grid'],
      description: 'Layout of the form fields'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the form elements'
    },
    variant: {
      control: 'select',
      options: ['default', 'card', 'elevated'],
      description: 'Visual variant of the form'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire form'
    },
    norwegianValidation: {
      control: 'boolean',
      description: 'Enable Norwegian-specific validation patterns'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  render: () => (
    <Form className="max-w-md">
      <FormField>
        <FormLabel htmlFor="name">Navn</FormLabel>
        <FormControl>
          <Input id="name" placeholder="Ditt navn" />
        </FormControl>
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="email">E-postadresse</FormLabel>
        <FormControl>
          <Input id="email" type="email" placeholder="din@epost.no" />
        </FormControl>
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="message">Melding</FormLabel>
        <FormControl>
          <Textarea id="message" placeholder="Skriv din melding..." rows={3} />
        </FormControl>
      </FormField>
    </Form>
  )
};

export const WithValidation: Story = {
  render: () => {
    const [errors, setErrors] = React.useState({
      name: 'Dette feltet er påkrevd',
      email: ''
    });

    return (
      <Form className="max-w-md" errors={errors}>
        <FormField name="name">
          <FormLabel htmlFor="name-error" required>Navn</FormLabel>
          <FormControl>
            <Input id="name-error" placeholder="Ditt navn" />
          </FormControl>
        </FormField>
        
        <FormField name="email" success="Gyldig e-postadresse">
          <FormLabel htmlFor="email-success">E-postadresse</FormLabel>
          <FormControl>
            <Input id="email-success" type="email" defaultValue="test@example.com" />
          </FormControl>
        </FormField>
      </Form>
    );
  }
};

// Layout Variants
export const Layouts: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertikal layout (standard)</h3>
        <Form layout="vertical" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="vertical-name">Navn</FormLabel>
            <FormControl>
              <Input id="vertical-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel htmlFor="vertical-email">E-post</FormLabel>
            <FormControl>
              <Input id="vertical-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Horisontal layout</h3>
        <Form layout="horizontal" className="max-w-2xl">
          <FormField layout="horizontal">
            <FormLabel htmlFor="horizontal-name">Navn</FormLabel>
            <FormControl>
              <Input id="horizontal-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
          <FormField layout="horizontal">
            <FormLabel htmlFor="horizontal-email">E-post</FormLabel>
            <FormControl>
              <Input id="horizontal-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Inline layout</h3>
        <Form layout="inline">
          <FormField layout="inline">
            <FormLabel htmlFor="inline-search">Søk</FormLabel>
            <FormControl>
              <Input id="inline-search" placeholder="Søkeord..." />
            </FormControl>
          </FormField>
          <button className="h-12 px-4 bg-primary text-primary-foreground rounded-lg">
            Søk
          </button>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Grid layout</h3>
        <Form layout="grid" className="grid-cols-2 gap-4">
          <FormField>
            <FormLabel htmlFor="grid-first">Fornavn</FormLabel>
            <FormControl>
              <Input id="grid-first" placeholder="Fornavn" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel htmlFor="grid-last">Etternavn</FormLabel>
            <FormControl>
              <Input id="grid-last" placeholder="Etternavn" />
            </FormControl>
          </FormField>
          <FormField className="col-span-2">
            <FormLabel htmlFor="grid-email">E-postadresse</FormLabel>
            <FormControl>
              <Input id="grid-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
        </Form>
      </div>
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liten størrelse</h3>
        <Form size="sm" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="small-name">Navn</FormLabel>
            <FormControl>
              <Input id="small-name" placeholder="Ditt navn" />
            </FormControl>
            <FormDescription>Kompakt størrelse for tette oppsett</FormDescription>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medium størrelse (standard)</h3>
        <Form size="md" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="medium-name">Navn</FormLabel>
            <FormControl>
              <Input id="medium-name" placeholder="Ditt navn" />
            </FormControl>
            <FormDescription>Standard størrelse for de fleste bruksområder</FormDescription>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Stor størrelse</h3>
        <Form size="lg" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="large-name">Navn</FormLabel>
            <FormControl>
              <Input id="large-name" placeholder="Ditt navn" />
            </FormControl>
            <FormDescription>Større størrelse for bedre synlighet</FormDescription>
          </FormField>
        </Form>
      </div>
    </div>
  )
};

// Visual Variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Standard variant</h3>
        <Form variant="default" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="default-name">Navn</FormLabel>
            <FormControl>
              <Input id="default-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Kort variant</h3>
        <Form variant="card" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="card-name">Navn</FormLabel>
            <FormControl>
              <Input id="card-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel htmlFor="card-email">E-post</FormLabel>
            <FormControl>
              <Input id="card-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Hevet variant</h3>
        <Form variant="elevated" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="elevated-name">Navn</FormLabel>
            <FormControl>
              <Input id="elevated-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
          <FormField>
            <FormLabel htmlFor="elevated-email">E-post</FormLabel>
            <FormControl>
              <Input id="elevated-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
        </Form>
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
          <Form nsmClassification="OPEN" variant="card" className="max-w-md">
            <FormField>
              <FormLabel htmlFor="open-name">Åpen informasjon</FormLabel>
              <FormControl>
                <Input id="open-name" placeholder="Offentlig tilgjengelig data" />
              </FormControl>
              <FormDescription>
                Informasjon som kan deles offentlig
              </FormDescription>
            </FormField>
          </Form>

          <Form nsmClassification="RESTRICTED" variant="card" className="max-w-md">
            <FormField>
              <FormLabel htmlFor="restricted-name">Begrenset tilgang</FormLabel>
              <FormControl>
                <Input id="restricted-name" placeholder="Kun for autoriserte" />
              </FormControl>
              <FormDescription>
                Kun for autorisert personell
              </FormDescription>
            </FormField>
          </Form>

          <Form nsmClassification="CONFIDENTIAL" variant="card" className="max-w-md">
            <FormField>
              <FormLabel htmlFor="confidential-name">Konfidensiell</FormLabel>
              <FormControl>
                <Input id="confidential-name" placeholder="Høyt sikkerhetsnivå" />
              </FormControl>
              <FormDescription>
                Høyt sikkerhetsnivå påkrevd
              </FormDescription>
            </FormField>
          </Form>

          <Form nsmClassification="SECRET" variant="elevated" className="max-w-md">
            <FormField>
              <FormLabel htmlFor="secret-name">Hemmelig</FormLabel>
              <FormControl>
                <Input id="secret-name" placeholder="Strengt sikkerhetsnivå" />
              </FormControl>
              <FormDescription>
                Strengt sikkerhetsnivå
              </FormDescription>
            </FormField>
          </Form>
        </div>
      </div>
    </div>
  )
};

// Norwegian Validation
export const NorwegianValidation: Story = {
  render: () => {
    const validateNorwegian = useNorwegianValidation();
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleValidation = (field: string, value: string) => {
      let error = '';
      switch (field) {
        case 'phone':
          error = validateNorwegian('phone', value) || '';
          break;
        case 'postalCode':
          error = validateNorwegian('postalCode', value) || '';
          break;
        case 'organizationNumber':
          error = validateNorwegian('organizationNumber', value) || '';
          break;
        case 'nationalId':
          error = validateNorwegian('nationalId', value) || '';
          break;
      }
      setErrors(prev => ({ ...prev, [field]: error }));
    };

    return (
      <Form 
        norwegianValidation 
        errors={errors} 
        variant="card" 
        className="max-w-2xl"
      >
        <FormSection title="Norske valideringsmønstre" description="Automatisk validering for norske dataformater">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="phone">
              <FormLabel htmlFor="phone-validation">Telefonnummer</FormLabel>
              <FormControl>
                <Input 
                  id="phone-validation" 
                  norwegianFormat="phone"
                  onChange={(e) => handleValidation('phone', e.target.value)}
                />
              </FormControl>
            </FormField>
            
            <FormField name="postalCode">
              <FormLabel htmlFor="postal-validation">Postnummer</FormLabel>
              <FormControl>
                <Input 
                  id="postal-validation" 
                  norwegianFormat="postalCode"
                  onChange={(e) => handleValidation('postalCode', e.target.value)}
                />
              </FormControl>
            </FormField>
            
            <FormField name="organizationNumber">
              <FormLabel htmlFor="org-validation">Organisasjonsnummer</FormLabel>
              <FormControl>
                <Input 
                  id="org-validation" 
                  norwegianFormat="organizationNumber"
                  onChange={(e) => handleValidation('organizationNumber', e.target.value)}
                />
              </FormControl>
            </FormField>
            
            <FormField name="nationalId">
              <FormLabel htmlFor="national-validation">Fødselsnummer</FormLabel>
              <FormControl>
                <Input 
                  id="national-validation" 
                  norwegianFormat="nationalId"
                  onChange={(e) => handleValidation('nationalId', e.target.value)}
                />
              </FormControl>
            </FormField>
          </div>
        </FormSection>
      </Form>
    );
  }
};

// Form States
export const FormStates: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);

    return (
      <div className="space-y-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setLoading(!loading)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Veksle lasting: {loading ? 'På' : 'Av'}
          </button>
          <button
            onClick={() => setDisabled(!disabled)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
          >
            Veksle deaktivert: {disabled ? 'På' : 'Av'}
          </button>
        </div>

        <Form loading={loading} disabled={disabled} variant="card" className="max-w-md">
          <FormField>
            <FormLabel htmlFor="state-name">Navn</FormLabel>
            <FormControl>
              <Input id="state-name" placeholder="Ditt navn" />
            </FormControl>
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="state-email">E-postadresse</FormLabel>
            <FormControl>
              <Input id="state-email" type="email" placeholder="din@epost.no" />
            </FormControl>
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="state-message">Melding</FormLabel>
            <FormControl>
              <Textarea id="state-message" placeholder="Din melding..." rows={3} />
            </FormControl>
          </FormField>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || disabled}
              className="w-full h-12 px-4 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sender...' : 'Send melding'}
            </button>
          </div>
        </Form>
      </div>
    );
  }
};

// Complex Form Example
export const ComplexForm: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      personalInfo: { firstName: '', lastName: '', email: '', phone: '' },
      preferences: { newsletter: true, notifications: false },
      settings: { theme: 'light', language: 'nb' },
      privacy: { analytics: false, marketing: false }
    });

    return (
      <Form variant="elevated" className="max-w-4xl">
        <FormSection 
          title="Brukerprofil" 
          description="Opprett din nye brukerprofil med personlige innstillinger"
        >
          <FormGroup legend="Personlig informasjon" description="Grunnleggende informasjon om deg" required>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="complex-first" required>Fornavn</FormLabel>
                <FormControl>
                  <Input 
                    id="complex-first" 
                    placeholder="Fornavn"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                    }))}
                  />
                </FormControl>
              </FormField>
              
              <FormField>
                <FormLabel htmlFor="complex-last" required>Etternavn</FormLabel>
                <FormControl>
                  <Input 
                    id="complex-last" 
                    placeholder="Etternavn"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                    }))}
                  />
                </FormControl>
              </FormField>
            </div>
            
            <FormField>
              <FormLabel htmlFor="complex-email" required>E-postadresse</FormLabel>
              <FormControl>
                <Input 
                  id="complex-email" 
                  type="email" 
                  placeholder="din@epost.no"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                />
              </FormControl>
              <FormDescription>
                Vi sender bekreftelse til denne adressen
              </FormDescription>
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="complex-phone">Telefonnummer</FormLabel>
              <FormControl>
                <Input 
                  id="complex-phone" 
                  norwegianFormat="phone"
                  placeholder="+47 XXX XX XXX"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                />
              </FormControl>
              <FormDescription>
                Valgfritt - for viktige meldinger
              </FormDescription>
            </FormField>
          </FormGroup>
          
          <FormGroup legend="Kommunikasjonsinnstillinger" description="Hvordan vil du motta informasjon fra oss?">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <FormLabel htmlFor="complex-newsletter">Nyhetsbrev</FormLabel>
                  <FormDescription className="mt-1">
                    Motta månedlige oppdateringer og tips
                  </FormDescription>
                </div>
                <Switch 
                  id="complex-newsletter"
                  checked={formData.preferences.newsletter}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, newsletter: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <FormLabel htmlFor="complex-notifications">Push-varsler</FormLabel>
                  <FormDescription className="mt-1">
                    Umiddelbare varsler om viktige hendelser
                  </FormDescription>
                </div>
                <Switch 
                  id="complex-notifications"
                  checked={formData.preferences.notifications}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifications: checked }
                  }))}
                />
              </div>
            </div>
          </FormGroup>
          
          <FormGroup legend="Preferanser" description="Tilpass grensesnittet etter dine behov">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField>
                <FormLabel>Tema</FormLabel>
                <FormControl>
                  <RadioGroup 
                    value={formData.settings.theme}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, theme: value }
                    }))}
                  >
                    <RadioGroupItem value="light">Lyst tema</RadioGroupItem>
                    <RadioGroupItem value="dark">Mørkt tema</RadioGroupItem>
                    <RadioGroupItem value="auto">Automatisk</RadioGroupItem>
                  </RadioGroup>
                </FormControl>
              </FormField>
              
              <FormField>
                <FormLabel>Språk</FormLabel>
                <FormControl>
                  <RadioGroup 
                    value={formData.settings.language}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, language: value }
                    }))}
                  >
                    <RadioGroupItem value="nb">Norsk bokmål</RadioGroupItem>
                    <RadioGroupItem value="nn">Norsk nynorsk</RadioGroupItem>
                    <RadioGroupItem value="en">English</RadioGroupItem>
                  </RadioGroup>
                </FormControl>
              </FormField>
            </div>
          </FormGroup>
          
          <FormGroup legend="Personvern" description="Kontroller hvordan dataene dine brukes">
            <CheckboxGroup label="Databrukssamtykke" description="Du kan endre disse innstillingene når som helst">
              <Checkbox 
                value="analytics"
                label="Analysedata"
                description="Hjelp oss forbedre tjenesten med anonymiserte bruksdata"
                checked={formData.privacy.analytics}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, analytics: checked as boolean }
                }))}
              />
              <Checkbox 
                value="marketing"
                label="Markedsføring"
                description="Motta tilpassede annonser og tilbud"
                checked={formData.privacy.marketing}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, marketing: checked as boolean }
                }))}
              />
            </CheckboxGroup>
          </FormGroup>
          
          <div className="pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit"
                className="h-12 px-6 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Opprett profil
              </button>
              <button 
                type="button"
                className="h-12 px-6 bg-secondary text-secondary-foreground rounded-lg font-medium"
              >
                Avbryt
              </button>
            </div>
          </div>
        </FormSection>
      </Form>
    );
  }
};

// All Form Controls
export const AllFormControls: Story = {
  render: () => (
    <Form variant="card" className="max-w-4xl">
      <FormSection title="Alle skjemakontroller" description="Oversikt over alle tilgjengelige skjemaelementer">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-base font-semibold">Tekstinndata</h4>
            
            <FormField>
              <FormLabel htmlFor="all-input">Tekstfelt</FormLabel>
              <FormControl>
                <Input id="all-input" placeholder="Skriv inn tekst" />
              </FormControl>
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="all-textarea">Tekstområde</FormLabel>
              <FormControl>
                <Textarea id="all-textarea" placeholder="Flerlinjet tekst..." rows={3} />
              </FormControl>
            </FormField>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-semibold">Valg</h4>
            
            <FormField>
              <FormLabel>Avkrysningsbokser</FormLabel>
              <CheckboxGroup>
                <Checkbox value="option1" label="Alternativ 1" />
                <Checkbox value="option2" label="Alternativ 2" />
              </CheckboxGroup>
            </FormField>
            
            <FormField>
              <FormLabel>Radioknapper</FormLabel>
              <RadioGroup defaultValue="radio1">
                <RadioGroupItem value="radio1">Radio 1</RadioGroupItem>
                <RadioGroupItem value="radio2">Radio 2</RadioGroupItem>
              </RadioGroup>
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="all-switch">Bryter</FormLabel>
              <div className="flex items-center space-x-3">
                <Switch id="all-switch" />
                <span>Aktiver funksjon</span>
              </div>
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="all-slider">Skyvebryter</FormLabel>
              <FormControl>
                <Slider id="all-slider" defaultValue={[50]} showValue />
              </FormControl>
            </FormField>
          </div>
        </div>
      </FormSection>
    </Form>
  )
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <Form variant="card" className="max-w-2xl">
      <FormSection 
        title="Tilgjengelighetsfunksjoner" 
        description="Demonstrasjon av WCAG AAA-kompatible skjemafunksjoner"
      >
        <div className="space-y-6">
          <FormField>
            <FormLabel htmlFor="accessible-name" required>
              Navn med riktig etikettering
            </FormLabel>
            <FormControl>
              <Input 
                id="accessible-name" 
                placeholder="Ditt navn"
                aria-describedby="name-help"
                required
              />
            </FormControl>
            <FormDescription id="name-help">
              Dette feltet er påkrevd og har korrekt ARIA-beskrivelse
            </FormDescription>
          </FormField>
          
          <FormField error="E-postadressen må være gyldig">
            <FormLabel htmlFor="accessible-email">E-postadresse med feil</FormLabel>
            <FormControl>
              <Input 
                id="accessible-email" 
                type="email" 
                defaultValue="ugyldig-epost"
                aria-invalid="true"
              />
            </FormControl>
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="accessible-phone">Telefonnummer med hjelpetekst</FormLabel>
            <FormControl>
              <Input 
                id="accessible-phone" 
                norwegianFormat="phone"
                aria-describedby="phone-help"
              />
            </FormControl>
            <FormDescription id="phone-help">
              Format: +47 XXX XX XXX (8 siffer etter landkode)
            </FormDescription>
          </FormField>
          
          <FormGroup 
            legend="Tilgjengelig radiogruppe" 
            description="Gruppe med riktig rolle og beskrivelse"
          >
            <RadioGroup aria-describedby="radio-help">
              <RadioGroupItem value="option1">
                Alternativ med god kontrast
              </RadioGroupItem>
              <RadioGroupItem value="option2">
                Alternativ med tastaturnavigasjon
              </RadioGroupItem>
              <RadioGroupItem value="option3">
                Alternativ med skjermleser-støtte
              </RadioGroupItem>
            </RadioGroup>
            <FormDescription id="radio-help">
              Bruk piltaster for å navigere, mellomrom for å velge
            </FormDescription>
          </FormGroup>
          
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Tilgjengelighetsfunksjoner:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Riktige ARIA-roller og egenskaper</li>
              <li>Beskrivende etiketter og hjelpetekst</li>
              <li>Feilmeldinger kunngjøres til skjermlesere</li>
              <li>Tastaturnavigasjon for alle kontroller</li>
              <li>Høy kontrast og lesbare skriftstørrelser</li>
              <li>Semantisk HTML-struktur</li>
            </ul>
          </div>
        </div>
      </FormSection>
    </Form>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    layout: 'vertical',
    size: 'md',
    variant: 'default',
    loading: false,
    disabled: false,
    norwegianValidation: false
  },
  render: (args) => (
    <Form {...args} className="max-w-md">
      <FormField>
        <FormLabel htmlFor="playground-name" required>Navn</FormLabel>
        <FormControl>
          <Input id="playground-name" placeholder="Ditt navn" />
        </FormControl>
        <FormDescription>Interaktivt skjema for testing av egenskaper</FormDescription>
      </FormField>
      
      <FormField>
        <FormLabel htmlFor="playground-email">E-postadresse</FormLabel>
        <FormControl>
          <Input id="playground-email" type="email" placeholder="din@epost.no" />
        </FormControl>
      </FormField>
    </Form>
  )
};