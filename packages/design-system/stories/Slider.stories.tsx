/**
 * Slider Component Stories
 * Showcasing all variants, sizes, and states with Norwegian localization
 * WCAG AAA compliant examples with accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Slider } from '../registry/components/slider/slider';
import { Label } from '../registry/components/label/label';

const meta: Meta<typeof Slider> = {
  title: 'Form/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Profesjonell skyvebryter for verdiområde-valg med norsk lokalisering, WCAG AAA-kompatibilitet og NSM-klassifisering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the slider (professional minimum heights)'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the slider'
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
      description: 'Visual variant of the slider'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the slider'
    },
    showValue: {
      control: 'boolean',
      description: 'Show current value and range'
    },
    min: {
      control: 'number',
      description: 'Minimum value'
    },
    max: {
      control: 'number',
      description: 'Maximum value'
    },
    step: {
      control: 'number',
      description: 'Step increment'
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification'
    }
  }
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100
  }
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4">
      <Label>Velg volum</Label>
      <Slider defaultValue={[70]} min={0} max={100} />
    </div>
  )
};

export const WithValue: Story = {
  render: () => (
    <div className="space-y-4">
      <Label>Temperatur</Label>
      <Slider 
        defaultValue={[22]} 
        min={10} 
        max={35} 
        showValue
        formatValue={(value) => `${value}°C`}
      />
    </div>
  )
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-4">
      <Label>Kvalitetsinnstilling</Label>
      <Slider 
        defaultValue={[75]} 
        min={0} 
        max={100} 
        showValue
        helperText="Høyere verdi gir bedre kvalitet, men større filstørrelse"
      />
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
          <div className="space-y-2">
            <Label>Liten størrelse - h-10 (40px)</Label>
            <Slider size="sm" defaultValue={[30]} showValue />
          </div>
          <div className="space-y-2">
            <Label>Medium størrelse - h-12 (48px) - Standard</Label>
            <Slider size="md" defaultValue={[50]} showValue />
          </div>
          <div className="space-y-2">
            <Label>Stor størrelse - h-14 (56px)</Label>
            <Slider size="lg" defaultValue={[70]} showValue />
          </div>
          <div className="space-y-2">
            <Label>Ekstra stor størrelse - h-16 (64px)</Label>
            <Slider size="xl" defaultValue={[90]} showValue />
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
        <h3 className="text-sm font-medium mb-4">Horisontal orientering (standard)</h3>
        <div className="space-y-2">
          <Label>Lydstyrke</Label>
          <Slider 
            orientation="horizontal" 
            defaultValue={[65]} 
            showValue
            formatValue={(value) => `${value}%`}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Vertikal orientering</h3>
        <div className="flex items-center space-x-6">
          <div className="space-y-2">
            <Label>Bass</Label>
            <div className="h-40">
              <Slider 
                orientation="vertical" 
                defaultValue={[40]} 
                showValue
                className="h-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mellomtone</Label>
            <div className="h-40">
              <Slider 
                orientation="vertical" 
                defaultValue={[60]} 
                showValue
                className="h-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Diskant</Label>
            <div className="h-40">
              <Slider 
                orientation="vertical" 
                defaultValue={[80]} 
                showValue
                className="h-full"
              />
            </div>
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
          <Slider defaultValue={[50]} showValue />
        </div>
        <div className="space-y-2">
          <Label>Deaktivert tilstand</Label>
          <Slider 
            defaultValue={[30]} 
            disabled 
            showValue
            helperText="Denne funksjonen er ikke tilgjengelig"
          />
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
            <Label>Standard variant</Label>
            <Slider 
              variant="default" 
              defaultValue={[50]} 
              showValue
              helperText="Standard blå farge"
            />
          </div>
          <div className="space-y-2">
            <Label>Suksess variant</Label>
            <Slider 
              variant="success" 
              defaultValue={[80]} 
              showValue
              helperText="Grønn farge for positive verdier"
            />
          </div>
          <div className="space-y-2">
            <Label>Advarsel variant</Label>
            <Slider 
              variant="warning" 
              defaultValue={[75]} 
              showValue
              helperText="Gul farge for advarsler"
            />
          </div>
          <div className="space-y-2">
            <Label>Destruktiv variant</Label>
            <Slider 
              variant="destructive" 
              defaultValue={[90]} 
              showValue
              helperText="Rød farge for kritiske verdier"
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
            <Slider 
              nsmClassification="OPEN"
              defaultValue={[60]} 
              showValue
              helperText="Kan deles offentlig uten begrensninger"
            />
          </div>
          <div className="space-y-2">
            <Label>Begrenset tilgang</Label>
            <Slider 
              nsmClassification="RESTRICTED"
              defaultValue={[45]} 
              showValue
              helperText="Kun for autorisert personell"
            />
          </div>
          <div className="space-y-2">
            <Label>Konfidensiell informasjon</Label>
            <Slider 
              nsmClassification="CONFIDENTIAL"
              defaultValue={[25]} 
              showValue
              helperText="Høyt sikkerhetsnivå påkrevd"
            />
          </div>
          <div className="space-y-2">
            <Label>Hemmelig informasjon</Label>
            <Slider 
              nsmClassification="SECRET"
              defaultValue={[10]} 
              showValue
              helperText="Strengt sikkerhetsnivå"
            />
          </div>
        </div>
      </div>
    </div>
  )
};

// Value Ranges and Steps
export const ValueRangesAndSteps: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Standardområde (0-100, steg 1)</Label>
          <Slider 
            defaultValue={[50]} 
            min={0} 
            max={100} 
            step={1}
            showValue
          />
        </div>
        
        <div className="space-y-2">
          <Label>Pris (0-10000 kr, steg 100)</Label>
          <Slider 
            defaultValue={[2500]} 
            min={0} 
            max={10000} 
            step={100}
            showValue
            formatValue={(value) => `${value.toLocaleString('nb-NO')} kr`}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Desimalverdier (0-1, steg 0.1)</Label>
          <Slider 
            defaultValue={[0.5]} 
            min={0} 
            max={1} 
            step={0.1}
            showValue
            formatValue={(value) => value.toFixed(1)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Negativt område (-100 til 100, steg 5)</Label>
          <Slider 
            defaultValue={[-25]} 
            min={-100} 
            max={100} 
            step={5}
            showValue
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tid (0-24 timer, steg 0.5)</Label>
          <Slider 
            defaultValue={[14.5]} 
            min={0} 
            max={24} 
            step={0.5}
            showValue
            formatValue={(value) => {
              const hours = Math.floor(value);
              const minutes = (value % 1) * 60;
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }}
          />
        </div>
      </div>
    </div>
  )
};

// Real World Examples
export const RealWorldExamples: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      volume: [75],
      brightness: [60],
      fontSize: [16],
      timeout: [30],
      quality: [85]
    });

    return (
      <div className="max-w-2xl space-y-10">
        {/* Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lydinnstillinger</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hovedvolum</Label>
              <Slider 
                value={settings.volume}
                onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
                min={0} 
                max={100} 
                showValue
                formatValue={(value) => `${value}%`}
                helperText="Justerer hovedvolumet for alle lyder"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skjerminnstillinger</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lysstyrke</Label>
              <Slider 
                variant="success"
                value={settings.brightness}
                onValueChange={(value) => setSettings(prev => ({ ...prev, brightness: value }))}
                min={10} 
                max={100} 
                showValue
                formatValue={(value) => `${value}%`}
                helperText="Justerer skjermens lysstyrke"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Skriftstørrelse</Label>
              <Slider 
                value={settings.fontSize}
                onValueChange={(value) => setSettings(prev => ({ ...prev, fontSize: value }))}
                min={12} 
                max={24} 
                step={1}
                showValue
                formatValue={(value) => `${value}px`}
                helperText="Størrelse på tekst i grensesnittet"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Systeminnstillinger</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tidsavbrudd for økt</Label>
              <Slider 
                variant="warning"
                value={settings.timeout}
                onValueChange={(value) => setSettings(prev => ({ ...prev, timeout: value }))}
                min={5} 
                max={120} 
                step={5}
                showValue
                formatValue={(value) => `${value} min`}
                helperText="Automatisk utlogging etter inaktivitet"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bildekvalitet</Label>
              <Slider 
                value={settings.quality}
                onValueChange={(value) => setSettings(prev => ({ ...prev, quality: value }))}
                min={10} 
                max={100} 
                step={5}
                showValue
                formatValue={(value) => `${value}%`}
                helperText="Komprimeringsgrad for bilder"
              />
            </div>
          </div>
        </div>

        {/* Current Values Display */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-base font-semibold mb-2">Nåværende innstillinger</h4>
          <ul className="text-sm space-y-1">
            <li>Volum: {settings.volume[0]}%</li>
            <li>Lysstyrke: {settings.brightness[0]}%</li>
            <li>Skriftstørrelse: {settings.fontSize[0]}px</li>
            <li>Tidsavbrudd: {settings.timeout[0]} minutter</li>
            <li>Bildekvalitet: {settings.quality[0]}%</li>
          </ul>
        </div>
      </div>
    );
  }
};

