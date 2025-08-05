import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NSMBadge } from '@/components/ui/nsm-badge';
import { cn } from '@/lib/utils';

interface PlatformOption {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
}

interface AIAssistantPanelProps {
  readonly className?: string;
  readonly onGenerate?: (config: GenerationConfig) => void;
}

interface GenerationConfig {
  readonly prompt: string;
  readonly platform: string;
  readonly nsmClassification: string;
  readonly features: string[];
}

const platforms: readonly PlatformOption[] = [
  { id: 'nextjs', name: 'Next.js', icon: '▲', color: 'text-black dark:text-white' },
  { id: 'react', name: 'React', icon: '⚛️', color: 'text-cyan-500' },
  { id: 'vue', name: 'Vue', icon: '🟢', color: 'text-green-500' },
  { id: 'angular', name: 'Angular', icon: '🔴', color: 'text-red-600' },
  { id: 'svelte', name: 'Svelte', icon: '🟠', color: 'text-orange-500' },
  { id: 'electron', name: 'Electron', icon: '🖥️', color: 'text-blue-600' },
  { id: 'react-native', name: 'React Native', icon: '📱', color: 'text-purple-600' }
];

const features = [
  { id: 'typescript', name: 'TypeScript', checked: true },
  { id: 'tailwind', name: 'Tailwind CSS', checked: true },
  { id: 'cva', name: 'CVA Architecture', checked: true },
  { id: 'ssr', name: 'Server Components', checked: false },
  { id: 'api', name: 'API Routes', checked: false },
  { id: 'auth', name: 'Authentication', checked: false },
  { id: 'db', name: 'Database Models', checked: false },
  { id: 'bankid', name: 'BankID Integration', checked: false },
  { id: 'altinn', name: 'Altinn Integration', checked: false }
];

export function AIAssistantPanel({ className, onGenerate }: AIAssistantPanelProps): JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('nextjs');
  const [nsmLevel, setNsmLevel] = useState<'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET'>('OPEN');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(features.filter(f => f.checked).map(f => f.id))
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFeatureToggle = useCallback((featureId: string) => {
    setSelectedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !onGenerate) return;

    setIsGenerating(true);
    try {
      await onGenerate({
        prompt: prompt.trim(),
        platform: selectedPlatform,
        nsmClassification: nsmLevel,
        features: Array.from(selectedFeatures)
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedPlatform, nsmLevel, selectedFeatures, onGenerate]);

  const characterCount = useMemo(() => prompt.length, [prompt]);
  const maxCharacters = 5000;

  return (
    <Card className={cn("p-6 lg:p-8 space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">AI Assistant - Natural Language to Production Code</h2>
        <p className="text-muted-foreground">
          Describe what you want to build, and I'll generate production-ready code with Norwegian compliance.
        </p>
      </div>

      {/* Natural Language Input */}
      <div className="space-y-2">
        <label htmlFor="ai-prompt" className="text-sm font-medium">
          Natural Language Input
        </label>
        <div className="relative">
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a comprehensive user management system with:&#10;- Norwegian BankID authentication&#10;- NSM RESTRICTED security classification&#10;- Full CRUD operations with data tables&#10;- GDPR compliant data handling&#10;- Accessible forms with WCAG AAA compliance&#10;- Real-time validation and error handling"
            className="w-full min-h-[200px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Describe your project requirements"
            maxLength={maxCharacters}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {characterCount}/{maxCharacters} chars
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Selection */}
        <div className="space-y-3">
          <h3 className="font-medium">Platform</h3>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  selectedPlatform === platform.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <input
                  type="radio"
                  name="platform"
                  value={platform.id}
                  checked={selectedPlatform === platform.id}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="sr-only"
                />
                <span className={cn("text-2xl", platform.color)} aria-hidden="true">
                  {platform.icon}
                </span>
                <span className="font-medium">{platform.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-medium">Features</h3>
          <div className="space-y-2">
            {features.map((feature) => (
              <label
                key={feature.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedFeatures.has(feature.id)}
                  onChange={() => handleFeatureToggle(feature.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{feature.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="space-y-3">
          <h3 className="font-medium">Compliance</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border">
              <label className="text-sm font-medium mb-2 block">
                NSM Classification:
              </label>
              <select
                value={nsmLevel}
                onChange={(e) => setNsmLevel(e.target.value as any)}
                className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="OPEN">OPEN - Public Data</option>
                <option value="RESTRICTED">RESTRICTED - Limited Access</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL - Sensitive</option>
                <option value="SECRET">SECRET - Classified</option>
              </select>
              <div className="mt-2">
                <NSMBadge classification={nsmLevel} size="sm" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.has('gdpr')}
                  onChange={() => handleFeatureToggle('gdpr')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">GDPR Compliance</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.has('wcag')}
                  onChange={() => handleFeatureToggle('wcag')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">WCAG AAA</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.has('bankid')}
                  onChange={() => handleFeatureToggle('bankid')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">BankID Ready</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.has('altinn')}
                  onChange={() => handleFeatureToggle('altinn')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Altinn Integration</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isGenerating}
        >
          Save Configuration
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isGenerating}
        >
          Preview Full Code
        </Button>
        <Button
          variant="norway"
          size="lg"
          className="flex-1 sm:flex-none sm:min-w-[200px]"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          loading={isGenerating}
        >
          🚀 Generate Project
        </Button>
      </div>
    </Card>
  );
}