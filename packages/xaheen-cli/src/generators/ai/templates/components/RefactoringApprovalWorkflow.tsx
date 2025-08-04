import React, { useState, useCallback, useMemo } from 'react';

interface RefactoringStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  readonly timestamp?: Date;
  readonly error?: string;
}

interface RefactoringApprovalWorkflowProps {
  readonly workflowId: string;
  readonly title: string;
  readonly steps: readonly RefactoringStep[];
  readonly currentStepId?: string;
  readonly onApprove?: (stepId: string) => void;
  readonly onReject?: (stepId: string) => void;
  readonly onSkip?: (stepId: string) => void;
  readonly onCancel?: () => void;
  readonly onRetry?: (stepId: string) => void;
  readonly allowBatchApproval?: boolean;
  readonly isDarkMode?: boolean;
}

export const RefactoringApprovalWorkflow = ({
  workflowId,
  title,
  steps,
  currentStepId,
  onApprove,
  onReject,
  onSkip,
  onCancel,
  onRetry,
  allowBatchApproval = false,
  isDarkMode = false
}: RefactoringApprovalWorkflowProps): JSX.Element => {
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const currentStepIndex = useMemo(() => {
    return steps.findIndex(step => step.id === currentStepId);
  }, [steps, currentStepId]);

  const progress = useMemo(() => {
    const completedSteps = steps.filter(step => 
      step.status === 'completed' || step.status === 'skipped'
    ).length;
    return Math.round((completedSteps / steps.length) * 100);
  }, [steps]);

  const handleStepSelect = useCallback((stepId: string) => {
    if (!allowBatchApproval) return;
    
    setSelectedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, [allowBatchApproval]);

  const handleExpandStep = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  const handleBatchApprove = useCallback(() => {
    if (!onApprove) return;
    selectedSteps.forEach(stepId => onApprove(stepId));
    setSelectedSteps(new Set());
  }, [selectedSteps, onApprove]);

  const getStepIcon = useCallback((status: RefactoringStep['status']): string => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⟳';
      case 'failed':
        return '✗';
      case 'skipped':
        return '→';
      default:
        return '○';
    }
  }, []);

  const getStepColor = useCallback((status: RefactoringStep['status']): string => {
    switch (status) {
      case 'completed':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'in-progress':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'failed':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'skipped':
        return isDarkMode ? 'text-gray-400' : 'text-gray-500';
      default:
        return isDarkMode ? 'text-gray-500' : 'text-gray-400';
    }
  }, [isDarkMode]);

  const getStepBgColor = useCallback((status: RefactoringStep['status']): string => {
    switch (status) {
      case 'completed':
        return isDarkMode ? 'bg-green-900/20' : 'bg-green-50';
      case 'in-progress':
        return isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50';
      case 'failed':
        return isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'skipped':
        return isDarkMode ? 'bg-gray-800/20' : 'bg-gray-50';
      default:
        return '';
    }
  }, [isDarkMode]);

  try {
    return (
      <div className={`w-full max-w-4xl mx-auto p-8 rounded-xl shadow-lg ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className={`h-3 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Workflow progress"
                />
              </div>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {progress}% Complete
            </span>
          </div>
        </div>

        {allowBatchApproval && selectedSteps.size > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                {selectedSteps.size} steps selected
              </span>
              <button
                onClick={handleBatchApprove}
                className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                aria-label={`Approve ${selectedSteps.size} selected steps`}
              >
                Approve Selected
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4" role="list">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative rounded-lg border-2 transition-all ${
                step.id === currentStepId
                  ? isDarkMode 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-blue-400 shadow-lg'
                  : isDarkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
              } ${getStepBgColor(step.status)}`}
              role="listitem"
            >
              {index < steps.length - 1 && (
                <div className={`absolute top-full left-8 w-0.5 h-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
              )}

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {allowBatchApproval && step.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedSteps.has(step.id)}
                      onChange={() => handleStepSelect(step.id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      aria-label={`Select ${step.title}`}
                    />
                  )}

                  <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold ${
                    getStepColor(step.status)
                  } ${step.status !== 'pending' ? getStepBgColor(step.status) : ''}`}>
                    {getStepIcon(step.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        step.status === 'in-progress'
                          ? isDarkMode
                            ? 'bg-blue-900/30 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                          : ''
                      }`}>
                        {step.status === 'in-progress' && 'IN PROGRESS'}
                      </span>
                    </div>

                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.description}
                    </p>

                    {step.error && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'
                      }`}>
                        <p className="text-sm font-medium">Error: {step.error}</p>
                      </div>
                    )}

                    {step.timestamp && (
                      <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {step.timestamp.toLocaleString()}
                      </p>
                    )}

                    {step.id === currentStepId && step.status === 'pending' && (
                      <div className="mt-4 flex items-center gap-3">
                        {onApprove && (
                          <button
                            onClick={() => onApprove(step.id)}
                            className="h-12 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            aria-label={`Approve ${step.title}`}
                          >
                            Approve
                          </button>
                        )}
                        
                        {onReject && (
                          <button
                            onClick={() => onReject(step.id)}
                            className="h-12 px-6 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                            aria-label={`Reject ${step.title}`}
                          >
                            Reject
                          </button>
                        )}
                        
                        {onSkip && (
                          <button
                            onClick={() => onSkip(step.id)}
                            className={`h-12 px-6 font-medium rounded-lg transition-colors shadow-md ${
                              isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            aria-label={`Skip ${step.title}`}
                          >
                            Skip
                          </button>
                        )}
                      </div>
                    )}

                    {step.status === 'failed' && onRetry && (
                      <button
                        onClick={() => onRetry(step.id)}
                        className="mt-4 h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        aria-label={`Retry ${step.title}`}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {onCancel && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onCancel}
              className={`h-12 px-8 font-medium rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Cancel workflow"
            >
              Cancel Workflow
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('RefactoringApprovalWorkflow error:', error);
    return (
      <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
        Error rendering approval workflow
      </div>
    );
  }
};