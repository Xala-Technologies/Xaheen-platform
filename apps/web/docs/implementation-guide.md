# Implementation Guide for Enterprise UI Components

## Overview

This guide provides comprehensive implementation guidance for the wireframed components, focusing on enterprise-grade standards, accessibility compliance, and scalable architecture patterns.

## Component Architecture Principles

### 1. Design System Integration
All components must integrate with the Xala Enterprise design system principles:

```typescript
// Component structure follows atomic design methodology
interface ComponentProps {
  readonly variant?: 'primary' | 'secondary' | 'tertiary';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly 'aria-label'?: string;
}

export const Component = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: ComponentProps): JSX.Element => {
  // Implementation
};
```

### 2. Accessibility First
Every component must meet WCAG 2.2 AAA standards:

```typescript
// Mandatory accessibility patterns
const AccessibilityChecklist = {
  ariaLabels: 'All interactive elements must have proper ARIA labels',
  keyboardNavigation: 'Full keyboard support with logical tab order',
  screenReader: 'Content announced clearly with proper roles',
  colorContrast: '7:1 ratio for text, 3:1 for interactive elements',
  focusManagement: 'Visible focus indicators and proper focus flow'
};
```

### 3. Responsive Design Standards
Components must work across all device sizes:

```scss
// Mobile-first responsive breakpoints
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'large': 1200px,
  'xlarge': 1440px
);

// Component must adapt gracefully at each breakpoint
@mixin responsive-component {
  // Mobile first
  min-width: 100%;
  
  @media (min-width: map-get($breakpoints, 'tablet')) {
    // Tablet adaptations
  }
  
  @media (min-width: map-get($breakpoints, 'desktop')) {
    // Desktop optimizations
  }
}
```

## Component Implementation Patterns

### Navigation Components

#### Navbar Implementation
```typescript
interface NavbarProps {
  readonly brand: {
    logo: string;
    title: string;
    href: string;
  };
  readonly navigation: NavigationItem[];
  readonly user?: UserProfile;
  readonly onSearch?: (query: string) => void;
}

export const Navbar = ({ brand, navigation, user, onSearch }: NavbarProps): JSX.Element => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Keyboard event handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsSearchActive(false);
      setIsMobileMenuOpen(false);
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <nav 
      className="navbar" 
      role="navigation" 
      aria-label="Main navigation"
    >
      {/* Implementation with full accessibility support */}
    </nav>
  );
};
```

#### Sidebar Implementation Pattern
```typescript
interface SidebarProps {
  readonly isCollapsed?: boolean;
  readonly navigationTree: NavigationTreeItem[];
  readonly onNavigate?: (path: string) => void;
  readonly onToggleCollapse?: () => void;
}

export const Sidebar = ({ 
  isCollapsed = false, 
  navigationTree, 
  onNavigate,
  onToggleCollapse 
}: SidebarProps): JSX.Element => {
  // ARIA tree navigation implementation
  const handleKeyNavigation = useCallback((event: KeyboardEvent, item: NavigationTreeItem) => {
    switch (event.key) {
      case 'ArrowRight':
        // Expand if collapsed, move to first child if expanded
        break;
      case 'ArrowLeft':
        // Collapse if expanded, move to parent if collapsed
        break;
      case 'ArrowDown':
        // Move to next item
        break;
      case 'ArrowUp':
        // Move to previous item
        break;
      case 'Enter':
      case ' ':
        // Activate item
        onNavigate?.(item.path);
        break;
    }
  }, [onNavigate]);
  
  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Tree navigation with full keyboard support */}
    </aside>
  );
};
```

### Layout Components

#### Dashboard Implementation
```typescript
interface DashboardProps {
  readonly user: UserProfile;
  readonly kpis: KPICard[];
  readonly charts: ChartData[];
  readonly activities: ActivityItem[];
  readonly quickActions: QuickAction[];
}

export const Dashboard = ({ 
  user, 
  kpis, 
  charts, 
  activities, 
  quickActions 
}: DashboardProps): JSX.Element => {
  // Performance optimization with React.memo for expensive components
  const MemoizedChart = useMemo(() => React.memo(ChartComponent), []);
  
  return (
    <main className="dashboard" role="main" aria-label="Dashboard overview">
      <section className="dashboard-header" aria-labelledby="welcome-heading">
        <h1 id="welcome-heading">Welcome back, {user.name}</h1>
        <div className="quick-actions" role="group" aria-label="Quick actions">
          {quickActions.map(action => (
            <QuickActionButton 
              key={action.id} 
              {...action} 
              aria-describedby={`action-${action.id}-desc`}
            />
          ))}
        </div>
      </section>
      
      <section className="kpi-section" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        <div className="kpi-grid" role="group">
          {kpis.map(kpi => (
            <KPICard key={kpi.id} {...kpi} />
          ))}
        </div>
      </section>
      
      {/* Additional sections with proper semantic structure */}
    </main>
  );
};
```

