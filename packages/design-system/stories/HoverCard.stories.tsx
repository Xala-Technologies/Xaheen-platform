/**
 * HoverCard Component Stories
 * Showcasing hover interactions, delays, and content variations
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardArrow,
} from '../registry/components/hover-card/hover-card';

const meta: Meta<typeof HoverCard> = {
  title: 'Layout/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Hover-activated card component with configurable delays, positioning, and rich content support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Which side to appear on',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'How to align with trigger',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the hover card',
    },
    openDelay: {
      control: 'number',
      description: 'Delay before opening (ms)',
    },
    closeDelay: {
      control: 'number',
      description: 'Delay before closing (ms)',
    },
    avoidCollisions: {
      control: 'boolean',
      description: 'Automatically reposition to avoid collisions',
    },
    arrow: {
      control: 'boolean',
      description: 'Show arrow pointing to trigger',
    },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default HoverCard
export const Default: Story = {
  render: () => {
    return (
      <div className="p-8">
        <HoverCard
          trigger={
            <span className="text-blue-600 hover:text-blue-700 underline decoration-dotted cursor-pointer">
              Hold musen her
            </span>
          }
          content={
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Standard HoverCard</h3>
              <p className="text-sm text-gray-600">
                Dette er en standard hover card som vises når du holder musen
                over utløser-elementet.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Informativ
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Interaktiv
                </span>
              </div>
            </div>
          }
          side="bottom"
          size="md"
        />
      </div>
    );
  },
};

// Side Variants
export const SideVariants: Story = {
  render: () => {
    const sides = [
      { key: 'top', label: 'Topp' },
      { key: 'right', label: 'Høyre' },
      { key: 'bottom', label: 'Bunn' },
      { key: 'left', label: 'Venstre' },
    ] as const;

    return (
      <div className="grid grid-cols-2 gap-8 p-12">
        {sides.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-center">
            <HoverCard
              trigger={
                <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  Hover for {label}
                </button>
              }
              content={
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fra {label}</p>
                  <p className="text-xs text-gray-600">
                    HoverCard som vises {label.toLowerCase()}
                  </p>
                </div>
              }
              side={key}
              size="sm"
              arrow={true}
            />
          </div>
        ))}
      </div>
    );
  },
};

// Size Variants
export const SizeVariants: Story = {
  render: () => {
    const sizes = [
      { key: 'sm', label: 'Liten', content: 'Kompakt innhold' },
      { key: 'md', label: 'Medium', content: 'Standard mengde innhold for de fleste brukstilfeller' },
      { key: 'lg', label: 'Stor', content: 'Mer detaljert innhold med plass til flere elementer og lengre beskrivelser' },
      { key: 'xl', label: 'Ekstra stor', content: 'Rikelig med plass for omfattende innhold, bilder, og komplekse layout-strukturer som krever mer plass' },
    ] as const;

    return (
      <div className="flex flex-wrap gap-6 p-8">
        {sizes.map(({ key, label, content }) => (
          <HoverCard
            key={key}
            trigger={
              <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                {label}
              </button>
            }
            content={
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Størrelse: {label}</h3>
                <p className="text-sm text-gray-600">{content}</p>
                {key === 'lg' || key === 'xl' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mx-auto mb-1"></div>
                      <p className="text-xs text-blue-700">Funksjon A</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <div className="w-3 h-3 bg-green-500 rounded mx-auto mb-1"></div>
                      <p className="text-xs text-green-700">Funksjon B</p>
                    </div>
                  </div>
                ) : null}
              </div>
            }
            side="bottom"
            size={key}
          />
        ))}
      </div>
    );
  },
};

// User Profile HoverCard
export const UserProfileHoverCard: Story = {
  render: () => {
    const users = [
      {
        name: 'Kari Nordmann',
        title: 'Senior Utvikler',
        avatar: 'KN',
        email: 'kari@example.com',
        status: 'online',
        location: 'Oslo, Norge',
      },
      {
        name: 'Ole Hansen',
        title: 'Produktsjef',
        avatar: 'OH',
        email: 'ole@example.com',
        status: 'away',
        location: 'Bergen, Norge',
      },
      {
        name: 'Lisa Andersen',
        title: 'UX Designer',
        avatar: 'LA',
        email: 'lisa@example.com',
        status: 'offline',
        location: 'Trondheim, Norge',
      },
    ];

    return (
      <div className="space-y-6 p-8">
        <h3 className="text-lg font-medium text-gray-900">Teammedlemmer</h3>
        
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.email} className="flex items-center gap-3">
              <HoverCard
                trigger={
                  <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                      user.status === 'online' ? 'bg-green-600' :
                      user.status === 'away' ? 'bg-yellow-600' : 'bg-gray-400'
                    }`}>
                      {user.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.title}</p>
                    </div>
                  </button>
                }
                content={
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                        user.status === 'online' ? 'bg-green-600' :
                        user.status === 'away' ? 'bg-yellow-600' : 'bg-gray-400'
                      }`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.title}</p>
                        <p className={`text-xs font-medium ${
                          user.status === 'online' ? 'text-green-600' :
                          user.status === 'away' ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {user.status === 'online' ? 'Pålogget' :
                           user.status === 'away' ? 'Borte' : 'Frakoblet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.location}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button className="flex-1 h-9 px-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Send melding
                      </button>
                      <button className="h-9 px-3 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        Profil
                      </button>
                    </div>
                  </div>
                }
                side="right"
                size="lg"
                openDelay={500}
                closeDelay={200}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Documentation HoverCard
export const DocumentationHoverCard: Story = {
  render: () => {
    const terms = [
      {
        term: 'BankID',
        definition: 'BankID er en norsk elektronisk ID som brukes for sikker pålogging og signering.',
        type: 'Autentisering',
      },
      {
        term: 'Altinn',
        definition: 'Altinn er Norges digitale portal for offentlige tjenester og skjemaer.',
        type: 'Offentlig tjeneste',
      },
      {
        term: 'NSM',
        definition: 'Nasjonal sikkerhetsmyndighet som setter standarder for informasjonssikkerhet.',
        type: 'Sikkerhet',
      },
      {
        term: 'GDPR',
        definition: 'General Data Protection Regulation - EUs forordning om personvern.',
        type: 'Personvern',
      },
    ];

    return (
      <div className="max-w-2xl space-y-6 p-8">
        <h3 className="text-lg font-medium text-gray-900">Dokumentasjon med HoverCards</h3>
        
        <div className="prose text-gray-700 leading-relaxed">
          <p>
            For å bruke denne applikasjonen må du logge inn med{' '}
            {terms.map((term, index) => (
              <span key={term.term}>
                <HoverCard
                  trigger={
                    <span className="text-blue-600 hover:text-blue-700 underline decoration-dotted cursor-help">
                      {term.term}
                    </span>
                  }
                  content={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{term.term}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {term.type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">{term.definition}</p>
                      
                      <div className="flex gap-2 pt-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700">
                          Les mer
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700">
                          Eksempler
                        </button>
                      </div>
                    </div>
                  }
                  side="top"
                  size="md"
                  openDelay={400}
                />
                {index < terms.length - 1 ? (index === terms.length - 2 ? ' eller ' : ', ') : ''}
              </span>
            ))}
            {'. '}
            Applikasjonen følger{' '}
            <HoverCard
              trigger={
                <span className="text-blue-600 hover:text-blue-700 underline decoration-dotted cursor-help">
                  GDPR-krav
                </span>
              }
              content={
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">GDPR Compliance</h4>
                  <p className="text-sm text-gray-600">
                    Vi følger alle GDPR-krav for behandling av personopplysninger.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Rett til innsyn</li>
                    <li>• Rett til retting</li>
                    <li>• Rett til sletting</li>
                    <li>• Dataportabilitet</li>
                  </ul>
                </div>
              }
              side="bottom"
              size="md"
            />
            {' '}og er godkjent av{' '}
            <HoverCard
              trigger={
                <span className="text-blue-600 hover:text-blue-700 underline decoration-dotted cursor-help">
                  NSM
                </span>
              }
              content={
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">NSM Godkjenning</h4>
                  <p className="text-sm text-gray-600">
                    Applikasjonen er klassifisert og godkjent etter NSM sine retningslinjer.
                  </p>
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-700 font-medium">
                      ✓ Godkjent for BEGRENSET klassifisering
                    </p>
                  </div>
                </div>
              }
              side="bottom"
              size="sm"
            />
            .
          </p>
        </div>
      </div>
    );
  },
};

// Delay Variations
export const DelayVariations: Story = {
  render: () => {
    const delays = [
      { openDelay: 0, closeDelay: 100, label: 'Umiddelbar (0ms / 100ms)' },
      { openDelay: 300, closeDelay: 150, label: 'Rask (300ms / 150ms)' },
      { openDelay: 700, closeDelay: 300, label: 'Standard (700ms / 300ms)' },
      { openDelay: 1000, closeDelay: 500, label: 'Langsom (1000ms / 500ms)' },
    ];

    return (
      <div className="space-y-6 p-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Forsinkelsesvariasjoner</h3>
          <p className="text-sm text-gray-600">
            Test forskjellige åpnings- og lukkingsforsinkelser for optimal brukeropplevelse.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {delays.map(({ openDelay, closeDelay, label }) => (
            <HoverCard
              key={label}
              trigger={
                <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm">
                  {label}
                </button>
              }
              content={
                <div className="space-y-2">
                  <p className="text-sm font-medium">Forsinkelse: {label}</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Åpningsforsinkelse: {openDelay}ms</p>
                    <p>Lukkingsforsinkelse: {closeDelay}ms</p>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${(1000 - openDelay) / 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              }
              side="bottom"
              size="sm"
              openDelay={openDelay}
              closeDelay={closeDelay}
            />
          ))}
        </div>
      </div>
    );
  },
};

// Rich Content Example
export const RichContentExample: Story = {
  render: () => {
    return (
      <div className="space-y-8 p-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rik innhold i HoverCards</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart Preview */}
            <HoverCard
              trigger={
                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Salgsstatistikk</p>
                      <p className="text-sm text-gray-500">Månedlig rapport</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-4 h-16 bg-blue-200 rounded-sm"></div>
                    <div className="w-4 h-20 bg-blue-300 rounded-sm"></div>
                    <div className="w-4 h-24 bg-blue-400 rounded-sm"></div>
                    <div className="w-4 h-18 bg-blue-300 rounded-sm"></div>
                  </div>
                </div>
              }
              content={
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Salgsstatistikk November</h4>
                    <span className="text-xs text-gray-500">Oppdatert i dag</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">Totalt salg</p>
                      <p className="text-lg font-bold text-green-900">2.4M kr</p>
                      <p className="text-xs text-green-700">↗ +12% fra forrige måned</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Nye kunder</p>
                      <p className="text-lg font-bold text-blue-900">156</p>
                      <p className="text-xs text-blue-700">↗ +8% fra forrige måned</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 h-8 px-3 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      Vis rapport
                    </button>
                    <button className="h-8 px-3 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                      Eksporter
                    </button>
                  </div>
                </div>
              }
              side="right"
              size="lg"
              openDelay={300}
            />
            
            {/* Product Preview */}
            <HoverCard
              trigger={
                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                    <div>
                      <p className="font-medium text-gray-900">Premium Produkt</p>
                      <p className="text-sm text-gray-500">SKU: PP-2024-01</p>
                    </div>
                  </div>
                </div>
              }
              content={
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Premium Produkt v2.0</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Avansert løsning for moderne bedrifter
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-gray-900">899 kr</span>
                        <span className="text-sm text-green-600 font-medium">På lager</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Hovedfunksjoner:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Avansert analyse og rapportering</li>
                      <li>• 24/7 kundesupport</li>
                      <li>• API-integrasjoner</li>
                      <li>• Mobilapp inkludert</li>
                    </ul>
                  </div>
                  
                  <button className="w-full h-9 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                    Legg til i handlekurv
                  </button>
                </div>
              }
              side="left"
              size="lg"
              openDelay={400}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6 p-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• Aktiveres på hover og fokus</li>
            <li>• ARIA-beskrivelser for skjermlesere</li>
            <li>• Konfigurerbare forsinkelser</li>
            <li>• Automatisk posisjonering og kollisjonshåndtering</li>
            <li>• Mus kan flyttes til hover card uten å miste fokus</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            HoverCards kan også aktiveres med tastatur. Prøv å{' '}
            <HoverCard
              trigger={
                <button className="text-blue-600 hover:text-blue-700 underline decoration-dotted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                  fokusere på denne knappen
                </button>
              }
              content={
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tastaturnavigasjon</p>
                  <p className="text-xs text-gray-600">
                    Dette hover card ble aktivert med tastatur-fokus!
                  </p>
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      ✓ WCAG AAA kompatibel
                    </p>
                  </div>
                </div>
              }
              side="top"
              size="sm"
            />
            {' '}og se hvordan hover card aktiveres.
          </p>
          
          <p className="text-gray-700">
            Her er et eksempel på en{' '}
            <HoverCard
              trigger={
                <span 
                  className="text-blue-600 hover:text-blue-700 underline decoration-dotted cursor-help"
                  tabIndex={0}
                  role="button"
                  aria-describedby="tooltip-content"
                >
                  interaktiv span
                </span>
              }
              content={
                <div id="tooltip-content" className="space-y-2">
                  <p className="text-sm font-medium">Span med rolle som knapp</p>
                  <p className="text-xs text-gray-600">
                    Dette elementet har riktig ARIA-etiketter og kan navigeres med tastatur.
                  </p>
                </div>
              }
              side="bottom"
              size="sm"
            />
            {' '}som kan navigeres med tastatur.
          </p>
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    return (
      <div className="p-8">
        <HoverCard
          trigger={
            <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Interaktiv HoverCard
            </button>
          }
          content={
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Interaktiv HoverCard</h3>
              <p className="text-sm text-gray-600">
                Tilpass denne hover card ved å bruke Storybook controls.
              </p>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Gjeldende innstillinger:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Side: {args.side || 'bottom'}</li>
                  <li>• Justering: {args.align || 'center'}</li>
                  <li>• Størrelse: {args.size || 'md'}</li>
                  <li>• Åpningsforsinkelse: {args.openDelay || 700}ms</li>
                  <li>• Lukkingsforsinkelse: {args.closeDelay || 300}ms</li>
                  <li>• Unngå kollisjoner: {args.avoidCollisions !== false ? 'Ja' : 'Nei'}</li>
                  <li>• Pil: {args.arrow ? 'Ja' : 'Nei'}</li>
                </ul>
              </div>
              
              <button className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                Test interaksjon
              </button>
            </div>
          }
          side={args.side || 'bottom'}
          align={args.align || 'center'}
          size={args.size || 'md'}
          openDelay={args.openDelay || 700}
          closeDelay={args.closeDelay || 300}
          avoidCollisions={args.avoidCollisions !== false}
          arrow={args.arrow || false}
        />
      </div>
    );
  },
  args: {
    side: 'bottom',
    align: 'center',
    size: 'md',
    openDelay: 700,
    closeDelay: 300,
    avoidCollisions: true,
    arrow: false,
  },
};