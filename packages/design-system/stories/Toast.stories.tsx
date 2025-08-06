/**
 * Toast Component Stories
 * Showcasing notification toasts with all positioning and variants
 * WCAG AAA compliant examples with Norwegian text and full accessibility features
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ToastProvider, useToast, useToastActions } from '../registry/components/toast/toast';

// Demo component to interact with toasts
const ToastDemo: React.FC<{
  readonly position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  readonly maxToasts?: number;
}> = ({ position = 'top-right', maxToasts = 5 }) => {
  const { addToast, removeToast, clearAllToasts, toasts, setPosition } = useToast();
  const { success, error, warning, info, promise } = useToastActions();

  const handleBasicToast = () => {
    addToast({
      title: 'Standard varsling',
      description: 'Dette er en grunnleggende toast-melding.',
      variant: 'default'
    });
  };

  const handleSuccessToast = () => {
    success('Operasjon fullført', 'Endringene dine er lagret og aktivert.');
  };

  const handleErrorToast = () => {
    error('Feil oppstod', 'Kunne ikke lagre endringene. Prøv igjen senere.');
  };

  const handleWarningToast = () => {
    warning('Advarsel', 'BankID-sesjonen utløper om 5 minutter.');
  };

  const handleInfoToast = () => {
    info('Viktig informasjon', 'Systemvedlikehold planlagt i morgen kl. 02:00.');
  };

  const handleActionToast = () => {
    addToast({
      title: 'Handlingsvarsel',
      description: 'Klikk på handlingen for å fullføre prosessen.',
      variant: 'info',
      action: {
        label: 'Fullfør',
        onClick: () => {
          success('Fullført', 'Handlingen ble utført.');
        }
      }
    });
  };

  const handlePersistentToast = () => {
    addToast({
      title: 'Vedvarende varsling',
      description: 'Denne meldingen forblir til du lukker den manuelt.',
      variant: 'warning',
      persistent: true
    });
  };

  const handlePromiseToast = () => {
    const mockApiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Data lastet') : reject(new Error('Nettverksfeil'));
      }, 2000);
    });

    promise(mockApiCall, {
      loading: 'Laster data...',
      success: 'Data lastet vellykket!',
      error: 'Kunne ikke laste data.'
    });
  };

  const handleLongMessage = () => {
    addToast({
      title: 'Detaljert varsling',
      description: 'Dette er en lang beskrivelse som demonstrerer hvordan toast-komponenten håndterer større mengder tekst og ombryter innholdet på en elegant måte.',
      variant: 'info',
      duration: 8000
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Toast Kontroller</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <button 
            onClick={handleBasicToast}
            className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Standard Toast
          </button>
          
          <button 
            onClick={handleSuccessToast}
            className="h-12 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Suksess
          </button>
          
          <button 
            onClick={handleErrorToast}
            className="h-12 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Feil
          </button>
          
          <button 
            onClick={handleWarningToast}
            className="h-12 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            Advarsel
          </button>
          
          <button 
            onClick={handleInfoToast}
            className="h-12 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Info
          </button>
          
          <button 
            onClick={handleActionToast}
            className="h-12 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Med handling
          </button>
          
          <button 
            onClick={handlePersistentToast}
            className="h-12 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Vedvarende
          </button>
          
          <button 
            onClick={handlePromiseToast}
            className="h-12 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Promise Toast
          </button>
          
          <button 
            onClick={handleLongMessage}
            className="h-12 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
          >
            Lang melding
          </button>
        </div>
        
        <div className="flex gap-3 mb-6">
          <button 
            onClick={clearAllToasts}
            className="h-12 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Lukk alle ({toasts.length})
          </button>
        </div>
      </div>
      
      <div>
        <h4 className="text-base font-semibold mb-3">Posisjon</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`h-10 px-3 text-sm rounded-lg border transition-colors ${
                position === pos
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
            >
              {pos.replace('-', ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Wrapper component for Storybook
const ToastStoryWrapper: React.FC<{
  readonly position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  readonly maxToasts?: number;
  readonly children?: React.ReactNode;
}> = ({ position, maxToasts, children }) => (
  <ToastProvider position={position} maxToasts={maxToasts}>
    {children || <ToastDemo position={position} maxToasts={maxToasts} />}
  </ToastProvider>
);

const meta: Meta<typeof ToastStoryWrapper> = {
  title: 'Components/Toast',
  component: ToastStoryWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Professional toast notification system with positioning, animations, and accessibility features. Supports persistent toasts, actions, and promise tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'],
      description: 'Toast container position',
    },
    maxToasts: {
      control: 'number',
      min: 1,
      max: 20,
      description: 'Maximum number of toasts to show simultaneously',
    },
  },
} satisfies Meta<typeof ToastStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    position: 'top-right',
    maxToasts: 5,
  },
};

export const TopLeft: Story = {
  args: {
    position: 'top-left',
    maxToasts: 5,
  },
};

export const TopCenter: Story = {
  args: {
    position: 'top-center',
    maxToasts: 5,
  },
};

export const BottomRight: Story = {
  args: {
    position: 'bottom-right',
    maxToasts: 5,
  },
};

export const BottomCenter: Story = {
  args: {
    position: 'bottom-center',
    maxToasts: 5,
  },
};

// Toast Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastVariantsDemo />
    </ToastProvider>
  ),
};

const ToastVariantsDemo: React.FC = () => {
  const { success, error, warning, info, addToast } = useToastActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleShowVariants = () => {
    // Show all variants with slight delays
    setTimeout(() => addToast({
      title: 'Standard varsling',
      description: 'Grunnleggende informasjon til brukeren.',
      variant: 'default'
    }), 100);
    
    setTimeout(() => success('Operasjon fullført', 'Endringene er lagret.'), 300);
    setTimeout(() => info('Viktig oppdatering', 'Ny funksjonalitet tilgjengelig.'), 500);
    setTimeout(() => warning('Vær oppmerksom', 'Sesjonen utløper snart.'), 700);
    setTimeout(() => error('Noe gikk galt', 'Kunne ikke fullføre operasjonen.'), 900);
  };

  const handlePromiseExample = () => {
    setIsLoading(true);
    const mockOperation = new Promise((resolve, reject) => {
      setTimeout(() => {
        setIsLoading(false);
        Math.random() > 0.3 ? resolve('Suksess') : reject(new Error('Feil'));
      }, 2500);
    });

    // Using promise toast helper
    addToast({
      title: 'Laster data...',
      description: 'Henter informasjon fra serveren.',
      variant: 'info',
      persistent: true
    });

    mockOperation
      .then(() => success('Data lastet', 'Alle data er hentet vellykket.'))
      .catch(() => error('Lasting feilet', 'Kunne ikke hente data.'));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Toast Varianter</h3>
        <div className="flex gap-4">
          <button 
            onClick={handleShowVariants}
            className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Vis alle varianter
          </button>
          
          <button 
            onClick={handlePromiseExample}
            disabled={isLoading}
            className="h-12 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Laster...' : 'Promise eksempel'}
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tilgjengelige varianter:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Default:</strong> Standard informasjon (grå)</li>
          <li><strong>Success:</strong> Vellykkede operasjoner (grønn)</li>
          <li><strong>Warning:</strong> Advarsler og viktige meldinger (gul)</li>
          <li><strong>Error:</strong> Feilmeldinger og problemer (rød)</li>
          <li><strong>Info:</strong> Informative meldinger (blå)</li>
        </ul>
      </div>
    </div>
  );
};

// Enterprise Scenarios
export const EnterpriseScenarios: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <EnterpriseToastDemo />
    </ToastProvider>
  ),
};

const EnterpriseToastDemo: React.FC = () => {
  const { success, error, warning, info, addToast } = useToastActions();

  const scenarios = [
    {
      label: 'BankID Autentisering',
      handler: () => {
        addToast({
          title: 'BankID pålogging',
          description: 'Omdirigerer til BankID...',
          variant: 'info',
          duration: 2000
        });
        setTimeout(() => success('Innlogget', 'Velkommen tilbake!'), 2500);
      }
    },
    {
      label: 'Altinn Rapport',
      handler: () => {
        const reportId = `ALT-${Date.now()}`;
        addToast({
          title: 'Sender til Altinn',
          description: `Rapport ${reportId} er under behandling...`,
          variant: 'info',
          persistent: true
        });
        setTimeout(() => {
          success('Rapport sendt', `Rapport ${reportId} er levert til Altinn.`);
        }, 3000);
      }
    },
    {
      label: 'Sesjon Utløp',
      handler: () => {
        warning('Sesjon utløper snart', 'Du vil bli logget ut om 2 minutter. Lagre arbeidet ditt.');
        setTimeout(() => {
          error('Sesjon utløpt', 'Du har blitt logget ut av sikkerhetshensyn.');
        }, 5000);
      }
    },
    {
      label: 'Systemvedlikehold',
      handler: () => {
        addToast({
          title: 'Planlagt vedlikehold',
          description: 'Systemet vil være utilgjengelig fra 02:00-04:00 i natt.',
          variant: 'warning',
          duration: 10000,
          action: {
            label: 'Les mer',
            onClick: () => info('Vedlikehold info', 'Alle tjenester vil være midlertidig utilgjengelige.')
          }
        });
      }
    },
    {
      label: 'Dokumentsignering',
      handler: () => {
        addToast({
          title: 'Dokument signert',
          description: 'Kontrakten er signert og arkivert.',
          variant: 'success',
          action: {
            label: 'Last ned',
            onClick: () => info('Nedlasting', 'Dokumentet lastes ned...')
          }
        });
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bedriftsscenarier</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={scenario.handler}
              className="h-12 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Bedriftsfunksjoner:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• BankID integrasjon med status-oppdateringer</li>
          <li>• Altinn-rapportering med referansenumre</li>
          <li>• Sesjonsbehandling og sikkerhet</li>
          <li>• Systemvedlikehold og driftsmeldinger</li>
          <li>• Dokumenthåndtering og arkivering</li>
        </ul>
      </div>
    </div>
  );
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <AccessibilityDemo />
    </ToastProvider>
  ),
};

const AccessibilityDemo: React.FC = () => {
  const { success, error, addToast } = useToastActions();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">WCAG AAA Tilgjengelighetsfunksjoner</h3>
        
        <div className="space-y-4">
          <button 
            onClick={() => addToast({
              title: 'Skjermleservennlig',
              description: 'Denne toast-meldingen har riktig ARIA-merking og live regions.',
              variant: 'info'
            })}
            className="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test skjermleser
          </button>
          
          <button 
            onClick={() => success('Høy kontrast', 'Tekst og bakgrunn oppfyller WCAG AAA kontrastkrav.')}
            className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test kontrast
          </button>
          
          <button 
            onClick={() => error('Tastaturnavigasjon', 'Bruk Tab for å navigere til lukkeknappen, Enter/Space for å lukke.')}
            className="h-12 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Test tastatur
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Tilgjengelighetsfunksjoner:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <code>role="alert"</code> og <code>aria-live="polite"</code> for skjermlesere</li>
          <li>• Tastaturnavigasjon med Tab og Enter/Space</li>
          <li>• Høy kontrast for tekst og ikoner (WCAG AAA)</li>
          <li>• Fokusbehandling og -indikatorer</li>
          <li>• Semantiske HTML-elementer</li>
          <li>• Beskrivende aria-label på kontroller</li>
          <li>• Animasjoner som respekterer prefers-reduced-motion</li>
        </ul>
      </div>
    </div>
  );
};

// Position Comparison
export const PositionComparison: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <PositionDemo />
    </ToastProvider>
  ),
};

const PositionDemo: React.FC = () => {
  const { setPosition, addToast } = useToast();

  const positions = [
    { key: 'top-left' as const, label: 'Øvre venstre', color: 'bg-red-600' },
    { key: 'top-center' as const, label: 'Øvre senter', color: 'bg-orange-600' },
    { key: 'top-right' as const, label: 'Øvre høyre', color: 'bg-yellow-600' },
    { key: 'bottom-left' as const, label: 'Nedre venstre', color: 'bg-green-600' },
    { key: 'bottom-center' as const, label: 'Nedre senter', color: 'bg-blue-600' },
    { key: 'bottom-right' as const, label: 'Nedre høyre', color: 'bg-purple-600' },
  ];

  const handlePositionTest = (position: typeof positions[0]['key']) => {
    setPosition(position);
    addToast({
      title: `Toast fra ${positions.find(p => p.key === position)?.label}`,
      description: 'Denne meldingen vises i den valgte posisjonen.',
      variant: 'info'
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Toast Posisjoner</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {positions.map((position) => (
          <button
            key={position.key}
            onClick={() => handlePositionTest(position.key)}
            className={`h-16 px-4 ${position.color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
          >
            {position.label}
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Posisjonsguide:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Øvre høyre:</strong> Standard for de fleste applikasjoner</li>
          <li><strong>Øvre senter:</strong> Viktige systemmeldinger</li>
          <li><strong>Nedre høyre:</strong> Handlingsbekreftelser</li>
          <li><strong>Nedre senter:</strong> Mobiloptimaliserte layouter</li>
        </ul>
      </div>
    </div>
  );
};

// Interactive Playground
export const Playground: Story = {
  args: {
    position: 'top-right',
    maxToasts: 5,
  },
};