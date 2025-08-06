/**
 * Sheet Component Stories
 * Showcasing all sides, sizes, and accessibility features
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
} from '../registry/components/sheet/sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Layout/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Slide-out panel component with full accessibility support, keyboard navigation, and multiple positioning options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls sheet visibility',
    },
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Which side to slide from',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the sheet',
    },
    modal: {
      control: 'boolean',
      description: 'Whether sheet is modal',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close when clicking overlay',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close when pressing escape',
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Sheet
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Åpne sheet
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="right"
          size="md"
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Standard Sheet</SheetTitle>
              <SheetDescription>
                Dette er en standard slide-out panel som kommer fra høyre side.
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sheet-komponenten er perfekt for navigasjonsmenyer, innstillinger,
                  eller annet innhold som ikke trenger en full modal dialog.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Funksjon 1</h4>
                    <p className="text-sm text-gray-600">Beskrivelse av funksjon</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Funksjon 2</h4>
                    <p className="text-sm text-gray-600">Beskrivelse av funksjon</p>
                  </div>
                </div>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose onClick={() => setOpen(false)}>
                Lukk
              </SheetClose>
              <button className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Lagre
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};

// Side Variants
export const SideVariants: Story = {
  render: () => {
    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    
    const sides = [
      { key: 'top', label: 'Topp', side: 'top' as const },
      { key: 'right', label: 'Høyre', side: 'right' as const },
      { key: 'bottom', label: 'Bunn', side: 'bottom' as const },
      { key: 'left', label: 'Venstre', side: 'left' as const },
    ];
    
    return (
      <div className="flex gap-4">
        {sides.map(({ key, label, side }) => (
          <React.Fragment key={key}>
            <button
              onClick={() => setActiveSheet(key)}
              className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Fra {label}
            </button>
            
            <Sheet
              open={activeSheet === key}
              onOpenChange={(open) => !open && setActiveSheet(null)}
              side={side}
              size="md"
            >
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet fra {label}</SheetTitle>
                  <SheetDescription>
                    Dette sheet glir inn fra {label.toLowerCase()} side av skjermen.
                  </SheetDescription>
                </SheetHeader>
                
                <SheetBody>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Hver side har sin egen animasjon og posisjonering for
                      optimal brukeropplevelse.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="w-4 h-4 bg-blue-600 rounded mb-2"></div>
                        <p className="text-xs text-blue-800">Element 1</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="w-4 h-4 bg-green-600 rounded mb-2"></div>
                        <p className="text-xs text-green-800">Element 2</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="w-4 h-4 bg-purple-600 rounded mb-2"></div>
                        <p className="text-xs text-purple-800">Element 3</p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="w-4 h-4 bg-yellow-600 rounded mb-2"></div>
                        <p className="text-xs text-yellow-800">Element 4</p>
                      </div>
                    </div>
                  </div>
                </SheetBody>
                
                <SheetFooter>
                  <SheetClose onClick={() => setActiveSheet(null)} />
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// Size Variants
export const SizeVariants: Story = {
  render: () => {
    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    
    const sizes = [
      { key: 'sm', label: 'Liten (max-w-xs)', size: 'sm' as const },
      { key: 'md', label: 'Medium (max-w-sm)', size: 'md' as const },
      { key: 'lg', label: 'Stor (max-w-md)', size: 'lg' as const },
      { key: 'xl', label: 'Ekstra stor (max-w-lg)', size: 'xl' as const },
      { key: 'full', label: 'Full bredde', size: 'full' as const },
    ];
    
    return (
      <div className="flex flex-wrap gap-4">
        {sizes.map(({ key, label, size }) => (
          <React.Fragment key={key}>
            <button
              onClick={() => setActiveSheet(key)}
              className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              {label}
            </button>
            
            <Sheet
              open={activeSheet === key}
              onOpenChange={(open) => !open && setActiveSheet(null)}
              side="right"
              size={size}
            >
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Størrelse: {label}</SheetTitle>
                  <SheetDescription>
                    Dette sheet viser {size} størrelsen.
                  </SheetDescription>
                </SheetHeader>
                
                <SheetBody>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Innholdet tilpasser seg automatisk til sheet-størrelsen.
                    </p>
                    
                    <div className="space-y-3">
                      {Array.from({ length: size === 'sm' ? 3 : size === 'full' ? 8 : 5 }).map((_, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">Element {i + 1}</p>
                              <p className="text-xs text-gray-500">Beskrivelse av element</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetBody>
                
                <SheetFooter>
                  <SheetClose onClick={() => setActiveSheet(null)} />
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// Navigation Sheet Example
export const NavigationSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    
    const navigationItems = [
      { key: 'dashboard', label: 'Dashbord', icon: '📊' },
      { key: 'projects', label: 'Prosjekter', icon: '📁' },
      { key: 'team', label: 'Team', icon: '👥' },
      { key: 'settings', label: 'Innstillinger', icon: '⚙️' },
      { key: 'help', label: 'Hjelp', icon: '❓' },
    ];
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Navigasjon
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="left"
          size="md"
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigasjon</SheetTitle>
              <SheetDescription>
                Hovednavigasjon for applikasjonen
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === item.key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.key && (
                      <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Aktiv seksjon</p>
                  <p className="text-sm text-blue-700">
                    {navigationItems.find(item => item.key === activeSection)?.label}
                  </p>
                </div>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose onClick={() => setOpen(false)}>
                Lukk navigasjon
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};

// Settings Sheet Example
export const SettingsSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      language: 'no',
      autoSave: true,
    });
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Innstillinger
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="right"
          size="lg"
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Applikasjonsinnstillinger</SheetTitle>
              <SheetDescription>
                Tilpass applikasjonen etter dine preferanser
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-4">Varslinger</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Push-varslinger</span>
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Automatisk lagring</span>
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-4">Utseende</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Mørkt tema</span>
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-4">Språk</h3>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="no">Norsk</option>
                    <option value="en">English</option>
                    <option value="sv">Svenska</option>
                    <option value="da">Dansk</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Gjeldende innstillinger</h4>
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(settings, null, 2)}
                  </pre>
                </div>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose onClick={() => setOpen(false)}>
                Avbryt
              </SheetClose>
              <button 
                onClick={() => {
                  console.log('Innstillinger lagret:', settings);
                  setOpen(false);
                }}
                className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Lagre innstillinger
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};

// Responsive Sheet Example
export const ResponsiveSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Åpne responsivt sheet
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="right"
          size="md"
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Responsivt Sheet</SheetTitle>
              <SheetDescription>
                Dette sheet tilpasser seg forskjellige skjermstørrelser
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Mobil</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Full bredde på små skjermer
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Desktop</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Begrenset bredde på store skjermer
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Responsive elementer</h4>
                  <div className="hidden md:block p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      Dette elementet vises kun på medium og større skjermer.
                    </p>
                  </div>
                  
                  <div className="block md:hidden p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      Dette elementet vises kun på små skjermer.
                    </p>
                  </div>
                </div>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose onClick={() => setOpen(false)} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• ESC-tasten lukker sheet</li>
            <li>• Fokus blir fanget inne i sheet</li>
            <li>• Klikk på overlay lukker sheet</li>
            <li>• ARIA-etiketter for skjermlesere</li>
            <li>• Fokus returneres til utløser ved lukking</li>
          </ul>
        </div>
        
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Test tilgjengelighet
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="right"
          size="md"
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Tilgjengelig Sheet</SheetTitle>
              <SheetDescription>
                Test tastaturnavigasjon og tilgjengelighetsfunksjoner
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Prøv å navigere med Tab/Shift+Tab og test ESC-tasten.
                </p>
                
                <button className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Fokuser knapp 1
                </button>
                
                <input
                  type="text"
                  placeholder="Test fokus på input"
                  className="h-12 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
                
                <button className="h-12 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  Fokuser knapp 2
                </button>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose 
                onClick={() => setOpen(false)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Lukk (eller trykk ESC)
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open || false);
    
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Interaktivt sheet
        </button>
        
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side={args.side || 'right'}
          size={args.size || 'md'}
          modal={args.modal}
          closeOnOverlayClick={args.closeOnOverlayClick}
          closeOnEscape={args.closeOnEscape}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Interaktivt Sheet</SheetTitle>
              <SheetDescription>
                Tilpass dette sheet ved å bruke Storybook controls
              </SheetDescription>
            </SheetHeader>
            
            <SheetBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Bruk kontrollene i Storybook for å teste forskjellige
                  konfigurasjoner av sheet-komponenten.
                </p>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Gjeldende innstillinger</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Side: {args.side || 'right'}</li>
                    <li>• Størrelse: {args.size || 'md'}</li>
                    <li>• Modal: {args.modal !== false ? 'Ja' : 'Nei'}</li>
                    <li>• Lukk på overlay: {args.closeOnOverlayClick !== false ? 'Ja' : 'Nei'}</li>
                    <li>• Lukk på ESC: {args.closeOnEscape !== false ? 'Ja' : 'Nei'}</li>
                  </ul>
                </div>
              </div>
            </SheetBody>
            
            <SheetFooter>
              <SheetClose onClick={() => setOpen(false)} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
  args: {
    open: false,
    side: 'right',
    size: 'md',
    modal: true,
    closeOnOverlayClick: true,
    closeOnEscape: true,
  },
};