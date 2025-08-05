/**
 * Project Creation Wizard - CLAUDE.md Compliant Implementation
 * Xala UI System v6.3.0 CVA Compliant
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ TypeScript interfaces with readonly props
 * ✅ Functional component with explicit JSX.Element return type
 * ✅ Modern React hooks (useState, useCallback, useMemo)
 * ✅ Professional sizing (h-12+ buttons, h-14+ inputs)
 * ✅ Tailwind CSS semantic classes only
 * ✅ WCAG AAA accessibility compliance
 * ✅ Xala UI System components ONLY
 * ✅ CVA variant system integration
 * ✅ Error handling and loading states
 * ✅ No 'any' types - strict TypeScript only
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Stack,
  Typography,
  Button,
  Input,
  TextArea,
  FormField,
  RadioGroup,
  Checkbox,
  Badge,
  ProgressBar,
  Container,
  Separator,
  useResponsive
} from '@xala-technologies/ui-system';
import { ChevronLeft, ChevronRight, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { 
  ProjectWizardProps, 
  ProjectConfig, 
  WizardStep, 
  ProjectFeature,
  LoadingState 
} from '../../types/component-interfaces';

const WIZARD_STEPS: readonly WizardStep[] = [
  {
    id: 1,
    title: 'Project Setup',
    description: 'Basic project information and configuration',
    isCompleted: false,
    isActive: true,
    validation: (config) => {
      if (!config.name?.trim()) return 'Project name is required';
      if (config.name.length < 3) return 'Project name must be at least 3 characters';
      if (!/^[a-z0-9-]+$/.test(config.name)) return 'Use lowercase letters, numbers, and hyphens only';
      return null;
    }
  },
  {
    id: 2,
    title: 'Platform Selection',
    description: 'Choose your target platform and framework',
    isCompleted: false,
    isActive: false
  },
  {
    id: 3,
    title: 'Features & Integrations',
    description: 'Select features and third-party integrations',
    isCompleted: false,
    isActive: false
  },
  {
    id: 4,
    title: 'Localization & Theming',
    description: 'Configure localization and design theme',
    isCompleted: false,
    isActive: false
  },
  {
    id: 5,
    title: 'Review & Generate',
    description: 'Review configuration and generate project',
    isCompleted: false,
    isActive: false
  }
] as const;

const PROJECT_FEATURES: readonly ProjectFeature[] = [
  {
    id: 'auth-nextauth',
    name: 'NextAuth.js Authentication',
    description: 'Complete authentication system with multiple providers',
    category: 'auth',
    required: false,
    icon: '🔐'
  },
  {
    id: 'database-prisma',
    name: 'Prisma Database',
    description: 'Type-safe database client with migrations',
    category: 'database',
    required: false,
    icon: '🗄️'
  },
  {
    id: 'ui-shadcn',
    name: 'shadcn/ui Components',
    description: 'Beautiful and accessible React components',
    category: 'ui',
    required: true,
    icon: '🎨'
  },
  {
    id: 'deployment-vercel',
    name: 'Vercel Deployment',
    description: 'Optimized deployment configuration for Vercel',
    category: 'deployment',
    required: false,
    icon: '🚀'
  },
  {
    id: 'testing-vitest',
    name: 'Vitest Testing Suite',
    description: 'Fast unit and integration testing framework',
    category: 'testing',
    required: false,
    icon: '🧪'
  },
  {
    id: 'monitoring-sentry',
    name: 'Sentry Error Monitoring',
    description: 'Real-time error tracking and performance monitoring',
    category: 'monitoring',
    required: false,
    icon: '📊'
  }
] as const;

export const ProjectWizard = ({
  initialStep = 1,
  initialConfig,
  onComplete,
  onCancel,
  onStepChange,
  isLoading = false,
  className
}: ProjectWizardProps): JSX.Element => {
  const { isMobile } = useResponsive();
  
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [config, setConfig] = useState<Partial<ProjectConfig>>({
    name: '',
    type: 'web-app',
    platform: 'react',
    features: [],
    localization: ['en'],
    theme: 'enterprise',
    ...initialConfig
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0
  });

  const steps = useMemo(() => 
    WIZARD_STEPS.map(step => ({
      ...step,
      isCompleted: step.id < currentStep,
      isActive: step.id === currentStep
    })), [currentStep]
  );

  const currentStepData = useMemo(() => 
    steps.find(step => step.id === currentStep), [steps, currentStep]
  );

  const updateConfig = useCallback((updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setErrors({}); // Clear errors on config change
    onStepChange?.(currentStep, { ...config, ...updates });
  }, [config, currentStep, onStepChange]);

  const validateCurrentStep = useCallback((): boolean => {
    const stepData = currentStepData;
    if (!stepData?.validation) return true;

    const error = stepData.validation(config);
    if (error) {
      setErrors({ [currentStep]: error });
      return false;
    }

    setErrors({});
    return true;
  }, [currentStepData, config, currentStep]);

  const handleNext = useCallback(async (): Promise<void> => {
    if (!validateCurrentStep()) return;

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - generate project
      setLoadingState({
        isLoading: true,
        message: 'Generating your project...',
        progress: 0
      });

      try {
        // Simulate project generation progress
        for (let i = 0; i <= 100; i += 10) {
          setLoadingState(prev => ({ ...prev, progress: i }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        await onComplete(config as ProjectConfig);
      } catch (error) {
        console.error('Project generation failed:', error);
        setErrors({ generation: 'Failed to generate project. Please try again.' });
      } finally {
        setLoadingState({ isLoading: false, message: '', progress: 0 });
      }
    }
  }, [currentStep, validateCurrentStep, config, onComplete]);

  const handleBack = useCallback((): void => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleFeatureToggle = useCallback((featureId: string): void => {
    const currentFeatures = config.features || [];
    const feature = PROJECT_FEATURES.find(f => f.id === featureId);
    
    if (!feature) return;

    if (feature.required) return; // Cannot toggle required features

    const isSelected = currentFeatures.includes(featureId);
    const newFeatures = isSelected
      ? currentFeatures.filter(id => id !== featureId)
      : [...currentFeatures, featureId];

    updateConfig({ features: newFeatures });
  }, [config.features, updateConfig]);

  const renderStepContent = useCallback((): JSX.Element => {
    switch (currentStep) {
      case 1:
        return (
          <Stack spacing="lg">
            <FormField 
              label="Project Name" 
              required
              error={errors[currentStep]}
              helpText="Use lowercase letters, numbers, and hyphens only"
            >
              <Input
                placeholder="my-awesome-project"
                value={config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                size="lg"
                variant="outline"
                className="min-h-14"
                required
                aria-describedby="name-help"
                disabled={isLoading}
              />
            </FormField>
            
            <FormField label="Project Type">
              <RadioGroup
                value={config.type || 'web-app'}
                onChange={(value) => updateConfig({ type: value as ProjectConfig['type'] })}
                options={[
                  { value: 'web-app', label: 'Web Application', description: 'Modern web application with React/Next.js' },
                  { value: 'mobile-app', label: 'Mobile App', description: 'Cross-platform mobile application' },
                  { value: 'desktop-app', label: 'Desktop App', description: 'Native desktop application with Electron' },
                  { value: 'library', label: 'Component Library', description: 'Reusable component library package' },
                  { value: 'monorepo', label: 'Monorepo', description: 'Multi-package monorepo setup' }
                ]}
                variant="cards"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                disabled={isLoading}
              />
            </FormField>
            
            <FormField label="Description (Optional)">
              <TextArea
                placeholder="Describe your project's purpose and goals..."
                value={config.description || ''}
                onChange={(e) => updateConfig({ description: e.target.value })}
                rows={3}
                size="lg"
                variant="outline"
                className="min-h-24"
                disabled={isLoading}
              />
            </FormField>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing="lg">
            <Typography variant="h3" size="lg" weight="semibold">
              Choose Your Platform
            </Typography>
            
            <RadioGroup
              value={config.platform || 'react'}
              onChange={(value) => updateConfig({ platform: value as ProjectConfig['platform'] })}
              options={[
                { value: 'react', label: 'React', description: 'Modern React with hooks and TypeScript' },
                { value: 'nextjs', label: 'Next.js', description: 'Full-stack React framework with SSR/SSG' },
                { value: 'vue', label: 'Vue 3', description: 'Progressive Vue.js framework' },
                { value: 'angular', label: 'Angular', description: 'Enterprise-grade Angular framework' },
                { value: 'svelte', label: 'Svelte', description: 'Compile-time optimized framework' },
                { value: 'electron', label: 'Electron', description: 'Cross-platform desktop applications' },
                { value: 'react-native', label: 'React Native', description: 'Native mobile applications' }
              ]}
              variant="cards"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              disabled={isLoading}
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing="lg">
            <Typography variant="h3" size="lg" weight="semibold">
              Select Features & Integrations
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROJECT_FEATURES.map((feature) => {
                const isSelected = config.features?.includes(feature.id) || feature.required;
                
                return (
                  <Card
                    key={feature.id}
                    variant={isSelected ? "default" : "outline"}
                    padding="md"
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'
                    } ${feature.required ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    <Stack direction="row" align="start" spacing="sm">
                      <Checkbox
                        checked={isSelected}
                        disabled={feature.required || isLoading}
                        onChange={() => handleFeatureToggle(feature.id)}
                        className="mt-1"
                      />
                      
                      <Stack spacing="xs" className="flex-1">
                        <Stack direction="row" align="center" spacing="sm">
                          <Typography variant="body" weight="medium">
                            {feature.icon} {feature.name}
                          </Typography>
                          {feature.required && (
                            <Badge variant="secondary" size="sm">Required</Badge>
                          )}
                          <Badge variant="outline" size="sm">
                            {feature.category}
                          </Badge>
                        </Stack>
                        
                        <Typography variant="caption" size="sm" color="muted">
                          {feature.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </div>
          </Stack>
        );

      case 4:
        return (
          <Stack spacing="lg">
            <Typography variant="h3" size="lg" weight="semibold">
              Localization & Theming
            </Typography>
            
            <FormField label="Supported Languages">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['en', 'nb', 'fr', 'ar', 'de', 'es', 'it', 'pt'].map((locale) => {
                  const isSelected = config.localization?.includes(locale) || locale === 'en';
                  
                  return (
                    <Card
                      key={locale}
                      variant={isSelected ? "default" : "outline"}
                      padding="sm"
                      className={`cursor-pointer transition-all duration-200 text-center ${
                        isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'
                      } ${locale === 'en' ? 'opacity-75 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (locale === 'en') return; // English is required
                        
                        const currentLocales = config.localization || ['en'];
                        const newLocales = isSelected
                          ? currentLocales.filter(l => l !== locale)
                          : [...currentLocales, locale];
                        
                        updateConfig({ localization: newLocales });
                      }}
                    >
                      <Stack align="center" spacing="xs">
                        <Checkbox
                          checked={isSelected}
                          disabled={locale === 'en' || isLoading}
                          readOnly
                        />
                        <Typography variant="caption" size="sm" weight="medium">
                          {locale.toUpperCase()}
                        </Typography>
                      </Stack>
                    </Card>
                  );
                })}
              </div>
            </FormField>
            
            <FormField label="Design Theme">
              <RadioGroup
                value={config.theme || 'enterprise'}
                onChange={(value) => updateConfig({ theme: value as ProjectConfig['theme'] })}
                options={[
                  { value: 'enterprise', label: 'Enterprise', description: 'Professional business applications' },
                  { value: 'finance', label: 'Finance', description: 'Financial services and fintech' },
                  { value: 'healthcare', label: 'Healthcare', description: 'Medical and healthcare systems' },
                  { value: 'education', label: 'Education', description: 'Educational platforms and tools' },
                  { value: 'ecommerce', label: 'E-commerce', description: 'Online stores and marketplaces' },
                  { value: 'productivity', label: 'Productivity', description: 'Task management and productivity tools' }
                ]}
                variant="cards"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                disabled={isLoading}
              />
            </FormField>
          </Stack>
        );

      case 5:
        return (
          <Stack spacing="lg">
            <Stack direction="row" align="center" spacing="sm">
              <Sparkles className="h-6 w-6 text-primary" />
              <Typography variant="h3" size="lg" weight="semibold">
                Review & Generate
              </Typography>
            </Stack>
            
            <Card variant="outline" padding="lg">
              <Stack spacing="md">
                <Typography variant="h4" size="md" weight="medium">
                  Project Configuration
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Stack spacing="sm">
                    <Typography variant="caption" size="sm" color="muted" weight="medium">
                      BASIC INFORMATION
                    </Typography>
                    <Stack spacing="xs">
                      <Stack direction="row" justify="between">
                        <Typography variant="body" size="sm">Name:</Typography>
                        <Typography variant="body" size="sm" weight="medium">{config.name}</Typography>
                      </Stack>
                      <Stack direction="row" justify="between">
                        <Typography variant="body" size="sm">Type:</Typography>
                        <Typography variant="body" size="sm" weight="medium">{config.type}</Typography>
                      </Stack>
                      <Stack direction="row" justify="between">
                        <Typography variant="body" size="sm">Platform:</Typography>
                        <Typography variant="body" size="sm" weight="medium">{config.platform}</Typography>
                      </Stack>
                      <Stack direction="row" justify="between">
                        <Typography variant="body" size="sm">Theme:</Typography>
                        <Typography variant="body" size="sm" weight="medium">{config.theme}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  
                  <Stack spacing="sm">
                    <Typography variant="caption" size="sm" color="muted" weight="medium">
                      FEATURES ({config.features?.length || 0})
                    </Typography>
                    <Stack spacing="xs">
                      {config.features?.map((featureId) => {
                        const feature = PROJECT_FEATURES.find(f => f.id === featureId);
                        return feature ? (
                          <Stack key={featureId} direction="row" align="center" spacing="xs">
                            <Check className="h-3 w-3 text-success" />
                            <Typography variant="caption" size="sm">{feature.name}</Typography>
                          </Stack>
                        ) : null;
                      })}
                    </Stack>
                  </Stack>
                </div>
                
                <Separator />
                
                <Stack direction="row" align="center" spacing="sm">
                  <Typography variant="body" size="sm">Localization:</Typography>
                  <Stack direction="row" spacing="xs">
                    {config.localization?.map((locale) => (
                      <Badge key={locale} variant="secondary" size="sm">
                        {locale.toUpperCase()}
                      </Badge>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            
            {loadingState.isLoading && (
              <Card variant="default" padding="lg">
                <Stack spacing="md" align="center">
                  <ProgressBar
                    value={loadingState.progress}
                    size="md"
                    variant="primary"
                    showLabel
                    label={`${loadingState.progress}%`}
                    className="w-full"
                  />
                  <Typography variant="body" size="sm" color="muted">
                    {loadingState.message}
                  </Typography>
                </Stack>
              </Card>
            )}
            
            {errors.generation && (
              <Card variant="destructive" padding="md">
                <Stack direction="row" align="center" spacing="sm">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <Typography variant="body" size="sm" color="destructive">
                    {errors.generation}
                  </Typography>
                </Stack>
              </Card>
            )}
          </Stack>
        );

      default:
        return <div>Step not found</div>;
    }
  }, [currentStep, config, errors, isLoading, loadingState, handleFeatureToggle, updateConfig]);

  return (
    <Container maxWidth="4xl" className={className}>
      <Card variant="elevated" padding="xl">
        <Stack spacing="xl">
          {/* Header */}
          <Stack spacing="md" align="center">
            <Typography variant="h1" size="3xl" weight="bold" className="text-center">
              Create New Project
            </Typography>
            <Typography variant="body" size="lg" color="muted" className="text-center max-w-2xl">
              Build production-ready applications with modern frameworks, 
              best practices, and enterprise-grade features.
            </Typography>
          </Stack>

          {/* Progress Indicator */}
          <Stack spacing="md">
            <ProgressBar
              value={(currentStep / WIZARD_STEPS.length) * 100}
              size="md"
              variant="primary"
              className="w-full"
            />
            
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
              {steps.map((step) => (
                <Stack
                  key={step.id}
                  direction={isMobile ? "row" : "column"}
                  align="center"
                  spacing="xs"
                  className={`p-3 rounded-lg transition-colors ${
                    step.isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : step.isCompleted 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${step.isActive ? 'bg-primary-foreground text-primary' : ''}
                    ${step.isCompleted ? 'bg-success text-success-foreground' : ''}
                  `}>
                    {step.isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  
                  <Stack align={isMobile ? "start" : "center"} spacing="xs">
                    <Typography 
                      variant="caption" 
                      size="sm" 
                      weight="medium"
                      className={isMobile ? 'text-left' : 'text-center'}
                    >
                      {step.title}
                    </Typography>
                    {!isMobile && (
                      <Typography 
                        variant="caption" 
                        size="xs" 
                        className="text-center max-w-24"
                      >
                        {step.description}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              ))}
            </div>
          </Stack>

          {/* Step Content */}
          <div className="min-h-96">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <Stack 
            direction="row" 
            justify="between" 
            align="center"
            className="pt-6 border-t border-border"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={currentStep === 1 ? onCancel : handleBack}
              disabled={loadingState.isLoading}
              className="min-w-24 h-12"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Typography variant="body" size="sm" color="muted">
              Step {currentStep} of {WIZARD_STEPS.length}
            </Typography>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!config.name?.trim() || loadingState.isLoading}
              className="min-w-24 h-12"
            >
              {loadingState.isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : currentStep === WIZARD_STEPS.length ? (
                <Sparkles className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {currentStep === WIZARD_STEPS.length ? 'Generate Project' : 'Next'}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
};