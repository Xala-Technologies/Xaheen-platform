import React, { useState, useCallback, useMemo } from 'react';

interface CodeDiff {
  readonly lineNumber: number;
  readonly type: 'added' | 'removed' | 'unchanged';
  readonly content: string;
}

interface RefactoringPreviewProps {
  readonly originalCode: string;
  readonly refactoredCode: string;
  readonly language: string;
  readonly fileName: string;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onModify?: (code: string) => void;
  readonly isDarkMode?: boolean;
}

export const RefactoringPreview = ({
  originalCode,
  refactoredCode,
  language,
  fileName,
  onApprove,
  onReject,
  onModify,
  isDarkMode = false
}: RefactoringPreviewProps): JSX.Element => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [selectedLineNumbers, setSelectedLineNumbers] = useState<Set<number>>(new Set());

  const codeDiff = useMemo((): CodeDiff[] => {
    const originalLines = originalCode.split('\n');
    const refactoredLines = refactoredCode.split('\n');
    const diff: CodeDiff[] = [];
    
    // Simple diff algorithm for demonstration
    const maxLines = Math.max(originalLines.length, refactoredLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      if (i >= originalLines.length) {
        diff.push({ lineNumber: i + 1, type: 'added', content: refactoredLines[i] });
      } else if (i >= refactoredLines.length) {
        diff.push({ lineNumber: i + 1, type: 'removed', content: originalLines[i] });
      } else if (originalLines[i] !== refactoredLines[i]) {
        diff.push({ lineNumber: i + 1, type: 'removed', content: originalLines[i] });
        diff.push({ lineNumber: i + 1, type: 'added', content: refactoredLines[i] });
      } else {
        diff.push({ lineNumber: i + 1, type: 'unchanged', content: originalLines[i] });
      }
    }
    
    return diff;
  }, [originalCode, refactoredCode]);

  const handleLineSelect = useCallback((lineNumber: number) => {
    setSelectedLineNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber);
      } else {
        newSet.add(lineNumber);
      }
      return newSet;
    });
  }, []);

  const handleViewModeChange = useCallback((mode: 'split' | 'unified') => {
    setViewMode(mode);
  }, []);

  const getLineClassName = useCallback((type: 'added' | 'removed' | 'unchanged'): string => {
    const baseClasses = 'px-4 py-1 font-mono text-sm';
    
    if (type === 'added') {
      return `${baseClasses} ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`;
    } else if (type === 'removed') {
      return `${baseClasses} ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`;
    }
    
    return `${baseClasses} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  }, [isDarkMode]);

  try {
    return (
      <div className={`w-full max-w-7xl mx-auto p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Refactoring Preview
            </h2>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {fileName} • {language}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              role="tablist"
              aria-label="View mode selector"
            >
              <button
                onClick={() => handleViewModeChange('split')}
                className={`h-12 px-6 rounded-lg font-medium transition-colors ${
                  viewMode === 'split'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-blue-600 shadow-md'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                role="tab"
                aria-selected={viewMode === 'split'}
                aria-label="Split view mode"
              >
                Split View
              </button>
              <button
                onClick={() => handleViewModeChange('unified')}
                className={`h-12 px-6 rounded-lg font-medium transition-colors ${
                  viewMode === 'unified'
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-blue-600 shadow-md'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                role="tab"
                aria-selected={viewMode === 'unified'}
                aria-label="Unified view mode"
              >
                Unified View
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2 divide-x-2 divide-gray-200 dark:divide-gray-700">
              <div>
                <div className={`px-4 py-3 font-medium ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                  Original Code
                </div>
                <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                  <pre className="min-w-full">
                    {originalCode.split('\n').map((line, index) => (
                      <div
                        key={`original-${index}`}
                        className={`flex ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      >
                        <span className={`inline-block w-12 px-2 py-1 text-right text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>
                        <code className={`flex-1 px-4 py-1 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {line || '\n'}
                        </code>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
              
              <div>
                <div className={`px-4 py-3 font-medium ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                  Refactored Code
                </div>
                <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                  <pre className="min-w-full">
                    {refactoredCode.split('\n').map((line, index) => (
                      <div
                        key={`refactored-${index}`}
                        className={`flex ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      >
                        <span className={`inline-block w-12 px-2 py-1 text-right text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>
                        <code className={`flex-1 px-4 py-1 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {line || '\n'}
                        </code>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
              <div className={`px-4 py-3 font-medium ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                Unified Diff View
              </div>
              <div className="overflow-x-auto">
                <pre className="min-w-full">
                  {codeDiff.map((diff, index) => (
                    <div
                      key={`diff-${index}`}
                      className={`flex ${getLineClassName(diff.type)} ${
                        selectedLineNumbers.has(diff.lineNumber) 
                          ? isDarkMode ? 'ring-2 ring-blue-400' : 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => handleLineSelect(diff.lineNumber)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Line ${diff.lineNumber}: ${diff.type}`}
                    >
                      <span className={`inline-block w-12 px-2 text-right text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {diff.lineNumber}
                      </span>
                      <span className="inline-block w-8 text-center">
                        {diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : ' '}
                      </span>
                      <code className="flex-1 px-2">
                        {diff.content || '\n'}
                      </code>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="inline-flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className={`inline-block h-4 w-4 rounded ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`} />
                <span>Added</span>
              </span>
              <span className="flex items-center gap-2">
                <span className={`inline-block h-4 w-4 rounded ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`} />
                <span>Removed</span>
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {onReject && (
              <button
                onClick={onReject}
                className={`h-12 px-6 font-medium rounded-lg transition-colors shadow-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Reject refactoring"
              >
                Reject
              </button>
            )}
            
            {onModify && (
              <button
                onClick={() => onModify(refactoredCode)}
                className={`h-12 px-6 font-medium rounded-lg transition-colors shadow-md ${
                  isDarkMode
                    ? 'bg-blue-700 text-white hover:bg-blue-600'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                aria-label="Modify refactoring"
              >
                Modify
              </button>
            )}
            
            {onApprove && (
              <button
                onClick={onApprove}
                className="h-12 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                aria-label="Approve refactoring"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RefactoringPreview error:', error);
    return (
      <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
        Error rendering refactoring preview
      </div>
    );
  }
};