/**
 * Progress Component - Professional Progress Indicators
 * CLAUDE.md Compliant: Professional styling and accessibility
 * WCAG AAA: Full keyboard navigation and screen reader support
 * CVA: Class Variance Authority for consistent styling
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// =============================================================================
// PROGRESS VARIANTS
// =============================================================================

const progressVariants = cva(
  [
    'relative overflow-hidden rounded-full bg-secondary',
    'transition-all duration-300 ease-in-out'
  ],
  {
    variants: {
      variant: {
        default: 'bg-secondary',
        destructive: 'bg-destructive/20',
        warning: 'bg-yellow-200 dark:bg-yellow-900/30',
        success: 'bg-green-200 dark:bg-green-900/30',
        info: 'bg-blue-200 dark:bg-blue-900/30'
      },
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6'
      },
      animated: {
        true: '',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animated: false
    }
  }
);

const progressIndicatorVariants = cva(
  [
    'h-full w-full flex-1 transition-all duration-500 ease-out',
    'rounded-full'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        warning: 'bg-yellow-500',
        success: 'bg-green-500',
        info: 'bg-blue-500'
      },
      animated: {
        true: 'bg-gradient-to-r animate-pulse',
        false: ''
      },
      striped: {
        true: 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:40px_100%] animate-[shimmer_2s_infinite]',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
      striped: false
    }
  }
);

const circularProgressVariants = cva(
  [
    'relative inline-flex items-center justify-center'
  ],
  {
    variants: {
      size: {
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

const stepperVariants = cva([
  'flex items-center justify-between relative'
]);

const stepVariants = cva(
  [
    'flex items-center justify-center relative z-10',
    'rounded-full border-2 transition-all duration-300',
    'font-medium text-sm'
  ],
  {
    variants: {
      status: {
        pending: 'bg-secondary border-border text-muted-foreground',
        active: 'bg-primary border-primary text-primary-foreground',
        completed: 'bg-green-500 border-green-500 text-white',
        error: 'bg-destructive border-destructive text-destructive-foreground'
      },
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
      }
    },
    defaultVariants: {
      status: 'pending',
      size: 'md'
    }
  }
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ProgressProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof progressVariants> {
  readonly value?: number | null;
  readonly max?: number;
  readonly showLabel?: boolean;
  readonly label?: string;
  readonly striped?: boolean;
  readonly indeterminate?: boolean;
  readonly ariaLabel?: string;
  readonly ariaValueText?: string;
}

export interface CircularProgressProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof circularProgressVariants> {
  readonly value?: number | null;
  readonly max?: number;
  readonly showLabel?: boolean;
  readonly label?: string;
  readonly strokeWidth?: number;
  readonly variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  readonly indeterminate?: boolean;
  readonly ariaLabel?: string;
  readonly ariaValueText?: string;
}

export interface StepperProps extends 
  React.HTMLAttributes<HTMLDivElement> {
  readonly steps: readonly StepData[];
  readonly currentStep: number;
  readonly variant?: 'default' | 'numbered' | 'dots';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly orientation?: 'horizontal' | 'vertical';
  readonly showLabels?: boolean;
  readonly onStepClick?: (stepIndex: number) => void;
  readonly ariaLabel?: string;
}

export interface StepData {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly status?: 'pending' | 'active' | 'completed' | 'error';
  readonly optional?: boolean;
  readonly disabled?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const clampValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const formatProgress = (value: number, max = 100): string => {
  const percentage = Math.round((value / max) * 100);
  return `${percentage}%`;
};

const getStepStatus = (stepIndex: number, currentStep: number, steps: readonly StepData[]): StepData['status'] => {
  const step = steps[stepIndex];
  if (step?.status) return step.status;
  
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'active';
  return 'pending';
};

// =============================================================================
// PROGRESS COMPONENTS
// =============================================================================

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({
  className,
  variant,
  size,
  animated,
  value,
  max = 100,
  showLabel = false,
  label,
  striped = false,
  indeterminate = false,
  ariaLabel,
  ariaValueText,
  ...props
}, ref) => {
  const progressValue = value ?? 0;
  const clampedValue = clampValue(progressValue, 0, max);
  const percentage = (clampedValue / max) * 100;
  
  return (
    <div
      ref={ref}
      className={cn(progressVariants({ variant, size, animated }), className)}
      role="progressbar"
      aria-label={ariaLabel || 'Progress'}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={ariaValueText || (indeterminate ? 'Loading...' : formatProgress(clampedValue, max))}
      {...props}
    >
      <div
        className={cn(
          progressIndicatorVariants({ 
            variant, 
            animated: animated || indeterminate, 
            striped 
          }),
          indeterminate && 'animate-[indeterminateProgress_2s_linear_infinite]'
        )}
        style={{
          transform: indeterminate ? 'translateX(-100%)' : `translateX(-${100 - percentage}%)`
        }}
      />
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground mix-blend-difference">
            {label || formatProgress(clampedValue, max)}
          </span>
        </div>
      )}
    </div>
  );
});

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(({
  className,
  size,
  value,
  max = 100,
  showLabel = false,
  label,
  strokeWidth = 8,
  variant = 'default',
  indeterminate = false,
  ariaLabel,
  ariaValueText,
  ...props
}, ref) => {
  const progressValue = value ?? 0;
  const clampedValue = clampValue(progressValue, 0, max);
  const percentage = (clampedValue / max) * 100;
  
  const sizeMap = {
    sm: { size: 64, radius: 24 },
    md: { size: 80, radius: 32 },
    lg: { size: 96, radius: 40 },
    xl: { size: 128, radius: 56 }
  };
  
  const { size: svgSize, radius } = sizeMap[size || 'md'];
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = indeterminate ? 0 : circumference - (percentage / 100) * circumference;
  
  const getVariantColor = () => {
    switch (variant) {
      case 'destructive': return 'stroke-destructive';
      case 'warning': return 'stroke-yellow-500';
      case 'success': return 'stroke-green-500';
      case 'info': return 'stroke-blue-500';
      default: return 'stroke-primary';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(circularProgressVariants({ size }), className)}
      role="progressbar"
      aria-label={ariaLabel || 'Circular progress'}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={ariaValueText || (indeterminate ? 'Loading...' : formatProgress(clampedValue, max))}
      {...props}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-all duration-500 ease-out',
            getVariantColor(),
            indeterminate && 'animate-[circularProgress_2s_ease-in-out_infinite]'
          )}
          style={{
            transformOrigin: `${center}px ${center}px`
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground">
            {label || formatProgress(clampedValue, max)}
          </span>
        </div>
      )}
    </div>
  );
});

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(({
  className,
  steps,
  currentStep,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  showLabels = true,
  onStepClick,
  ariaLabel,
  ...props
}, ref) => {
  const handleStepClick = useCallback((stepIndex: number) => {
    if (onStepClick && !steps[stepIndex]?.disabled) {
      onStepClick(stepIndex);
    }
  }, [onStepClick, steps]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, stepIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepClick(stepIndex);
    }
  }, [handleStepClick]);

  if (orientation === 'vertical') {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        role="group"
        aria-label={ariaLabel || 'Stepper'}
        {...props}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index, currentStep, steps);
          const isClickable = onStepClick && !step.disabled;
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <button
                  className={cn(
                    stepVariants({ status, size }),
                    isClickable && 'hover:scale-110 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                    !isClickable && 'cursor-default'
                  )}
                  onClick={() => handleStepClick(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={!isClickable}
                  aria-current={status === 'active' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                  type="button"
                >
                  {variant === 'numbered' && (
                    <span className="text-inherit">
                      {status === 'completed' ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                  )}
                  
                  {variant === 'dots' && <div className="w-2 h-2 rounded-full bg-current" />}
                  
                  {variant === 'default' && (
                    status === 'completed' ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : status === 'error' ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    ) : (
                      <span className="text-inherit">{index + 1}</span>
                    )
                  )}
                </button>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-2 transition-colors duration-300',
                      index < currentStep ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </div>
              
              {showLabels && (
                <div className="flex-1 pb-8">
                  <div className="text-sm font-medium text-foreground">
                    {step.label}
                    {step.optional && (
                      <span className="text-xs text-muted-foreground ml-2">(optional)</span>
                    )}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal stepper
  return (
    <div
      ref={ref}
      className={cn(stepperVariants(), className)}
      role="group"
      aria-label={ariaLabel || 'Stepper'}
      {...props}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index, currentStep, steps);
        const isClickable = onStepClick && !step.disabled;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                className={cn(
                  stepVariants({ status, size }),
                  isClickable && 'hover:scale-110 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
                  !isClickable && 'cursor-default'
                )}
                onClick={() => handleStepClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={!isClickable}
                aria-current={status === 'active' ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
                type="button"
              >
                {variant === 'numbered' && (
                  <span className="text-inherit">
                    {status === 'completed' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                )}
                
                {variant === 'dots' && <div className="w-2 h-2 rounded-full bg-current" />}
                
                {variant === 'default' && (
                  status === 'completed' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : status === 'error' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  ) : (
                    <span className="text-inherit">{index + 1}</span>
                  )
                )}
              </button>
              
              {showLabels && (
                <div className="text-center mt-2">
                  <div className="text-xs font-medium text-foreground">
                    {step.label}
                  </div>
                  {step.optional && (
                    <div className="text-xs text-muted-foreground">(optional)</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors duration-300',
                  index < currentStep ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

// Display names for React DevTools
Progress.displayName = 'Progress';
CircularProgress.displayName = 'CircularProgress';
Stepper.displayName = 'Stepper';

// Export types and variants
export type { VariantProps, StepData };
export { progressVariants, progressIndicatorVariants, circularProgressVariants, stepperVariants, stepVariants };