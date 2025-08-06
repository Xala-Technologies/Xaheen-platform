/**
 * Accordion Component Stories
 * Showcasing collapsible content sections with full accessibility
 * WCAG AAA compliant examples with Norwegian text and keyboard navigation
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '../registry/components/accordion/accordion';
import { 
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Professional accordion component for collapsible content sections with WCAG AAA compliance, full keyboard navigation, and NSM security classifications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Allow single or multiple items to be open',
    },
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outline', 'ghost', 'nsmOpen', 'nsmRestricted', 'nsmConfidential', 'nsmSecret'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable entire accordion',
    },
    nsmClassification: {
      control: 'select',
      options: [undefined, 'OPEN', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'],
      description: 'NSM security classification',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    type: 'single',
    defaultValue: 'item-1',
    children: (
      <>
        <AccordionItem value="item-1">
          <AccordionTrigger>Hva er en accordion?</AccordionTrigger>
          <AccordionContent>
            En accordion er en brukergrensesnittkomponent som lar brukere utvide og skjule seksjoner med innhold. 
            Den er nyttig for å organisere informasjon i kompakte, navigerbare seksjoner.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>Hvordan bruker jeg den?</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <p>Accordion-komponenten består av flere deler:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Accordion:</strong> Hovedcontaineren</li>
                <li><strong>AccordionItem:</strong> Hver enkelt seksjon</li>
                <li><strong>AccordionTrigger:</strong> Knappen som åpner/lukker</li>
                <li><strong>AccordionContent:</strong> Innholdet som vises/skjules</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>Er den tilgjengelig?</AccordionTrigger>
          <AccordionContent>
            Ja! Komponenten følger WCAG AAA-retningslinjer og inkluderer:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Full tastaturnavigasjon</li>
              <li>Riktige ARIA-attributter</li>
              <li>Skjermleserstøtte</li>
              <li>Fokusbehandling</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </>
    ),
  },
};

// Multiple Open
export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['faq-1', 'faq-3']}>
      <AccordionItem value="faq-1">
        <AccordionTrigger>Kan flere seksjoner være åpne samtidig?</AccordionTrigger>
        <AccordionContent>
          Ja! Ved å sette <code>type="multiple"</code> kan flere accordion-elementer være åpne samtidig. 
          Dette er nyttig når brukere trenger å se innhold fra flere seksjoner samtidig.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="faq-2">
        <AccordionTrigger>Hvordan styrer jeg standard åpne elementer?</AccordionTrigger>
        <AccordionContent>
          Bruk <code>defaultValue</code>-props med en array av verdier for å spesifisere hvilke elementer 
          som skal være åpne som standard i multiple-modus.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="faq-3">
        <AccordionTrigger>Kan jeg kontrollere tilstanden programmatisk?</AccordionTrigger>
        <AccordionContent>
          Absolutt! Bruk <code>value</code> og <code>onValueChange</code> props for kontrollert tilstand, 
          eller <code>defaultValue</code> for ukontrollert tilstand.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Produktinformasjon</AccordionTrigger>
        <AccordionContent>
          Dette produktet tilbyr omfattende funksjonalitet for norske bedrifter.
          Det støtter BankID, Altinn integrasjon og følger NSM retningslinjer.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Priser og abonnement</AccordionTrigger>
        <AccordionContent>
          Vi tilbyr fleksible prismodeller tilpasset små og store organisasjoner.
          Alle priser er oppgitt eksklusiv MVA i norske kroner.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Teknisk støtte</AccordionTrigger>
        <AccordionContent>
          Vårt supportteam er tilgjengelig hverdager 08:00-16:00 norsk tid.
          Vi tilbyr support på norsk, engelsk og støtter også samisk.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Small</h3>
        <Accordion type="single" size="sm" className="w-full max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>Liten størrelse</AccordionTrigger>
            <AccordionContent>Kompakt innhold for mindre komponenter.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Medium (Standard)</h3>
        <Accordion type="single" size="md" className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Medium størrelse</AccordionTrigger>
            <AccordionContent>Standard størrelse for de fleste brukstilfeller.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Large</h3>
        <Accordion type="single" size="lg" className="w-full max-w-lg">
          <AccordionItem value="item-1">
            <AccordionTrigger>Stor størrelse</AccordionTrigger>
            <AccordionContent>Større tekst og mer polstring for bedre lesbarhet.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
};

// Visual Variants
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Default</h3>
        <Accordion type="single" variant="default" className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Standard utseende</AccordionTrigger>
            <AccordionContent>Standard styling med subtil skygge og runding.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Elevated</h3>
        <Accordion type="single" variant="elevated" className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Hevet design</AccordionTrigger>
            <AccordionContent>Mer fremtredende med større skygge for visuell separasjon.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Outline</h3>
        <Accordion type="single" variant="outline" className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Omriss stil</AccordionTrigger>
            <AccordionContent>Kun ramme uten bakgrunnsfarge for minimal design.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-4">Ghost</h3>
        <Accordion type="single" variant="ghost" className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>Gjennomsiktig stil</AccordionTrigger>
            <AccordionContent>Minimal styling uten ramme eller skygge.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
};

// NSM Security Classification
export const NSMClassification: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">NSM Sikkerhetsklassifiseringer</h3>
        
        <div className="space-y-4">
          <Accordion type="single" nsmClassification="OPEN" className="w-full max-w-md">
            <AccordionItem value="open">
              <AccordionTrigger>ÅPEN - Offentlig tilgjengelig</AccordionTrigger>
              <AccordionContent>
                Dette innholdet er klassifisert som ÅPEN og kan deles fritt.
                Informasjonen er tilgjengelig for allmennheten.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" nsmClassification="RESTRICTED" className="w-full max-w-md">
            <AccordionItem value="restricted">
              <AccordionTrigger>BEGRENSET - Intern bruk</AccordionTrigger>
              <AccordionContent>
                Dette innholdet er klassifisert som BEGRENSET og er kun for intern bruk
                i organisasjonen eller godkjente samarbeidspartnere.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" nsmClassification="CONFIDENTIAL" className="w-full max-w-md">
            <AccordionItem value="confidential">
              <AccordionTrigger>KONFIDENSIELL - Sensitiv informasjon</AccordionTrigger>
              <AccordionContent>
                Dette innholdet er klassifisert som KONFIDENSIELL og inneholder
                sensitiv informasjon som krever særlig beskyttelse.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" nsmClassification="SECRET" className="w-full max-w-md">
            <AccordionItem value="secret">
              <AccordionTrigger>HEMMELIG - Høyeste klassifisering</AccordionTrigger>
              <AccordionContent>
                Dette innholdet er klassifisert som HEMMELIG og krever
                høyeste sikkerhetsnivå og spesiell tilgangskontroll.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
};

// Norwegian Enterprise Examples
export const NorwegianEnterprise: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Altinn Integrasjon</h3>
        <Accordion type="single" nsmClassification="RESTRICTED" className="w-full max-w-lg">
          <AccordionItem value="altinn-setup">
            <AccordionTrigger>Oppsett av Altinn kobling</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>For å koble til Altinn trenger du:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Gyldig organisasjonsnummer</li>
                  <li>Altinn API-nøkkel</li>
                  <li>Virksomhetssertifikat</li>
                  <li>Godkjenning fra Digdir</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="altinn-services">
            <AccordionTrigger>Tilgjengelige tjenester</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>Støttede Altinn tjenester:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Innsending av skjemaer</li>
                  <li>Henting av meldinger</li>
                  <li>Autorisasjon og fullmakter</li>
                  <li>Virksomhetsdata fra Enhetsregisteret</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">GDPR Compliance</h3>
        <Accordion type="multiple" className="w-full max-w-lg">
          <AccordionItem value="data-processing">
            <AccordionTrigger>Behandling av personopplysninger</AccordionTrigger>
            <AccordionContent>
              Vi behandler personopplysninger i henhold til GDPR og personopplysningsloven.
              All data lagres innenfor EU/EØS og krypteres både i hvile og transit.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="user-rights">
            <AccordionTrigger>Brukerrettigheter</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>Du har følgende rettigheter:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Rett til innsyn i egne data</li>
                  <li>Rett til retting av feilaktige data</li>
                  <li>Rett til sletting ("retten til å bli glemt")</li>
                  <li>Rett til begrensning av behandling</li>
                  <li>Rett til dataportabilitet</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
};

// Complex Content
export const ComplexContent: Story = {
  render: () => (
    <Accordion type="single" className="w-full max-w-2xl">
      <AccordionItem value="technical-specs">
        <AccordionTrigger>Tekniske spesifikasjoner</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Systemkrav</h4>
                <ul className="text-sm text-muted-foreground">
                  <li>Node.js 18+</li>
                  <li>React 18+</li>
                  <li>TypeScript 5+</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Browser støtte</h4>
                <ul className="text-sm text-muted-foreground">
                  <li>Chrome 100+</li>
                  <li>Firefox 100+</li>
                  <li>Safari 15+</li>
                  <li>Edge 100+</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">
                npm install @xaheen/design-system
              </code>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="api-reference">
        <AccordionTrigger>API Referanse</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Prop</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Standard</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-mono">type</td>
                  <td className="py-2">'single' | 'multiple'</td>
                  <td className="py-2">'single'</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">variant</td>
                  <td className="py-2">'default' | 'elevated' | 'outline' | 'ghost'</td>
                  <td className="py-2">'default'</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">size</td>
                  <td className="py-2">'sm' | 'md' | 'lg'</td>
                  <td className="py-2">'md'</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
};

// Custom Icons
export const CustomIcons: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['icon-1']}>
      <AccordionItem value="icon-1">
        <AccordionTrigger customIcon={<PlusIcon className="h-5 w-5" />}>
          Pluss/minus ikon
        </AccordionTrigger>
        <AccordionContent>
          Tilpasset ikon som endres basert på åpen/lukket tilstand.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="icon-2">
        <AccordionTrigger customIcon={<ChevronRightIcon className="h-5 w-5" />}>
          Høyre pil ikon
        </AccordionTrigger>
        <AccordionContent>
          Chevron som roterer når seksjonen åpnes.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="icon-3">
        <AccordionTrigger hideChevron>
          Uten ikon
        </AccordionTrigger>
        <AccordionContent>
          Ren tekst uten noe ikon.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Disabled States
export const DisabledStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-medium mb-3">Helt deaktivert accordion</h4>
        <Accordion type="single" disabled>
          <AccordionItem value="disabled-1">
            <AccordionTrigger>Denne kan ikke åpnes</AccordionTrigger>
            <AccordionContent>Dette innholdet er utilgjengelig.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h4 className="text-base font-medium mb-3">Enkelte elementer deaktivert</h4>
        <Accordion type="single" defaultValue="mixed-2">
          <AccordionItem value="mixed-1" disabled>
            <AccordionTrigger>Deaktivert element</AccordionTrigger>
            <AccordionContent>Dette innholdet er utilgjengelig.</AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="mixed-2">
            <AccordionTrigger>Aktivt element</AccordionTrigger>
            <AccordionContent>Dette elementet fungerer normalt.</AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="mixed-3">
            <AccordionTrigger>Et annet aktivt element</AccordionTrigger>
            <AccordionContent>Dette fungerer også normalt.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// Controlled State Example
export const ControlledState: Story = {
  render: () => <ControlledDemo />,
};

const ControlledDemo: React.FC = (): JSX.Element => {
  const [value, setValue] = useState<string>('');
  const [multiValue, setMultiValue] = useState<string[]>(['ctrl-2']);
  
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-base font-medium mb-4">Kontrollert enkelt accordion</h4>
        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => setValue('ctrl-1')}
            className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Åpne første
          </button>
          <button 
            onClick={() => setValue('ctrl-2')}
            className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Åpne andre
          </button>
          <button 
            onClick={() => setValue('')}
            className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Lukk alle
          </button>
        </div>
        
        <Accordion type="single" value={value} onValueChange={(val) => setValue(val as string)}>
          <AccordionItem value="ctrl-1">
            <AccordionTrigger>Første kontrollerte element</AccordionTrigger>
            <AccordionContent>
              Innhold i første element. Åpnet programmatisk: {value === 'ctrl-1' ? 'Ja' : 'Nei'}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="ctrl-2">
            <AccordionTrigger>Andre kontrollerte element</AccordionTrigger>
            <AccordionContent>
              Innhold i andre element. Åpnet programmatisk: {value === 'ctrl-2' ? 'Ja' : 'Nei'}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h4 className="text-base font-medium mb-4">Kontrollert multiple accordion</h4>
        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => setMultiValue(['multi-1', 'multi-2'])}
            className="h-10 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Åpne alle
          </button>
          <button 
            onClick={() => setMultiValue([])}
            className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Lukk alle
          </button>
        </div>
        
        <Accordion 
          type="multiple" 
          value={multiValue} 
          onValueChange={(val) => setMultiValue(val as string[])}
        >
          <AccordionItem value="multi-1">
            <AccordionTrigger>Multiple element 1</AccordionTrigger>
            <AccordionContent>
              Åpen: {multiValue.includes('multi-1') ? 'Ja' : 'Nei'}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="multi-2">
            <AccordionTrigger>Multiple element 2</AccordionTrigger>
            <AccordionContent>
              Åpen: {multiValue.includes('multi-2') ? 'Ja' : 'Nei'}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

// Enterprise Scenarios
export const EnterpriseScenarios: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bedriftsscenarier</h3>
        
        <Accordion type="multiple" defaultValue={['enterprise-1']} variant="elevated">
          <AccordionItem value="enterprise-1">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>BankID Integrasjon</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Aktiv</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Status:</strong> Tilkoblet
                  </div>
                  <div>
                    <strong>Siste synk:</strong> 2 minutter siden
                  </div>
                  <div>
                    <strong>Aktive sesjoner:</strong> 47
                  </div>
                  <div>
                    <strong>Feilrate:</strong> 0.2%
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Vis logg
                  </button>
                  <button className="h-10 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm">
                    Konfigurer
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="enterprise-2">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Altinn Rapportering</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Advarsel</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    3 rapporter venter på godkjenning. Frist: 15. mars 2024
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Månedsskjema Februar</span>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Godkjenn</button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">MVA-rapport Q1</span>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Godkjenn</button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Årsrapport 2023</span>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Godkjenn</button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="enterprise-3" disabled>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Dokumentarkiv</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Vedlikehold</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              Ikke tilgjengelig under vedlikehold.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">WCAG AAA Tilgjengelighetsfunksjoner</h3>
        
        <Accordion type="single" defaultValue="a11y-1">
          <AccordionItem value="a11y-1">
            <AccordionTrigger>Tastaturnavigasjon</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p>Accordion-komponenten støtter full tastaturnavigasjon:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> - Naviger mellom triggere</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> - Åpne/lukke accordion</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> - Åpne/lukke accordion</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">↓</kbd> - Gå til neste trigger</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">↑</kbd> - Gå til forrige trigger</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">Home</kbd> - Gå til første trigger</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded">End</kbd> - Gå til siste trigger</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="a11y-2">
            <AccordionTrigger>ARIA-attributter</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p>Komponenten bruker riktige ARIA-attributter for skjermlesere:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><code>aria-expanded</code> - Indikerer om innholdet er utvidet</li>
                  <li><code>aria-controls</code> - Kobler trigger til innhold</li>
                  <li><code>role="region"</code> - Definerer innholdsområdet</li>
                  <li><code>aria-labelledby</code> - Kobler innhold til trigger</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="a11y-3">
            <AccordionTrigger>Fokusbehandling</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p>Profesjonell fokusbehandling inkluderer:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Tydelige fokusindikatorer som oppfyller kontrastkrav</li>
                  <li>Logisk tabulatorsekvens</li>
                  <li>Fokus forblir på trigger når innhold lukkes</li>
                  <li>Skip-links for lange accordion-lister</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Fullstendig tilgjengelighetsstøtte:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Semantiske HTML-elementer (button, div med riktige roller)</li>
            <li>• WCAG AAA kontrastnivåer for tekst og fokusindikatorer</li>
            <li>• Responsivt design som fungerer på alle skjermstørrelser</li>
            <li>• Støtte for skjermlesere (NVDA, JAWS, VoiceOver)</li>
            <li>• Animasjoner som respekterer prefers-reduced-motion</li>
            <li>• NSM-klassifisering annonseres for skjermlesere</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

// Interactive Playground
export const Playground: Story = {
  args: {
    type: 'single',
    variant: 'default',
    size: 'md',
    disabled: false,
    defaultValue: 'playground-1',
    children: (
      <>
        <AccordionItem value="playground-1">
          <AccordionTrigger>Første akkordion element</AccordionTrigger>
          <AccordionContent>
            Dette er innholdet i det første accordion-elementet. Du kan tilpasse egenskapene 
            ved hjelp av kontrollpanelet for å teste forskjellige konfigurasjoner.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="playground-2">
          <AccordionTrigger>Andre akkordion element</AccordionTrigger>
          <AccordionContent>
            Her er innholdet i det andre elementet. Test hvordan forskjellige varianter 
            og størrelser påvirker utseendet og oppførselen.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="playground-3">
          <AccordionTrigger>Tredje akkordion element</AccordionTrigger>
          <AccordionContent>
            Det siste elementet for å demonstrere hvordan accordion fungerer med 
            flere elementer i forskjellige konfigurasjoner.
          </AccordionContent>
        </AccordionItem>
      </>
    ),
  },
};