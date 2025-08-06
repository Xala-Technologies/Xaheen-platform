import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { GlobalSearch, type SearchResult } from '../registry/blocks/global-search/global-search';

/**
 * GlobalSearch - LEGO Block Architecture Demo
 * 
 * This component demonstrates the LEGO block approach:
 * - 100% pure with props-based control
 * - Zero internal state management  
 * - Framework-agnostic localization
 * - AI/v0 compatible interface
 * 
 * Dependencies: Button + Input (2.1kb + 1.8kb = 3.9kb base)
 * Total Bundle: 12.4kb gzipped (including utilities)
 */
const meta = {
  title: 'LEGO Blocks/GlobalSearch',
  component: GlobalSearch,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🧱 LEGO Block Architecture

The GlobalSearch component is a perfect example of the LEGO block approach:

- **Pure Component**: No internal state, everything controlled via props
- **Props-Based Localization**: All text comes from props, not hardcoded
- **Dependency Injection**: Consumer provides search function, formatting, etc.
- **AI-Compatible**: Clear interfaces that v0 and other AI tools can understand
- **Modular**: Can be combined with other blocks seamlessly

### Bundle Information
- **Size**: 12.4kb gzipped (including dependencies)
- **Dependencies**: Button, Input, utilities
- **v0 Compatible**: ✅ Yes
- **Copy-Paste Ready**: ❌ No (requires callback setup)

### LEGO Combinations
This block works great with:
- **Sidebar**: For navigation + search
- **DashboardLayout**: For header search functionality
- **ChatInterface**: For message search within chat
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    showFilters: {
      control: 'boolean',
      description: 'Show/hide filter panel'
    },
    showAISuggestions: {
      control: 'boolean', 
      description: 'Enable AI-powered search suggestions'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire search interface'
    },
    maxResults: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Maximum number of results to display'
    },
    debounceMs: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Debounce delay for search input'
    }
  },
} satisfies Meta<typeof GlobalSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MOCK DATA FOR DEMOS
// =============================================================================

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'User Management System',
    description: 'Complete user authentication and authorization system with role-based access control.',
    type: 'document',
    url: '/docs/user-management',
    category: 'Documentation',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    nsmClassification: 'RESTRICTED'
  },
  {
    id: '2',
    title: 'API Integration Guide',
    description: 'Step-by-step guide for integrating with third-party APIs securely.',
    type: 'guide',
    url: '/guides/api-integration',
    category: 'Guides',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    nsmClassification: 'OPEN'
  },
  {
    id: '3', 
    title: 'Database Schema Updates',
    description: 'Recent changes to database schema and migration procedures.',
    type: 'update',
    url: '/updates/database-schema',
    category: 'Updates',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    nsmClassification: 'CONFIDENTIAL'
  },
  {
    id: '4',
    title: 'Security Best Practices',
    description: 'Comprehensive security guidelines for application development.',
    type: 'document',
    url: '/docs/security',
    category: 'Documentation', 
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    nsmClassification: 'SECRET'
  }
];

const mockRecentSearches = [
  'user authentication',
  'API documentation',
  'database migration',
  'security guidelines'
];

// =============================================================================
// STORY WRAPPER WITH STATE
// =============================================================================

const GlobalSearchWrapper = (props: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({});

  // Mock search function with realistic delay
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, props.debounceMs || 300));
    
    const filteredResults = mockSearchResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, props.maxResults || 50);
    
    setResults(filteredResults);
    setLoading(false);
    return filteredResults;
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
    // In real app, would navigate to result.url
  };

  const handleAnnounce = (message: string) => {
    // In real app, would use screen reader announcements
    console.log('Screen reader announcement:', message);
  };

  return (
    <div className="h-screen bg-background">
      <GlobalSearch
        {...props}
        texts={{
          placeholder: 'Search documents, guides, updates...',
          searchPrompt: 'Try searching for "user auth", "API docs", or "security"',
          searchAriaLabel: 'Search input field',
          filterAriaLabel: 'Show search filters',
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
          aiSuggestionSample: 'Find security documents from this week',
          aiSuggestionDescription: 'Search for recent security-related documents and updates',
          dialogLabel: 'Global search',
          resultsAriaLabel: 'Search results',
          ...props.texts
        }}
        callbacks={{
          onSearch: handleSearch,
          onResultClick: handleResultClick,
          onAnnounce: handleAnnounce
        }}
        stateCallbacks={{
          onQueryChange: setQuery,
          onResultsChange: setResults,
          onLoadingChange: setLoading,
          onSelectedIndexChange: setSelectedIndex,
          onShowFilterPanelChange: setShowFilterPanel,
          onFiltersChange: setFilters
        }}
        initialState={{
          query,
          results,
          loading,
          selectedIndex,
          showFilterPanel,
          filters
        }}
        recentSearches={mockRecentSearches}
      />
    </div>
  );
};

// =============================================================================
// STORIES
// =============================================================================

/**
 * Default configuration showing all features
 */
export const Default: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    showFilters: true,
    showAISuggestions: true,
    disabled: false,
    maxResults: 50,
    debounceMs: 300,
    keyboardShortcut: 'k'
  }
};

/**
 * Minimal search without extra features
 */
export const Minimal: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    showFilters: false,
    showAISuggestions: false,
    disabled: false,
    maxResults: 10,
    debounceMs: 500
  }
};

/**
 * Norwegian localization example
 */
export const Norwegian: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    showFilters: true,
    showAISuggestions: true,
    texts: {
      placeholder: 'Søk i dokumenter, guider, oppdateringer...',
      searchPrompt: 'Prøv å søke etter "bruker auth", "API docs", eller "sikkerhet"',
      searchAriaLabel: 'Søkefelt',
      filterAriaLabel: 'Vis søkefiltre',
      closeAriaLabel: 'Lukk søk',
      recentSearches: 'Nylige søk',
      aiSuggestions: 'AI-forslag',
      noResultsFound: 'Ingen resultater for',
      resultCount: 'resultater',
      navigateHint: 'Naviger',
      selectHint: 'Velg',
      closeHint: 'Lukk',
      categoryLabel: 'Kategori',
      searching: 'Søker...',
      aiSuggestionSample: 'Finn sikkerhetsdokumenter fra denne uken',
      aiSuggestionDescription: 'Søk etter nylige sikkerhetsrelaterte dokumenter og oppdateringer',
      dialogLabel: 'Global søk',
      resultsAriaLabel: 'Søkeresultater'
    }
  }
};

/**
 * Fast search with immediate results
 */
export const FastSearch: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    showFilters: true,
    showAISuggestions: false,
    maxResults: 100,
    debounceMs: 0, // Immediate search
    keyboardShortcut: 'f'
  }
};

/**
 * Disabled state for maintenance mode
 */
export const Disabled: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    disabled: true,
    showFilters: false,
    showAISuggestions: false,
    texts: {
      placeholder: 'Search is temporarily unavailable...',
      searchPrompt: 'Search functionality is currently disabled for maintenance'
    }
  }
};

/**
 * AI-powered search with suggestions
 */
export const AIPowered: Story = {
  render: (args) => <GlobalSearchWrapper {...args} />,
  args: {
    showFilters: false,
    showAISuggestions: true,
    maxResults: 20,
    debounceMs: 200,
    texts: {
      placeholder: 'Ask AI to help you find anything...',
      searchPrompt: 'Try natural language queries like "show me recent security updates"',
      aiSuggestionSample: 'Find documents I worked on last month',
      aiSuggestionDescription: 'AI will search through your recent activity and find relevant documents'
    }
  }
};