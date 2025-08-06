/**
 * Progress Component Stories
 * Linear, circular, and stepper progress indicators
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { 
  Progress,
  CircularProgress,
  Stepper,
  type ProgressProps,
  type StepData
} from '../registry/components/progress/progress';
import { Button } from '../registry/components/button/button';

// Sample step data for stepper examples
const sampleSteps: readonly StepData[] = [
  {
    id: 'step1',
    label: 'Personopplysninger',
    description: 'Grunnleggende informasjon om deg',
    optional: false
  },
  {
    id: 'step2',
    label: 'Adresse',
    description: 'Din bostedsadresse',
    optional: false
  },
  {
    id: 'step3',
    label: 'Verifisering',
    description: 'Bekreft din identitet',
    optional: false
  },
  {
    id: 'step4',
    label: 'Preferanser',
    description: 'Velg dine innstillinger',
    optional: true
  },
  {
    id: 'step5',
    label: 'Fullført',
    description: 'Registreringen er klar',
    optional: false
  }
];

const onboardingSteps: readonly StepData[] = [
  {
    id: 'welcome',
    label: 'Velkommen',
    description: 'Introduksjon til systemet',
    status: 'completed'
  },
  {
    id: 'profile',
    label: 'Profil',
    description: 'Sett opp din profil',
    status: 'completed'
  },
  {
    id: 'security',
    label: 'Sikkerhet',
    description: 'Sikkerhetsnivå og tilganger',
    status: 'active'
  },
  {
    id: 'preferences',
    label: 'Innstillinger',
    description: 'Tilpass systemet',
    status: 'pending'
  },
  {
    id: 'complete',
    label: 'Ferdig',
    description: 'Alt er klart',
    status: 'pending'
  }
];

const meta: Meta<typeof Progress> = {
  title: 'Data Display/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'warning', 'success', 'info'],
      description: 'Progress visual variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Progress bar size'
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)'
    },
    max: {
      control: 'number',
      description: 'Maximum value'
    },
    showLabel: {
      control: 'boolean',
      description: 'Show progress label'
    },
    striped: {
      control: 'boolean',
      description: 'Show striped pattern'
    },
    animated: {
      control: 'boolean',
      description: 'Animate progress bar'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Show indeterminate progress'
    }
  }
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    value: 60,
    showLabel: true,
    ariaLabel: 'Fremdrift for oppgave'
  }
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    ariaLabel: 'Laster innhold'
  }
};

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
    label: 'Opplasting fullført',
    ariaLabel: 'Opplasting fremdrift'
  }
};

// Variant Examples
export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Standard varianter</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Standard (60%)</div>
            <Progress value={60} showLabel />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Suksess (85%)</div>
            <Progress value={85} variant="success" showLabel />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Advarsel (45%)</div>
            <Progress value={45} variant="warning" showLabel />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Feil (25%)</div>
            <Progress value={25} variant="destructive" showLabel />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">Info (70%)</div>
            <Progress value={70} variant="info" showLabel />
          </div>
        </div>
      </div>
    </div>
  )
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Liten (SM)</div>
          <Progress value={60} size="sm" showLabel />
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-2">Medium (MD) - Standard</div>
          <Progress value={60} size="md" showLabel />
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-2">Stor (LG)</div>
          <Progress value={60} size="lg" showLabel />
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-2">Ekstra stor (XL)</div>
          <Progress value={60} size="xl" showLabel />
        </div>
      </div>
    </div>
  )
};

// Animated Progress
export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (isRunning && progress < 100) {
        interval = setInterval(() => {
          setProgress(prev => {
            const next = prev + Math.random() * 10;
            if (next >= 100) {
              setIsRunning(false);
              return 100;
            }
            return next;
          });
        }, 200);
      }

      return () => clearInterval(interval);
    }, [isRunning, progress]);

    const handleStart = () => {
      setProgress(0);
      setIsRunning(true);
    };

    const handleReset = () => {
      setProgress(0);
      setIsRunning(false);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Nedlasting ({Math.round(progress)}%)
            </div>
            <Progress 
              value={progress} 
              animated 
              showLabel 
              ariaLabel="Nedlastingsfremdrift"
            />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Stripet animasjon
            </div>
            <Progress 
              value={progress} 
              striped 
              animated 
              variant="info"
              showLabel 
            />
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Indeterminate loading
            </div>
            <Progress 
              indeterminate={isRunning} 
              variant="success"
              ariaLabel="Laster data"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleStart} disabled={isRunning}>
            {isRunning ? 'Pågår...' : 'Start nedlasting'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            Tilbakestill
          </Button>
        </div>
      </div>
    );
  }
};

// Circular Progress
export const CircularProgressExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Størelser</h3>
        <div className="flex items-center gap-8">
          <div className="text-center space-y-3">
            <CircularProgress value={60} size="sm" showLabel />
            <div className="text-sm text-muted-foreground">Liten</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={60} size="md" showLabel />
            <div className="text-sm text-muted-foreground">Medium</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={60} size="lg" showLabel />
            <div className="text-sm text-muted-foreground">Stor</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={60} size="xl" showLabel />
            <div className="text-sm text-muted-foreground">Ekstra stor</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Varianter</h3>
        <div className="flex items-center gap-8">
          <div className="text-center space-y-3">
            <CircularProgress value={85} variant="success" size="lg" showLabel />
            <div className="text-sm text-muted-foreground">Suksess</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={45} variant="warning" size="lg" showLabel />
            <div className="text-sm text-muted-foreground">Advarsel</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={25} variant="destructive" size="lg" showLabel />
            <div className="text-sm text-muted-foreground">Feil</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress value={70} variant="info" size="lg" showLabel />
            <div className="text-sm text-muted-foreground">Info</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Indeterminate</h3>
        <div className="flex items-center gap-8">
          <div className="text-center space-y-3">
            <CircularProgress indeterminate size="lg" />
            <div className="text-sm text-muted-foreground">Laster...</div>
          </div>
          
          <div className="text-center space-y-3">
            <CircularProgress indeterminate variant="success" size="lg" />
            <div className="text-sm text-muted-foreground">Behandler...</div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Stepper Examples
export const StepperExamples: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(2);
    const [verticalStep, setVerticalStep] = useState(2);

    return (
      <div className="space-y-12">
        <div>
          <h3 className="text-lg font-semibold mb-6">Horisontal stepper</h3>
          <div className="space-y-6">
            <Stepper
              steps={sampleSteps}
              currentStep={currentStep}
              onStepClick={(step) => setCurrentStep(step)}
              ariaLabel="Registreringsprosess"
            />
            
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                variant="outline"
                disabled={currentStep === 0}
              >
                Forrige
              </Button>
              <Button 
                onClick={() => setCurrentStep(Math.min(sampleSteps.length - 1, currentStep + 1))}
                disabled={currentStep === sampleSteps.length - 1}
              >
                Neste
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-6">Vertikal stepper</h3>
          <div className="flex gap-8">
            <div className="flex-1 max-w-md">
              <Stepper
                steps={sampleSteps}
                currentStep={verticalStep}
                orientation="vertical"
                onStepClick={(step) => setVerticalStep(step)}
                ariaLabel="Vertikal registreringsprosess"
              />
            </div>
            
            <div className="flex-1">
              <div className="p-6 bg-card rounded-lg border">
                <h4 className="text-lg font-semibold mb-4">
                  Steg {verticalStep + 1}: {sampleSteps[verticalStep].label}
                </h4>
                <p className="text-muted-foreground mb-6">
                  {sampleSteps[verticalStep].description}
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setVerticalStep(Math.max(0, verticalStep - 1))}
                    variant="outline"
                    disabled={verticalStep === 0}
                  >
                    Forrige
                  </Button>
                  <Button 
                    onClick={() => setVerticalStep(Math.min(sampleSteps.length - 1, verticalStep + 1))}
                    disabled={verticalStep === sampleSteps.length - 1}
                  >
                    {verticalStep === sampleSteps.length - 1 ? 'Fullfør' : 'Neste'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-6">Stepper varianter</h3>
          <div className="space-y-8">
            <div>
              <div className="text-sm text-muted-foreground mb-4">Nummerert</div>
              <Stepper
                steps={sampleSteps.slice(0, 4)}
                currentStep={1}
                variant="numbered"
                size="lg"
              />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-4">Prikker</div>
              <Stepper
                steps={sampleSteps.slice(0, 4)}
                currentStep={2}
                variant="dots"
                size="md"
              />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-4">Uten etiketter</div>
              <Stepper
                steps={sampleSteps.slice(0, 4)}
                currentStep={1}
                showLabels={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Onboarding Flow Example
export const OnboardingFlow: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(2);

    const getStepContent = (stepIndex: number) => {
      switch (stepIndex) {
        case 0:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold">Velkommen til systemet!</h4>
              <p className="text-muted-foreground">Du har fullført den første delen av oppsettet.</p>
            </div>
          );
        case 1:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold">Profilen din er konfigurert</h4>
              <p className="text-muted-foreground">Grunnleggende profilinformasjon er lagret.</p>
            </div>
          );
        case 2:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold">Sikkerhet og tilganger</h4>
              <p className="text-muted-foreground">Konfigurer ditt sikkerhetsnivå og tilgangspermisjonene.</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-700">
                  Vi anbefaler å aktivere to-faktor autentisering for økt sikkerhet.
                </p>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold">Innstillinger</h4>
              <p className="text-muted-foreground">Tilpass systemet etter dine preferanser.</p>
            </div>
          );
        case 4:
          return (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold">Oppsettet er fullført!</h4>
              <p className="text-muted-foreground">Du er nå klar til å bruke systemet.</p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Systemoppsett</h3>
          <p className="text-muted-foreground">Fullfør disse stegene for å komme i gang</p>
        </div>
        
        <Stepper
          steps={onboardingSteps}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          ariaLabel="Systemoppsett fremdrift"
        />
        
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-card rounded-lg border">
            {getStepContent(currentStep)}
            
            <div className="flex justify-center gap-3 mt-8">
              <Button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                variant="outline"
                disabled={currentStep === 0}
              >
                Forrige
              </Button>
              <Button 
                onClick={() => setCurrentStep(Math.min(onboardingSteps.length - 1, currentStep + 1))}
                disabled={currentStep === onboardingSteps.length - 1}
              >
                {currentStep === onboardingSteps.length - 1 ? 'Fullfør' : 'Neste'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// File Upload Progress
export const FileUploadProgress: Story = {
  render: () => {
    const [uploads, setUploads] = useState([
      { id: 1, name: 'dokument.pdf', progress: 85, status: 'uploading' },
      { id: 2, name: 'bilde.jpg', progress: 100, status: 'completed' },
      { id: 3, name: 'rapport.docx', progress: 23, status: 'error' },
      { id: 4, name: 'presentasjon.pptx', progress: 0, status: 'pending' }
    ]);

    const getVariant = (status: string) => {
      switch (status) {
        case 'completed': return 'success';
        case 'error': return 'destructive';
        case 'uploading': return 'info';
        default: return 'default';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'completed': return 'Fullført';
        case 'error': return 'Feil';
        case 'uploading': return 'Laster opp';
        case 'pending': return 'Venter';
        default: return 'Ukjent';
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Filopplasting</h3>
          <p className="text-sm text-muted-foreground">Fremdrift for alle filer</p>
        </div>
        
        <div className="space-y-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="p-4 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{upload.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getStatusText(upload.status)} • {upload.progress}%
                    </div>
                  </div>
                </div>
                
                {upload.status === 'uploading' && (
                  <CircularProgress 
                    value={upload.progress} 
                    size="sm"
                    variant={getVariant(upload.status)}
                  />
                )}
                
                {upload.status === 'completed' && (
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
                
                {upload.status === 'error' && (
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <Progress 
                value={upload.progress} 
                variant={getVariant(upload.status)}
                animated={upload.status === 'uploading'}
                ariaLabel={`${upload.name} opplastingsfremdrift`}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button variant="outline">
            Legg til flere filer
          </Button>
        </div>
      </div>
    );
  }
};

// Playground
export const Playground: Story = {
  args: {
    value: 60,
    variant: 'default',
    size: 'md',
    showLabel: true,
    striped: false,
    animated: false,
    indeterminate: false
  }
};