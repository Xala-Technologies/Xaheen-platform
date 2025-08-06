/**
 * Textarea Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Textarea } from '../registry/components/textarea/textarea';
import { Label } from '../registry/components/label/label';

const meta: Meta<typeof Textarea> = {
  title: 'Form/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonelt tekstområde for flerlinjet tekst med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: 'Visual variant of the textarea'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the textarea (professional minimum heights)'
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'Resize behavior of the textarea'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable textarea'
    },
    characterCount: {
      control: 'boolean',
      description: 'Show character count'
    },
    autoResize: {
      control: 'boolean',
      description: 'Auto-resize based on content'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    placeholder: 'Skriv inn din tekst her...'
  }
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="comment-textarea">Kommentar</Label>
      <Textarea 
        id="comment-textarea"
        placeholder="Skriv din kommentar her..."
        rows={4}
      />
    </div>
  )
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="message-textarea" required>Melding</Label>
      <Textarea 
        id="message-textarea"
        placeholder="Skriv din melding..."
        required
        helperText="Dette feltet er påkrevd"
        rows={3}
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
            <Label>Small - min-h-20 (80px)</Label>
            <Textarea size="sm" placeholder="Liten størrelse" />
          </div>
          <div className="space-y-2">
            <Label>Medium - min-h-24 (96px) - Standard</Label>
            <Textarea size="md" placeholder="Medium størrelse - anbefalt" />
          </div>
          <div className="space-y-2">
            <Label>Large - min-h-32 (128px)</Label>
            <Textarea size="lg" placeholder="Stor størrelse" />
          </div>
          <div className="space-y-2">
            <Label>Extra Large - min-h-40 (160px)</Label>
            <Textarea size="xl" placeholder="Ekstra stor størrelse" />
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
          <Textarea placeholder="Normal tekstområde" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Feil tilstand</Label>
          <Textarea 
            error 
            placeholder="Ugyldig tekst"
            helperText="Dette feltet inneholder feil"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Suksess tilstand</Label>
          <Textarea 
            success 
            placeholder="Gyldig tekst"
            helperText="Teksten er gyldig"
            defaultValue="Dette er gyldig tekst som har blitt validert."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Advarsel tilstand</Label>
          <Textarea 
            warning 
            placeholder="Tekst med advarsel"
            helperText="Dette feltet bør fylles ut mer detaljert"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Deaktivert</Label>
          <Textarea 
            disabled 
            placeholder="Deaktivert tekstområde"
            defaultValue="Dette tekstområdet kan ikke redigeres"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
};

// Resize Options
export const ResizeOptions: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Ingen endring av størrelse</Label>
          <Textarea 
            resize="none" 
            placeholder="Kan ikke endre størrelse"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Vertikal endring (standard)</Label>
          <Textarea 
            resize="vertical" 
            placeholder="Kan endres vertikalt"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Horisontal endring</Label>
          <Textarea 
            resize="horizontal" 
            placeholder="Kan endres horisontalt"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Begge retninger</Label>
          <Textarea 
            resize="both" 
            placeholder="Kan endres i begge retninger"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
};

// Character Count
export const CharacterCount: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Med tegntelling</Label>
          <Textarea 
            characterCount 
            placeholder="Skriv noe tekst..."
            rows={3}
            helperText="Tegntelling vises nederst til høyre"
          />
        </div>
        <div className="space-y-2">
          <Label>Med maksimum antall tegn</Label>
          <Textarea 
            characterCount 
            maxLength={200}
            placeholder="Maksimum 200 tegn"
            rows={4}
            helperText="Fargene endres når grensen nås"
          />
        </div>
        <div className="space-y-2">
          <Label>Med minimum antall tegn</Label>
          <Textarea 
            characterCount 
            minLength={50}
            placeholder="Minimum 50 tegn påkrevd"
            rows={4}
            helperText="Advarsel vises hvis under minimum"
          />
        </div>
        <div className="space-y-2">
          <Label>Med både min og maks</Label>
          <Textarea 
            characterCount 
            minLength={10}
            maxLength={100}
            placeholder="Mellom 10 og 100 tegn"
            rows={3}
            helperText="Både minimum og maksimum validering"
          />
        </div>
      </div>
    </div>
  )
};

// Auto Resize
export const AutoResize: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Auto-størrelse</Label>
          <Textarea 
            autoResize 
            placeholder="Dette tekstområdet vokser automatisk når du skriver mer tekst. Prøv å skrive flere linjer for å se effekten."
            helperText="Høyden justeres automatisk basert på innhold"
          />
        </div>
        <div className="space-y-2">
          <Label>Auto-størrelse med tegntelling</Label>
          <Textarea 
            autoResize 
            characterCount 
            maxLength={300}
            placeholder="Kombinert med tegntelling og maksimum lengde..."
            helperText="Auto-høyde med alle funksjoner aktivert"
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
          <div className="space-y-2">
            <Label>Åpen informasjon</Label>
            <Textarea 
              nsmClassification="OPEN"
              placeholder="Åpen informasjon som kan deles offentlig..."
              helperText="Kan deles offentlig"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Begrenset tilgang</Label>
            <Textarea 
              nsmClassification="RESTRICTED"
              placeholder="Begrenset informasjon kun for autoriserte..."
              helperText="Kun for autorisert personell"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Konfidensiell</Label>
            <Textarea 
              nsmClassification="CONFIDENTIAL"
              placeholder="Konfidensiell informasjon med høyt sikkerhetsnivå..."
              helperText="Høyt sikkerhetsnivå påkrevd"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Hemmelig</Label>
            <Textarea 
              nsmClassification="SECRET"
              placeholder="Hemmelig informasjon med strengt sikkerhetsnivå..."
              helperText="Strengt sikkerhetsnivå"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

// Different Use Cases
export const UseCases: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ulike bruksområder</h3>
        
        {/* Feedback Form */}
        <div className="space-y-2">
          <Label htmlFor="feedback" required>Tilbakemelding</Label>
          <Textarea 
            id="feedback"
            placeholder="Del dine tanker om produktet eller tjenesten..."
            characterCount
            maxLength={500}
            rows={4}
            helperText="Hjelp oss å forbedre ved å dele din opplevelse"
          />
        </div>
        
        {/* Bug Report */}
        <div className="space-y-2">
          <Label htmlFor="bug-report">Feilrapport</Label>
          <Textarea 
            id="bug-report"
            placeholder="Beskriv feilen du opplevde i detalj..."
            characterCount
            minLength={50}
            rows={5}
            helperText="Jo mer detaljert, jo lettere er det å løse problemet"
          />
        </div>
        
        {/* Meeting Notes */}
        <div className="space-y-2">
          <Label htmlFor="meeting-notes">Møtenotater</Label>
          <Textarea 
            id="meeting-notes"
            autoResize
            placeholder="Notater fra møtet..."
            helperText="Tekstområdet tilpasses automatisk innholdet"
          />
        </div>
        
        {/* Terms and Conditions */}
        <div className="space-y-2">
          <Label htmlFor="terms">Vilkår og betingelser</Label>
          <Textarea 
            id="terms"
            disabled
            resize="none"
            rows={6}
            defaultValue="1. Vilkår for bruk av tjenesten...
