/**
 * Combobox Component Stories
 * Professional searchable select with accessibility and form integration
 * WCAG AAA compliant examples with Norwegian localization
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Combobox,
  type ComboboxProps,
  type ComboboxOption,
} from '../registry/components/combobox/combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Navigation/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional searchable combobox component with form integration, NSM classifications, keyboard navigation, and WCAG AAA compliance. Features professional touch targets (56px+ height).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'lg', 'xl', '2xl'],
      description: 'Size variant with professional touch targets'
    },
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: 'Visual state variant'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the combobox'
    },
    required: {
      control: 'boolean',
      description: 'Mark as required field'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Search input placeholder'
    },
    emptyMessage: {
      control: 'text',
      description: 'Message when no options match'
    }
  }
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const norwegianCities: readonly ComboboxOption[] = [
  { value: 'oslo', label: 'Oslo', description: 'Hovedstad og største by' },
  { value: 'bergen', label: 'Bergen', description: 'Vestlandets hovedstad' },
  { value: 'stavanger', label: 'Stavanger', description: 'Oljehovedstaden' },
  { value: 'trondheim', label: 'Trondheim', description: 'Teknologihovedstsad' },
  { value: 'kristiansand', label: 'Kristiansand', description: 'Sørlandets hovedstad' },
  { value: 'fredrikstad', label: 'Fredrikstad', description: 'Østfold fylke' },
  { value: 'drammen', label: 'Drammen', description: 'Buskerud fylke' },
  { value: 'skien', label: 'Skien', description: 'Telemark fylke' },
  { value: 'kristiansund', label: 'Kristiansund', description: 'Møre og Romsdal' },
  { value: 'aalesund', label: 'Ålesund', description: 'Møre og Romsdal' },
  { value: 'toensberg', label: 'Tønsberg', description: 'Vestfold fylke' },
  { value: 'sandefjord', label: 'Sandefjord', description: 'Vestfold fylke' }
];

const bankServices: readonly ComboboxOption[] = [
  { value: 'checking', label: 'Brukskonto', description: 'Daglig bankkonto for lønn og utgifter' },
  { value: 'savings', label: 'Sparekonto', description: 'Høyrentekonto for sparing' },
  { value: 'bsu', label: 'BSU', description: 'Boligsparing for ungdom' },
  { value: 'mortgage', label: 'Boliglån', description: 'Lån til boligkjøp' },
  { value: 'personal-loan', label: 'Forbrukslån', description: 'Personlig lån til større innkjøp' },
  { value: 'credit-card', label: 'Kredittkort', description: 'Revolving kredit' },
  { value: 'insurance', label: 'Forsikring', description: 'Ulike forsikringstyper' },
  { value: 'pension', label: 'Pensjonssparing', description: 'Individuell pensjonssparing (IPS)' }
];

const altinnServices: readonly ComboboxOption[] = [
  { value: 'tax-return', label: 'Skattemelding', description: 'Levere årlig skattemelding' },
  { value: 'vat-return', label: 'Merverdiavgift', description: 'MVA-melding for bedrifter' },
  { value: 'employer-register', label: 'A-melding', description: 'Arbeidsgivers melding til NAV og Skatteetaten' },
  { value: 'business-register', label: 'Næringsoppgave', description: 'Årsoppgave for næringsdrivende' },
  { value: 'customs', label: 'Toll og avgift', description: 'Deklarering av import/eksport' },
  { value: 'welfare', label: 'NAV tjenester', description: 'Søknad om trygd og stønad' },
  { value: 'health-register', label: 'Helseregistre', description: 'Meldinger til helseregistre' }
];

const programmingLanguages: readonly ComboboxOption[] = [
  { value: 'typescript', label: 'TypeScript', description: 'Typesikker JavaScript' },
  { value: 'javascript', label: 'JavaScript', description: 'Dynamisk programmeringsspråk' },
  { value: 'python', label: 'Python', description: 'Allsidig og lesbart språk' },
  { value: 'java', label: 'Java', description: 'Objektorientert enterprise språk' },
  { value: 'csharp', label: 'C#', description: 'Microsoft .NET språk' },
  { value: 'go', label: 'Go', description: 'Google utviklet språk' },
  { value: 'rust', label: 'Rust', description: 'Systemsprogrammering uten garbage collection' },
  { value: 'kotlin', label: 'Kotlin', description: 'Moderne JVM språk' },
  { value: 'swift', label: 'Swift', description: 'Apple iOS/macOS språk' },
  { value: 'dart', label: 'Dart', description: 'Flutter utviklingsspråk' }
];

// Basic Examples
export const Default: Story = {
  args: {
    options: norwegianCities.slice(0, 6),
    placeholder: 'Velg en by...',
    searchPlaceholder: 'Søk etter byer...',
    size: 'lg',
    searchable: true
  }
};

export const SimpleSelect: Story = {
  args: {
    options: [
      { value: 'morning', label: 'Morgen' },
      { value: 'afternoon', label: 'Ettermiddag' },
      { value: 'evening', label: 'Kveld' },
      { value: 'night', label: 'Natt' }
    ],
    placeholder: 'Velg tidspunkt...',
    searchable: false,
    size: 'lg'
  }
};

// Size Variants
export const Sizes: Story = {
  render: () => {
    const [valueMd, setValueMd] = React.useState('');
    const [valueLg, setValueLg] = React.useState('');
    const [valueXl, setValueXl] = React.useState('');
    const [value2xl, setValue2xl] = React.useState('');
    
    const options = norwegianCities.slice(0, 5);
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Medium (md) - 48px høyde</h3>
          <Combobox
            options={options}
            value={valueMd}
            onValueChange={setValueMd}
            placeholder="Velg by (medium)..."
            size="md"
            aria-label="Medium combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (lg) - 56px høyde (Standard)</h3>
          <Combobox
            options={options}
            value={valueLg}
            onValueChange={setValueLg}
            placeholder="Velg by (large)..."
            size="lg"
            aria-label="Large combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Extra Large (xl) - 64px høyde</h3>
          <Combobox
            options={options}
            value={valueXl}
            onValueChange={setValueXl}
            placeholder="Velg by (extra large)..."
            size="xl"
            aria-label="Extra large combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">2X Large (2xl) - 72px høyde</h3>
          <Combobox
            options={options}
            value={value2xl}
            onValueChange={setValue2xl}
            placeholder="Velg by (2x large)..."
            size="2xl"
            aria-label="2X large combobox"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// State Variants
export const StateVariants: Story = {
  render: () => {
    const [defaultValue, setDefaultValue] = React.useState('');
    const [errorValue, setErrorValue] = React.useState('');
    const [successValue, setSuccessValue] = React.useState('oslo');
    const [warningValue, setWarningValue] = React.useState('');
    
    const options = norwegianCities.slice(0, 5);
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Default</h3>
          <Combobox
            options={options}
            value={defaultValue}
            onValueChange={setDefaultValue}
            placeholder="Velg en by..."
            variant="default"
            size="lg"
            aria-label="Default state combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Error</h3>
          <Combobox
            options={options}
            value={errorValue}
            onValueChange={setErrorValue}
            placeholder="Påkrevd felt..."
            variant="error"
            error={true}
            helperText="Dette feltet må fylles ut"
            size="lg"
            aria-label="Error state combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Success</h3>
          <Combobox
            options={options}
            value={successValue}
            onValueChange={setSuccessValue}
            placeholder="Gyldig valg..."
            variant="success"
            success={true}
            helperText="Utmerket valg!"
            size="lg"
            aria-label="Success state combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Warning</h3>
          <Combobox
            options={options}
            value={warningValue}
            onValueChange={setWarningValue}
            placeholder="Vær oppmerksom..."
            variant="warning"
            warning={true}
            helperText="Dette valget kan ha konsekvenser"
            size="lg"
            aria-label="Warning state combobox"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// NSM Security Classifications
export const NSMClassifications: Story = {
  render: () => {
    const [openValue, setOpenValue] = React.useState('');
    const [restrictedValue, setRestrictedValue] = React.useState('');
    const [confidentialValue, setConfidentialValue] = React.useState('');
    const [secretValue, setSecretValue] = React.useState('');
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div>
          <h3 className="text-sm font-medium mb-4 text-green-700">ÅPEN (OPEN)</h3>
          <Combobox
            options={[
              { value: 'public-info', label: 'Offentlig informasjon' },
              { value: 'press-release', label: 'Pressemelding' },
              { value: 'general-docs', label: 'Generelle dokumenter' }
            ]}
            value={openValue}
            onValueChange={setOpenValue}
            placeholder="Velg åpen informasjon..."
            nsmClassification="OPEN"
            size="lg"
            helperText="Informasjon tilgjengelig for alle"
            aria-label="NSM Åpen klassifisering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-yellow-700">BEGRENSET (RESTRICTED)</h3>
          <Combobox
            options={[
              { value: 'internal-docs', label: 'Interne dokumenter' },
              { value: 'org-data', label: 'Organisasjonsdata' },
              { value: 'dept-info', label: 'Avdelingsinformasjon' }
            ]}
            value={restrictedValue}
            onValueChange={setRestrictedValue}
            placeholder="Velg begrenset informasjon..."
            nsmClassification="RESTRICTED"
            size="lg"
            helperText="Kun for autorisert personell"
            aria-label="NSM Begrenset klassifisering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-red-700">KONFIDENSIELL (CONFIDENTIAL)</h3>
          <Combobox
            options={[
              { value: 'personal-data', label: 'Personopplysninger' },
              { value: 'business-secrets', label: 'Forretningshemmeligheter' },
              { value: 'security-info', label: 'Sikkerhetsinformasjon' }
            ]}
            value={confidentialValue}
            onValueChange={setConfidentialValue}
            placeholder="Velg konfidensiell informasjon..."
            nsmClassification="CONFIDENTIAL"
            size="lg"
            helperText="Høyt sikkerhetsnivå påkrevd"
            aria-label="NSM Konfidensiell klassifisering"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-gray-800">HEMMELIG (SECRET)</h3>
          <Combobox
            options={[
              { value: 'classified-docs', label: 'Klassifiserte dokumenter' },
              { value: 'security-critical', label: 'Sikkerhetskritisk informasjon' },
              { value: 'admin-access', label: 'Administrativ tilgang' }
            ]}
            value={secretValue}
            onValueChange={setSecretValue}
            placeholder="Velg hemmelig informasjon..."
            nsmClassification="SECRET"
            size="lg"
            helperText="Maksimal sikkerhet påkrevd"
            aria-label="NSM Hemmelig klassifisering"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Large Dataset with Search
export const LargeDatasetWithSearch: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Søk i stort datasett</h4>
          <p className="text-sm text-muted-foreground">
            {programmingLanguages.length} programmeringsspråk tilgjengelig
          </p>
        </div>
        
        <Combobox
          options={programmingLanguages}
          value={value}
          onValueChange={setValue}
          placeholder="Søk etter programmeringsspråk..."
          searchPlaceholder="Skriv for å søke..."
          emptyMessage="Ingen språk funnet"
          size="lg"
          searchable={true}
          aria-label="Programmeringsspråk søk"
        />
        
        {value && (
          <div className="p-3 bg-primary/10 rounded border">
            <p className="text-sm">
              <strong>Valgt:</strong> {programmingLanguages.find(lang => lang.value === value)?.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {programmingLanguages.find(lang => lang.value === value)?.description}
            </p>
          </div>
        )}
      </div>
    );
  }
};

// Form Integration Example
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      city: '',
      service: '',
      priority: ''
    });
    
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newErrors: Record<string, string> = {};
      
      if (!formData.city) newErrors.city = 'By er påkrevd';
      if (!formData.service) newErrors.service = 'Tjeneste er påkrevd';
      if (!formData.priority) newErrors.priority = 'Prioritet er påkrevd';
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        alert(`Skjema sendt:\nBy: ${formData.city}\nTjeneste: ${formData.service}\nPrioritet: ${formData.priority}`);
      }
    };
    
    return (
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Tjenesteskjema</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-2">
                  Velg by *
                </label>
                <Combobox
                  id="city"
                  name="city"
                  options={norwegianCities.slice(0, 8)}
                  value={formData.city}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, city: value }));
                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                  }}
                  placeholder="Velg din by..."
                  required={true}
                  error={!!errors.city}
                  helperText={errors.city}
                  size="lg"
                  aria-label="Velg by"
                />
              </div>
              
              <div>
                <label htmlFor="service" className="block text-sm font-medium mb-2">
                  Velg tjeneste *
                </label>
                <Combobox
                  id="service"
                  name="service"
                  options={bankServices.slice(0, 6)}
                  value={formData.service}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, service: value }));
                    if (errors.service) setErrors(prev => ({ ...prev, service: '' }));
                  }}
                  placeholder="Velg ønsket tjeneste..."
                  required={true}
                  error={!!errors.service}
                  helperText={errors.service}
                  size="lg"
                  aria-label="Velg tjeneste"
                />
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-2">
                  Prioritet *
                </label>
                <Combobox
                  id="priority"
                  name="priority"
                  options={[
                    { value: 'low', label: 'Lav', description: 'Ikke haster' },
                    { value: 'medium', label: 'Medium', description: 'Normal behandlingstid' },
                    { value: 'high', label: 'Høy', description: 'Prioritert behandling' },
                    { value: 'urgent', label: 'Akutt', description: 'Øyeblikkelig behandling' }
                  ]}
                  value={formData.priority}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, priority: value }));
                    if (errors.priority) setErrors(prev => ({ ...prev, priority: '' }));
                  }}
                  placeholder="Velg prioritetsnivå..."
                  required={true}
                  error={!!errors.priority}
                  helperText={errors.priority}
                  searchable={false}
                  size="lg"
                  aria-label="Velg prioritet"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full mt-6 h-12 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              Send inn skjema
            </button>
          </div>
        </form>
      </div>
    );
  }
};

// Norwegian Enterprise Examples
export const NorwegianEnterpriseExamples: Story = {
  render: () => {
    const [altinnService, setAltinnService] = React.useState('');
    const [bankService, setBankService] = React.useState('');
    
    return (
      <div className="space-y-8 w-full max-w-4xl">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Altinn Tjenester</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            Velg hvilken offentlig tjeneste du ønsker å bruke
          </div>
          
          <Combobox
            options={altinnServices}
            value={altinnService}
            onValueChange={setAltinnService}
            placeholder="Søk etter Altinn tjenester..."
            searchPlaceholder="Skriv for å søke i tjenester..."
            nsmClassification="RESTRICTED"
            size="lg"
            helperText="Krever BankID innlogging"
            aria-label="Altinn tjenester"
          />
          
          {altinnService && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {altinnServices.find(s => s.value === altinnService)?.label}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {altinnServices.find(s => s.value === altinnService)?.description}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Banktjenester</h3>
          <div className="mb-4 text-sm text-muted-foreground">
            Velg hvilken banktjeneste du er interessert i
          </div>
          
          <Combobox
            options={bankServices}
            value={bankService}
            onValueChange={setBankService}
            placeholder="Søk etter banktjenester..."
            searchPlaceholder="Skriv for å søke i tjenester..."
            size="lg"
            helperText="Kontakt din rådgiver for mer informasjon"
            aria-label="Bank tjenester"
          />
          
          {bankService && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                {bankServices.find(s => s.value === bankService)?.label}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {bankServices.find(s => s.value === bankService)?.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded'
  }
};

// Disabled and Loading States
export const DisabledAndLoadingStates: Story = {
  render: () => {
    const [normalValue, setNormalValue] = React.useState('');
    const [disabledValue, setDisabledValue] = React.useState('oslo');
    const [loadingValue, setLoadingValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleLoadingChange = async (value: string) => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoadingValue(value);
      setIsLoading(false);
    };
    
    const options = norwegianCities.slice(0, 5);
    
    return (
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Normal tilstand</h3>
          <Combobox
            options={options}
            value={normalValue}
            onValueChange={setNormalValue}
            placeholder="Velg en by..."
            size="lg"
            aria-label="Normal combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Deaktivert</h3>
          <Combobox
            options={options}
            value={disabledValue}
            onValueChange={setDisabledValue}
            placeholder="Deaktivert..."
            disabled={true}
            size="lg"
            helperText="Dette feltet er låst"
            aria-label="Deaktivert combobox"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">
            Laster {isLoading && '(simulert API-kall)'}
          </h3>
          <Combobox
            options={options}
            value={loadingValue}
            onValueChange={handleLoadingChange}
            placeholder={isLoading ? 'Laster...' : 'Velg for å teste lasting...'}
            disabled={isLoading}
            size="lg"
            helperText={isLoading ? 'Vennligst vent...' : 'Valg utløser lasting'}
            aria-label="Laster combobox"
          />
        </div>
      </div>
    );
  }
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tastatursnarveier:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter / Space</kbd> - Åpne/lukke dropdown</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">↑ ↓</kbd> - Naviger gjennom alternativer</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd> - Velg alternativ</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Esc</kbd> - Lukk dropdown</li>
            <li><kbd className="px-2 py-1 bg-background rounded text-xs">Tab</kbd> - Forlat komponenten</li>
          </ul>
        </div>
        
        <Combobox
          options={norwegianCities.slice(0, 6)}
          value={value}
          onValueChange={setValue}
          placeholder="Test tastaturnavigasjon..."
          searchPlaceholder="Bruk piltastene for å navigere..."
          size="lg"
          aria-label="Tastaturnavigasjon demo"
        />
      </div>
    );
  }
};

// Accessibility Features Demo
export const AccessibilityFeatures: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    
    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ WCAG AAA kompatibel</li>
            <li>✅ Profesjonelle berøringsmål (56px+ høyde)</li>
            <li>✅ Skjermleser støtte med ARIA</li>
            <li>✅ Tastaturnavigasjon</li>
            <li>✅ Høy kontrast støtte</li>
            <li>✅ Fokushåndtering og -fangst</li>
            <li>✅ Semantisk HTML struktur</li>
            <li>✅ Beskrivende etiketter og roller</li>
          </ul>
        </div>
        
        <div>
          <label htmlFor="accessible-combobox" className="block text-sm font-medium mb-2">
            Tilgjengelig combobox med full støtte
          </label>
          <Combobox
            id="accessible-combobox"
            options={norwegianCities.slice(0, 6)}
            value={value}
            onValueChange={setValue}
            placeholder="Fullt tilgjengelig combobox..."
            searchPlaceholder="Søk med skjermleser støtte..."
            size="lg"
            helperText="Optimalisert for alle brukere"
            aria-label="Tilgjengelig combobox med full WCAG AAA støtte"
            aria-describedby="accessible-combobox-description"
          />
          <div id="accessible-combobox-description" className="sr-only">
            Denne comboboxen støtter tastaturnavigasjon, skjermlesere og høy kontrast modus
          </div>
        </div>
      </div>
    );
  }
};

// Interactive Playground
export const Playground: Story = {
  args: {
    options: norwegianCities,
    placeholder: 'Velg en by...',
    searchPlaceholder: 'Søk etter byer...',
    emptyMessage: 'Ingen byer funnet',
    size: 'lg',
    variant: 'default',
    searchable: true,
    disabled: false,
    required: false,
    helperText: 'Velg din nærmeste by'
  }
};