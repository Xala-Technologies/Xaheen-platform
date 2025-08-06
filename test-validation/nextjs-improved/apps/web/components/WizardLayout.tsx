




'use client';

/**
 * WizardLayout Component - Xala UI System Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ❌ NO raw HTML elements (div, span, p, h1-h6, button, input, etc.) in pages
 * ✅ ONLY semantic components from @xaheen-ai/design-system
 * ❌ NO hardcoded styling (no style=placeholder, no arbitrary Tailwind values)
 * ✅ MANDATORY design token usage for all colors, spacing, typography
 * ✅ Enhanced 8pt Grid System - all spacing in 8px increments
 * ✅ WCAG 2.2 AAA compliance for accessibility
 * ❌ NO hardcoded user-facing text - ALL text must use t() function
 * ✅ MANDATORY localization: English, Norwegian Bokmål, French, Arabic
 * ✅ Explicit TypeScript return types (no 'any' types)
 * ✅ SOLID principles and component composition
 * ✅ Maximum 200 lines per file, 20 lines per function
 * 
 * Features:
 * - Multi-step wizard interface
 * - Step validation and navigation
 * - Progress tracking
 * - Conditional step logic
 * - Data persistence between steps
 * - Norwegian onboarding patterns
 * - Accessibility-first navigation
 */


import React from 'react';
import { useTranslation } from 'next-intl';
import {
  Box,
  Stack,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Progress,
  Badge,
  Icon,
  Separator,
  Alert,
  Stepper,
  StepperItem,
  StepperSeparator,
  ScrollArea
} from '@xaheen-ai/design-system';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  X,
  Save
} from 'lucide-react';
import BaseLayout from './BaseLayout';

interface WizardLayoutProps {
  title: string;
  description?: string;
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: (data: any) => void;
  onCancel?: () => void;
  data?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  loading?: boolean;
  error?: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  children: React.ReactNode;
  locale?: string;
  theme?: 'light' | 'dark' | 'high-contrast';
}

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType;
  required?: boolean;
  skippable?: boolean;
  completed?: boolean;
  error?: boolean;
  condition?: (data: Record<string, any>) => boolean;
}

import React from 'react';
import { useTranslation } from 'next-intl';
import {
  Box,
  Stack,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Progress,
  Badge,
  Icon,
  Separator,
  Alert,
  Stepper,
  StepperItem,
  StepperSeparator,
  ScrollArea
} from '@xaheen-ai/design-system';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  X,
  Save
} from 'lucide-react';
import BaseLayout from './BaseLayout';


/**
 * WizardLayout - Multi-step wizard interface
 * Optimized for complex onboarding and setup processes
 */

