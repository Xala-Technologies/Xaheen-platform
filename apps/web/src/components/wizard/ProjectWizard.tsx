import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { cn } from '@/lib/utils';

interface WizardStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

const wizardSteps: readonly WizardStep[] = [
  { id: 'discovery', title: 'Project Discovery', description: 'Define your project', icon: '🎯' },
  { id: 'stack', title: 'Technology Stack', description: 'Choose frameworks', icon: '🛠️' },
  { id: 'features', title: 'Features', description: 'Configure capabilities', icon: '✨' },
  { id: 'infrastructure', title: 'Infrastructure', description: 'Setup deployment', icon: '☁️' },
  { id: 'preview', title: 'Review & Generate', description: 'Final confirmation', icon: '🚀' }
];

interface ProjectConfig {
  name: string;
  description: string;
  type: string;
  platform: string;
  features: string[];
  infrastructure: {
    provider: string;
    region: string;
    cicd: string;
  };
  compliance: {
    nsm: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
    gdpr: boolean;
    wcag: boolean;
    bankid: boolean;
    altinn: boolean;
  };
}

export function ProjectWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<ProjectConfig>({
    name: '',
    description: '',
    type: 'web-app',
    platform: 'nextjs',
    features: [],
    infrastructure: {
      provider: 'vercel',
      region: 'eu-north-1',
      cicd: 'github-actions'
    },
    compliance: {
      nsm: 'OPEN',
      gdpr: false,
      wcag: true,
      bankid: false,
      altinn: false
    }
  });

  const handleNext = useCallback(() => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const updateConfig = useCallback((updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const currentStepData = wizardSteps[currentStep];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {wizardSteps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                index === currentStep
                  ? "border-primary bg-primary text-white"
                  : index < currentStep
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-300 bg-white text-gray-500"
              )}
            >
              {index < currentStep ? (
                <span className="text-lg">✓</span>
              ) : (
                <span className="text-xl" aria-hidden="true">{step.icon}</span>
              )}
            </div>
            {index < wizardSteps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  index < currentStep ? "bg-primary" : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between">
        {wizardSteps.map((step, index) => (
          <div key={step.id} className="flex-1 text-center">
            <p className={cn(
              "text-sm font-medium",
              index === currentStep ? "text-primary" : "text-gray-500"
            )}>
              {step.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {currentStep === 0 && <StepDiscovery config={config} updateConfig={updateConfig} />}
        {currentStep === 1 && <StepTechnologyStack config={config} updateConfig={updateConfig} />}
        {currentStep === 2 && <StepFeatures config={config} updateConfig={updateConfig} />}
        {currentStep === 3 && <StepInfrastructure config={config} updateConfig={updateConfig} />}
        {currentStep === 4 && <StepPreview config={config} />}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" size="lg">
            Save Draft
          </Button>
          
          {currentStep === wizardSteps.length - 1 ? (
            <Button variant="norway" size="lg">
              🚀 Generate Project
            </Button>
          ) : (
            <Button variant="default" size="lg" onClick={handleNext}>
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function StepDiscovery({ config, updateConfig }: any): JSX.Element {
  const projectTypes = [
    { id: 'web-app', name: 'Web Application', icon: '🌐' },
    { id: 'mobile-app', name: 'Mobile Application', icon: '📱' },
    { id: 'desktop-app', name: 'Desktop Application', icon: '🖥️' },
    { id: 'library', name: 'Component Library', icon: '📚' },
    { id: 'monorepo', name: 'Monorepo', icon: '📦' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Project Discovery</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Project Name</label>
          <Input
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            placeholder="my-awesome-project"
            size="lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="A comprehensive project that..."
            className="w-full h-32 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">Project Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {projectTypes.map(type => (
              <label
                key={type.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                  config.type === type.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type.id}
                  checked={config.type === type.id}
                  onChange={(e) => updateConfig({ type: e.target.value })}
                  className="sr-only"
                />
                <span className="text-2xl" aria-hidden="true">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTechnologyStack({ config, updateConfig }: any): JSX.Element {
  const platforms = [
    { id: 'nextjs', name: 'Next.js', icon: '▲', recommended: true },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'vue', name: 'Vue', icon: '🟢' },
    { id: 'angular', name: 'Angular', icon: '🔴' },
    { id: 'svelte', name: 'Svelte', icon: '🟠' },
    { id: 'electron', name: 'Electron', icon: '🖥️' },
    { id: 'react-native', name: 'React Native', icon: '📱' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Technology Stack</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {platforms.map(platform => (
          <label
            key={platform.id}
            className={cn(
              "relative flex flex-col items-center gap-2 p-6 rounded-lg border-2 cursor-pointer transition-all",
              config.platform === platform.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            <input
              type="radio"
              name="platform"
              value={platform.id}
              checked={config.platform === platform.id}
              onChange={(e) => updateConfig({ platform: e.target.value })}
              className="sr-only"
            />
            {platform.recommended && (
              <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Recommended
              </span>
            )}
            <span className="text-4xl" aria-hidden="true">{platform.icon}</span>
            <span className="font-medium">{platform.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepFeatures({ config, updateConfig }: any): JSX.Element {
  const features = [
    { id: 'auth', name: 'Authentication', icon: '🔐' },
    { id: 'database', name: 'Database', icon: '💾' },
    { id: 'api', name: 'API Routes', icon: '🔌' },
    { id: 'ssr', name: 'Server Rendering', icon: '🖥️' },
    { id: 'pwa', name: 'Progressive Web App', icon: '📱' },
    { id: 'i18n', name: 'Internationalization', icon: '🌍' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'monitoring', name: 'Monitoring', icon: '📈' }
  ];

  const toggleFeature = (featureId: string) => {
    const currentFeatures = config.features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter((f: string) => f !== featureId)
      : [...currentFeatures, featureId];
    updateConfig({ features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Features Configuration</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map(feature => (
          <label
            key={feature.id}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
              config.features?.includes(feature.id)
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            <input
              type="checkbox"
              checked={config.features?.includes(feature.id) || false}
              onChange={() => toggleFeature(feature.id)}
              className="sr-only"
            />
            <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
            <span className="text-sm font-medium text-center">{feature.name}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Norwegian Compliance</h3>
        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <label className="flex items-center justify-between">
              <span className="font-medium">NSM Security Classification</span>
              <select
                value={config.compliance.nsm}
                onChange={(e) => updateConfig({ 
                  compliance: { ...config.compliance, nsm: e.target.value } 
                })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="OPEN">OPEN</option>
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
              </select>
            </label>
            <div className="mt-2">
              <NSMBadge classification={config.compliance.nsm} />
            </div>
          </div>
          
          {['gdpr', 'wcag', 'bankid', 'altinn'].map(comp => (
            <label key={comp} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <span className="font-medium">
                {comp === 'gdpr' && 'GDPR Compliance'}
                {comp === 'wcag' && 'WCAG AAA Accessibility'}
                {comp === 'bankid' && 'BankID Integration'}
                {comp === 'altinn' && 'Altinn Services'}
              </span>
              <input
                type="checkbox"
                checked={config.compliance[comp]}
                onChange={(e) => updateConfig({ 
                  compliance: { ...config.compliance, [comp]: e.target.checked } 
                })}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepInfrastructure({ config, updateConfig }: any): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Infrastructure Setup</h2>
      <p className="text-gray-600">Configure deployment and CI/CD pipeline</p>
    </div>
  );
}

function StepPreview({ config }: any): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Review & Generate</h2>
      <div className="bg-gray-50 p-6 rounded-lg">
        <pre className="text-sm">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}