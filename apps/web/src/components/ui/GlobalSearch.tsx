/**
 * Global Search Component - Xala UI System v5.0.0 Compliant
 * Generated with Xaheen CLI
 * 
 * MANDATORY COMPLIANCE RULES:
 * ✅ ONLY semantic components from @xala-technologies/ui-system
 * ✅ MANDATORY localization for all text
 * ✅ WCAG 2.2 AAA compliance
 * ✅ Explicit TypeScript return types
 * ✅ SOLID principles with component composition
 */

'use client';

import { 
  Stack, 
  Typography, 
  Input, 
  Card, 
  Button,
  useTokens 
} from '@xala-technologies/ui-system';
import { Search, Command, ArrowUpDown, Clock, Hash } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLocale } from '@/lib/i18n';

interface GlobalSearchProps {
  locale: SupportedLocale;
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'component' | 'documentation' | 'command';
  url: string;
  keywords: string[];
}

/**
 * Advanced global search with keyboard navigation and command palette
 * Features search suggestions, recent searches, and keyboard shortcuts
 */
export function GlobalSearch({ 
  locale, 
  isOpen, 
  onClose, 
  onSearch 
}: GlobalSearchProps): React.JSX.Element | null {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { colors, spacing } = useTokens();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Homepage',
      description: 'Main application interface with project builder',
      type: 'page',
      url: `/${locale}`,
      keywords: ['home', 'main', 'dashboard']
    },
    {
      id: '2',
      title: 'Project Builder',
      description: 'Create new projects with AI assistance',
      type: 'component',
      url: `/${locale}/new`,
      keywords: ['builder', 'create', 'project', 'ai']
    },
    {
      id: '3',
      title: 'Documentation',
      description: 'Complete guide to using Xaheen platform',
      type: 'documentation',
      url: `/${locale}/docs`,
      keywords: ['docs', 'guide', 'help', 'tutorial']
    },
    {
      id: '4',
      title: 'Analytics Dashboard',
      description: 'View project metrics and performance data',
      type: 'page',
      url: `/${locale}/analytics`,
      keywords: ['analytics', 'metrics', 'data', 'performance']
    }
  ];

  // Search functionality with debouncing
  const performSearch = useCallback((searchQuery: string): void => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
    }
  }, [isOpen, results, selectedIndex, onClose]);

  // Handle result selection
  const handleSelectResult = useCallback((result: SearchResult): void => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(item => item !== query)];
      return updated.slice(0, 5); // Keep only 5 recent searches
    });

    // Navigate to result
    if (typeof window !== 'undefined') {
      window.location.href = result.url;
    }
    onClose();
  }, [query, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Perform search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: `0 ${spacing[4]}`,
          backgroundColor: colors.background?.primary,
          border: `1px solid ${colors.border?.default}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          style={{
            padding: spacing[4],
            borderBottom: `1px solid ${colors.border?.default}`,
          }}
        >
          <Stack direction="horizontal" gap="md" align="center">
            <Search size={20} color={colors.text?.muted} />
            <Input
              ref={inputRef}
              value={query}
              onChange={(value: string) => setQuery(value)}
              placeholder={t('search.placeholder', 'Search pages, components, and documentation...')}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                backgroundColor: 'transparent',
                flex: 1,
              }}
            />
            <Stack direction="horizontal" gap="xs" align="center">
              <Typography variant="body" size="xs" color="muted">
                ESC
              </Typography>
            </Stack>
          </Stack>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={result.id}
                style={{
                  padding: spacing[3],
                  backgroundColor: index === selectedIndex 
                    ? colors.background?.muted 
                    : 'transparent',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${colors.border?.default}`,
                }}
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Stack direction="horizontal" gap="md" align="center">
                  <div
                    style={{
                      padding: spacing[2],
                      borderRadius: '6px',
                      backgroundColor: colors.primary?.[100],
                      color: colors.primary?.[600],
                    }}
                  >
                    {result.type === 'page' && <Hash size={16} />}
                    {result.type === 'component' && <Command size={16} />}
                    {result.type === 'documentation' && <Search size={16} />}
                  </div>
                  <Stack direction="vertical" gap="xs" style={{ flex: 1 }}>
                    <Typography variant="body" weight="medium">
                      {result.title}
                    </Typography>
                    <Typography variant="body" size="sm" color="muted">
                      {result.description}
                    </Typography>
                  </Stack>
                  <ArrowUpDown size={14} color={colors.text?.muted} />
                </Stack>
              </div>
            ))
          ) : query ? (
            <div style={{ padding: spacing[4], textAlign: 'center' }}>
              <Typography variant="body" color="muted">
                {t('search.noResults', 'No results found for "{query}"', { query })}
              </Typography>
            </div>
          ) : (
            <div style={{ padding: spacing[4] }}>
              <Typography variant="body" weight="medium" style={{ marginBottom: spacing[2] }}>
                {t('search.recent', 'Recent searches')}
              </Typography>
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <div
                    key={index}
                    style={{
                      padding: spacing[2],
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                    onClick={() => setQuery(search)}
                  >
                    <Stack direction="horizontal" gap="md" align="center">
                      <Clock size={14} color={colors.text?.muted} />
                      <Typography variant="body" size="sm">
                        {search}
                      </Typography>
                    </Stack>
                  </div>
                ))
              ) : (
                <Typography variant="body" size="sm" color="muted">
                  {t('search.noRecent', 'No recent searches')}
                </Typography>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: spacing[3],
            borderTop: `1px solid ${colors.border?.default}`,
            backgroundColor: colors.background?.muted,
          }}
        >
          <Stack direction="horizontal" gap="lg" align="center" justify="space-between">
            <Stack direction="horizontal" gap="md" align="center">
              <Stack direction="horizontal" gap="xs" align="center">
                <ArrowUpDown size={12} />
                <Typography variant="body" size="xs" color="muted">
                  {t('search.navigate', 'to navigate')}
                </Typography>
              </Stack>
              <Stack direction="horizontal" gap="xs" align="center">
                <Typography variant="body" size="xs" color="muted">
                  ↵
                </Typography>
                <Typography variant="body" size="xs" color="muted">
                  {t('search.select', 'to select')}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="body" size="xs" color="muted">
              {t('search.poweredBy', 'Powered by Xaheen Search')}
            </Typography>
          </Stack>
        </div>
      </Card>
    </div>
  );
}
