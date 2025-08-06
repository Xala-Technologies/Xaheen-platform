/**
 * Tabs Component Stories
 * Showcasing all variants, orientations, and advanced features
 * WCAG AAA compliant examples with Norwegian text and lazy loading
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AdvancedTabs,
  LazyTabs,
  useTabs,
  type TabItem,
} from '../registry/components/tabs/tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Layout/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Professional tabbed interface system with multiple variants, accessibility support, and advanced features like lazy loading.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tab orientation',
    },
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
      description: 'How tabs are activated',
    },
    value: {
      control: 'text',
      description: 'Currently active tab',
    },
    defaultValue: {
      control: 'text',
      description: 'Initially active tab',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Tabs
export const Default: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList variant="default" size="md">
            <TabsTrigger value="overview" variant="default" size="md">
              Oversikt
            </TabsTrigger>
            <TabsTrigger value="details" variant="default" size="md">
              Detaljer
            </TabsTrigger>
            <TabsTrigger value="settings" variant="default" size="md">
              Innstillinger
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" variant="default">
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-medium text-gray-900">Oversikt</h3>
              <p className="text-sm text-gray-600">
                Velkommen til oversiktssiden. Her finner du en sammendrag av all viktig informasjon
                og statistikk som er relevant for deg.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-900">156</p>
                  <p className="text-sm text-blue-700">Aktive prosjekter</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-900">89%</p>
                  <p className="text-sm text-green-700">Ferdigstillelse</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-900">24</p>
                  <p className="text-sm text-purple-700">Teammedlemmer</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" variant="default">
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-medium text-gray-900">Detaljert informasjon</h3>
              <p className="text-sm text-gray-600">
                Her finner du mer detaljert informasjon og spesifikasjoner.
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Opprettet dato</span>
                  <span className="text-sm text-gray-600">15. november 2024</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Sist oppdatert</span>
                  <span className="text-sm text-gray-600">I dag, 14:30</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktiv
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" variant="default">
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-medium text-gray-900">Innstillinger</h3>
              <p className="text-sm text-gray-600">
                Tilpass applikasjonen etter dine preferanser.
              </p>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">E-postvarslinger</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Mørkt tema</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Språk</label>
                  <select className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="no">Norsk</option>
                    <option value="en">English</option>
                    <option value="sv">Svenska</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

// Variant Styles
export const VariantStyles: Story = {
  render: () => {
    const variants = [
      { key: 'default', label: 'Standard', variant: 'default' as const },
      { key: 'line', label: 'Linje', variant: 'line' as const },
      { key: 'pills', label: 'Piller', variant: 'pills' as const },
      { key: 'vertical', label: 'Vertikal', variant: 'vertical' as const },
    ];

    return (
      <div className="w-full max-w-4xl space-y-8">
        {variants.map(({ key, label, variant }) => (
          <div key={key} className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">{label} variant</h3>
            
            <Tabs defaultValue="tab1" className="w-full" orientation={variant === 'vertical' ? 'vertical' : 'horizontal'}>
              <TabsList variant={variant} size="md">
                <TabsTrigger value="tab1" variant={variant} size="md">
                  Fane 1
                </TabsTrigger>
                <TabsTrigger value="tab2" variant={variant} size="md">
                  Fane 2
                </TabsTrigger>
                <TabsTrigger value="tab3" variant={variant} size="md">
                  Fane 3
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tab1" variant={variant === 'vertical' ? 'padded' : 'default'}>
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Dette er innholdet for den første fanen i {label.toLowerCase()} variant.
                    Hver variant har sin egen unike visuell stil.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="tab2" variant={variant === 'vertical' ? 'padded' : 'default'}>
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Innhold for den andre fanen viser hvordan {label.toLowerCase()} variant
                    håndterer overganger mellom faner.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="tab3" variant={variant === 'vertical' ? 'padded' : 'default'}>
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Den tredje fanen demonstrerer konsistent styling på tvers av
                    hele {label.toLowerCase()} varianten.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
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
      { key: 'sm', label: 'Liten', size: 'sm' as const },
      { key: 'md', label: 'Medium', size: 'md' as const },
      { key: 'lg', label: 'Stor', size: 'lg' as const },
    ];

    return (
      <div className="w-full max-w-2xl space-y-8">
        {sizes.map(({ key, label, size }) => (
          <div key={key} className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">{label} størrelse ({size})</h3>
            
            <Tabs defaultValue="content" className="w-full">
              <TabsList variant="default" size={size}>
                <TabsTrigger value="content" variant="default" size={size}>
                  Innhold
                </TabsTrigger>
                <TabsTrigger value="media" variant="default" size={size}>
                  Media
                </TabsTrigger>
                <TabsTrigger value="settings" variant="default" size={size}>
                  Innstillinger
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" variant="default">
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Faner i {label.toLowerCase()} størrelse ({size}) gir {
                      size === 'sm' ? 'en kompakt opplevelse' :
                      size === 'md' ? 'den perfekte balansen' :
                      'maksimal synlighet og touch-vennlighet'
                    }.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="media" variant="default">
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Media-innholdet tilpasser seg {label.toLowerCase()} størrelse for optimal visning.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" variant="default">
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Innstillinger for {label.toLowerCase()} størrelse-variant av fane-komponenten.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ))}
      </div>
    );
  },
};

// Tabs with Icons and Badges
export const TabsWithIconsAndBadges: Story = {
  render: () => {
    return (
      <div className="w-full max-w-2xl">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList variant="line" size="md">
            <TabsTrigger 
              value="dashboard" 
              variant="line" 
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 002 2H6a2 2 0 002-2v0z" />
                </svg>
              }
            >
              Dashbord
            </TabsTrigger>
            
            <TabsTrigger 
              value="messages" 
              variant="line" 
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              badge={5}
            >
              Meldinger
            </TabsTrigger>
            
            <TabsTrigger 
              value="notifications" 
              variant="line" 
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l.707-.707m12.728 0l.707.707m-6.5 4.5V6a2 2 0 00-4 0v2.5m0 0V12a6 6 0 0012 0V8.5" />
                </svg>
              }
              badge="NY"
            >
              Varslinger
            </TabsTrigger>
            
            <TabsTrigger 
              value="profile" 
              variant="line" 
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              Profil
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" variant="padded">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">📊 Dashbord</h3>
              <p className="text-sm text-gray-600">
                Her er ditt personlige dashbord med oversikt over aktiviteter og statistikk.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-900">42</p>
                  <p className="text-sm text-blue-700">Oppgaver fullført</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-900">15</p>
                  <p className="text-sm text-green-700">Aktive prosjekter</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" variant="padded">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">💬 Meldinger</h3>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  5 uleste
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-gray-900">Kari Nordmann</p>
                  <p className="text-sm text-gray-600">Hei! Kan du sjekke dokumentet jeg sendte?</p>
                  <p className="text-xs text-gray-500 mt-1">2 minutter siden</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Ole Hansen</p>
                  <p className="text-sm text-gray-600">Møtet i morgen er flyttet til kl. 14:00</p>
                  <p className="text-xs text-gray-500 mt-1">1 time siden</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" variant="padded">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">🔔 Varslinger</h3>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  NY
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900">Nytt system-oppdatering</p>
                  <p className="text-sm text-yellow-800">En ny versjon er tilgjengelig for nedlasting</p>
                  <p className="text-xs text-yellow-700 mt-1">5 minutter siden</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">Backup fullført</p>
                  <p className="text-sm text-green-800">Automatisk backup ble utført med suksess</p>
                  <p className="text-xs text-green-700 mt-1">30 minutter siden</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" variant="padded">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">👤 Min profil</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  KN
                </div>
                <div>
                  <p className="font-medium text-gray-900">Kari Nordmann</p>
                  <p className="text-sm text-gray-600">kari@example.com</p>
                  <p className="text-xs text-gray-500">Medlem siden mars 2024</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <button className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Rediger profil
                </button>
                <button className="h-10 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Innstillinger
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

// Advanced Tabs Example
export const AdvancedTabsExample: Story = {
  render: () => {
    const tabItems: TabItem[] = [
      {
        value: 'overview',
        label: 'Oversikt',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Prosjektoversikt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Aktive oppgaver</h4>
                <p className="text-2xl font-bold text-blue-800">23</p>
                <p className="text-sm text-blue-700">+3 siden i går</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">Fullførte oppgaver</h4>
                <p className="text-2xl font-bold text-green-800">156</p>
                <p className="text-sm text-green-700">89% av totalt</p>
              </div>
            </div>
          </div>
        ),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        value: 'team',
        label: 'Team',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Teammedlemmer</h3>
            <div className="space-y-3">
              {['Kari Nordmann', 'Ole Hansen', 'Lisa Andersen'].map((name, index) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">
                      {index === 0 ? 'Prosjektleder' : index === 1 ? 'Utvikler' : 'Designer'}
                    </p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-green-400' : 'bg-gray-300'
                  }`} title={index === 0 ? 'Pålogget' : 'Frakoblet'}></span>
                </div>
              ))}
            </div>
          </div>
        ),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        badge: '5',
      },
      {
        value: 'reports',
        label: 'Rapporter',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Prosjektrapporter</h3>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Ukentlig rapport</h4>
                  <span className="text-xs text-gray-500">Uke 46, 2024</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Oversikt over fremgang og utfordringer denne uken.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Last ned PDF →
                </button>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Månedlig sammendrag</h4>
                  <span className="text-xs text-gray-500">November 2024</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Detaljert analyse av månedens resultater og KPI-er.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Vis rapport →
                </button>
              </div>
            </div>
          </div>
        ),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        value: 'settings',
        label: 'Innstillinger',
        content: (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Prosjektinnstillinger</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prosjektnavn
                </label>
                <input
                  type="text"
                  defaultValue="Mitt fantastiske prosjekt"
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  rows={3}
                  defaultValue="En detaljert beskrivelse av prosjektet og dets mål."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">E-postvarslinger</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Offentlig synlig</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Automatisk backup</span>
                </label>
              </div>
            </div>
          </div>
        ),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ];

    return (
      <div className="w-full max-w-4xl">
        <AdvancedTabs
          items={tabItems}
          defaultValue="overview"
          variant="line"
          size="md"
          contentVariant="padded"
          ariaLabel="Prosjekt faner"
        />
      </div>
    );
  },
};

// Lazy Loading Tabs
export const LazyLoadingExample: Story = {
  render: () => {
    const [loadCount, setLoadCount] = useState(1);
    
    const heavyContent = (title: string, delay: number = 1000) => (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">
          Dette innholdet ble lastet lazy og simulerer en tung operasjon som tar {delay}ms.
        </p>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            ⚡ Lazy Loading Aktivert
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Innhold lastes kun når fanen blir aktivert første gang.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Data {index + 1}</p>
              <p className="text-xs text-gray-600">Simulert data load #{loadCount + index}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setLoadCount(prev => prev + 10)}
          className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Oppdater data
        </button>
      </div>
    );

    const lazyTabItems: TabItem[] = [
      {
        value: 'quick',
        label: 'Rask',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Rask lasting</h3>
            <p className="text-sm text-gray-600">
              Dette innholdet lastes umiddelbart og krever ingen tung prosessering.
            </p>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                ✅ Standard Lasting
              </p>
              <p className="text-xs text-green-700 mt-1">
                Lett innhold som alltid er tilgjengelig.
              </p>
            </div>
          </div>
        ),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        value: 'heavy1',
        label: 'Tung data 1',
        content: heavyContent('Tung Data Set 1', 1500),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        ),
      },
      {
        value: 'heavy2',
        label: 'Tung data 2',
        content: heavyContent('Tung Data Set 2', 2000),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        ),
      },
      {
        value: 'analytics',
        label: 'Analytikk',
        content: heavyContent('Analytikk Dashboard', 3000),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ];

    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900">Lazy Loading Demo</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Innhold i "tunge" faner lastes kun når du klikker på dem første gang.
            Åpne utviklerverktøy for å se nettverkstrafikk.
          </p>
        </div>
        
        <LazyTabs
          items={lazyTabItems}
          defaultValue="quick"
          variant="pills"
          size="md"
          contentVariant="card"
          lazy={true}
        />
      </div>
    );
  },
};

// Controlled Tabs with Hook
export const ControlledTabsWithHook: Story = {
  render: () => {
    const tabItems: TabItem[] = [
      {
        value: 'step1',
        label: 'Steg 1',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personlig informasjon</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornavn</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etternavn</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                <input type="email" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        ),
      },
      {
        value: 'step2',
        label: 'Steg 2',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Kontaktinformasjon</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
                <input type="tel" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poststed</label>
                  <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        value: 'step3',
        label: 'Steg 3',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Bekreftelse</h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Registrering fullført!</h4>
              <p className="text-sm text-green-800">
                Takk for at du registrerte deg. Vi har sendt en bekreftelse til din e-post.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Sammendrag:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Personlig informasjon registrert</li>
                <li>• Kontaktinformasjon lagret</li>
                <li>• E-postbekreftelse sendt</li>
              </ul>
            </div>
          </div>
        ),
      },
    ];
    
    const { activeTab, setActiveTab, activeTabItem, isActive } = useTabs({
      defaultValue: 'step1',
      items: tabItems,
      onChange: (value) => console.log('Tab changed to:', value),
    });
    
    const handleNext = () => {
      const currentIndex = tabItems.findIndex(item => item.value === activeTab);
      const nextIndex = Math.min(currentIndex + 1, tabItems.length - 1);
      setActiveTab(tabItems[nextIndex].value);
    };
    
    const handlePrevious = () => {
      const currentIndex = tabItems.findIndex(item => item.value === activeTab);
      const previousIndex = Math.max(currentIndex - 1, 0);
      setActiveTab(tabItems[previousIndex].value);
    };

    return (
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Registreringsprosess</h2>
          <p className="text-sm text-gray-600">Fyll ut informasjonen nedenfor trinn for trinn</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 mb-8">
          {tabItems.map((item, index) => (
            <React.Fragment key={item.value}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                isActive(item.value) ? 'bg-blue-600 text-white' :
                index < tabItems.findIndex(tab => isActive(tab.value)) ? 'bg-green-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < tabItems.length - 1 && (
                <div className={`w-12 h-0.5 ${
                  index < tabItems.findIndex(tab => isActive(tab.value)) ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList variant="line" size="md" className="mb-6">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                variant="line"
                size="md"
                disabled={item.value === 'step3' && !isActive('step3') && activeTab !== 'step2'}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} variant="default">
              {item.content}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={activeTab === 'step1'}
            className="h-10 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Forrige
          </button>
          
          <div className="text-sm text-gray-500">
            Steg {tabItems.findIndex(item => isActive(item.value)) + 1} av {tabItems.length}
          </div>
          
          <button
            onClick={handleNext}
            disabled={activeTab === 'step3'}
            className="h-10 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {activeTab === 'step2' ? 'Fullfør' : 'Neste'}
          </button>
        </div>
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
            <li>• Full tastaturnavigasjon med piltaster</li>
            <li>• ARIA-roller og tilstandsindikatorer</li>
            <li>• Fokusindikering for skjermlesere</li>
            <li>• Automatisk eller manuell aktivering</li>
            <li>• Høy kontrast og lesbarhet</li>
          </ul>
        </div>
        
        <Tabs defaultValue="keyboard" className="w-full" activationMode="manual">
          <TabsList variant="line" size="md">
            <TabsTrigger value="keyboard" variant="line" size="md">
              ⌨️ Tastatur
            </TabsTrigger>
            <TabsTrigger value="screen-reader" variant="line" size="md">
              🔊 Skjermleser
            </TabsTrigger>
            <TabsTrigger value="focus" variant="line" size="md">
              🎯 Fokus
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="keyboard" variant="padded">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tastaturnavigasjon</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Test følgende tastekombinasjoner:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Tab</kbd>
                    <span>Naviger til fane-listen</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">←→</kbd>
                    <span>Naviger mellom faner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Enter/Space</kbd>
                    <span>Aktiver valgt fane (manuell modus)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Tab</kbd>
                    <span>Naviger til faneinnhold</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="screen-reader" variant="padded">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Skjermleser-støtte</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Skjermlesere får følgende informasjon:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Antall faner og gjeldende posisjon</li>
                  <li>• Hvilken fane som er aktiv</li>
                  <li>• Orientering (horisontal/vertikal)</li>
                  <li>• Aktiveringsmodus (automatisk/manuell)</li>
                </ul>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-4">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ WCAG 2.1 AAA-kompatibel
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Følger alle retningslinjer for tilgjengelig tabbed interface
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="focus" variant="padded">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Fokushåndtering</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Komponenten håndterer fokus på følgende måte:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Synlig fokusindikator med høy kontrast</li>
                  <li>• Roving tabindex for optimal navigasjon</li>
                  <li>• Fokus bevares når fane aktiveres</li>
                  <li>• Logisk fokusrekkefølge</li>
                </ul>
                
                <div className="space-y-2 mt-4">
                  <button className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm">
                    Fokusérbar knapp 1
                  </button>
                  <button className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm ml-2">
                    Fokusérbar knapp 2
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    return (
      <div className="w-full max-w-2xl">
        <Tabs 
          defaultValue={args.defaultValue || 'tab1'}
          orientation={args.orientation}
          activationMode={args.activationMode}
          className="w-full"
        >
          <TabsList variant="default" size="md">
            <TabsTrigger value="tab1" variant="default" size="md">
              Fane 1
            </TabsTrigger>
            <TabsTrigger value="tab2" variant="default" size="md">
              Fane 2
            </TabsTrigger>
            <TabsTrigger value="tab3" variant="default" size="md">
              Fane 3
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tab1" variant="default">
            <div className="py-4 space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Interaktive Faner</h3>
              <p className="text-sm text-gray-600">
                Tilpass fane-komponenten ved hjelp av Storybook controls.
              </p>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Gjeldende innstillinger:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Orientering: {args.orientation || 'horizontal'}</li>
                  <li>• Aktiveringsmodus: {args.activationMode || 'automatic'}</li>
                  <li>• Standard fane: {args.defaultValue || 'tab1'}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tab2" variant="default">
            <div className="py-4">
              <h3 className="text-lg font-medium text-gray-900">Andre fane</h3>
              <p className="text-sm text-gray-600">
                Test hvordan innstillingene påvirker navigasjon og oppførsel.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tab3" variant="default">
            <div className="py-4">
              <h3 className="text-lg font-medium text-gray-900">Tredje fane</h3>
              <p className="text-sm text-gray-600">
                Utforsk de forskjellige konfigurasjonene og deres effekter.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
  args: {
    orientation: 'horizontal',
    activationMode: 'automatic',
    defaultValue: 'tab1',
  },
};