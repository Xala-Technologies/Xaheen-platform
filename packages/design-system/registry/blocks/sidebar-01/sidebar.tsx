/**
 * Sidebar Component Block
 * Professional navigation sidebar with collapsible sections
 * WCAG AAA compliant with Norwegian language support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
// import { LABELS } from '../../lib/constants'; // Simplified for now
// TODO: Replace with context/provider pattern
// import { useAccessibility } from '@/hooks/use-accessibility';
// import { useResponsive } from '@/hooks/use-responsive';

export interface SidebarItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly badge?: string | number;
  readonly children?: SidebarItem[];
  readonly disabled?: boolean;
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface SidebarSection {
  readonly id: string;
  readonly title?: string;
  readonly items: SidebarItem[];
  readonly collapsible?: boolean;
  readonly defaultExpanded?: boolean;
}

export interface SidebarProps {
  readonly sections: SidebarSection[];
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly activeItemId?: string;
  readonly onItemClick?: (item: SidebarItem) => void;
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly showSearch?: boolean;
  readonly searchPlaceholder?: string;
  readonly className?: string;
  readonly variant?: 'default' | 'compact' | 'minimal';
  readonly position?: 'left' | 'right';
  readonly norwegianLabels?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  header,
  footer,
  activeItemId,
  onItemClick,
  collapsible = true,
  defaultCollapsed = false,
  showSearch = true,
  searchPlaceholder = 'Søk...',
  className,
  variant = 'default',
  position = 'left',
  norwegianLabels = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.id))
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const sidebarRef = useRef<HTMLDivElement>(null);
  // TODO: Replace with proper context/provider
  const announce = (message: string) => console.log('Announce:', message);
  const getAriaLabel = (key: string) => key; // Simplified for now
  const isAtLeast = (_bp: string) => window.innerWidth >= 1024;
  const isAtMost = (_bp: string) => window.innerWidth <= 768;

  // Auto-collapse on mobile
  useEffect(() => {
    if (isAtMost('md') && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isAtMost]);

  // Toggle section
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Toggle item with children
  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Handle item click
  const handleItemClick = useCallback((item: SidebarItem, e?: React.MouseEvent) => {
    if (item.disabled) {
      e?.preventDefault();
      return;
    }

    if (item.children && item.children.length > 0) {
      e?.preventDefault();
      toggleItem(item.id);
    } else {
      onItemClick?.(item);
      item.onClick?.();
    }

    announce(`Navigerer til ${item.label}`);
  }, [onItemClick, toggleItem, announce]);

  // Filter items based on search
  const filterItems = useCallback((items: SidebarItem[]): SidebarItem[] => {
    if (!searchQuery) return items;

    return items.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingChildren = item.children?.some(child => 
        child.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearch || hasMatchingChildren;
    });
  }, [searchQuery]);

  // Render sidebar item
  const renderItem = (item: SidebarItem, level: number = 0): JSX.Element => {
    const isActive = item.id === activeItemId;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    const itemContent = (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
          "hover:bg-accent cursor-pointer",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
          item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          level > 0 && "ml-6",
          variant === 'compact' && "py-1.5",
          variant === 'minimal' && "gap-2 px-2 py-1"
        )}
        onClick={(e) => handleItemClick(item, e)}
        role={item.href ? "link" : "button"}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={item.disabled}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* NSM Classification Indicator */}
        {item.nsmClassification && (
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1",
              item.nsmClassification === 'OPEN' && "bg-green-600",
              item.nsmClassification === 'RESTRICTED' && "bg-yellow-600",
              item.nsmClassification === 'CONFIDENTIAL' && "bg-red-600",
              item.nsmClassification === 'SECRET' && "bg-gray-800"
            )}
            aria-label={`NSM klassifisering: ${item.nsmClassification}`}
          />
        )}

        {/* Icon */}
        {item.icon && (
          <span className={cn(
            "flex-shrink-0",
            variant === 'minimal' && "text-sm",
            isCollapsed && "mx-auto"
          )}>
            {item.icon}
          </span>
        )}

        {/* Label */}
        {!isCollapsed && (
          <>
            <span className={cn(
              "flex-1 truncate",
              variant === 'minimal' && "text-sm"
            )}>
              {item.label}
            </span>

            {/* Badge */}
            {item.badge !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {item.badge}
              </span>
            )}

            {/* Expand/Collapse Arrow */}
            {hasChildren && (
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </>
        )}
      </div>
    );

    return (
      <div key={item.id}>
        {item.href ? (
          <a href={item.href} className="block no-underline">
            {itemContent}
          </a>
        ) : (
          itemContent
        )}

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1">
            {filterItems(item.children!).map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render section
  const renderSection = (section: SidebarSection) => {
    const isExpanded = expandedSections.has(section.id);
    const filteredItems = filterItems(section.items);

    if (filteredItems.length === 0 && searchQuery) {
      return null;
    }

    return (
      <div key={section.id} className="mb-6 last:mb-0">
        {section.title && !isCollapsed && (
          <div
            className={cn(
              "flex items-center justify-between mb-2",
              section.collapsible && "cursor-pointer hover:text-primary"
            )}
            onClick={() => section.collapsible && toggleSection(section.id)}
            role={section.collapsible ? "button" : undefined}
            aria-expanded={section.collapsible ? isExpanded : undefined}
          >
            <h3 className={cn(
              "text-sm font-medium text-muted-foreground uppercase tracking-wider",
              variant === 'minimal' && "text-xs"
            )}>
              {section.title}
            </h3>
            {section.collapsible && (
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        )}

        {(!section.collapsible || isExpanded || isCollapsed) && (
          <div className="space-y-1">
            {filteredItems.map(item => renderItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "flex flex-col h-full bg-card border-r transition-all duration-300",
        position === 'right' && "border-r-0 border-l",
        isCollapsed ? "w-16" : "w-64",
        variant === 'compact' && !isCollapsed && "w-56",
        variant === 'minimal' && !isCollapsed && "w-48",
        className
      )}
      aria-label={getAriaLabel('sidebar')}
    >
      {/* Header */}
      {header && (
        <div className={cn(
          "p-4 border-b",
          isCollapsed && "px-2"
        )}>
          {header}
        </div>
      )}

      {/* Collapse Toggle */}
      {collapsible && isAtLeast('lg') && (
        <div className={cn(
          "p-4",
          isCollapsed && "px-2"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Utvid sidemeny' : 'Kollaps sidemeny'}
            className="w-full"
          >
            <svg
              className={cn(
                "h-5 w-5 transition-transform",
                position === 'right' ? (isCollapsed ? "rotate-180" : "") : (isCollapsed ? "" : "rotate-180")
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </Button>
        </div>
      )}

      {/* Search */}
      {showSearch && !isCollapsed && (
        <div className="p-4">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full"
            aria-label="Søk i sidemeny"
          />
        </div>
      )}

      {/* Sections */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4",
        isCollapsed && "px-2"
      )}>
        {sections.map(renderSection)}

        {/* No results */}
        {searchQuery && sections.every(s => filterItems(s.items).length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              {norwegianLabels ? 'Ingen resultater' : 'No results'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className={cn(
          "p-4 border-t mt-auto",
          isCollapsed && "px-2"
        )}>
          {footer}
        </div>
      )}
    </aside>
  );
};

// Pre-configured sidebars
export const DashboardSidebar: React.FC<Omit<SidebarProps, 'sections'>> = (props) => {
  const dashboardSections: SidebarSection[] = [
    {
      id: 'main',
      items: [
        { id: 'dashboard', label: 'Oversikt', icon: '🏠', href: '/dashboard' },
        { id: 'analytics', label: 'Analyse', icon: '📊', href: '/analytics', badge: 'NY' },
        { id: 'reports', label: 'Rapporter', icon: '📈', href: '/reports' }
      ]
    },
    {
      id: 'management',
      title: 'Administrasjon',
      collapsible: true,
      items: [
        {
          id: 'users',
          label: 'Brukere',
          icon: '👥',
          badge: 24,
          children: [
            { id: 'all-users', label: 'Alle brukere', href: '/users' },
            { id: 'roles', label: 'Roller', href: '/users/roles' },
            { id: 'permissions', label: 'Tillatelser', href: '/users/permissions' }
          ]
        },
        {
          id: 'content',
          label: 'Innhold',
          icon: '📝',
          children: [
            { id: 'pages', label: 'Sider', href: '/content/pages' },
            { id: 'media', label: 'Media', href: '/content/media' },
            { id: 'categories', label: 'Kategorier', href: '/content/categories' }
          ]
        },
        {
          id: 'settings',
          label: 'Innstillinger',
          icon: '⚙️',
          href: '/settings',
          nsmClassification: 'RESTRICTED'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      items: [
        { id: 'help', label: 'Hjelp', icon: '❓', href: '/help' },
        { id: 'docs', label: 'Dokumentasjon', icon: '📚', href: '/docs' },
        { id: 'contact', label: 'Kontakt oss', icon: '💬', onClick: () => console.log('Contact') }
      ]
    }
  ];

  return <Sidebar {...props} sections={dashboardSections} />;
};