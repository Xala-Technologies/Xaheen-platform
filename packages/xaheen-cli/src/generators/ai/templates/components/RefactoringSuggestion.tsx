import React, { useState, useCallback } from 'react';

interface RefactoringSuggestionProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'performance' | 'readability' | 'maintainability' | 'security' | 'best-practice';
  readonly confidenceScore: number;
  readonly impact: 'low' | 'medium' | 'high';
  readonly codePreview?: string;
  readonly estimatedChanges: number;
  readonly onApply?: (id: string) => void;
  readonly onDismiss?: (id: string) => void;
  readonly onViewDetails?: (id: string) => void;
  readonly isDarkMode?: boolean;
}

export const RefactoringSuggestion = ({
  id,
  title,
  description,
  type,
  confidenceScore,
  impact,
  codePreview,
  estimatedChanges,
  onApply,
  onDismiss,
  onViewDetails,
  isDarkMode = false
}: RefactoringSuggestionProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const getTypeIcon = useCallback((): string => {
    switch (type) {
      case 'performance':
        return '⚡';
      case 'readability':
        return '📖';
      case 'maintainability':
        return '🔧';
      case 'security':
        return '🔒';
      case 'best-practice':
        return '✨';
      default:
        return '💡';
    }
  }, [type]);

  const getTypeColor = useCallback((): string => {
    switch (type) {
      case 'performance':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'readability':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'maintainability':
        return isDarkMode ? 'text-purple-400' : 'text-purple-600';
      case 'security':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'best-practice':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  }, [type, isDarkMode]);

  const getImpactColor = useCallback((): string => {
    switch (impact) {
      case 'high':
        return isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700';
      case 'medium':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'low':
        return isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700';
      default:
        return isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  }, [impact, isDarkMode]);

  const getConfidenceColor = useCallback((): string => {
    if (confidenceScore >= 80) {
      return isDarkMode ? 'text-green-400' : 'text-green-600';
    } else if (confidenceScore >= 60) {
      return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    }
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  }, [confidenceScore, isDarkMode]);

  try {
    return (
      <div
        className={`p-6 rounded-xl shadow-lg transition-all duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } ${isHovered ? 'shadow-xl transform -translate-y-1' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`Refactoring suggestion: ${title}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl ${getTypeColor()}`} role="img" aria-label={type}>
                {getTypeIcon()}
              </span>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getImpactColor()}`}
                aria-label={`Impact: ${impact}`}
              >
                {impact.toUpperCase()} IMPACT
              </span>
            </div>
            
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {description}
            </p>

            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Confidence:
                </span>
                <span className={`font-semibold ${getConfidenceColor()}`}>
                  {confidenceScore}%
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Changes:
                </span>
                <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {estimatedChanges} {estimatedChanges === 1 ? 'line' : 'lines'}
                </span>
              </div>
            </div>

            {codePreview && (
              <button
                onClick={handleToggleExpand}
                className={`mt-4 flex items-center gap-2 text-sm font-medium ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                } transition-colors`}
                aria-expanded={isExpanded}
                aria-label="Toggle code preview"
              >
                <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                {isExpanded ? 'Hide' : 'Show'} Code Preview
              </button>
            )}

            {isExpanded && codePreview && (
              <div
                className={`mt-4 p-4 rounded-lg overflow-x-auto ${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                }`}
              >
                <pre className="text-sm">
                  <code className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {codePreview}
                  </code>
                </pre>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(id)}
                className={`h-12 px-6 font-medium rounded-lg transition-colors shadow-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="View suggestion details"
              >
                Details
              </button>
            )}
            
            {onApply && (
              <button
                onClick={() => onApply(id)}
                className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                aria-label="Apply this refactoring"
              >
                Apply
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(id)}
                className={`h-12 px-6 font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
                }`}
                aria-label="Dismiss this suggestion"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Type: {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              ID: {id}
            </span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RefactoringSuggestion error:', error);
    return (
      <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'}`}>
        Error rendering refactoring suggestion
      </div>
    );
  }
};