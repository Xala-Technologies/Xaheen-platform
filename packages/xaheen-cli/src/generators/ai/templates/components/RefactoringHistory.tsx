import React, { useState, useCallback, useMemo } from 'react';

interface RefactoringHistoryItem {
  readonly id: string;
  readonly timestamp: Date;
  readonly type: 'performance' | 'readability' | 'maintainability' | 'security' | 'best-practice';
  readonly title: string;
  readonly description: string;
  readonly filesChanged: number;
  readonly linesAdded: number;
  readonly linesRemoved: number;
  readonly status: 'applied' | 'reverted' | 'pending';
  readonly author: string;
  readonly confidenceScore?: number;
  readonly relatedFiles?: readonly string[];
}

interface RefactoringHistoryProps {
  readonly items: readonly RefactoringHistoryItem[];
  readonly onViewDetails?: (id: string) => void;
  readonly onRevert?: (id: string) => void;
  readonly onReapply?: (id: string) => void;
  readonly showFilters?: boolean;
  readonly isDarkMode?: boolean;
}

export const RefactoringHistory = ({
  items,
  onViewDetails,
  onRevert,
  onReapply,
  showFilters = true,
  isDarkMode = false
}: RefactoringHistoryProps): JSX.Element => {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'impact' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const typeOptions = useMemo(() => [
    { value: 'performance', label: 'Performance', icon: '⚡' },
    { value: 'readability', label: 'Readability', icon: '📖' },
    { value: 'maintainability', label: 'Maintainability', icon: '🔧' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'best-practice', label: 'Best Practice', icon: '✨' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'applied', label: 'Applied', color: isDarkMode ? 'text-green-400' : 'text-green-600' },
    { value: 'reverted', label: 'Reverted', color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600' },
    { value: 'pending', label: 'Pending', color: isDarkMode ? 'text-gray-400' : 'text-gray-500' }
  ], [isDarkMode]);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const handleStatusToggle = useCallback((status: string) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  }, []);

  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter(item => selectedTypes.has(item.type));
    }

    // Apply status filter
    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(item => selectedStatuses.has(item.status));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.relatedFiles?.some(file => file.toLowerCase().includes(query))
      );
    }

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'impact':
          comparison = (a.linesAdded + a.linesRemoved) - (b.linesAdded + b.linesRemoved);
          break;
        case 'confidence':
          comparison = (a.confidenceScore || 0) - (b.confidenceScore || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, selectedTypes, selectedStatuses, searchQuery, sortBy, sortOrder]);

  const getTypeIcon = useCallback((type: string): string => {
    return typeOptions.find(opt => opt.value === type)?.icon || '💡';
  }, [typeOptions]);

  const formatRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, []);

  try {
    return (
      <div className={`w-full max-w-6xl mx-auto p-8 rounded-xl shadow-lg ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Refactoring History
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage all refactoring changes made to your codebase
          </p>
        </div>

        {showFilters && (
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="search-history"
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Search
                </label>
                <input
                  id="search-history"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or file name..."
                  className={`h-14 w-full px-4 rounded-lg border-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filter by Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleTypeToggle(option.value)}
                        className={`h-12 px-4 rounded-lg font-medium transition-colors ${
                          selectedTypes.has(option.value)
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                        aria-pressed={selectedTypes.has(option.value)}
                        aria-label={`Filter by ${option.label}`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filter by Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusToggle(option.value)}
                        className={`h-12 px-4 rounded-lg font-medium transition-colors ${
                          selectedStatuses.has(option.value)
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                        aria-pressed={selectedStatuses.has(option.value)}
                        aria-label={`Filter by ${option.label} status`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: 'date' as const, label: 'Date' },
                    { value: 'impact' as const, label: 'Impact' },
                    { value: 'confidence' as const, label: 'Confidence' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`h-12 px-4 rounded-lg font-medium transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-600 text-white shadow-md'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                      aria-label={`Sort by ${option.label}`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <span className="ml-2">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredAndSortedItems.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-lg">No refactoring history items found</p>
              <p className="text-sm mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredAndSortedItems.map(item => (
              <div
                key={item.id}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl" role="img" aria-label={item.type}>
                        {getTypeIcon(item.type)}
                      </span>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <span className={`text-sm font-medium ${
                        statusOptions.find(opt => opt.value === item.status)?.color
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>

                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        By {item.author}
                      </span>
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {item.filesChanged} file{item.filesChanged !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-medium ${
                        item.linesAdded > item.linesRemoved
                          ? isDarkMode ? 'text-green-400' : 'text-green-600'
                          : isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        +{item.linesAdded} -{item.linesRemoved}
                      </span>
                      {item.confidenceScore && (
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                          {item.confidenceScore}% confidence
                        </span>
                      )}
                    </div>

                    {item.relatedFiles && item.relatedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.relatedFiles.slice(0, 3).map((file, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 text-xs font-mono rounded-full ${
                              isDarkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {file}
                          </span>
                        ))}
                        {item.relatedFiles.length > 3 && (
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            +{item.relatedFiles.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(item.id)}
                        className={`h-12 px-6 font-medium rounded-lg transition-colors shadow-md ${
                          isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={`View details of ${item.title}`}
                      >
                        Details
                      </button>
                    )}
                    
                    {item.status === 'applied' && onRevert && (
                      <button
                        onClick={() => onRevert(item.id)}
                        className={`h-12 px-6 font-medium rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-yellow-400 hover:bg-yellow-900/20'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                        aria-label={`Revert ${item.title}`}
                      >
                        Revert
                      </button>
                    )}
                    
                    {item.status === 'reverted' && onReapply && (
                      <button
                        onClick={() => onReapply(item.id)}
                        className={`h-12 px-6 font-medium rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-green-400 hover:bg-green-900/20'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        aria-label={`Reapply ${item.title}`}
                      >
                        Reapply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('RefactoringHistory error:', error);
    return (
      <div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
        Error rendering refactoring history
      </div>
    );
  }
};