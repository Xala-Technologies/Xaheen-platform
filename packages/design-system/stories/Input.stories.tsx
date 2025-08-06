/**
 * Input Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from '../registry/components/input/input';
import { Label } from '../registry/components/label/label';
import { MagnifyingGlassIcon, EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Input> = {
  title: 'Form/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell tekstinndata-komponent med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: 'Visual variant of the input'
    },
    size: {
      control: 'select', 
      options: ['md', 'lg', 'xl', '2xl'],
      description: 'Size of the input (professional sizing only)'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make input full width'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    },
    norwegianFormat: {
      control: 'select',
      options: [undefined, 'phone', 'postalCode', 'organizationNumber', 'nationalId'],
      description: 'Norwegian-specific input formatting'
    }
  }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    placeholder: 'Skriv inn tekst...'
  }
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name-input">Navn</Label>
      <Input 
        id="name-input"
        placeholder="Skriv inn ditt navn"
      />
    </div>
  )
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email-input" required>E-postadresse</Label>
      <Input 
        id="email-input"
        type="email"
        placeholder="din@epost.no"
        required
      />
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Størrelser (Profesjonell minimum høyde)</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Medium - h-12 (48px)</Label>
            <Input size="md" placeholder="Medium størrelse" />
          </div>
          <div className="space-y-2">
            <Label>Large - h-14 (56px) - Standard</Label>
            <Input size="lg" placeholder="Large størrelse - anbefalt" />
          </div>
          <div className="space-y-2">
            <Label>Extra Large - h-16 (64px)</Label>
            <Input size="xl" placeholder="Extra large størrelse" />
          </div>
          <div className="space-y-2">
            <Label>2X Large - h-18 (72px)</Label>
            <Input size="2xl" placeholder="2X large størrelse" />
          </div>
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
        <div className="space-y-2">
          <Label>Normal tilstand</Label>
          <Input placeholder="Normal inndata" />
        </div>
        <div className="space-y-2">
          <Label>Feil tilstand</Label>
          <Input 
            error 
            placeholder="Ugyldig inndata"
            helperText="Dette feltet er påkrevd"
          />
        </div>
        <div className="space-y-2">
          <Label>Suksess tilstand</Label>
          <Input 
            success 
            placeholder="Gyldig inndata"
            helperText="Inndata er gyldig"
            defaultValue="valid@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Advarsel tilstand</Label>
          <Input 
            warning 
            placeholder="Inndata med advarsel"
            helperText="Dette feltet bør fylles ut"
          />
        </div>
        <div className="space-y-2">
          <Label>Deaktivert</Label>
          <Input 
            disabled 
            placeholder="Deaktivert inndata"
            defaultValue="Kan ikke redigeres"
          />
        </div>
      </div>
    </div>
  )
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Med ledende ikon</Label>
          <Input 
            placeholder="Søk..."
            leadingIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
        </div>
        <div className="space-y-2">
          <Label>Med etterfølgende ikon</Label>
          <Input 
            type="password"
            placeholder="Passord"
            trailingIcon={<EyeSlashIcon className="h-5 w-5" />}
          />
        </div>
        <div className="space-y-2">
          <Label>Med brukerikon</Label>
          <Input 
            placeholder="Brukernavn"
            leadingIcon={<UserIcon className="h-5 w-5" />}
          />
        </div>
        <div className="space-y-2">
          <Label>E-post med ikon</Label>
          <Input 
            type="email"
            placeholder="din@epost.no"
            leadingIcon={<EnvelopeIcon className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  )
};

// Norwegian Formatting
export const NorwegianFormatting: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Norsk formatering</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-input">Telefonnummer</Label>
            <Input 
              id="phone-input"
              norwegianFormat="phone"
              leadingIcon={<PhoneIcon className="h-5 w-5" />}
              helperText="Format: +47 XXX XX XXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal-input">Postnummer</Label>
            <Input 
              id="postal-input"
              norwegianFormat="postalCode"
              helperText="4 siffer, f.eks. 0150"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-input">Organisasjonsnummer</Label>
            <Input 
              id="org-input"
              norwegianFormat="organizationNumber"
              leadingIcon={<BuildingOfficeIcon className="h-5 w-5" />}
              helperText="9 siffer, f.eks. 123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="national-input">Fødselsnummer</Label>
            <Input 
              id="national-input"
              norwegianFormat="nationalId"
              helperText="11 siffer, format: DDMMYYXXXXX"
            />
          </div>
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
            <Label>Åpen informasjon</Label>
            <Input 
              nsmClassification="OPEN"
              placeholder="Åpen informasjon"
              helperText="Kan deles offentlig"
            />
          </div>
          <div className="space-y-2">
            <Label>Begrenset tilgang</Label>
            <Input 
              nsmClassification="RESTRICTED"
              placeholder="Begrenset informasjon"
              helperText="Kun for autorisert personell"
            />
          </div>
          <div className="space-y-2">
            <Label>Konfidensiell</Label>
            <Input 
              nsmClassification="CONFIDENTIAL"
              placeholder="Konfidensiell informasjon"
              helperText="Høyt sikkerhetsnivå påkrevd"
            />
          </div>
          <div className="space-y-2">
            <Label>Hemmelig</Label>
            <Input 
              nsmClassification="SECRET"
              placeholder="Hemmelig informasjon"
              helperText="Strengt sikkerhetsnivå"
            />
          </div>
        </div>
      </div>
    </div>
  )
};

// Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Inndata-typer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tekst</Label>
            <Input type="text" placeholder="Vanlig tekst" />
          </div>
          <div className="space-y-2">
            <Label>E-post</Label>
            <Input type="email" placeholder="din@epost.no" />
          </div>
          <div className="space-y-2">
            <Label>Passord</Label>
            <Input type="password" placeholder="Passord" />
          </div>
          <div className="space-y-2">
            <Label>Nummer</Label>
            <Input type="number" placeholder="123" />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input type="tel" placeholder="+47 123 45 678" />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input type="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label>Søk</Label>
            <Input 
              type="search" 
              placeholder="Søk..."
              leadingIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="space-y-2">
            <Label>Dato</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Tid</Label>
            <Input type="time" />
          </div>
          <div className="space-y-2">
            <Label>Dato og tid</Label>
            <Input type="datetime-local" />
          </div>
        </div>
      </div>
    </div>
  )
};

// Complex Forms
export const ComplexForm: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Komplett skjema</h3>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name" required>Fornavn</Label>
              <Input 
                id="first-name"
                placeholder="Ola"
                leadingIcon={<UserIcon className="h-5 w-5" />}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name" required>Etternavn</Label>
              <Input 
                id="last-name"
                placeholder="Nordmann"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" required>E-postadresse</Label>
            <Input 
              id="email"
              type="email"
              placeholder="ola.nordmann@example.com"
              leadingIcon={<EnvelopeIcon className="h-5 w-5" />}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input 
              id="phone"
              norwegianFormat="phone"
              leadingIcon={<PhoneIcon className="h-5 w-5" />}
              helperText="Valgfritt - norsk format"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal">Postnummer</Label>
              <Input 
                id="postal"
                norwegianFormat="postalCode"
                placeholder="0150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Poststed</Label>
              <Input 
                id="city"
                placeholder="Oslo"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Bedrift</Label>
            <Input 
              id="company"
              placeholder="Bedriftsnavn AS"
              leadingIcon={<BuildingOfficeIcon className="h-5 w-5" />}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org-number">Organisasjonsnummer</Label>
            <Input 
              id="org-number"
              norwegianFormat="organizationNumber"
              helperText="9 siffer for norske bedrifter"
            />
          </div>
        </form>
      </div>
    </div>
  )
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aria-input">Med ARIA-beskrivelse</Label>
            <Input 
              id="aria-input"
              placeholder="Inndata med hjelpetekst"
              helperText="Dette feltet har utvidet hjelpetekst for skjermlesere"
              aria-describedby="aria-input-help"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="required-input" required>Påkrevd felt</Label>
            <Input 
              id="required-input"
              placeholder="Dette feltet må fylles ut"
              required
              aria-required="true"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invalid-input">Ugyldig inndata</Label>
            <Input 
              id="invalid-input"
              placeholder="test@"
              error
              helperText="E-postadressen er ugyldig"
              aria-invalid="true"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="focus-input">Fokusindikator</Label>
            <Input 
              id="focus-input"
              placeholder="Klikk for å se fokusring"
              helperText="Synlig fokusring for tastaturnavigasjon"
            />
          </div>
        </div>
      </div>
    </div>
  )
};

// Interactive Playground
export const Playground: Story = {
  args: {
    placeholder: 'Interaktiv inndata...',
    size: 'lg',
    fullWidth: true,
    disabled: false,
    helperText: 'Hjelpetekst for inndata'
  }
};