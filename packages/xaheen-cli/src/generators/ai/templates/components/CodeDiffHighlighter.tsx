import React, { useMemo, useCallback } from 'react';

interface TokenizedLine {
  readonly content: string;
  readonly tokens: readonly Token[];
}

interface Token {
  readonly type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'variable' | 'operator' | 'punctuation' | 'text';
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

interface DiffLine {
  readonly lineNumber: number;
  readonly type: 'added' | 'removed' | 'unchanged' | 'modified';
  readonly content: string;
  readonly tokens?: readonly Token[];
}

interface CodeDiffHighlighterProps {
  readonly language: string;
  readonly diffLines: readonly DiffLine[];
  readonly showLineNumbers?: boolean;
  readonly highlightSyntax?: boolean;
  readonly wrapLongLines?: boolean;
  readonly theme?: 'light' | 'dark' | 'github' | 'monokai';
  readonly onLineClick?: (lineNumber: number) => void;
  readonly selectedLines?: readonly number[];
  readonly collapsibleSections?: boolean;
}

export const CodeDiffHighlighter = ({
  language,
  diffLines,
  showLineNumbers = true,
  highlightSyntax = true,
  wrapLongLines = false,
  theme = 'github',
  onLineClick,
  selectedLines = [],
  collapsibleSections = false
}: CodeDiffHighlighterProps): JSX.Element => {
  const isDarkTheme = theme === 'dark' || theme === 'monokai';

  const getTokenColor = useCallback((tokenType: Token['type']): string => {
    switch (theme) {
      case 'github':
        switch (tokenType) {
          case 'keyword': return 'text-purple-600';
          case 'string': return 'text-blue-700';
          case 'number': return 'text-orange-600';
          case 'comment': return 'text-gray-500';
          case 'function': return 'text-red-600';
          case 'variable': return 'text-gray-800';
          case 'operator': return 'text-gray-700';
          default: return 'text-gray-800';
        }
      case 'dark':
        switch (tokenType) {
          case 'keyword': return 'text-purple-400';
          case 'string': return 'text-green-400';
          case 'number': return 'text-yellow-400';
          case 'comment': return 'text-gray-500';
          case 'function': return 'text-blue-400';
          case 'variable': return 'text-gray-300';
          case 'operator': return 'text-gray-400';
          default: return 'text-gray-300';
        }
      case 'monokai':
        switch (tokenType) {
          case 'keyword': return 'text-pink-400';
          case 'string': return 'text-yellow-300';
          case 'number': return 'text-purple-400';
          case 'comment': return 'text-gray-500';
          case 'function': return 'text-green-400';
          case 'variable': return 'text-white';
          case 'operator': return 'text-red-400';
          default: return 'text-gray-100';
        }
      default:
        return 'text-gray-800';
    }
  }, [theme]);

  const getLineBackground = useCallback((type: DiffLine['type'], isSelected: boolean): string => {
    if (isSelected) {
      return isDarkTheme ? 'bg-blue-900/40' : 'bg-blue-100';
    }

    switch (type) {
      case 'added':
        return isDarkTheme ? 'bg-green-900/20' : 'bg-green-50';
      case 'removed':
        return isDarkTheme ? 'bg-red-900/20' : 'bg-red-50';
      case 'modified':
        return isDarkTheme ? 'bg-yellow-900/20' : 'bg-yellow-50';
      default:
        return '';
    }
  }, [isDarkTheme]);

  const getLineIndicator = useCallback((type: DiffLine['type']): string => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return ' ';
    }
  }, []);

  const getLineIndicatorColor = useCallback((type: DiffLine['type']): string => {
    switch (type) {
      case 'added':
        return isDarkTheme ? 'text-green-400' : 'text-green-600';
      case 'removed':
        return isDarkTheme ? 'text-red-400' : 'text-red-600';
      case 'modified':
        return isDarkTheme ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDarkTheme ? 'text-gray-500' : 'text-gray-400';
    }
  }, [isDarkTheme]);

  const renderTokenizedLine = useCallback((line: DiffLine): React.ReactNode => {
    if (!highlightSyntax || !line.tokens || line.tokens.length === 0) {
      return (
        <span className={isDarkTheme ? 'text-gray-300' : 'text-gray-800'}>
          {line.content || '\n'}
        </span>
      );
    }

    return line.tokens.map((token, index) => (
      <span key={`${line.lineNumber}-${index}`} className={getTokenColor(token.type)}>
        {token.value}
      </span>
    ));
  }, [highlightSyntax, isDarkTheme, getTokenColor]);

  const collapsedSections = useMemo(() => {
    if (!collapsibleSections) return [];
    
    const sections: Array<{ start: number; end: number }> = [];
    let currentSection: { start: number; end: number } | null = null;
    
    diffLines.forEach((line, index) => {
      if (line.type === 'unchanged') {
        if (!currentSection) {
          currentSection = { start: index, end: index };
        } else {
          currentSection.end = index;
        }
      } else if (currentSection && currentSection.end - currentSection.start > 3) {
        sections.push(currentSection);
        currentSection = null;
      }
    });
    
    return sections;
  }, [diffLines, collapsibleSections]);

  try {
    return (
      <div className={`rounded-lg overflow-hidden shadow-lg ${
        isDarkTheme ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`px-4 py-3 border-b ${
          isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {language.charAt(0).toUpperCase() + language.slice(1)} • {diffLines.length} lines
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded ${
                  isDarkTheme ? 'bg-green-900/30' : 'bg-green-100'
                }`} />
                <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>Added</span>
              </span>
              <span className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded ${
                  isDarkTheme ? 'bg-red-900/30' : 'bg-red-100'
                }`} />
                <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>Removed</span>
              </span>
              <span className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded ${
                  isDarkTheme ? 'bg-yellow-900/30' : 'bg-yellow-100'
                }`} />
                <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>Modified</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`overflow-x-auto ${isDarkTheme ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <table className="w-full" role="table">
            <tbody>
              {diffLines.map((line, index) => {
                const isSelected = selectedLines.includes(line.lineNumber);
                const isCollapsible = collapsedSections.some(
                  section => index >= section.start && index <= section.end
                );

                return (
                  <tr
                    key={`line-${line.lineNumber}`}
                    className={`group ${onLineClick ? 'cursor-pointer' : ''} ${
                      getLineBackground(line.type, isSelected)
                    }`}
                    onClick={() => onLineClick?.(line.lineNumber)}
                    role="row"
                  >
                    {showLineNumbers && (
                      <td
                        className={`select-none text-right align-top pr-4 pl-2 ${
                          isDarkTheme ? 'text-gray-600' : 'text-gray-400'
                        } text-xs font-mono`}
                        style={{ minWidth: '3rem' }}
                        role="cell"
                      >
                        {line.lineNumber}
                      </td>
                    )}
                    
                    <td
                      className={`select-none text-center align-top px-2 font-mono font-bold ${
                        getLineIndicatorColor(line.type)
                      }`}
                      style={{ width: '2rem' }}
                      role="cell"
                    >
                      {getLineIndicator(line.type)}
                    </td>
                    
                    <td
                      className={`pl-4 pr-8 font-mono text-sm ${
                        wrapLongLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                      }`}
                      role="cell"
                    >
                      <code>{renderTokenizedLine(line)}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedLines.length > 0 && (
          <div className={`px-4 py-3 border-t ${
            isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedLines.length} line{selectedLines.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('CodeDiffHighlighter error:', error);
    return (
      <div className={`p-6 rounded-lg shadow-lg ${
        isDarkTheme ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'
      }`}>
        Error rendering code diff
      </div>
    );
  }
};