#### Data Table Implementation Pattern
```typescript
interface DataTableProps<T> {
  readonly data: T[];
  readonly columns: ColumnDefinition<T>[];
  readonly pagination?: PaginationConfig;
  readonly sorting?: SortingConfig;
  readonly filtering?: FilteringConfig;
  readonly selection?: SelectionConfig;
  readonly onRowAction?: (action: string, row: T) => void;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  pagination,
  sorting,
  filtering,
  selection,
  onRowAction
}: DataTableProps<T>): JSX.Element => {
  const [sortState, setSortState] = useState<SortState>();
  const [filterState, setFilterState] = useState<FilterState>();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  // Keyboard navigation for table
  const handleTableKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const currentRow = target.closest('[role="row"]');
    
    switch (event.key) {
      case 'ArrowUp':
        // Move to previous row
        break;
      case 'ArrowDown':
        // Move to next row
        break;
      case 'ArrowLeft':
        // Move to previous cell
        break;
      case 'ArrowRight':
        // Move to next cell
        break;
      case ' ':
        if (selection && currentRow) {
          // Toggle row selection
          event.preventDefault();
        }
        break;
    }
  }, [selection]);
  
  return (
    <div className="data-table-container">
      <table 
        className="data-table"
        role="table"
        aria-label="Data table"
        onKeyDown={handleTableKeyDown}
      >
        <thead role="rowgroup">
          <tr role="row">
            {selection && (
              <th role="columnheader">
                <input 
                  type="checkbox"
                  aria-label="Select all rows"
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map(column => (
              <th 
                key={column.key}
                role="columnheader"
                aria-sort={getSortAriaSort(column.key, sortState)}
                tabIndex={0}
                onClick={() => handleSort(column.key)}
                onKeyDown={(e) => handleSortKeyDown(e, column.key)}
              >
                {column.title}
                {sorting && <SortIndicator column={column.key} sortState={sortState} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {processedData.map((row, index) => (
            <tr 
              key={getRowKey(row, index)}
              role="row"
              aria-selected={selectedRows.has(getRowKey(row, index))}
              tabIndex={0}
            >
              {/* Row cells with proper accessibility */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Interactive Components

#### Pagination Implementation
```typescript
interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange?: (size: number) => void;
  readonly showPageSizeSelector?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false
}: PaginationProps): JSX.Element => {
  const generatePageNumbers = useCallback(() => {
    // Smart page number generation logic
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  }, [currentPage, totalPages]);
  
  return (
    <nav 
      className="pagination" 
      role="navigation" 
      aria-label="Pagination navigation"
    >
      <button
        className="pagination-button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
      >
        Previous
      </button>
      
      {generatePageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        className="pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
      >
        Next
      </button>
      
      <div className="pagination-info">
        Showing {(currentPage - 1) * pageSize + 1} to{' '}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
      </div>
    </nav>
  );
};
```

### Communication Components

#### Chat Interface Implementation
```typescript
interface ChatInterfaceProps {
  readonly isOpen: boolean;
  readonly messages: ChatMessage[];
  readonly isTyping?: boolean;
  readonly onSendMessage: (message: string) => void;
  readonly onClose: () => void;
  readonly onMinimize?: () => void;
}

export const ChatInterface = ({
  isOpen,
  messages,
  isTyping = false,
  onSendMessage,
  onClose,
  onMinimize
}: ChatInterfaceProps): JSX.Element => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onSendMessage]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
    if (event.key === 'Escape') {
      onClose();
    }
  }, [handleSendMessage, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="chat-interface"
      role="dialog"
      aria-label="Chat interface"
      aria-modal="true"
    >
      <header className="chat-header">
        <h2 id="chat-title">Customer Support</h2>
        <div className="chat-controls">
          {onMinimize && (
            <button
              className="chat-control-button"
              onClick={onMinimize}
              aria-label="Minimize chat"
            >
              −
            </button>
          )}
          <button
            className="chat-control-button"
            onClick={onClose}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
      </header>
      
      <div 
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          aria-label="Type your message"
          rows={1}
        />
        <button
          className="chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};
```

## Testing Strategy

### Component Testing
```typescript
// Comprehensive testing for each component
describe('Component', () => {
  // Accessibility testing
  it('should meet WCAG AAA standards', () => {
    const { container } = render(<Component />);
    expect(container).toBeAccessible();
  });
  
  // Keyboard navigation testing
  it('should support keyboard navigation', () => {
    render(<Component />);
    // Test all keyboard interactions
  });
  
  // Responsive testing
  it('should adapt to different screen sizes', () => {
    // Test component at different viewport sizes
  });
  
  // Performance testing
  it('should render within performance budgets', () => {
    // Test rendering time and memory usage
  });
});
```

### Visual Regression Testing
```typescript
// Storybook integration for visual testing
export default {
  title: 'Components/Component',
  component: Component,
  parameters: {
    docs: {
      description: {
        component: 'Component description and usage guidelines'
      }
    },
    a11y: {
      config: {
        rules: [
          // Custom accessibility rules
        ]
      }
    }
  }
} as Meta;
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const OptimizedComponent = (): JSX.Element => (
  <Suspense fallback={<ComponentSkeleton />}>
    <HeavyComponent />
  </Suspense>
);
```

### Memory Management
```typescript
// Proper cleanup in components
export const Component = (): JSX.Element => {
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Component implementation
};
```

## Documentation Requirements

Each component must include:

1. **API Documentation**: Complete prop interface documentation
2. **Usage Examples**: Multiple usage scenarios with code examples
3. **Accessibility Notes**: Specific accessibility features and requirements
4. **Design Tokens**: Used tokens and customization options
5. **Browser Support**: Compatibility matrix and known issues
6. **Migration Guide**: Updates and breaking changes documentation

This implementation guide ensures all components meet enterprise standards for accessibility, performance, and maintainability while providing consistent user experiences across all platforms and devices.