// Price Range Filter
export const PriceRangeFilter: Story = {
  render: () => {
    const [priceRange, setPriceRange] = React.useState([1000, 5000]);
    const [products] = React.useState([
      { name: "Bærbar PC", price: 8900 },
      { name: "Mobiltelefon", price: 3200 },
      { name: "Hodetelefoner", price: 1200 },
      { name: "Tablet", price: 2500 },
      { name: "Smartklokke", price: 1800 },
      { name: "Kamera", price: 6500 }
    ]);

    const filteredProducts = products.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Produktfilter</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prisområde</Label>
              <Slider 
                value={priceRange}
                onValueChange={setPriceRange}
                min={0} 
                max={15000} 
                step={100}
                showValue
                formatValue={(value) => `${value.toLocaleString('nb-NO')} kr`}
                helperText="Filtrer produkter basert på pris"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-base font-semibold">
            Filtrerte produkter ({filteredProducts.length} av {products.length})
          </h4>
          {filteredProducts.length > 0 ? (
            <div className="grid gap-2">
              {filteredProducts.map((product, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 border border-border rounded-lg"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.price.toLocaleString('nb-NO')} kr
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ingen produkter i valgt prisområde</p>
          )}
        </div>
      </div>
    );
  }
};

// Form Integration
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = React.useState({
      budget: [5000],
      experience: [3],
      timeCommitment: [10],
      priority: [7],
      satisfaction: [8]
    });

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Prosjektdefinisjon</h3>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name" required>Prosjektnavn</Label>
              <input 
                id="project-name"
                className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base"
                placeholder="Navn på prosjektet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Budsjett</Label>
              <Slider 
                value={formData.budget}
                onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                min={1000} 
                max={50000} 
                step={500}
                showValue
                formatValue={(value) => `${value.toLocaleString('nb-NO')} kr`}
                helperText="Anslått budsjett for hele prosjektet"
              />
            </div>

            <div className="space-y-2">
              <Label>Erfaringsnivå påkrevd</Label>
              <Slider 
                variant="success"
                value={formData.experience}
                onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}
                min={1} 
                max={5} 
                step={1}
                showValue
                formatValue={(value) => {
                  const levels = ['Nybegynner', 'Grunnleggende', 'Mellomnivå', 'Avansert', 'Ekspert'];
                  return levels[value - 1];
                }}
                helperText="Nødvendig erfaringsnivå for teamet"
              />
            </div>

            <div className="space-y-2">
              <Label>Tidsforbruk per uke</Label>
              <Slider 
                variant="warning"
                value={formData.timeCommitment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeCommitment: value }))}
                min={1} 
                max={40} 
                step={1}
                showValue
                formatValue={(value) => `${value} timer`}
                helperText="Forventet tidsbruk per uke"
              />
            </div>

            <div className="space-y-2">
              <Label>Prioritetsnivå</Label>
              <Slider 
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                min={1} 
                max={10} 
                step={1}
                showValue
                formatValue={(value) => {
                  if (value <= 3) return `${value} - Lav`;
                  if (value <= 6) return `${value} - Medium`;
                  if (value <= 8) return `${value} - Høy`;
                  return `${value} - Kritisk`;
                }}
                helperText="Hvor viktig er dette prosjektet?"
              />
            </div>

            <div className="space-y-2">
              <Label>Forventet tilfredshet</Label>
              <Slider 
                variant="success"
                value={formData.satisfaction}
                onValueChange={(value) => setFormData(prev => ({ ...prev, satisfaction: value }))}
                min={1} 
                max={10} 
                step={1}
                showValue
                formatValue={(value) => `${value}/10`}
                helperText="Hvor fornøyd forventer du å være med resultatet?"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-base font-semibold mb-2">Prosjektsammendrag</h4>
              <ul className="text-sm space-y-1">
                <li>Budsjett: {formData.budget[0].toLocaleString('nb-NO')} kr</li>
                <li>Erfaringsnivå: {['Nybegynner', 'Grunnleggende', 'Mellomnivå', 'Avansert', 'Ekspert'][formData.experience[0] - 1]}</li>
                <li>Tidsforbruk: {formData.timeCommitment[0]} timer/uke</li>
                <li>Prioritet: {formData.priority[0]}/10</li>
                <li>Forventet tilfredshet: {formData.satisfaction[0]}/10</li>
              </ul>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Piltaster for justering</Label>
                <Slider 
                  defaultValue={[50]}
                  showValue
                  helperText="Bruk venstre/høyre piltaster for å justere verdien"
                />
              </div>
              <div className="space-y-2">
                <Label>Home/End for ekstremverdier</Label>
                <Slider 
                  defaultValue={[25]}
                  min={0}
                  max={100}
                  showValue
                  helperText="Home for minimum, End for maksimum"
                />
              </div>
              <div className="space-y-2">
                <Label>Page Up/Down for store hopp</Label>
                <Slider 
                  defaultValue={[40]}
                  min={0}
                  max={100}
                  step={1}
                  showValue
                  helperText="Page Up/Down for hopp på 10 enheter"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Skjermleser-støtte</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ARIA slider rolle</Label>
                <Slider 
                  defaultValue={[60]}
                  showValue
                  aria-label="Volumkontroll med ARIA-støtte"
                  helperText="Kunngjør rolle, verdi, minimum og maksimum"
                />
              </div>
              <div className="space-y-2">
                <Label>Live oppdateringer</Label>
                <Slider 
                  defaultValue={[70]}
                  showValue
                  helperText="Verdien kunngjøres når den endres"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Visuell tilgjengelighet</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Høy kontrast</Label>
                <Slider 
                  size="lg"
                  defaultValue={[80]}
                  showValue
                  helperText="Designet for å møte WCAG AA kontrastkrav"
                />
              </div>
              <div className="space-y-2">
                <Label>Store berøringsmål</Label>
                <Slider 
                  size="xl"
                  defaultValue={[90]}
                  showValue
                  helperText="Minimum 44px berøringsmål for mobile enheter"
                />
              </div>
              <div className="space-y-2">
                <Label>Tydelig fokusindikator</Label>
                <Slider 
                  defaultValue={[35]}
                  showValue
                  helperText="Synlig fokusring for tastaturnavigasjon"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-3">Tilleggsstøtte</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Med hjelpetekst</Label>
                <Slider 
                  defaultValue={[45]}
                  showValue
                  helperText="Utvidet beskrivelse som leses opp av skjermlesere"
                  aria-describedby="slider-help"
                />
              </div>
              <div className="space-y-2">
                <Label>Formatert verdi</Label>
                <Slider 
                  defaultValue={[22]}
                  min={-10}
                  max={40}
                  showValue
                  formatValue={(value) => `${value}°C`}
                  helperText="Verdier presenteres i forståelig format"
                />
              </div>
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
    size: 'md',
    orientation: 'horizontal',
    variant: 'default',
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    showValue: true,
    helperText: 'Interaktiv skyvebryter'
  }
};