import React, { useState, useCallback } from 'react';
import {
  RefactoringPreview,
  RefactoringSuggestion,
  RefactoringApprovalWorkflow,
  CodeDiffHighlighter,
  RefactoringHistory,
  RefactoringSettingsPanel,
  RefactoringStatusIndicator
} from './index';
import type {
  RefactoringStep,
  RefactoringHistoryItem,
  RefactoringSettings,
  RefactoringTask,
  DiffLine
} from './types';

/**
 * Example implementation of a complete AI Refactoring Dashboard
 * This demonstrates how to use all the refactoring components together
 */

interface RefactoringDashboardProps {
  readonly isDarkMode?: boolean;
}

export const RefactoringDashboard = ({ 
  isDarkMode = false 
}: RefactoringDashboardProps): JSX.Element => {
  const [activeView, setActiveView] = useState<'suggestions' | 'workflow' | 'history' | 'settings'>('suggestions');
  
  // Example data - in a real app, this would come from your state management
  const [suggestions] = useState([
    {
      id: '1',
      title: 'Convert to async/await',
      description: 'Replace promise chains with modern async/await syntax for better readability',
      type: 'readability' as const,
      confidenceScore: 92,
      impact: 'medium' as const,
      estimatedChanges: 24,
      codePreview: 'async function fetchData() {\n  const data = await api.get();\n  return data;\n}'
    },
    {
      id: '2',
      title: 'Memoize expensive calculations',
      description: 'Add React.memo and useMemo to prevent unnecessary re-renders',
      type: 'performance' as const,
      confidenceScore: 87,
      impact: 'high' as const,
      estimatedChanges: 15
    }
  ]);

  const [workflowSteps] = useState<RefactoringStep[]>([
    {
      id: 'step-1',
      title: 'Analyze code patterns',
      description: 'Scanning codebase for refactoring opportunities',
      status: 'completed',
      timestamp: new Date()
    },
    {
      id: 'step-2',
      title: 'Generate suggestions',
      description: 'Creating refactoring suggestions based on best practices',
      status: 'in-progress'
    },
    {
      id: 'step-3',
      title: 'Apply refactoring',
      description: 'Apply approved changes to the codebase',
      status: 'pending'
    }
  ]);

  const [historyItems] = useState<RefactoringHistoryItem[]>([
    {
      id: 'history-1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'performance',
      title: 'Optimized component rendering',
      description: 'Added memoization to prevent unnecessary re-renders in ProductList',
      filesChanged: 3,
      linesAdded: 45,
      linesRemoved: 32,
      status: 'applied',
      author: 'AI Assistant',
      confidenceScore: 94,
      relatedFiles: ['src/components/ProductList.tsx', 'src/hooks/useProducts.ts']
    }
  ]);

  const [tasks] = useState<RefactoringTask[]>([
    {
      id: 'task-1',
      name: 'Refactoring UserProfile component',
      status: 'processing',
      progress: 65,
      filesProcessed: 13,
      totalFiles: 20,
      startTime: new Date(Date.now() - 120000)
    }
  ]);

  const [settings, setSettings] = useState<RefactoringSettings>({
    autoApprove: false,
    confidenceThreshold: 80,
    enabledTypes: {
      performance: true,
      readability: true,
      maintainability: true,
      security: true,
      bestPractice: true
    },
    maxChangesPerFile: 100,
    preserveComments: true,
    preserveFormatting: true,
    enableBackup: true,
    aiModel: 'gpt-4',
    excludePatterns: ['node_modules/**', 'dist/**'],
    includePatterns: ['src/**/*.ts', 'src/**/*.tsx']
  });

  // Example diff lines for the code highlighter
  const [diffLines] = useState<DiffLine[]>([
    { lineNumber: 1, type: 'unchanged', content: 'import React from "react";' },
    { lineNumber: 2, type: 'removed', content: 'import { Component } from "react";' },
    { lineNumber: 3, type: 'added', content: 'import { useState, useCallback } from "react";' },
    { lineNumber: 4, type: 'unchanged', content: '' },
    { lineNumber: 5, type: 'removed', content: 'class UserProfile extends Component {' },
    { lineNumber: 6, type: 'added', content: 'const UserProfile = ({ userId }: UserProfileProps): JSX.Element => {' }
  ]);

  const handleApplySuggestion = useCallback((id: string) => {
    console.log('Applying suggestion:', id);
  }, []);

  const handleViewDetails = useCallback((id: string) => {
    console.log('Viewing details for:', id);
  }, []);

  const handleSaveSettings = useCallback(() => {
    console.log('Saving settings:', settings);
  }, [settings]);

  try {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Refactoring Dashboard
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Intelligent code improvements powered by AI
            </p>
          </div>
        </header>

        {/* Navigation */}
        <nav className={`px-8 py-4 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto flex gap-6">
            {[
              { key: 'suggestions' as const, label: 'Suggestions', icon: '💡' },
              { key: 'workflow' as const, label: 'Workflow', icon: '📋' },
              { key: 'history' as const, label: 'History', icon: '📜' },
              { key: 'settings' as const, label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`h-12 px-6 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeView === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {activeView === 'suggestions' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Refactoring Suggestions
                </h2>
                
                {/* Example: Refactoring Preview */}
                <RefactoringPreview
                  originalCode={`class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  
  render() {
    return <div>Profile</div>;
  }
}`}
                  refactoredCode={`const UserProfile = ({ userId }: UserProfileProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  
  return <div>Profile</div>;
};`}
                  language="typescript"
                  fileName="UserProfile.tsx"
                  onApprove={() => console.log('Approved')}
                  onReject={() => console.log('Rejected')}
                  isDarkMode={isDarkMode}
                />

                {/* Example: Suggestions List */}
                <div className="space-y-4 mt-8">
                  {suggestions.map(suggestion => (
                    <RefactoringSuggestion
                      key={suggestion.id}
                      {...suggestion}
                      onApply={handleApplySuggestion}
                      onViewDetails={handleViewDetails}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>

                {/* Example: Code Diff Highlighter */}
                <div className="mt-8">
                  <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Detailed Code Changes
                  </h3>
                  <CodeDiffHighlighter
                    language="typescript"
                    diffLines={diffLines}
                    theme={isDarkMode ? 'dark' : 'github'}
                    showLineNumbers={true}
                    highlightSyntax={true}
                  />
                </div>
              </div>
            )}

            {activeView === 'workflow' && (
              <RefactoringApprovalWorkflow
                workflowId="workflow-1"
                title="Component Modernization Workflow"
                steps={workflowSteps}
                currentStepId="step-2"
                onApprove={(id) => console.log('Approved step:', id)}
                onSkip={(id) => console.log('Skipped step:', id)}
                allowBatchApproval={true}
                isDarkMode={isDarkMode}
              />
            )}

            {activeView === 'history' && (
              <RefactoringHistory
                items={historyItems}
                onViewDetails={(id) => console.log('View history details:', id)}
                onRevert={(id) => console.log('Revert:', id)}
                showFilters={true}
                isDarkMode={isDarkMode}
              />
            )}

            {activeView === 'settings' && (
              <RefactoringSettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onSave={handleSaveSettings}
                onReset={() => console.log('Reset settings')}
                showAdvanced={true}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </main>

        {/* Status Indicator */}
        <RefactoringStatusIndicator
          tasks={tasks}
          onTaskClick={(id) => console.log('Task clicked:', id)}
          onCancelTask={(id) => console.log('Cancel task:', id)}
          compact={true}
          showNotifications={true}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  } catch (error) {
    console.error('RefactoringDashboard error:', error);
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
          Error rendering dashboard
        </div>
      </div>
    );
  }
};