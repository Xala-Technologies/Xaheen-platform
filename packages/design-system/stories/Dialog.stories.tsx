/**
 * Dialog Component Stories
 * Showcasing all variants, sizes, and accessibility features
 * WCAG AAA compliant examples with Norwegian text and NSM classifications
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  ConfirmationDialog,
} from '../registry/components/dialog/dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Layout/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal dialog component with full accessibility support, keyboard navigation, and NSM classification variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls dialog visibility',
    },
    modal: {
      control: 'boolean',
      description: 'Whether dialog is modal',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Dialog
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Åpne dialog
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Standard dialog</DialogTitle>
            <DialogDescription>
              Dette er en standard dialog med alle grunnleggende komponenter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Her kan du legge til innhold som trengs i dialogen. Dette kan være skjemaer,
              informasjon eller andre interaktive elementer.
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <button className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                Avbryt
              </button>
            </DialogClose>
            <button className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Bekreft
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

// Size Variants
export const SizeVariants: Story = {
  render: () => {
    const [activeDialog, setActiveDialog] = useState<string | null>(null);
    
    const sizes = [
      { key: 'sm', label: 'Liten (max-w-sm)', size: 'sm' as const },
      { key: 'md', label: 'Medium (max-w-md)', size: 'md' as const },
      { key: 'lg', label: 'Stor (max-w-lg)', size: 'lg' as const },
      { key: 'xl', label: 'Ekstra stor (max-w-xl)', size: 'xl' as const },
      { key: '2xl', label: '2X stor (max-w-2xl)', size: '2xl' as const },
      { key: 'full', label: 'Full (95vw/95vh)', size: 'full' as const },
    ];
    
    return (
      <div className="flex flex-wrap gap-4">
        {sizes.map(({ key, label, size }) => (
          <React.Fragment key={key}>
            <button
              onClick={() => setActiveDialog(key)}
              className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              {label}
            </button>
            
            <Dialog open={activeDialog === key} onOpenChange={(open) => !open && setActiveDialog(null)}>
              <DialogContent size={size}>
                <DialogHeader>
                  <DialogTitle>Dialog størrelse: {label}</DialogTitle>
                  <DialogDescription>
                    Denne dialogen viser {size} størrelsen.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Innholdet tilpasser seg dialogens størrelse automatisk.
                    Dette sikrer god brukeropplevelse på alle enheter.
                  </p>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <button className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                      Lukk
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// Variant Styles
export const VariantStyles: Story = {
  render: () => {
    const [activeDialog, setActiveDialog] = useState<string | null>(null);
    
    const variants = [
      { key: 'default', label: 'Standard', variant: 'default' as const },
      { key: 'elevated', label: 'Opphøyet', variant: 'elevated' as const },
      { key: 'alert', label: 'Advarsel', variant: 'alert' as const },
    ];
    
    return (
      <div className="flex gap-4">
        {variants.map(({ key, label, variant }) => (
          <React.Fragment key={key}>
            <button
              onClick={() => setActiveDialog(key)}
              className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              {label}
            </button>
            
            <Dialog open={activeDialog === key} onOpenChange={(open) => !open && setActiveDialog(null)}>
              <DialogContent variant={variant}>
                <DialogHeader>
                  <DialogTitle>{label} dialog</DialogTitle>
                  <DialogDescription>
                    Dette er en {label.toLowerCase()} variant av dialogen.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Hver variant har sin egen visuelle stil som passer til forskjellige bruksområder.
                  </p>
                </div>
                
                <DialogFooter>
                  <DialogClose />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </React.Fragment>
        ))}
      </div>
    );
  },
};

// NSM Classification Variants
export const NSMClassificationVariants: Story = {
  render: () => {
    const [activeDialog, setActiveDialog] = useState<string | null>(null);
    
    const classifications = [
      { key: 'OPEN', label: 'Åpen', color: 'text-green-700' },
      { key: 'RESTRICTED', label: 'Begrenset', color: 'text-yellow-700' },
      { key: 'CONFIDENTIAL', label: 'Konfidensiell', color: 'text-red-700' },
      { key: 'SECRET', label: 'Hemmelig', color: 'text-gray-700' },
    ] as const;
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          NSM (Nasjonal sikkerhetsmyndighet) klassifiseringsvisninger
        </div>
        
        <div className="flex flex-wrap gap-4">
          {classifications.map(({ key, label, color }) => (
            <React.Fragment key={key}>
              <button
                onClick={() => setActiveDialog(key)}
                className={`h-12 px-4 bg-white border-2 rounded-lg hover:bg-gray-50 transition-colors shadow-md ${color}`}
              >
                {label}
              </button>
              
              <Dialog open={activeDialog === key} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent nsmClassification={key}>
                  <DialogHeader>
                    <DialogTitle>NSM-klassifisert dialog</DialogTitle>
                    <DialogDescription>
                      Dette innholdet er klassifisert som {label.toLowerCase()} etter NSM-retningslinjer.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-3">
                    <div className={`p-4 rounded-lg border-l-4 ${
                      key === 'OPEN' ? 'border-l-green-500 bg-green-50' :
                      key === 'RESTRICTED' ? 'border-l-yellow-500 bg-yellow-50' :
                      key === 'CONFIDENTIAL' ? 'border-l-red-500 bg-red-50' :
                      'border-l-gray-500 bg-gray-50'
                    }`}>
                      <p className="text-sm font-medium">Klassifisering: {key}</p>
                      <p className="text-xs mt-1 text-gray-600">
                        Håndter i henhold til gjeldende sikkerhetsbestemmelser
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <button className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors">
                        Forstått
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
};

// Form Dialog Example
export const FormDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: '',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Skjema sendt:', formData);
      setOpen(false);
      setFormData({ name: '', email: '', message: '' });
    };
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Kontakt oss
          </button>
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Kontaktskjema</DialogTitle>
            <DialogDescription>
              Fyll ut skjemaet under så tar vi kontakt med deg så snart som mulig.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Navn *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Skriv inn ditt navn"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-post *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="din@epost.no"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Melding *
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                placeholder="Skriv din melding her..."
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                >
                  Avbryt
                </button>
              </DialogClose>
              <button
                type="submit"
                className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Send melding
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
};

// Confirmation Dialog Examples
export const ConfirmationDialogs: Story = {
  render: () => {
    const [activeConfirmation, setActiveConfirmation] = useState<string | null>(null);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveConfirmation('default')}
            className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Standard bekreftelse
          </button>
          
          <button
            onClick={() => setActiveConfirmation('destructive')}
            className="h-12 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            Destruktiv handling
          </button>
        </div>
        
        <ConfirmationDialog
          open={activeConfirmation === 'default'}
          onOpenChange={(open) => !open && setActiveConfirmation(null)}
          title="Bekreft handling"
          description="Er du sikker på at du vil fortsette? Denne handlingen kan ikke angres."
          confirmText="Ja, fortsett"
          cancelText="Avbryt"
          onConfirm={() => {
            console.log('Bekreftet standard handling');
            setActiveConfirmation(null);
          }}
        />
        
        <ConfirmationDialog
          open={activeConfirmation === 'destructive'}
          onOpenChange={(open) => !open && setActiveConfirmation(null)}
          title="Slett element"
          description="Dette vil permanent slette elementet og alle tilhørende data. Denne handlingen kan ikke angres."
          confirmText="Slett permanent"
          cancelText="Behold"
          variant="destructive"
          onConfirm={() => {
            console.log('Bekreftet sletting');
            setActiveConfirmation(null);
          }}
        />
      </div>
    );
  },
};

// Nested Dialogs Example
export const NestedDialogs: Story = {
  render: () => {
    const [parentOpen, setParentOpen] = useState(false);
    const [childOpen, setChildOpen] = useState(false);
    
    return (
      <>
        <button
          onClick={() => setParentOpen(true)}
          className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Åpne hoveddialog
        </button>
        
        <Dialog open={parentOpen} onOpenChange={setParentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hoveddialog</DialogTitle>
              <DialogDescription>
                Dette er den første dialogen. Du kan åpne en ny dialog ovenpå denne.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <button
                onClick={() => setChildOpen(true)}
                className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Åpne underdialog
              </button>
            </div>
            
            <DialogFooter>
              <DialogClose />
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={childOpen} onOpenChange={setChildOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Underdialog</DialogTitle>
              <DialogDescription>
                Dette er en dialog som åpner ovenpå den forrige dialogen.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Dialogen håndterer fokus og tastaturnavigasjon korrekt selv med
                flere lag med dialoger.
              </p>
            </div>
            
            <DialogFooter>
              <DialogClose />
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <li>• ESC-tasten lukker dialogen</li>
            <li>• Fokus blir fanget inne i dialogen</li>
            <li>• Klikk utenfor lukker dialogen</li>
            <li>• ARIA-etiketter for skjermlesere</li>
            <li>• Fokus returneres til utløser ved lukking</li>
          </ul>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Test tilgjengelighet
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tilgjengelig dialog</DialogTitle>
              <DialogDescription>
                Prøv å navigere med tastatur og test tilgjengelighetsfunksjonene.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <button className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                Fokuser knapp 1
              </button>
              <button className="h-12 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                Fokuser knapp 2
              </button>
              <input
                type="text"
                placeholder="Test fokus på input"
                className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <button className="h-12 px-6 rounded-lg border border-border bg-background hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Lukk (eller trykk ESC)
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            Interaktiv dialog
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interaktiv dialog</DialogTitle>
            <DialogDescription>
              Tilpass denne dialogen ved å bruke Storybook controls.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Bruk kontrollene i Storybook for å teste forskjellige konfigurasjoner
              av dialog-komponenten.
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  args: {
    open: false,
    modal: true,
  },
};