2. Personvern og databehandling...
3. Ansvar og begrensninger...
4. Endringer i vilkårene...
5. Kontaktinformasjon og support..."
            helperText="Skrivebeskyttede vilkår"
          />
        </div>
      </div>
    </div>
  )
};

// Form Integration
export const FormIntegration: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integrert kontaktskjema</h3>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name" required>Navn</Label>
              <input 
                id="contact-name"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                placeholder="Ditt navn"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email" required>E-post</Label>
              <input 
                id="contact-email"
                type="email"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                placeholder="din@epost.no"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Emne</Label>
            <input 
              id="contact-subject"
              className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
              placeholder="Hva gjelder henvendelsen?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-message" required>Melding</Label>
            <Textarea 
              id="contact-message"
              placeholder="Skriv din melding her..."
              characterCount
              maxLength={1000}
              minLength={20}
              rows={5}
              helperText="Beskriv din henvendelse så detaljert som mulig"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-additional">Tilleggsinformasjon</Label>
            <Textarea 
              id="contact-additional"
              placeholder="Eventuell tilleggsinformasjon..."
              rows={3}
              helperText="Valgfritt - annen relevant informasjon"
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
            <Label htmlFor="aria-textarea">Med ARIA-beskrivelse</Label>
            <Textarea 
              id="aria-textarea"
              placeholder="Tekstområde med utvidet ARIA-støtte"
              helperText="Dette tekstområdet har full ARIA-støtte for skjermlesere"
              rows={3}
              aria-describedby="aria-textarea-help"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="required-textarea" required>Påkrevd tekstområde</Label>
            <Textarea 
              id="required-textarea"
              placeholder="Dette feltet må fylles ut"
              required
              aria-required="true"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invalid-textarea">Ugyldig innhold</Label>
            <Textarea 
              id="invalid-textarea"
              defaultValue="For kort tekst"
              error
              helperText="Teksten er for kort, må være minst 50 tegn"
              aria-invalid="true"
              characterCount
              minLength={50}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="focus-textarea">Fokusindikator</Label>
            <Textarea 
              id="focus-textarea"
              placeholder="Klikk for å se fokusring"
              helperText="Synlig fokusring for tastaturnavigasjon"
              rows={3}
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
    placeholder: 'Interaktivt tekstområde...',
    size: 'md',
    rows: 4,
    characterCount: true,
    maxLength: 500,
    helperText: 'Hjelpetekst for tekstområdet'
  }
};