/**
 * Popover Component Stories
 * Showcasing all placements, sizes, and interactive features
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverClose,
} from '../registry/components/popover/popover';

const meta: Meta<typeof Popover> = {
  title: 'Layout/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Contextual popover component with flexible positioning, collision detection, and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
      description: 'Popover placement relative to trigger',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the popover',
    },
    open: {
      control: 'boolean',
      description: 'Controls popover visibility',
    },
    modal: {
      control: 'boolean',
      description: 'Whether popover is modal',
    },
    triggerAsChild: {
      control: 'boolean',
      description: 'Render trigger as child element',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Popover
export const Default: Story = {
  render: () => {
    return (
      <Popover
        trigger={
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Åpne popover
          </button>
        }
        placement="bottom"
        size="md"
      >
        <PopoverContent>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Standard Popover</h3>
            <p className="text-sm text-gray-600">
              Dette er en standard popover med grunnleggende innhold.
              Perfekt for kontekstuelle handlinger og informasjon.
            </p>
            <button className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Handling
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
};

// Placement Variants
export const PlacementVariants: Story = {
  render: () => {
    const placements = [
      { key: 'top', label: 'Topp' },
      { key: 'top-start', label: 'Topp start' },
      { key: 'top-end', label: 'Topp slutt' },
      { key: 'bottom', label: 'Bunn' },
      { key: 'bottom-start', label: 'Bunn start' },
      { key: 'bottom-end', label: 'Bunn slutt' },
      { key: 'left', label: 'Venstre' },
      { key: 'right', label: 'Høyre' },
    ] as const;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
        {placements.map(({ key, label }) => (
          <Popover
            key={key}
            trigger={
              <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm">
                {label}
              </button>
            }
            placement={key}
            size="sm"
          >
            <PopoverContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Plassering: {label}</p>
                <p className="text-xs text-gray-600">
                  Popover fra {label.toLowerCase()}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    );
  },
};

// Size Variants
export const SizeVariants: Story = {
  render: () => {
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
          <Popover
            key={key}
            trigger={
              <button className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                {label}
              </button>
            }
            placement="bottom"
            size={size}
          >
            <PopoverContent>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Størrelse: {label}</h3>
                <p className="text-sm text-gray-600">
                  Dette popover viser {size} størrelsen. Innholdet tilpasser seg
                  automatisk til den valgte størrelsen.
                </p>
                {size === 'xl' || size === 'full' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800">Funksjon 1</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-800">Funksjon 2</p>
                    </div>
                  </div>
                ) : null}
                <button className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Test knapp
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    );
  },
};

// User Profile Popover
export const UserProfilePopover: Story = {
  render: () => {
    return (
      <div className="flex items-center gap-4">
        <Popover
          trigger={
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                OA
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Ola Andersen</p>
                <p className="text-xs text-gray-500">ola@example.com</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          }
          placement="bottom-start"
          size="md"
          triggerAsChild={true}
        >
          <PopoverContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  OA
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ola Andersen</p>
                  <p className="text-sm text-gray-500">ola@example.com</p>
                  <p className="text-xs text-green-600">Pålogget</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Min profil</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Innstillinger</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Hjelp</span>
                </button>
              </nav>
              
              <div className="pt-3 border-t border-gray-200">
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Logg ut</span>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

// Action Menu Popover
export const ActionMenuPopover: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dokument.pdf</h3>
              <p className="text-sm text-gray-500">Opprettet 15. nov 2024</p>
            </div>
            
            <Popover
              trigger={
                <button className="w-8 h-8 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              }
              placement="bottom-end"
              size="sm"
            >
              <PopoverContent>
                <nav className="space-y-1">
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm">Vis</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm">Rediger</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm">Del</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Last ned</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-1" />
                  
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Slett</span>
                  </button>
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    );
  },
};

// Form Field Popover
export const FormFieldPopover: Story = {
  render: () => {
    const [password, setPassword] = useState('');
    
    const getPasswordStrength = (pwd: string) => {
      if (pwd.length < 4) return { strength: 0, label: 'Svært svakt', color: 'text-red-600' };
      if (pwd.length < 6) return { strength: 1, label: 'Svakt', color: 'text-orange-600' };
      if (pwd.length < 8) return { strength: 2, label: 'OK', color: 'text-yellow-600' };
      if (pwd.length < 12) return { strength: 3, label: 'Sterkt', color: 'text-green-600' };
      return { strength: 4, label: 'Meget sterkt', color: 'text-green-700' };
    };
    
    const { strength, label, color } = getPasswordStrength(password);
    
    return (
      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-post
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className="h-12 w-full px-4 pr-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              placeholder="din@epost.no"
            />
            
            <Popover
              trigger={
                <button className="absolute right-3 top-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              }
              placement="top"
              size="sm"
            >
              <PopoverContent>
                <div className="space-y-2">
                  <p className="text-xs font-medium">E-post format</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Må inneholde @</li>
                    <li>• Gyldig domene</li>
                    <li>• Ingen mellomrom</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Passord
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full px-4 pr-10 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              placeholder="Skriv inn passord"
            />
            
            <Popover
              trigger={
                <button className="absolute right-3 top-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </button>
              }
              placement="right"
              size="md"
            >
              <PopoverContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Passordstyrke</p>
                    <p className={`text-sm ${color}`}>{label}</p>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= strength ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-2">Krav:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className={password.length >= 8 ? 'text-green-600' : ''}>
                        • Minst 8 tegn
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        • En stor bokstav
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        • Et tall
                      </li>
                      <li className={/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''}>
                        • Et spesialtegn
                      </li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    );
  },
};

// Controlled Popover
export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('Dette er det første innholdet.');
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setOpen(!open)}
            className={`h-12 px-6 rounded-lg transition-colors shadow-md ${
              open 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {open ? 'Lukk popover' : 'Åpne popover'}
          </button>
          
          <button
            onClick={() => setContent(content.includes('første') ? 'Nytt innhold er nå synlig!' : 'Dette er det første innholdet.')}
            className="h-12 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Endre innhold
          </button>
        </div>
        
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={<span></span>}
          placement="bottom"
          size="md"
        >
          <PopoverContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Kontrollert Popover</h3>
                <PopoverClose onClick={() => setOpen(false)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </PopoverClose>
              </div>
              
              <p className="text-sm text-gray-600">{content}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setOpen(false)}
                  className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Lukk
                </button>
                <button className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Handling
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

// Accessibility Demonstration
export const AccessibilityDemo: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Tilgjengelighetsfunksjoner</h3>
          <ul className="text-sm text-blue-800 mt-2 space-y-1">
            <li>• ESC-tasten lukker popover</li>
            <li>• ARIA-etiketter for skjermlesere</li>
            <li>• Kollisjondeteksjon og automatisk posisjonering</li>
            <li>• Fokus håndtering</li>
            <li>• Klikk utenfor lukker popover (modal modus)</li>
          </ul>
        </div>
        
        <div className="flex gap-4">
          <Popover
            trigger={
              <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Test tilgjengelighet
              </button>
            }
            placement="bottom"
            size="md"
            modal={true}
          >
            <PopoverContent>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Tilgjengelig Popover</h3>
                <p className="text-sm text-gray-600">
                  Test tastaturnavigasjon og ESC-tasten for å lukke.
                </p>
                
                <button className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Fokuser knapp
                </button>
                
                <input
                  type="text"
                  placeholder="Test fokus"
                  className="h-10 w-full px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-sm"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open || false);
    
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Interaktivt popover
          </button>
        }
        placement={args.placement || 'bottom'}
        size={args.size || 'md'}
        modal={args.modal}
        triggerAsChild={args.triggerAsChild}
      >
        <PopoverContent>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Interaktivt Popover</h3>
            <p className="text-sm text-gray-600">
              Tilpass dette popover ved å bruke Storybook controls.
            </p>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Plassering: {args.placement || 'bottom'}
                <br />
                Størrelse: {args.size || 'md'}
                <br />
                Modal: {args.modal !== false ? 'Ja' : 'Nei'}
              </p>
            </div>
            
            <button className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Test knapp
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
  args: {
    open: false,
    placement: 'bottom',
    size: 'md',
    modal: false,
    triggerAsChild: false,
  },
};