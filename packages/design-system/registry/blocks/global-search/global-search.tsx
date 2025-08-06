/**
 * Global Search Component Block
 * WCAG AAA compliant with keyboard shortcuts and Norwegian language
 * Advanced search with filters, recent searches, and AI suggestions
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly category: string;
  readonly url: string;
  readonly icon?: React.ReactNode;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly timestamp?: Date;
}

export interface GlobalSearchTexts {
  readonly placeholder: string;
  readonly searchPrompt: string;
  readonly searchAriaLabel: string;
  readonly filterAriaLabel: string;
  readonly closeAriaLabel: string;
  readonly recentSearches: string;
  readonly aiSuggestions: string;
  readonly noResultsFound: string;
  readonly resultCount: string;
  readonly navigateHint: string;
  readonly selectHint: string;
  readonly closeHint: string;
  readonly categoryLabel: string;
  readonly searching: string;
  readonly aiSuggestionSample: string;
  readonly aiSuggestionDescription: string;
  readonly dialogLabel: string;
  readonly resultsAriaLabel: string;
}

export interface GlobalSearchCallbacks {
  readonly onSearch: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  readonly onResultClick?: (result: SearchResult) => void;
  readonly onRecentSearchClick?: (query: string) => void;
  readonly onAnnounce?: (message: string) => void;
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
  readonly onKeyboardShortcut?: (key: string) => void;
}

export interface GlobalSearchState {
  readonly isOpen: boolean;
  readonly query: string;
  readonly results: SearchResult[];
  readonly loading: boolean;
  readonly selectedIndex: number;
  readonly showFilterPanel: boolean;
  readonly filters: SearchFilters;
}

export interface GlobalSearchStateCallbacks {
  readonly onStateChange?: (state: Partial<GlobalSearchState>) => void;
  readonly onQueryChange?: (query: string) => void;
  readonly onResultsChange?: (results: SearchResult[]) => void;
  readonly onLoadingChange?: (loading: boolean) => void;
  readonly onSelectedIndexChange?: (index: number) => void;
  readonly onFiltersChange?: (filters: SearchFilters) => void;
}

export interface GlobalSearchProps {
  readonly texts?: Partial<GlobalSearchTexts>;
  readonly callbacks: GlobalSearchCallbacks;
  readonly stateCallbacks?: GlobalSearchStateCallbacks;
  readonly recentSearches?: string[];
  readonly showFilters?: boolean;
  readonly showAISuggestions?: boolean;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly maxResults?: number;
  readonly debounceMs?: number;
  readonly keyboardShortcut?: string;
  readonly initialState?: Partial<GlobalSearchState>;
}

export interface SearchFilters {
  readonly category?: string[];
  readonly dateRange?: { from: Date; to: Date };
  readonly nsmClassification?: string[];
  readonly sortBy?: 'relevance' | 'date' | 'title';
}

const defaultTexts: GlobalSearchTexts = {
  placeholder: 'Search everything... (Ctrl+K)',
  searchPrompt: 'Search for documents, users, projects...',
  searchAriaLabel: 'Search input',
  filterAriaLabel: 'Show filters',
  closeAriaLabel: 'Close search',
  recentSearches: 'Recent searches',
  aiSuggestions: 'AI suggestions',
  noResultsFound: 'No results found for',
  resultCount: 'results',
  navigateHint: 'Navigate',
  selectHint: 'Select',
  closeHint: 'Close',
  categoryLabel: 'Category',
  searching: 'Searching...',
  aiSuggestionSample: 'Find documents from last week',
  aiSuggestionDescription: 'Show all documents modified between January 22-29',
  dialogLabel: 'Global search',
  resultsAriaLabel: 'Search results'
}

const defaultCategories = [
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'users', label: 'Users', icon: '👤' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

const defaultState: GlobalSearchState = {
  isOpen: false,
  query: '',
  results: [],
  loading: false,
  selectedIndex: -1,
  showFilterPanel: false,
  filters: {}
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  texts = {},
  callbacks,
  stateCallbacks,
  recentSearches = [],
  showFilters = true,
  showAISuggestions = true,
  className,
  disabled = false,
  maxResults = 50,
  debounceMs = 300,
  keyboardShortcut = 'k',
  initialState = {}
}) => {
  // Merge with default texts
  const t = { ...defaultTexts, ...texts };
  
  // Use controlled state via props or internal fallback
  const currentState = { ...defaultState, ...initialState };
  const {
    isOpen,
    query,
    results,
    loading,
    selectedIndex,
    filters,
    showFilterPanel
  } = currentState;
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State management functions
  const updateState = useCallback((updates: Partial<GlobalSearchState>) => {
    stateCallbacks?.onStateChange?.(updates);
  }, [stateCallbacks]);
  
  const announce = useCallback((message: string) => {
    callbacks.onAnnounce?.(message);
  }, [callbacks]);

  // Keyboard shortcut handler
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === keyboardShortcut) {
      e.preventDefault();
      callbacks.onKeyboardShortcut?.(keyboardShortcut);
      callbacks.onOpen?.();
      updateState({ isOpen: true });
    } else if (e.key === 'Escape' && isOpen) {
      callbacks.onClose?.();
      updateState({ isOpen: false });
    }
  }, [keyboardShortcut, isOpen, callbacks, updateState]);

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    if (disabled) return;
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown, disabled]);

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [isOpen, disabled]);

  // Search execution
  const executeSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (!searchQuery.trim()) {
      stateCallbacks?.onResultsChange?.([]);
      updateState({ results: [], loading: false });
      return;
    }

    stateCallbacks?.onLoadingChange?.(true);
    updateState({ loading: true });
    announce(t.searching);

    try {
      const searchResults = await callbacks.onSearch(searchQuery, searchFilters);
      const limitedResults = searchResults.slice(0, maxResults);
      
      stateCallbacks?.onResultsChange?.(limitedResults);
      updateState({ results: limitedResults, loading: false });
      announce(`${limitedResults.length} ${t.resultCount}`);
    } catch (error) {
      announce('Search failed');
      console.error('Search error:', error);
      updateState({ loading: false, results: [] });
    }
  }, [callbacks, stateCallbacks, updateState, announce, t, maxResults]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) return;
    
    const timer = setTimeout(() => {
      executeSearch(query, filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, filters, executeSearch, debounceMs]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : selectedIndex;
        stateCallbacks?.onSelectedIndexChange?.(nextIndex);
        updateState({ selectedIndex: nextIndex });
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
        stateCallbacks?.onSelectedIndexChange?.(prevIndex);
        updateState({ selectedIndex: prevIndex });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Tab':
        if (e.shiftKey && showFilters) {
          e.preventDefault();
          const newShowFilterPanel = !showFilterPanel;
          updateState({ showFilterPanel: newShowFilterPanel });
        }
        break;
    }
  }, [disabled, selectedIndex, results, showFilters, showFilterPanel, stateCallbacks, updateState]);

  const handleResultClick = useCallback((result: SearchResult) => {
    callbacks.onResultClick?.(result);
    callbacks.onClose?.();
    updateState({ isOpen: false, query: '', selectedIndex: -1 });
    stateCallbacks?.onQueryChange?.('');
    announce(`Navigating to ${result.title}`);
  }, [callbacks, updateState, stateCallbacks, announce]);

  const handleQueryChange = useCallback((newQuery: string) => {
    stateCallbacks?.onQueryChange?.(newQuery);
    updateState({ query: newQuery, selectedIndex: -1 });
  }, [stateCallbacks, updateState]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    callbacks.onOpen?.();
    updateState({ isOpen: true });
  }, [disabled, callbacks, updateState]);

  const handleClose = useCallback(() => {
    callbacks.onClose?.();
    updateState({ isOpen: false, selectedIndex: -1 });
  }, [callbacks, updateState]);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        disabled={disabled}
        className={cn(
          'flex items-center gap-3 h-12 px-4 w-full max-w-md',
          'bg-background border-2 border-input rounded-lg',
          'hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-label={t.searchAriaLabel}
      >
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left text-muted-foreground">{t.placeholder}</span>
        <kbd className="hidden sm:inline-flex h-6 px-2 items-center gap-1 rounded bg-muted text-xs">
          <span>⌘</span>{keyboardShortcut.toUpperCase()}
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Search Dialog */}
      <div 
        ref={searchRef}
        className={cn(
          'fixed z-50 w-full max-w-3xl p-4',
          'top-[20%] left-1/2 -translate-x-1/2',
          'animate-in fade-in slide-in-from-bottom-4'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel}
      >
        <div className="bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <svg className="h-5 w-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.searchPrompt}
              disabled={disabled}
              className="flex-1 border-0 focus:ring-0 h-12 text-lg"
              aria-label={t.searchAriaLabel}
              aria-describedby="search-status"
            />

            {showFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateState({ showFilterPanel: !showFilterPanel })}
                disabled={disabled}
                aria-label={t.filterAriaLabel}
                aria-pressed={showFilterPanel}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={disabled}
              aria-label={t.closeAriaLabel}
            >
              <span className="text-xl">×</span>
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-4 border-b bg-muted/50">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.categoryLabel}</label>
                  <div className="flex gap-2">
                    {defaultCategories.map(cat => (
                      <Button
                        key={cat.id}
                        variant={filters.category?.includes(cat.id) ? 'secondary' : 'outline'}
                        size="md"
                        disabled={disabled}
                        onClick={() => {
                          const newCategory = filters.category?.includes(cat.id)
                            ? filters.category.filter(c => c !== cat.id)
                            : [...(filters.category || []), cat.id];
                          
                          const newFilters = { ...filters, category: newCategory };
                          stateCallbacks?.onFiltersChange?.(newFilters);
                          updateState({ filters: newFilters });
                        }}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div 
            className="max-h-[400px] overflow-y-auto"
            role="listbox"
            aria-label={t.resultsAriaLabel}
            id="search-status"
          >
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {t.recentSearches}
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleQueryChange(search);
                        callbacks.onRecentSearchClick?.(search);
                      }}
                      disabled={disabled}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent text-left disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {showAISuggestions && !query && (
              <div className="p-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {t.aiSuggestions}
                </h3>
                <div className="space-y-2">
                  <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-left">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="font-medium">{t.aiSuggestionSample}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.aiSuggestionDescription}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{t.searching}</span>
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && query && results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => stateCallbacks?.onSelectedIndexChange?.(index)}
                    className={cn(
                      'flex items-start gap-3 w-full p-3 rounded-lg text-left transition-colors',
                      'hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {result.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        {result.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {result.category}
                        </span>
                        {result.nsmClassification && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            result.nsmClassification === 'OPEN' && 'bg-green-100 text-green-700',
                            result.nsmClassification === 'RESTRICTED' && 'bg-yellow-100 text-yellow-700',
                            result.nsmClassification === 'CONFIDENTIAL' && 'bg-red-100 text-red-700',
                            result.nsmClassification === 'SECRET' && 'bg-gray-100 text-gray-700'
                          )}>
                            {result.nsmClassification}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedIndex === index && (
                      <kbd className="hidden sm:inline-flex h-6 px-2 items-center rounded bg-muted text-xs">
                        ↵
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  {t.noResultsFound} "{query}"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↑↓</kbd>
                {t.navigateHint}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">↵</kbd>
                {t.selectHint}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">esc</kbd>
                {t.closeHint}
              </span>
            </div>
            {results.length > 0 && (
              <span>{results.length} {t.resultCount}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};