export default function WizardLayout({
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onCancel,
  data = {},
  onDataChange,
  loading = false,
  error,
  canGoBack = true,
  canGoNext = true,
  showProgress = true,
  allowSkip = false,
  children,
  locale = 'en',
  theme = 'light'
}: WizardLayoutProps): React.ReactElement {

export default function WizardLayout({
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onCancel,
  data = {},
  onDataChange,
  loading = false,
  error,
  canGoBack = true,
  canGoNext = true,
  showProgress = true,
  allowSkip = false,
  children,
  locale = 'en',
  theme = 'light'
}) {

  const { t } = useTranslation();

  // Filter steps based on conditions
  const visibleSteps = React.useMemo(() => {
    return steps.filter(step => !step.condition || step.condition(data));
  }, [steps, data]);

  const currentStepData = visibleSteps[currentStep - 1];
  const totalSteps = visibleSteps.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handlePrevious = (): void => {
    if (currentStep > 1 && canGoBack) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = (): void => {
    if (currentStep < totalSteps && canGoNext) {
      onStepChange(currentStep + 1);
    }
  };

  const handleSkip = (): void => {
    if (allowSkip && currentStepData?.skippable) {
      handleNext();
    }
  };

  const handleComplete = (): void => {
    if (currentStep === totalSteps) {
      onComplete(data);
    }
  };

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' | 'error' => {
    const step = visibleSteps[stepIndex];
    if (step.error) return 'error';
    if (stepIndex + 1 < currentStep || step.completed) return 'completed';
    if (stepIndex + 1 === currentStep) return 'current';
    return 'pending';
  };

  const renderWizardHeader = (): React.ReactElement => (
    <Stack direction="vertical" spacing="6" marginBottom="8">
      <Stack direction="horizontal" align="center" justify="between">
        <Stack direction="vertical" spacing="2">
          <Typography variant="heading" size="2xl" weight="bold">
            {t(title, title)}
          </Typography>
          {description && (
            <Typography variant="body" size="lg" color="muted">
              {t(description, description)}
            </Typography>
          )}
        </Stack>

        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={loading}
          >
            <Icon component={X} size="sm" />
            {t('wizard.exit', 'Exit')}
          </Button>
        )}
      </Stack>

      {/* Progress Bar */}
      {showProgress && (
        <Stack direction="vertical" spacing="3">
          <Stack direction="horizontal" align="center" justify="between">
            <Typography variant="body" size="sm" weight="medium">
              {t('wizard.progress', 'Step {current} of {total}', {
                current: currentStep,
                total: totalSteps,
              })}
            </Typography>
            <Typography variant="body" size="sm" color="muted">
              {Math.round(progressPercentage)}% {t('wizard.complete', 'complete')}
            </Typography>
          </Stack>
          <Progress value={progressPercentage} max={100} />
        </Stack>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <Icon component={AlertCircle} size="sm" />
          <Typography variant="body">
            {t(error, error)}
          </Typography>
        </Alert>
      )}
    </Stack>
  );

  const renderStepIndicator = (): React.ReactElement => (
    <Card marginBottom="6">
      <CardContent padding="6">
        <Stepper orientation="horizontal" currentStep={currentStep - 1}>
          {visibleSteps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <React.Fragment key={step.id}>
                <StepperItem
                  completed={status === 'completed'}
                  active={status === 'current'}
                  error={status === 'error'}
                  onClick={handleClick}
                  disabled={loading}
                >
                  <Stack direction="vertical" align="center" spacing="2">
                    <Box
                      width="10"
                      height="10"
                      borderRadius="full"
                      backgroundColor={
                        status === 'completed'
                          ? 'success'
                          : status === 'current'
                          ? 'primary'
                          : status === 'error'
                          ? 'destructive'
                          : 'muted'
                      }
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {status === 'completed' ? (
                        <Icon component={Check} size="sm" color="success-foreground" />
                      ) : status === 'error' ? (
                        <Icon component={AlertCircle} size="sm" color="destructive-foreground" />
                      ) : step.icon ? (
                        <Icon component={step.icon} size="sm" />
                      ) : (
                        <Typography
                          variant="body"
                          size="sm"
                          weight="medium"
                          color={status === 'current' ? 'primary-foreground' : 'muted-foreground'}
                        >
                          {index + 1}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="vertical" align="center" spacing="1">
                      <Typography
                        variant="body"
                        size="sm"
                        weight="medium"
                        color={status === 'current' ? 'foreground' : 'muted'}
                      >
                        {t(step.title, step.title)}
                      </Typography>
                      {step.description && (
                        <Typography variant="caption" size="xs" color="muted" textAlign="center">
                          {t(step.description, step.description)}
                        </Typography>
                      )}
                      
                      <Stack direction="horizontal" align="center" spacing="1">
                        {step.required && (
                          <Badge variant="secondary" size="xs">
                            {t('wizard.required', 'Required')}
                          </Badge>
                        )}
                        {step.skippable && (
                          <Badge variant="outline" size="xs">
                            {t('wizard.optional', 'Optional')}
                          </Badge>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </StepperItem>

                {index < visibleSteps.length - 1 && (
                  <StepperSeparator
                    completed={getStepStatus(index) === 'completed'}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Stepper>
      </CardContent>
    </Card>
  );

  const renderCurrentStepInfo = (): React.ReactElement => (
    <Card marginBottom="6">
      <CardContent padding="6">
        <Stack direction="horizontal" align="center" spacing="4">
          {currentStepData?.icon && (
            <Box
              width="12"
              height="12"
              borderRadius="md"
              backgroundColor="primary"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon component={currentStepData.icon} size="md" color="primary-foreground" />
            </Box>
          )}

          <Stack direction="vertical" spacing="1" flex="1">
            <Typography variant="heading" size="lg" weight="medium">
              {t(currentStepData?.title || '', currentStepData?.title || '')}
            </Typography>
            {currentStepData?.description && (
              <Typography variant="body" size="md" color="muted">
                {t(currentStepData.description, currentStepData.description)}
              </Typography>
            )}
          </Stack>

          {currentStepData?.skippable && allowSkip && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={loading}
            >
              {t('wizard.skip', 'Skip')}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderWizardActions = (): React.ReactElement => (
    <Stack direction="horizontal" align="center" justify="between" spacing="4">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="md"
        onClick={handleClick}
        disabled={currentStep <= 1 || !canGoBack || loading}
      >
        <Icon component={ChevronLeft} size="sm" />
        {t('wizard.previous', 'Previous')}
      </Button>

      {/* Step Info */}
      <Typography variant="body" size="sm" color="muted">
        {t('wizard.stepInfo', 'Step {current} of {total}', {
          current: currentStep,
          total: totalSteps,
        })}
      </Typography>

      {/* Next/Complete Button */}
      {currentStep < totalSteps ? (
        <Button
          variant="primary"
          size="md"
          onClick={handleClick}
          disabled={!canGoNext || loading}
          loading={loading}
        >
          {t('wizard.next', 'Next')}
          <Icon component={ChevronRight} size="sm" />
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={handleClick}
          disabled={loading}
          loading={loading}
        >
          {loading ? t('wizard.completing', 'Completing...') : t('wizard.complete', 'Complete')}
        </Button>
      )}
    </Stack>
  );

  return (
    <BaseLayout locale={locale} theme={theme} enableCompliance={true}>
      <Container maxWidth="192" padding="6">
        <Stack direction="vertical" spacing="0">
          {renderWizardHeader()}
          {renderStepIndicator()}
          {renderCurrentStepInfo()}

          {/* Main Content */}
          <Card marginBottom="6">
            <CardContent padding="8">
              <ScrollArea height="120">
                {children}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent padding="6">
              {renderWizardActions()}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </BaseLayout>
  );
}


// Example usage:
/*
import WizardLayout from '@/layouts/WizardLayout';
import { User, Settings, CreditCard, Check } from 'lucide-react';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({});

  const steps = [
    {
      id: 'welcome',
      title: 'wizard.welcome.title',
      description: 'wizard.welcome.description',
      icon: User,
      required: true,
    },
    {
      id: 'profile',
      title: 'wizard.profile.title',
      description: 'wizard.profile.description',
      icon: Settings,
      required: true,
    },
    {
      id: 'billing',
      title: 'wizard.billing.title',
      description: 'wizard.billing.description',
      icon: CreditCard,
      skippable: true,
      condition: (data) => data.accountType === 'premium',
    },
    {
      id: 'complete',
      title: 'wizard.complete.title',
      description: 'wizard.complete.description',
      icon: Check,
      required: true,
    },
  ];

  return (
    <WizardLayout
      title="onboarding.title"
      description="onboarding.description"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={handleComplete}
      onCancel={handleCancel}
      data={wizardData}
      onDataChange={setWizardData}
      allowSkip={true}
      locale="nb"
    >
      {currentStep === 1 && <WelcomeStep />}
      {currentStep === 2 && <ProfileStep />}
      {currentStep === 3 && <BillingStep />}
      {currentStep === 4 && <CompleteStep />}
    </WizardLayout>
  );
}
*/

