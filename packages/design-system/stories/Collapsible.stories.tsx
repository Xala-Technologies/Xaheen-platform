/**
 * Collapsible Component Stories
 * Showcasing states, variants, and nested content examples
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleTitle,
  CollapsibleDescription,
  CollapsibleItem,
  CollapsibleGroup,
  useCollapsible,
} from '../registry/components/collapsible/collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Layout/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Collapsible component for expandable content sections with smooth animations and full accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls expanded state',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial expanded state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable expansion/collapse',
    },
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline', 'card'],
      description: 'Visual style variant',
    },
    animationDuration: {
      control: 'number',
      description: 'Animation duration in milliseconds',
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Collapsible
export const Default: Story = {
  render: () => {
    return (
      <div className="w-full max-w-md">
        <Collapsible variant="default">
          <CollapsibleTrigger>
            <CollapsibleTitle>Hva er våre åpningstider?</CollapsibleTitle>
            <CollapsibleDescription>
              Informasjon om når vi er tilgjengelige
            </CollapsibleDescription>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Mandag - Fredag</p>
                  <p className="text-gray-600">08:00 - 16:00</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lørdag</p>
                  <p className="text-gray-600">10:00 - 14:00</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Søndag</p>
                  <p className="text-gray-600">Stengt</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Helligdager</p>
                  <p className="text-gray-600">Stengt</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  * Åpningstider kan variere under høytider. Sjekk vår hjemmeside for oppdatert informasjon.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

// Variant Styles
export const VariantStyles: Story = {
  render: () => {
    const variants = [
      { key: 'default', label: 'Standard', variant: 'default' as const },
      { key: 'ghost', label: 'Ghost', variant: 'ghost' as const },
      { key: 'outline', label: 'Outline', variant: 'outline' as const },
      { key: 'card', label: 'Card', variant: 'card' as const },
    ];

    return (
      <div className="w-full max-w-2xl space-y-4">
        {variants.map(({ key, label, variant }) => (
          <Collapsible key={key} variant={variant}>
            <CollapsibleTrigger>
              <CollapsibleTitle>{label} variant</CollapsibleTitle>
              <CollapsibleDescription>
                Eksempel på {label.toLowerCase()} styling
              </CollapsibleDescription>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Dette er innholdet i en {label.toLowerCase()} variant av Collapsible-komponenten.
                  Hver variant har sin egen visuelle stil som passer til forskjellige bruksområder.
                </p>
                
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Variant: {variant}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Interaktiv
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  },
};

// Controlled Collapsible
export const ControlledCollapsible: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {open ? 'Lukk' : 'Åpne'}
          </button>
          
          <button
            onClick={() => setOpen(false)}
            className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            disabled={!open}
          >
            Lukk med knapp
          </button>
        </div>
        
        <Collapsible open={open} onOpenChange={setOpen} variant="card">
          <CollapsibleTrigger>
            <CollapsibleTitle>Kontrollert collapsible</CollapsibleTitle>
            <CollapsibleDescription>
              Tilstand: {open ? 'Åpen' : 'Lukket'}
            </CollapsibleDescription>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Denne collapsible-komponenten er kontrollert av ekstern state.
                Du kan åpne og lukke den med knappene over, eller ved å klikke på utløseren.
              </p>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">Kontrollert tilstand</p>
                <p className="text-xs text-green-700 mt-1">
                  Komponenten synkroniseres med ekstern state for full kontroll.
                </p>
              </div>
              
              <button
                onClick={() => setOpen(false)}
                className="w-full h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Lukk fra innhold
              </button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

// FAQ Example
export const FAQExample: Story = {
  render: () => {
    const faqs = [
      {
        question: 'Hvordan oppretter jeg en konto?',
        answer: 'Du kan opprette en konto ved å klikke på "Registrer deg" øverst på siden og følge instruksjonene. Du trenger en gyldig e-postadresse og må velge et sikkert passord.',
      },
      {
        question: 'Kan jeg endre min informasjon senere?',
        answer: 'Ja, du kan når som helst logge inn på kontoen din og oppdatere personlig informasjon som navn, adresse, og kontaktdetaljer i innstillingene.',
      },
      {
        question: 'Er mine data trygge?',
        answer: 'Vi tar datasikkerhet svært alvorlig og følger alle GDPR-retningslinjer. Dataene dine er kryptert og lagres sikkert i henhold til norske personvernlover.',
      },
      {
        question: 'Hvordan kontakter jeg kundeservice?',
        answer: 'Du kan kontakte oss via e-post på support@example.com, ringe oss på +47 12 34 56 78, eller bruke chat-funksjonen på hjemmesiden vår.',
      },
      {
        question: 'Kan jeg avbryte abonnementet mitt?',
        answer: 'Ja, du kan avbryte abonnementet ditt når som helst uten noen bindingsperiode. Logg inn på kontoen din og gå til "Abonnement" i innstillingene.',
      },
    ];

    return (
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Ofte stilte spørsmål</h2>
          <p className="text-gray-600">Finn svar på de vanligste spørsmålene</p>
        </div>
        
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <CollapsibleItem
              key={index}
              title={faq.question}
              variant="outline"
              defaultOpen={index === 0}
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
                
                {index === 2 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">💡 Visste du at...</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Vi er sertifisert etter ISO 27001 standarden for informasjonssikkerhet.
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-2">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Var dette nyttig? 👍
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    Trenger mer hjelp?
                  </button>
                </div>
              </div>
            </CollapsibleItem>
          ))}
        </div>
      </div>
    );
  },
};

// Nested Collapsible Example
export const NestedCollapsibleExample: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl">
        <Collapsible variant="card" defaultOpen={true}>
          <CollapsibleTrigger>
            <CollapsibleTitle>Produktkategorier</CollapsibleTitle>
            <CollapsibleDescription>
              Utforsk våre produktkategorier og underkategorier
            </CollapsibleDescription>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-3">
              <Collapsible variant="outline">
                <CollapsibleTrigger>
                  <CollapsibleTitle level={4}>📱 Elektronikk</CollapsibleTitle>
                  <CollapsibleDescription>
                    Mobiler, datamaskiner og tilbehør
                  </CollapsibleDescription>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="space-y-2">
                    <Collapsible variant="ghost">
                      <CollapsibleTrigger>
                        <CollapsibleTitle level={5}>Mobiltelefoner</CollapsibleTitle>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-4 space-y-2 text-sm text-gray-600">
                          <p>• iPhone serien</p>
                          <p>• Samsung Galaxy</p>
                          <p>• Google Pixel</p>
                          <p>• OnePlus</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <Collapsible variant="ghost">
                      <CollapsibleTrigger>
                        <CollapsibleTitle level={5}>Datamaskiner</CollapsibleTitle>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-4 space-y-2 text-sm text-gray-600">
                          <p>• Bærbare datamaskiner</p>
                          <p>• Stasjonære datamaskiner</p>
                          <p>• Tablets</p>
                          <p>• Tilbehør</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible variant="outline">
                <CollapsibleTrigger>
                  <CollapsibleTitle level={4}>👕 Klær</CollapsibleTitle>
                  <CollapsibleDescription>
                    Mote for hele familien
                  </CollapsibleDescription>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="space-y-2">
                    <Collapsible variant="ghost">
                      <CollapsibleTrigger>
                        <CollapsibleTitle level={5}>Hereklær</CollapsibleTitle>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-4 space-y-2 text-sm text-gray-600">
                          <p>• Skjorter og t-skjorter</p>
                          <p>• Bukser og jeans</p>
                          <p>• Jakker og yttertøy</p>
                          <p>• Undertøy og sokker</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    <Collapsible variant="ghost">
                      <CollapsibleTrigger>
                        <CollapsibleTitle level={5}>Dameklær</CollapsibleTitle>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-4 space-y-2 text-sm text-gray-600">
                          <p>• Kjoler og skjørt</p>
                          <p>• Topper og bluser</p>
                          <p>• Bukser og leggings</p>
                          <p>• Undertøy og bh</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible variant="outline">
                <CollapsibleTrigger>
                  <CollapsibleTitle level={4}>🏠 Hjem og hage</CollapsibleTitle>
                  <CollapsibleDescription>
                    Alt for hjemmet og hagen
                  </CollapsibleDescription>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="pl-4 space-y-2 text-sm text-gray-600">
                    <p>• Møbler og innredning</p>
                    <p>• Kjøkkenutstyr</p>
                    <p>• Hageartikler</p>
                    <p>• Rengjøring</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

// Accordion Group Example
export const AccordionGroupExample: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Single Selection Accordion</h3>
          <p className="text-sm text-gray-600 mb-6">
            Kun en seksjon kan være åpen av gangen
          </p>
          
          <CollapsibleGroup type="single" defaultValue="privacy">
            <CollapsibleItem
              title="Personvern og GDPR"
              description="Hvordan vi håndterer dine personopplysninger"
              variant="outline"
              value="privacy"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Vi følger alle GDPR-bestemmelser og norske personvernlover.
                  Dine data er trygt lagret og kryptert.
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-900">Datalagring</p>
                    <p className="text-green-700 mt-1">Kryptert i Norge</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">Dine rettigheter</p>
                    <p className="text-blue-700 mt-1">Innsyn, retting, sletting</p>
                  </div>
                </div>
              </div>
            </CollapsibleItem>
            
            <CollapsibleItem
              title="Sikkerhet og NSM-godkjenning"
              description="Våre sikkerhetsrutiner og sertifiseringer"
              variant="outline"
              value="security"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Vi er godkjent av NSM (Nasjonal sikkerhetsmyndighet) og følger
                  høyeste sikkerhetsstandarder.
                </p>
                
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ISO 27001 sertifisering</li>
                  <li>• NSM-godkjent for BEGRENSET klassifisering</li>
                  <li>• Regelmessige sikkerhetsrevisjoner</li>
                  <li>• 24/7 sikkerhetsovervåkning</li>
                </ul>
              </div>
            </CollapsibleItem>
            
            <CollapsibleItem
              title="Cookie-policy"
              description="Hvordan vi bruker cookies"
              variant="outline"
              value="cookies"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Vi bruker kun nødvendige cookies for å gi deg den beste opplevelsen.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Nødvendige cookies</span>
                    <span className="text-green-600 font-medium">Aktivert</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Analyse cookies</span>
                    <span className="text-red-600 font-medium">Deaktivert</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Marketing cookies</span>
                    <span className="text-red-600 font-medium">Deaktivert</span>
                  </div>
                </div>
              </div>
            </CollapsibleItem>
          </CollapsibleGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Multiple Selection Accordion</h3>
          <p className="text-sm text-gray-600 mb-6">
            Flere seksjoner kan være åpne samtidig
          </p>
          
          <CollapsibleGroup type="multiple" defaultValue={['contact']}>
            <CollapsibleItem
              title="Kontaktinformasjon"
              description="Våre kontaktdetaljer"
              variant="card"
              value="contact"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Telefon</p>
                    <p className="text-gray-600">+47 12 34 56 78</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">E-post</p>
                    <p className="text-gray-600">kontakt@example.com</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">Storgata 1, 0123 Oslo</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Org.nr</p>
                    <p className="text-gray-600">123 456 789</p>
                  </div>
                </div>
              </div>
            </CollapsibleItem>
            
            <CollapsibleItem
              title="Åpningstider"
              description="Når vi er tilgjengelige"
              variant="card"
              value="hours"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Mandag - Fredag</p>
                  <p className="text-gray-600">08:00 - 16:00</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lørdag</p>
                  <p className="text-gray-600">10:00 - 14:00</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Søndag</p>
                  <p className="text-gray-600">Stengt</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Helligdager</p>
                  <p className="text-gray-600">Stengt</p>
                </div>
              </div>
            </CollapsibleItem>
            
            <CollapsibleItem
              title="Sosiale medier"
              description="Følg oss på sosiale medier"
              variant="card"
              value="social"
            >
              <div className="flex gap-4">
                <a href="#" className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-6 h-6 bg-blue-400 rounded"></div>
                  <span className="text-sm font-medium">Twitter</span>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-6 h-6 bg-blue-700 rounded"></div>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </CollapsibleItem>
          </CollapsibleGroup>
        </div>
      </div>
    );
  },
};

// Animation Timing Example
export const AnimationTimingExample: Story = {
  render: () => {
    const timings = [100, 300, 500, 800, 1200];
    
    return (
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Animasjonshastigheter</h3>
          <p className="text-sm text-gray-600 mb-6">
            Test forskjellige animasjonshastigheter
          </p>
        </div>
        
        {timings.map((duration) => (
          <CollapsibleItem
            key={duration}
            title={`Animasjon: ${duration}ms`}
            description={`${duration === 100 ? 'Rask' : duration === 300 ? 'Normal' : duration === 500 ? 'Medium' : duration === 800 ? 'Langsom' : 'Veldig langsom'} animasjon`}
            variant="outline"
            animationDuration={duration}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Denne collapsible har en animasjonshastighet på {duration} millisekunder.
                {duration <= 200 && ' Dette gir en rask og responsiv følelse.'}
                {duration > 200 && duration <= 400 && ' Dette er standard hastighet for de fleste grensesnitt.'}
                {duration > 400 && duration <= 600 && ' Dette gir en roligere og mer elegant følelse.'}
                {duration > 600 && ' Dette kan oppleves som tregt for noen brukere.'}
              </p>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Varighet:</strong> {duration}ms
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Animasjonen bruker ease-in-out timing for naturlig bevegelse
                </p>
              </div>
            </div>
          </CollapsibleItem>
        ))}
      </div>
    );
  },
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• ARIA-expanded attributt indikerer tilstand</li>
            <li>• Tastaturnavigasjon med Enter og Space</li>
            <li>• Fokusindikering for skjermlesere</li>
            <li>• Semantisk HTML med korrekte roller</li>
            <li>• Smidig animasjoner som respekterer prefers-reduced-motion</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <CollapsibleItem
            title="Test tastaturnavigasjon"
            description="Bruk Tab, Enter og Space-tasten for å navigere"
            variant="outline"
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Denne komponenten støtter full tastaturnavigasjon:
              </p>
              
              <ul className="text-sm text-gray-600 space-y-1 pl-4">
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> - Naviger til trigger</li>
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> eller <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> - Utvid/kollaps</li>
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> - Naviger til innhold når utvidet</li>
              </ul>
              
              <button className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm">
                Fokusérbar knapp i innhold
              </button>
            </div>
          </CollapsibleItem>
          
          <CollapsibleItem
            title="Skjermleser-optimalisert"
            description="Korrekte ARIA-etiketter og tilstandsinformasjon"
            variant="outline"
            disabled={false}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Skjermlesere får beskjed om:
              </p>
              
              <ul className="text-sm text-gray-600 space-y-1 pl-4">
                <li>• Om seksjonen er utvidet eller kollapset</li>
                <li>• Hvilken type innhold som er tilgjengelig</li>
                <li>• Hvordan de skal interagere med komponenten</li>
              </ul>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">✓ WCAG AAA kompatibel</p>
                <p className="text-xs text-green-700 mt-1">
                  Følger alle retningslinjer for tilgjengelig webinnhold
                </p>
              </div>
            </div>
          </CollapsibleItem>
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    return (
      <div className="w-full max-w-md">
        <Collapsible
          open={args.open}
          defaultOpen={args.defaultOpen}
          disabled={args.disabled}
          variant={args.variant}
          animationDuration={args.animationDuration}
        >
          <CollapsibleTrigger>
            <CollapsibleTitle>Interaktiv Collapsible</CollapsibleTitle>
            <CollapsibleDescription>
              Tilpass egenskaper ved hjelp av Storybook controls
            </CollapsibleDescription>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Dette er en interaktiv collapsible-komponent som du kan tilpasse
                ved hjelp av kontrollene i Storybook.
              </p>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Gjeldende innstillinger:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Variant: {args.variant || 'default'}</li>
                  <li>• Deaktivert: {args.disabled ? 'Ja' : 'Nei'}</li>
                  <li>• Animasjonsvarighet: {args.animationDuration || 300}ms</li>
                  <li>• Åpen som standard: {args.defaultOpen ? 'Ja' : 'Nei'}</li>
                </ul>
              </div>
              
              <button className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Test knapp i innhold
              </button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
  args: {
    open: undefined,
    defaultOpen: false,
    disabled: false,
    variant: 'default',
    animationDuration: 300,
  },
};