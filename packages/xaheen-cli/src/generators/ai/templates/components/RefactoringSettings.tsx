import React, { useState, useCallback } from 'react';

interface RefactoringSettings {
  readonly autoApprove: boolean;
  readonly confidenceThreshold: number;
  readonly enabledTypes: {
    readonly performance: boolean;
    readonly readability: boolean;
    readonly maintainability: boolean;
    readonly security: boolean;
    readonly bestPractice: boolean;
  };
  readonly maxChangesPerFile: number;
  readonly preserveComments: boolean;
  readonly preserveFormatting: boolean;
  readonly enableBackup: boolean;
  readonly backupLocation?: string;
  readonly aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'custom';
  readonly customPrompt?: string;
  readonly excludePatterns: readonly string[];
  readonly includePatterns: readonly string[];
}

interface RefactoringSettingsProps {
  readonly settings: RefactoringSettings;
  readonly onSettingsChange: (settings: RefactoringSettings) => void;
  readonly onSave?: () => void;
  readonly onReset?: () => void;
  readonly showAdvanced?: boolean;
  readonly isDarkMode?: boolean;
}

export const RefactoringSettingsPanel = ({
  settings,
  onSettingsChange,
  onSave,
  onReset,
  showAdvanced = true,
  isDarkMode = false
}: RefactoringSettingsProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'general' | 'types' | 'advanced'>('general');
  const [newExcludePattern, setNewExcludePattern] = useState('');
  const [newIncludePattern, setNewIncludePattern] = useState('');

  const handleSettingChange = useCallback(<K extends keyof RefactoringSettings>(
    key: K,
    value: RefactoringSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  }, [settings, onSettingsChange]);

  const handleTypeToggle = useCallback((type: keyof RefactoringSettings['enabledTypes']) => {
    handleSettingChange('enabledTypes', {
      ...settings.enabledTypes,
      [type]: !settings.enabledTypes[type]
    });
  }, [settings, handleSettingChange]);

  const handleAddExcludePattern = useCallback(() => {
    if (newExcludePattern.trim()) {
      handleSettingChange('excludePatterns', [
        ...settings.excludePatterns,
        newExcludePattern.trim()
      ]);
      setNewExcludePattern('');
    }
  }, [newExcludePattern, settings.excludePatterns, handleSettingChange]);

  const handleRemoveExcludePattern = useCallback((index: number) => {
    handleSettingChange(
      'excludePatterns',
      settings.excludePatterns.filter((_, i) => i !== index)
    );
  }, [settings.excludePatterns, handleSettingChange]);

  const handleAddIncludePattern = useCallback(() => {
    if (newIncludePattern.trim()) {
      handleSettingChange('includePatterns', [
        ...settings.includePatterns,
        newIncludePattern.trim()
      ]);
      setNewIncludePattern('');
    }
  }, [newIncludePattern, settings.includePatterns, handleSettingChange]);

  const handleRemoveIncludePattern = useCallback((index: number) => {
    handleSettingChange(
      'includePatterns',
      settings.includePatterns.filter((_, i) => i !== index)
    );
  }, [settings.includePatterns, handleSettingChange]);

  const refactoringTypes = [
    { key: 'performance', label: 'Performance Optimizations', icon: '⚡', description: 'Improve code execution speed and efficiency' },
    { key: 'readability', label: 'Code Readability', icon: '📖', description: 'Make code easier to understand and maintain' },
    { key: 'maintainability', label: 'Maintainability', icon: '🔧', description: 'Reduce technical debt and improve code structure' },
    { key: 'security', label: 'Security Improvements', icon: '🔒', description: 'Fix potential security vulnerabilities' },
    { key: 'bestPractice', label: 'Best Practices', icon: '✨', description: 'Apply industry-standard coding patterns' }
  ] as const;

  const aiModels = [
    { value: 'gpt-4', label: 'GPT-4', description: 'Most capable, best for complex refactoring' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for standard tasks' },
    { value: 'claude', label: 'Claude', description: 'Excellent for code understanding' },
    { value: 'custom', label: 'Custom Model', description: 'Use your own AI model endpoint' }
  ] as const;

  try {
    return (
      <div className={`w-full max-w-4xl mx-auto p-8 rounded-xl shadow-lg ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Refactoring Settings
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure how the AI analyzes and refactors your code
          </p>
        </div>

        <div className="mb-6">
          <div 
            className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            role="tablist"
            aria-label="Settings sections"
          >
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 h-12 px-6 rounded-lg font-medium transition-colors ${
                activeTab === 'general'
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-blue-600 shadow-md'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={activeTab === 'general'}
              aria-label="General settings"
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`flex-1 h-12 px-6 rounded-lg font-medium transition-colors ${
                activeTab === 'types'
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-blue-600 shadow-md'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={activeTab === 'types'}
              aria-label="Refactoring types"
            >
              Refactoring Types
            </button>
            {showAdvanced && (
              <button
                onClick={() => setActiveTab('advanced')}
                className={`flex-1 h-12 px-6 rounded-lg font-medium transition-colors ${
                  activeTab === 'advanced'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 shadow-md'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                role="tab"
                aria-selected={activeTab === 'advanced'}
                aria-label="Advanced settings"
              >
                Advanced
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6" role="tabpanel">
          {activeTab === 'general' && (
            <>
              <div>
                <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}>
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Auto-approve suggestions
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Automatically apply refactoring suggestions above the confidence threshold
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoApprove}
                    onChange={(e) => handleSettingChange('autoApprove', e.target.checked)}
                    className="h-6 w-6 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle auto-approve"
                  />
                </label>
              </div>

              <div>
                <label 
                  htmlFor="confidence-threshold"
                  className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Confidence Threshold
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="confidence-threshold"
                    type="range"
                    min="0"
                    max="100"
                    value={settings.confidenceThreshold}
                    onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-300"
                    aria-label="Confidence threshold slider"
                  />
                  <span className={`w-16 text-right font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {settings.confidenceThreshold}%
                  </span>
                </div>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Only show suggestions with confidence above this threshold
                </p>
              </div>

              <div>
                <label 
                  htmlFor="ai-model"
                  className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  AI Model
                </label>
                <select
                  id="ai-model"
                  value={settings.aiModel}
                  onChange={(e) => handleSettingChange('aiModel', e.target.value as RefactoringSettings['aiModel'])}
                  className={`h-14 w-full px-4 rounded-lg border-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                >
                  {aiModels.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {aiModels.find(m => m.value === settings.aiModel)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Preserve Comments
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.preserveComments}
                    onChange={(e) => handleSettingChange('preserveComments', e.target.checked)}
                    className="h-6 w-6 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle preserve comments"
                  />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Preserve Formatting
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.preserveFormatting}
                    onChange={(e) => handleSettingChange('preserveFormatting', e.target.checked)}
                    className="h-6 w-6 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle preserve formatting"
                  />
                </label>
              </div>
            </>
          )}

          {activeTab === 'types' && (
            <div className="space-y-4">
              {refactoringTypes.map(type => (
                <label
                  key={type.key}
                  className={`flex items-center justify-between p-6 rounded-lg cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-1" role="img" aria-label={type.label}>
                      {type.icon}
                    </span>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {type.label}
                      </h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enabledTypes[type.key]}
                    onChange={() => handleTypeToggle(type.key)}
                    className="h-6 w-6 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-label={`Toggle ${type.label}`}
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'advanced' && showAdvanced && (
            <>
              <div>
                <label 
                  htmlFor="max-changes"
                  className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Max Changes Per File
                </label>
                <input
                  id="max-changes"
                  type="number"
                  min="1"
                  max="1000"
                  value={settings.maxChangesPerFile}
                  onChange={(e) => handleSettingChange('maxChangesPerFile', parseInt(e.target.value) || 1)}
                  className={`h-14 w-full px-4 rounded-lg border-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Limit the number of changes in a single file to prevent overwhelming refactoring
                </p>
              </div>

              <div>
                <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Include Patterns
                </h3>
                <div className="space-y-2">
                  {settings.includePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className={`flex-1 px-3 py-2 rounded-lg font-mono text-sm ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pattern}
                      </code>
                      <button
                        onClick={() => handleRemoveIncludePattern(index)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-900/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        aria-label={`Remove include pattern ${pattern}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIncludePattern}
                      onChange={(e) => setNewIncludePattern(e.target.value)}
                      placeholder="e.g., src/**/*.ts"
                      className={`flex-1 h-12 px-4 rounded-lg border-2 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIncludePattern()}
                    />
                    <button
                      onClick={handleAddIncludePattern}
                      className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      aria-label="Add include pattern"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Exclude Patterns
                </h3>
                <div className="space-y-2">
                  {settings.excludePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className={`flex-1 px-3 py-2 rounded-lg font-mono text-sm ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pattern}
                      </code>
                      <button
                        onClick={() => handleRemoveExcludePattern(index)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-900/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        aria-label={`Remove exclude pattern ${pattern}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExcludePattern}
                      onChange={(e) => setNewExcludePattern(e.target.value)}
                      placeholder="e.g., node_modules/**"
                      className={`flex-1 h-12 px-4 rounded-lg border-2 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExcludePattern()}
                    />
                    <button
                      onClick={handleAddExcludePattern}
                      className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      aria-label="Add exclude pattern"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {settings.aiModel === 'custom' && (
                <div>
                  <label 
                    htmlFor="custom-prompt"
                    className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Custom Refactoring Prompt
                  </label>
                  <textarea
                    id="custom-prompt"
                    value={settings.customPrompt || ''}
                    onChange={(e) => handleSettingChange('customPrompt', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder="Enter custom instructions for the AI model..."
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {onReset && (
              <button
                onClick={onReset}
                className={`h-12 px-6 font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Reset settings to defaults"
              >
                Reset to Defaults
              </button>
            )}
          </div>
          
          {onSave && (
            <button
              onClick={onSave}
              className="h-12 px-8 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              aria-label="Save settings"
            >
              Save Settings
            </button>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('RefactoringSettings error:', error);
    return (
      <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
        Error rendering refactoring settings
      </div>
    );
  }
};